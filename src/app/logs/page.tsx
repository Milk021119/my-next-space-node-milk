'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase'; 
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale'; 
import { Heart, MessageSquare, Send, Image as ImageIcon, X, Loader2, Trash2, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Sidebar from '@/components/Sidebar';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { validateImageFile } from '@/lib/constants';
import { hasLiked, markAsLiked } from '@/lib/likes';
import { getBookmarkStatuses } from '@/lib/bookmarks';
import BookmarkButton from '@/components/BookmarkButton';

// --- 工具函数 ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- 类型定义 ---
type Post = {
  id: number;
  content: string; 
  created_at: string;
  user_id: string;
  likes: number;
  profiles: {
    username: string;
    avatar_url: string;
  } | null;
};

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

// --- 工具: 提取图片 ---
const extractImages = (markdown: string) => {
  const imgRegex = /!\[.*?\]\((.*?)\)/g;
  const images: string[] = [];
  let match;
  while ((match = imgRegex.exec(markdown)) !== null) {
    images.push(match[1]);
  }
  const text = markdown.replace(imgRegex, '').trim();
  return { text, images };
};

// --- 组件: 图片九宫格 ---
const ImageGrid = ({ images, onImageClick }: { images: string[], onImageClick: (src: string) => void }) => {
  if (images.length === 0) return null;

  let gridClass = "mt-3 grid gap-1 rounded-xl overflow-hidden";
  if (images.length === 1) {
    return (
      <div className="mt-3 relative w-full max-w-[80%] aspect-video rounded-xl overflow-hidden border border-slate-200 cursor-zoom-in" onClick={(e) => { e.stopPropagation(); onImageClick(images[0]); }}>
        <img src={images[0]} alt="moment" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
      </div>
    );
  }
  
  if (images.length === 2) gridClass += " grid-cols-2 aspect-video";
  else if (images.length === 4) gridClass += " grid-cols-2 aspect-square max-w-[300px]";
  else gridClass += " grid-cols-3 aspect-square";

  return (
    <div className={gridClass}>
      {images.map((img, i) => (
        <div key={i} className="relative bg-slate-100 overflow-hidden cursor-zoom-in aspect-square" onClick={(e) => { e.stopPropagation(); onImageClick(img); }}>
          <img src={img} alt={`img-${i}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
        </div>
      ))}
    </div>
  );
};

// --- 组件: 评论区 (已修复 UI 偏移和即时显示) ---
const CommentSection = ({ postId, postAuthorId, currentUser }: { postId: number, postAuthorId: string, currentUser: any }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
    const channel = supabase.channel(`comments-${postId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` }, (payload) => {
        // 防止重复添加自己刚发的评论
        if (payload.new.user_id !== currentUser?.id) {
          fetchComments();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [postId, currentUser?.id]);

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
    
    // 1. 乐观更新：立即在界面显示评论
    const tempId = Date.now();
    const commentText = content.trim();
    const optimisticComment: Comment = {
      id: tempId,
      content: commentText,
      created_at: new Date().toISOString(),
      user_id: currentUser.id,
      profiles: {
        username: currentUser.user_metadata?.username || currentUser.email?.split('@')[0] || '我',
        avatar_url: currentUser.user_metadata?.avatar_url || '/default-avatar.png'
      }
    };

    setComments(prev => [...prev, optimisticComment]);
    setContent(''); // 立即清空输入框

    try {
      // 2. 发送请求
      const { data: insertedData, error } = await supabase.from('comments').insert({
        post_id: postId,
        user_id: currentUser.id,
        content: commentText
      }).select().single();

      if (error) throw error;
      
      // 3. 替换为真实数据
      setComments(prev => prev.map(c => c.id === tempId ? { ...c, id: insertedData.id } : c));

      // 4. 发送通知
      if (postAuthorId !== currentUser.id) {
        await supabase.from('notifications').insert({
          recipient_id: postAuthorId,
          sender_email: currentUser.email,
          content: `评论了你的动态: "${commentText.slice(0, 20)}..."`,
          is_read: false,
          post_id: postId
        });
      }
    } catch (err) {
      console.error(err);
      alert('评论发送失败');
      setComments(prev => prev.filter(c => c.id !== tempId)); // 回滚
      setContent(commentText); // 恢复文本
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm('确定删除这条评论吗?')) return;
    setComments(prev => prev.filter(c => c.id !== commentId));
    await supabase.from('comments').delete().eq('id', commentId);
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-100/50">
      {/* 评论列表 */}
      <div className="space-y-4 mb-5 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
        {loading ? <div className="text-center py-2"><Loader2 size={16} className="animate-spin inline text-slate-400"/></div> : 
         comments.length === 0 ? <p className="text-xs text-slate-400 italic text-center py-2">暂无评论，来坐沙发...</p> :
         comments.map((c) => (
           <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={c.id} className="flex gap-3 text-sm group">
             <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-100"><img src={c.profiles?.avatar_url || '/default-avatar.png'} className="w-full h-full object-cover"/></div>
             <div className="flex-1 bg-slate-50 p-2.5 rounded-2xl rounded-tl-none hover:bg-slate-100 transition-colors">
               <div className="flex justify-between items-baseline mb-0.5">
                 <span className="font-bold text-slate-700 text-xs">{c.profiles?.username || '用户'}</span>
                 <span className="text-[10px] text-slate-400">{formatDistanceToNow(new Date(c.created_at), { locale: zhCN, addSuffix: true })}</span>
               </div>
               <p className="text-slate-600 text-xs leading-relaxed break-all">{c.content}</p>
             </div>
             {(currentUser?.id === c.user_id || currentUser?.id === postAuthorId) && (
               <button onClick={() => handleDelete(c.id)} className="self-center p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
             )}
           </motion.div>
         ))
        }
      </div>
      {/* 输入框区域 */}
      <div className="flex gap-3 items-end">
        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
           {currentUser ? <img src={currentUser.user_metadata?.avatar_url || '/default-avatar.png'} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full text-slate-400"><User size={14}/></div>}
        </div>
        <div className="flex-1 relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!currentUser || submitting}
            placeholder={currentUser ? "写下评论..." : "请先登录"}
            className="w-full bg-slate-100/50 hover:bg-white focus:bg-white border border-transparent focus:border-purple-200 rounded-2xl py-2.5 pl-4 pr-12 text-xs outline-none transition-all resize-none min-h-[40px] h-[40px] focus:h-[80px]"
          />
          <button 
            onClick={handleSubmit} 
            disabled={!content.trim() || submitting} 
            className="absolute bottom-2 right-2 p-1.5 bg-slate-900 text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-600 transition-all shadow-sm active:scale-95"
          >
            {submitting ? <Loader2 size={12} className="animate-spin"/> : <Send size={12} className="ml-0.5"/>}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 主页面 ---
export default function LogsPage() {
  const [user, setUser] = useState<any>(null);
  const [moments, setMoments] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 发布状态
  const [newContent, setNewContent] = useState('');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 交互状态
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null);
  const [bookmarkStatuses, setBookmarkStatuses] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      fetchMoments();
    };
    init();
  }, []);

  // 批量加载收藏状态
  useEffect(() => {
    async function loadBookmarkStatuses() {
      if (!user?.id || moments.length === 0) return;
      
      const postIds = moments.map(m => m.id);
      const statuses = await getBookmarkStatuses(user.id, postIds);
      setBookmarkStatuses(prev => ({ ...prev, ...statuses }));
    }
    
    loadBookmarkStatuses();
  }, [user?.id, moments]);

  const fetchMoments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select(`*, profiles:user_id ( avatar_url, username )`)
      .eq('type', 'moment')
      .order('created_at', { ascending: false });
    
    if (!error && data) setMoments(data as any);
    setLoading(false);
  };

  const handlePublish = async () => {
    if ((!newContent.trim() && uploadFiles.length === 0) || !user) return;
    setIsPublishing(true);

    try {
      const uploadedUrls: string[] = [];
      for (const file of uploadFiles) {
        // 验证文件类型和大小
        const validation = validateImageFile(file);
        if (!validation.valid) {
          alert(validation.error);
          setIsPublishing(false);
          return;
        }
        
        const fileExt = file.name.split('.').pop();
        const fileName = `logs/${user.id}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const { error: uploadErr } = await supabase.storage.from('avatars').upload(fileName, file); 
        if (!uploadErr) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
          uploadedUrls.push(publicUrl);
        }
      }

      let finalContent = newContent;
      if (uploadedUrls.length > 0) {
        finalContent += '\n\n' + uploadedUrls.map(url => `![](${url})`).join('\n');
      }

      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content: finalContent,
        type: 'moment',
        likes: 0,
        is_public: true,
        tags: []
      });

      if (error) throw error;

      setNewContent('');
      setUploadFiles([]);
      fetchMoments();
    } catch (err) {
      console.error(err);
      alert('发布失败，请稍后重试');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleLike = async (id: number, currentLikes: number) => {
    // 检查是否已点赞
    if (hasLiked(id)) {
      return;
    }
    
    const newLikes = currentLikes + 1;
    setMoments(prev => prev.map(m => m.id === id ? { ...m, likes: newLikes } : m));
    markAsLiked(id);
    await supabase.from('posts').update({ likes: newLikes }).eq('id', id);
  };

  return (
    <div className="flex bg-[var(--bg-primary)] min-h-screen">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 transition-all duration-300">
        {/* Banner */}
        <div className="relative h-64 lg:h-80 bg-slate-800 overflow-hidden group">
          <img src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop" alt="header" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-[20s]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10 flex items-end gap-6 max-w-4xl mx-auto">
             <div className="relative w-24 h-24 rounded-2xl bg-[var(--bg-card)] backdrop-blur-md p-1 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300">
               <img src={user?.user_metadata?.avatar_url || '/default-avatar.png'} alt="me" className="w-full h-full object-cover rounded-xl bg-[var(--bg-secondary)]" />
             </div>
             <div className="mb-4">
                <h1 className="text-3xl font-bold text-[var(--text-primary)] mix-blend-hard-light">我的动态</h1>
                <p className="text-[var(--text-secondary)] font-medium">记录赛博空间的时间碎片</p>
             </div>
          </div>
        </div>

        {/* 主内容 */}
        <div className="max-w-3xl mx-auto px-4 lg:px-8 py-8 -mt-8 relative z-10">
          {user && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--bg-card)] backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-[var(--border-color)] mb-10">
              <div className="flex gap-4">
                <div className="flex-1">
                  <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="分享当下的想法..." className="w-full h-20 bg-transparent resize-none outline-none text-[var(--text-secondary)] placeholder:text-[var(--text-muted)] text-base" />
                  {uploadFiles.length > 0 && (
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
                      {uploadFiles.map((file, i) => (
                        <div key={i} className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden group">
                          <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                          <button onClick={() => setUploadFiles(files => files.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <div className="flex gap-2">
                      <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-purple-50 text-purple-600 rounded-full transition-colors"><ImageIcon size={20} /></button>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/jpeg,image/png,image/gif,image/webp" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={(e) => { 
                          const files = e.target.files; 
                          if (files) {
                            const validFiles = Array.from(files).filter(file => {
                              const validation = validateImageFile(file);
                              if (!validation.valid) {
                                alert(validation.error);
                                return false;
                              }
                              return true;
                            });
                            setUploadFiles(prev => [...prev, ...validFiles]);
                          }
                        }} 
                      />
                    </div>
                    <button onClick={handlePublish} disabled={isPublishing || (!newContent && uploadFiles.length === 0)} className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-purple-900/10 hover:shadow-purple-900/20 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      {isPublishing ? <Loader2 size={16} className="animate-spin"/> : <Send size={16} />} <span>发布</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="space-y-8">
            {loading ? <div className="text-center py-20 text-[var(--text-muted)]"><Loader2 className="w-8 h-8 animate-spin mx-auto"/></div> : moments.map((post) => {
              const { text, images } = extractImages(post.content);
              return (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} key={post.id} className="bg-[var(--bg-secondary)] rounded-3xl p-6 shadow-sm border border-[var(--border-color)]">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-[var(--bg-tertiary)] flex-shrink-0 overflow-hidden">
                      <img src={post.profiles?.avatar_url || '/default-avatar.png'} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-1">
                        <h3 className="font-bold text-[var(--text-primary)]">{post.profiles?.username || '未知用户'}</h3>
                        <span className="text-xs text-[var(--text-muted)] font-mono">{format(new Date(post.created_at), 'MM-dd HH:mm')}</span>
                      </div>
                      <div className="prose prose-slate dark:prose-invert prose-sm max-w-none text-[var(--text-secondary)] mb-3"><ReactMarkdown>{text}</ReactMarkdown></div>
                      <ImageGrid images={images} onImageClick={setLightboxSrc} />
                      
                      <div className="mt-4 flex items-center gap-6 border-t border-[var(--border-color)] pt-3">
                        <button 
                          onClick={() => handleLike(post.id, post.likes)} 
                          disabled={hasLiked(post.id)}
                          className={`group flex items-center gap-1.5 transition-colors ${hasLiked(post.id) ? 'text-pink-500 cursor-default' : 'text-slate-400 hover:text-pink-500'}`}
                        >
                          <div className="p-2 rounded-full group-hover:bg-pink-50 transition-colors"><Heart size={18} className={cn((hasLiked(post.id) || post.likes > 0) && "fill-pink-500 text-pink-500")} /></div>
                          <span className="text-sm font-medium">{post.likes || '赞'}</span>
                        </button>
                        
                        <button onClick={() => setActiveCommentId(activeCommentId === post.id ? null : post.id)} className={cn("group flex items-center gap-1.5 transition-colors", activeCommentId === post.id ? "text-purple-600" : "text-slate-400 hover:text-purple-600")}>
                          <div className={cn("p-2 rounded-full transition-colors", activeCommentId === post.id ? "bg-purple-50" : "group-hover:bg-purple-50")}><MessageSquare size={18} className={cn(activeCommentId === post.id && "fill-purple-600 text-purple-600")}/></div>
                          <span className="text-sm font-medium">评论</span>
                        </button>
                        
                        {/* 收藏按钮 */}
                        <BookmarkButton 
                          postId={post.id} 
                          initialBookmarked={bookmarkStatuses[post.id] || false}
                          size="sm"
                        />
                      </div>

                      <AnimatePresence>
                        {activeCommentId === post.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <CommentSection postId={post.id} postAuthorId={post.user_id} currentUser={user} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {lightboxSrc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setLightboxSrc(null)}>
            <button className="absolute top-5 right-5 text-white/70 hover:text-white p-2"><X size={32} /></button>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} src={lightboxSrc} className="max-w-full max-h-full object-contain rounded shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
