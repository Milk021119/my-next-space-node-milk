import { supabase } from './supabase';

export interface Bookmark {
  id: number;
  user_id: string;
  post_id: number;
  created_at: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author_email: string;
  likes: number;
  created_at: string;
  tags: string[];
  cover_url?: string;
  type?: string;
  user_id?: string;
}

export interface BookmarkWithPost extends Bookmark {
  posts: Post;
}

/**
 * 检查用户是否已收藏某文章
 */
export async function isBookmarked(userId: string, postId: number): Promise<boolean> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking bookmark:', error);
  }
  return !!data;
}

/**
 * 添加收藏
 */
export async function addBookmark(userId: string, postId: number): Promise<void> {
  const { error } = await supabase
    .from('bookmarks')
    .insert({ user_id: userId, post_id: postId });

  if (error && error.code !== '23505') {
    // 23505 是唯一约束冲突，表示已收藏
    throw new Error(`Failed to add bookmark: ${error.message}`);
  }
}


/**
 * 移除收藏
 */
export async function removeBookmark(userId: string, postId: number): Promise<void> {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('post_id', postId);

  if (error) {
    throw new Error(`Failed to remove bookmark: ${error.message}`);
  }
}

/**
 * 切换收藏状态，返回新的收藏状态
 */
export async function toggleBookmark(userId: string, postId: number): Promise<boolean> {
  const bookmarked = await isBookmarked(userId, postId);
  
  if (bookmarked) {
    await removeBookmark(userId, postId);
    return false;
  } else {
    await addBookmark(userId, postId);
    return true;
  }
}

/**
 * 获取用户所有收藏的文章，按收藏时间倒序
 */
export async function getUserBookmarks(userId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select(`
      id,
      user_id,
      post_id,
      created_at,
      posts (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookmarks:', error);
    return [];
  }

  // Supabase 返回的 posts 是单个对象（因为是一对一关系）
  return (data as unknown as BookmarkWithPost[])?.map(b => b.posts).filter(Boolean) || [];
}

/**
 * 获取用户收藏数量
 */
export async function getBookmarkCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('bookmarks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error getting bookmark count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * 批量检查收藏状态
 */
export async function getBookmarkStatuses(
  userId: string,
  postIds: number[]
): Promise<Record<number, boolean>> {
  if (!postIds.length) return {};

  const { data, error } = await supabase
    .from('bookmarks')
    .select('post_id')
    .eq('user_id', userId)
    .in('post_id', postIds);

  if (error) {
    console.error('Error getting bookmark statuses:', error);
    return {};
  }

  const bookmarkedIds = new Set(data?.map(b => b.post_id) || []);
  return postIds.reduce((acc, id) => {
    acc[id] = bookmarkedIds.has(id);
    return acc;
  }, {} as Record<number, boolean>);
}
