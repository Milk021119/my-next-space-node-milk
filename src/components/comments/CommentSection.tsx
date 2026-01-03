'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Send, Trash2, Loader2, User } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Comment = {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    avatar_url: string;
  } | null;
};

interface CommentSectionProps {
  postId: number;
  postAuthorId: string; // 用于发送通知
  currentUser: any;     // 当前登录用户
}

export default function CommentSection({ postId, postAuthorId, currentUser }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 初始化加载评论
  useEffect(() => {
    fetchComments();
    
    // 订阅实时评论 (可选)
    const channel = supabase.channel(`comments-${postId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` }, 
      (payload) => {
         // 简单策略：收到新评论就重新拉取，确保关联数据正确
         fetchComments();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [postId]);

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select(`*, profiles:user_id ( username, avatar_url )`)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (data) setComments(data as any);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!content.trim() || !currentUser) return;
    setSubmitting(true);

    try {
      // 1. 写入评论
      const { data: newComment, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          content: content.trim()
        })
        .select()
        .single();

      if (error) throw error;

      // 2. 发送通知 (如果不是自己给自己评论)
      if (postAuthorId !== currentUser.id) {
        await supabase.from('notifications').insert({
          recipient_id: postAuthorId,
          sender_email: currentUser.email, // 暂用 email 标识发送者，也可改用 id
          content: `评论了你的动态: "${content.slice(0, 20)}..."`,
          is_read: false,
          post_id: postId
        });
      }

      setContent('');
      // 实时订阅会处理更新，这里也可以手动 push 优化体验
      
    } catch (err) {
      console.error('评论失败', err);
      alert('评论发送失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm('确定删除这条评论吗？')) return;
    
    // 乐观更新 UI
    setComments(prev => prev.filter(c => c.id !== commentId));
    await supabase.from('comments').delete().eq('id', commentId);
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-100/50">
      {/* 评论列表区 */}
      <div className="space-y-4 mb-6">
        {loading ? (
          <div className="flex justify-center py-2"><Loader2 size={16} className="animate-spin text-slate-400"/></div>
        ) : comments.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-2">还没有人说话，打破沉默吧...</p>
        ) : (
          comments.map((comment) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              key={comment.id} 
              className="group flex gap-3 text-sm"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                <img src={comment.profiles?.avatar_url || '/default-avatar.png'} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 bg-slate-50/50 rounded-2xl rounded-tl-none p-3 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-slate-700 text-xs">{comment.profiles?.username || '神秘访客'}</span>
                  <span className="text-[10px] text-slate-400">{formatDistanceToNow(new Date(comment.created_at), { locale: zhCN, addSuffix: true })}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{comment.content}</p>
              </div>
              
              {/* 删除按钮 (仅本人或管理员可见，这里简单判断本人) */}
              {currentUser?.id === comment.user_id && (
                <button 
                  onClick={() => handleDelete(comment.id)}
                  className="self-center p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* 输入框区 */}
      <div className="flex gap-3 items-end">
        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
           {currentUser ? (
             <img src={currentUser.user_metadata?.avatar_url || '/default-avatar.png'} className="w-full h-full object-cover" />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={14}/></div>
           )}
        </div>
        <div className="flex-1 relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!currentUser || submitting}
            placeholder={currentUser ? "写下你的评论..." : "请先登录..."}
            className="w-full bg-slate-100/50 hover:bg-white focus:bg-white border border-transparent focus:border-purple-200 rounded-2xl py-2 px-4 pr-10 text-sm outline-none transition-all resize-none h-[40px] focus:h-[80px]"
          />
          <button 
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
            className="absolute bottom-2 right-2 p-1.5 bg-slate-900 text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors"
          >
            {submitting ? <Loader2 size={14} className="animate-spin"/> : <Send size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
