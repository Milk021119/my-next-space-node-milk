import { supabase } from './supabase';

export interface Comment {
  id: number;
  post_id: number;
  user_id: string;
  parent_id: number | null;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  };
  replies?: Comment[];
}

/**
 * 获取文章的所有评论（包含用户信息和嵌套回复）
 */
export async function getComments(postId: number): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      post_id,
      user_id,
      parent_id,
      content,
      created_at,
      updated_at,
      profiles (
        username,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }

  // 构建嵌套结构
  const comments = data as unknown as Comment[];
  const commentMap = new Map<number, Comment>();
  const rootComments: Comment[] = [];

  // 第一遍：创建映射
  comments.forEach(comment => {
    comment.replies = [];
    commentMap.set(comment.id, comment);
  });

  // 第二遍：构建树结构
  comments.forEach(comment => {
    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id);
      if (parent) {
        parent.replies!.push(comment);
      }
    } else {
      rootComments.push(comment);
    }
  });

  return rootComments;
}

/**
 * 添加评论
 */
export async function addComment(
  postId: number,
  userId: string,
  content: string,
  parentId?: number
): Promise<Comment | null> {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: userId,
      content: content.trim(),
      parent_id: parentId || null
    })
    .select(`
      id,
      post_id,
      user_id,
      parent_id,
      content,
      created_at,
      updated_at,
      profiles (
        username,
        avatar_url
      )
    `)
    .single();

  if (error) {
    console.error('Error adding comment:', error);
    throw new Error(`Failed to add comment: ${error.message}`);
  }

  return data as unknown as Comment;
}

/**
 * 删除评论（会级联删除回复）
 */
export async function deleteComment(commentId: number, userId: string): Promise<void> {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting comment:', error);
    throw new Error(`Failed to delete comment: ${error.message}`);
  }
}

/**
 * 获取文章评论数量
 */
export async function getCommentCount(postId: number): Promise<number> {
  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  if (error) {
    console.error('Error getting comment count:', error);
    return 0;
  }

  return count || 0;
}
