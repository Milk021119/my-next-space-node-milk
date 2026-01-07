// 点赞限制工具 - 使用 localStorage 防止重复点赞

const LIKES_STORAGE_KEY = 'soymilk_liked_posts';

// 获取已点赞的文章 ID 列表
export function getLikedPosts(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(LIKES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// 检查是否已点赞
export function hasLiked(postId: number): boolean {
  return getLikedPosts().includes(postId);
}

// 记录点赞
export function markAsLiked(postId: number): void {
  if (typeof window === 'undefined') return;
  const liked = getLikedPosts();
  if (!liked.includes(postId)) {
    liked.push(postId);
    localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(liked));
  }
}

// 取消点赞记录
export function removeLike(postId: number): void {
  if (typeof window === 'undefined') return;
  const liked = getLikedPosts().filter(id => id !== postId);
  localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(liked));
}
