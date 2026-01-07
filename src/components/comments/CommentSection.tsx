'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Trash2, Reply, Loader2, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import Image from 'next/image';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getComments, addComment, deleteComment, type Comment } from '@/lib/comments';
import LoginModal from '@/components/LoginModal';

interface CommentSectionProps {
  postId: number;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user, isMounted } = useCurrentUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: number; username: string } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  async function fetchComments() {
    setLoading(true);
    try {
      const data = await getComments(postId);
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const newComment = await addComment(postId, user.id, content, replyTo?.id);
      if (newComment) {
        // 刷新评论列表
        await fetchComments();
        setContent('');
        setReplyTo(null);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId: number) {
    if (!user || !confirm('确定要删除这条评论吗？')) return;

    try {
      await deleteComment(commentId, user.id);
      await fetchComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  }

  // 计算总评论数（包括回复）
  const totalCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  if (!isMounted) {
    return (
      <div className="mt-16 pt-8 border-t border-[var(--border-color)]">
        <div className="flex items-center gap-3 mb-8">
          <MessageCircle size={24} className="text-purple-500" />
          <h2 className="text-xl font-black text-[var(--text-primary)]">评论</h2>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-purple-500" size={24} />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 pt-8 border-t border-[var(--border-color)]">
      {/* 标题 */}
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle size={24} className="text-purple-500" />
        <h2 className="text-xl font-black text-[var(--text-primary)]">
          评论 {totalCount > 0 && <span className="text-purple-500">({totalCount})</span>}
        </h2>
      </div>

      {/* 评论表单 */}
      <form onSubmit={handleSubmit} className="mb-8">
        {replyTo && (
          <div className="flex items-center gap-2 mb-2 text-sm text-[var(--text-muted)]">
            <Reply size={14} />
            <span>回复 @{replyTo.username}</span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-red-400 hover:text-red-500"
            >
              取消
            </button>
          </div>
        )}
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] overflow-hidden flex-shrink-0">
            {user?.user_metadata?.avatar_url ? (
              <Image
                src={user.user_metadata.avatar_url}
                alt="avatar"
                width={40}
                height={40}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={20} className="text-[var(--text-muted)]" />
              </div>
            )}
          </div>
          <div className="flex-1 relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={user ? "写下你的评论..." : "登录后发表评论"}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-4 py-3 pr-12 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-purple-400 resize-none min-h-[80px] transition-colors"
              disabled={!user}
            />
            <button
              type="submit"
              disabled={!content.trim() || submitting}
              className="absolute right-3 bottom-3 p-2 rounded-xl bg-purple-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </div>
        {!user && (
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            <button
              type="button"
              onClick={() => setShowLoginModal(true)}
              className="text-purple-500 hover:underline"
            >
              登录
            </button>
            {' '}后即可发表评论
          </p>
        )}
      </form>

      {/* 评论列表 */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-purple-500" size={24} />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle size={48} className="mx-auto mb-4 text-[var(--text-muted)] opacity-30" />
          <p className="text-[var(--text-muted)]">暂无评论，来发表第一条吧！</p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={user?.id}
                onReply={(id, username) => setReplyTo({ id, username })}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}

// 单条评论组件
interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onReply: (id: number, username: string) => void;
  onDelete: (id: number) => void;
  isReply?: boolean;
}

function CommentItem({ comment, currentUserId, onReply, onDelete, isReply = false }: CommentItemProps) {
  const username = comment.profiles?.username || '匿名用户';
  const avatarUrl = comment.profiles?.avatar_url;
  const isOwner = currentUserId === comment.user_id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${isReply ? 'ml-12 mt-4' : ''}`}
    >
      <div className="flex gap-3">
        <Link href={`/u/${comment.user_id}`} className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={username}
                width={40}
                height={40}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={20} className="text-[var(--text-muted)]" />
              </div>
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/u/${comment.user_id}`}
              className="font-bold text-sm text-[var(--text-primary)] hover:text-purple-500 transition-colors"
            >
              {username}
            </Link>
            <span className="text-xs text-[var(--text-muted)]">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: zhCN })}
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap break-words">
            {comment.content}
          </p>
          <div className="flex items-center gap-4 mt-2">
            {!isReply && (
              <button
                onClick={() => onReply(comment.id, username)}
                className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-purple-500 transition-colors"
              >
                <Reply size={14} />
                回复
              </button>
            )}
            {isOwner && (
              <button
                onClick={() => onDelete(comment.id)}
                className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
                删除
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 回复列表 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onReply={onReply}
              onDelete={onDelete}
              isReply
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
