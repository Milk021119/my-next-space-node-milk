// 用户相关类型
export interface UserProfile {
  id: string;
  email?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  is_admin?: boolean;
  is_banned?: boolean;
  created_at?: string;
  user_metadata?: {
    avatar_url?: string;
    username?: string;
    full_name?: string;
    [key: string]: unknown;
  };
}

// 文章相关类型
export interface Post {
  id: number;
  title?: string;
  content: string;
  author_email?: string;
  user_id: string;
  likes: number;
  views?: number;
  created_at: string;
  updated_at?: string;
  tags?: string[];
  cover_url?: string;
  type: 'article' | 'moment';
  is_public?: boolean;
  is_pinned?: boolean;
  profiles?: {
    username: string;
    avatar_url: string;
  };
}

// 评论相关类型
export interface Comment {
  id: number;
  post_id: number;
  user_id: string;
  parent_id: number | null;
  content: string;
  created_at: string;
  updated_at?: string;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  };
  replies?: Comment[];
}

// 收藏相关类型
export interface Bookmark {
  id: number;
  user_id: string;
  post_id: number;
  created_at: string;
}

export interface BookmarkWithPost extends Bookmark {
  posts: Post;
}

// 消息相关类型
export interface Message {
  id: number;
  content: string;
  user_id?: string;
  sender_id?: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
  } | null;
}

// 通知相关类型
export interface Notification {
  id: number;
  recipient_id: string;
  sender_email?: string;
  content: string;
  is_read: boolean;
  post_id?: number;
  created_at: string;
}

// API 响应类型
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Toast 类型
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}
