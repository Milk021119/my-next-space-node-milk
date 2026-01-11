import { supabase } from './supabase';

// 数据库点赞系统 - 登录用户使用数据库记录，未登录用户使用 localStorage

const LIKES_STORAGE_KEY = 'soymilk_liked_posts';

// 获取 localStorage 中的点赞记录（未登录用户）
function getLocalLikes(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(LIKES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setLocalLike(postId: number) {
  if (typeof window === 'undefined') return;
  const likes = getLocalLikes();
  if (!likes.includes(postId)) {
    likes.push(postId);
    localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likes));
  }
}

// 检查用户是否已点赞
export async function checkLiked(postId: number, userId?: string): Promise<boolean> {
  if (!userId) {
    return getLocalLikes().includes(postId);
  }

  const { data } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();

  return !!data;
}

// 批量检查点赞状态
export async function checkLikedBatch(postIds: number[], userId?: string): Promise<Record<number, boolean>> {
  const result: Record<number, boolean> = {};
  
  if (!userId) {
    const localLikes = getLocalLikes();
    postIds.forEach(id => {
      result[id] = localLikes.includes(id);
    });
    return result;
  }

  const { data } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', userId)
    .in('post_id', postIds);

  const likedSet = new Set(data?.map(d => d.post_id) || []);
  postIds.forEach(id => {
    result[id] = likedSet.has(id);
  });

  return result;
}

// 点赞
export async function likePost(postId: number, userId?: string): Promise<{ success: boolean; newCount?: number }> {
  // 未登录用户使用 localStorage
  if (!userId) {
    if (getLocalLikes().includes(postId)) {
      return { success: false };
    }
    
    // 更新点赞数
    const { data: post } = await supabase
      .from('posts')
      .select('likes')
      .eq('id', postId)
      .single();
    
    const newCount = (post?.likes || 0) + 1;
    await supabase.from('posts').update({ likes: newCount }).eq('id', postId);
    setLocalLike(postId);
    
    return { success: true, newCount };
  }

  // 登录用户使用数据库
  const alreadyLiked = await checkLiked(postId, userId);
  if (alreadyLiked) {
    return { success: false };
  }

  // 插入点赞记录
  const { error: insertError } = await supabase
    .from('post_likes')
    .insert({ post_id: postId, user_id: userId });

  if (insertError) {
    console.error('Like insert error:', insertError);
    return { success: false };
  }

  // 更新点赞数
  const { data: post } = await supabase
    .from('posts')
    .select('likes')
    .eq('id', postId)
    .single();

  const newCount = (post?.likes || 0) + 1;
  await supabase.from('posts').update({ likes: newCount }).eq('id', postId);

  return { success: true, newCount };
}

// 取消点赞（仅登录用户）
export async function unlikePost(postId: number, userId: string): Promise<{ success: boolean; newCount?: number }> {
  const { error } = await supabase
    .from('post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);

  if (error) {
    return { success: false };
  }

  // 更新点赞数
  const { data: post } = await supabase
    .from('posts')
    .select('likes')
    .eq('id', postId)
    .single();

  const newCount = Math.max((post?.likes || 1) - 1, 0);
  await supabase.from('posts').update({ likes: newCount }).eq('id', postId);

  return { success: true, newCount };
}
