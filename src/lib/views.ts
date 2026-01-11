import { supabase } from './supabase';

// 增加文章浏览量
export async function incrementViewCount(postId: number): Promise<number> {
  // 使用 RPC 调用原子递增
  const { data, error } = await supabase.rpc('increment_view_count', {
    post_id: postId
  });

  if (error) {
    // 如果 RPC 不存在，使用普通更新
    const { data: post } = await supabase
      .from('posts')
      .select('views')
      .eq('id', postId)
      .single();

    const newViews = (post?.views || 0) + 1;
    await supabase
      .from('posts')
      .update({ views: newViews })
      .eq('id', postId);

    return newViews;
  }

  return data || 0;
}

// 获取文章浏览量
export async function getViewCount(postId: number): Promise<number> {
  const { data } = await supabase
    .from('posts')
    .select('views')
    .eq('id', postId)
    .single();

  return data?.views || 0;
}

// 批量获取浏览量
export async function getViewCounts(postIds: number[]): Promise<Record<number, number>> {
  const { data } = await supabase
    .from('posts')
    .select('id, views')
    .in('id', postIds);

  const result: Record<number, number> = {};
  data?.forEach(post => {
    result[post.id] = post.views || 0;
  });

  return result;
}
