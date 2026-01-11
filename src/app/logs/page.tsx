'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase'; 
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { zhCN } from 'date-fns/locale'; 
import { Heart, MessageSquare, Send, Image as ImageIcon, X, Loader2, Trash2, User, Sparkles, Clock, Calendar, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import PageLayout from '@/components/PageLayout';
import { PageBanner, MomentCardSkeleton } from '@/components/ui';
import { cn } from '@/lib/utils';
import { validateImageFile } from '@/lib/constants';
import { checkLikedBatch, likePost } from '@/lib/likesDb';
import { getBookmarkStatuses } from '@/lib/bookmarks';
import BookmarkButton from '@/components/BookmarkButton';
import { useToast } from '@/context/ToastContext';
import type { Post, Comment } from '@/types';

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

// --- 工具: 格式化日期分组 ---
const formatDateGroup = (date: Date) => {
  if (isToday(date)) return '今天';
  if (isYesterday(date)) return '昨天';
  return format(date, 'MM月dd日', { locale: zhCN });
};

// --- 组件: 图片九宫格 (美化版) ---
const ImageGrid = ({ images, onImageClick }: { images: string[], onImageClick: (src: string) => void }) => {
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div 
        className="mt-4 relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--border-color)] cursor-zoom-in group shadow-sm" 
        onClick={(e) => { e.stopPropagation(); onImageClick(images[0]); }}
      >
        <img src={images[0]} alt="moment" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  }

  const gridClass = cn(
    "mt-4 grid gap-1.5 rounded-2xl overflow-hidden",
    images.length === 2 && "grid-cols-2",
    images.length === 3 && "grid-cols-3",
    images.length === 4 && "grid-cols-2 max-w-xs",
    images.length > 4 && "grid-cols-3"
  );

  return (
    <div className={gridClass}>
      {images.slice(0, 9).map((img, i) => (
        <div 
          key={i} 
          className="relative bg-[var(--bg-tertiary)] overflow-hidden cursor-zoom-in aspect-square group rounded-xl" 
          onClick={(e) => { e.stopPropagation(); onImageClick(img); }}
        >
          <img src={img} alt={`img-${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          {i === 8 && images.length > 9 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xl">
              +{images.length - 9}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// --- 组件: 评论区 (美化版) ---
const CommentSection = ({ postId, postAuthorId, currentUser }: { postId: number, postAuthorId: string, currentUser: any }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
    const channel = supabase.channel(`comments-${postId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` }, (payload) => {
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
    
    const tempId = Date.now();
    const commentText = content.trim();
    const optimisticComment: Comment = {
      id: tempId,
      post_id: postId,
      parent_id: null,
      content: commentText,
      created_at: new Date().toISOString(),
      user_id: currentUser.id,
      profiles: {
        username: currentUser.user_metadata?.username || currentUser.email?.split('@')[0] || '我',
        avatar_url: currentUser.user_metadata?.avatar_url || '/default-avatar.png'
      }
    };

    setComments(prev => [...prev, optimisticComment]);
    setContent('');

    try {
      const { data: insertedData, error } = await supabase.from('comments').insert({
        post_id: postId,
        user_id: currentUser.id,
        content: commentText
      }).select().single();

      if (error) throw error;
      setComments(prev => prev.map(c => c.id === tempId ? { ...c, id: insertedData.id } : c));

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
      setComments(prev => prev.filter(c => c.id !== tempId));
      setContent(commentText);
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-5 pt-5 border-t border-dashed border-[var(--border-color)]"
    >
      {/* 评论列表 */}
      <div className="space-y-3 mb-4 max-h-[280px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[var(--border-color)]">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 size={20} className="animate-spin text-[var(--accent-color)]"/>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6">
            <MessageSquare size={24} className="mx-auto mb-2 text-[var(--text-muted)] opacity-50" />
            <p className="text-xs text-[var(--text-muted)]">还没有评论，来抢沙发~</p>
          </div>
        ) : (
          comments.map((c, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.05 }}
              key={c.id} 
              className="flex gap-3 group"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-[var(--bg-tertiary)]">
                <img src={c.profiles?.avatar_url || '/default-avatar.png'} className="w-full h-full object-cover"/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="inline-block bg-[var(--bg-tertiary)] px-4 py-2.5 rounded-2xl rounded-tl-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[var(--text-primary)] text-xs">{c.profiles?.username || '用户'}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {formatDistanceToNow(new Date(c.created_at), { locale: zhCN, addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed break-words">{c.content}</p>
                </div>
              </div>
              {(currentUser?.id === c.user_id || currentUser?.id === postAuthorId) && (
                <button 
                  onClick={() => handleDelete(c.id)} 
                  className="self-center p-1.5 text-[var(--text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                >
                  <Trash2 size={14}/>
                </button>
              )}
            </motion.div>
          ))
        )}
      </div>
      
      {/* 输入框 */}
      <div className="flex gap-3 items-center bg-[var(--bg-tertiary)] rounded-full p-1.5 pl-4">
        <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 ring-2 ring-white/50 dark:ring-black/20">
          {currentUser ? (
            <img src={currentUser.user_metadata?.avatar_url || '/default-avatar.png'} className="w-full h-full object-cover"/>
          ) : (
            <div className="flex items-center justify-center h-full bg-[var(--bg-secondary)] text-[var(--text-muted)]">
              <User size={12}/>
            </div>
          )}
        </div>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
          disabled={!currentUser || submitting}
          placeholder={currentUser ? "写下你的评论..." : "请先登录"}
          className="flex-1 bg-transparent text-sm outline-none text-[var(--text-secondary)] placeholder:text-[var(--text-muted)]"
        />
        <button 
          onClick={handleSubmit} 
          disabled={!content.trim() || submitting} 
          className="p-2 bg-[var(--accent-color)] text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-all active:scale-95"
        >
          {submitting ? <Loader2 size={14} className="animate-spin"/> : <Send size={14}/>}
        </button>
      </div>
    </motion.div>
  );
};


// --- 组件: 动态卡片 (美化版) ---
const MomentCard = ({ 
  post, 
  user, 
  likeStatus, 
  bookmarkStatus,
  isCommentOpen,
  onLike, 
  onToggleComment,
  onImageClick 
}: { 
  post: Post, 
  user: any,
  likeStatus: boolean,
  bookmarkStatus: boolean,
  isCommentOpen: boolean,
  onLike: () => void,
  onToggleComment: () => void,
  onImageClick: (src: string) => void
}) => {
  const { text, images } = extractImages(post.content);
  
  return (
    <motion.article 
      initial={{ opacity: 0, y: 30 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* 时间线连接点 */}
      <div className="absolute -left-[41px] top-6 w-3 h-3 rounded-full bg-[var(--accent-color)] ring-4 ring-[var(--bg-primary)] z-10 hidden lg:block" />
      
      <div className="bg-[var(--bg-card)] backdrop-blur-xl rounded-3xl overflow-hidden border border-[var(--border-color)] shadow-sm hover:shadow-lg hover:border-[var(--accent-color)]/20 transition-all duration-300 group">
        {/* 卡片头部 */}
        <div className="p-5 pb-0">
          <div className="flex items-start gap-4">
            {/* 头像 */}
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-0.5 shadow-lg shadow-purple-500/20">
                <img 
                  src={post.profiles?.avatar_url || '/default-avatar.png'} 
                  className="w-full h-full object-cover rounded-[14px] bg-[var(--bg-secondary)]" 
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[var(--bg-card)]" />
            </div>
            
            {/* 用户信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-bold text-[var(--text-primary)] truncate">
                  {post.profiles?.username || '未知用户'}
                </h3>
                <span className="px-2 py-0.5 bg-[var(--accent-color)]/10 text-[var(--accent-color)] text-[10px] font-bold rounded-full">
                  博主
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Clock size={12} />
                <span>{formatDistanceToNow(new Date(post.created_at), { locale: zhCN, addSuffix: true })}</span>
                <span className="opacity-50">·</span>
                <span className="font-mono">{format(new Date(post.created_at), 'HH:mm')}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 内容区域 */}
        <div className="px-5 py-4">
          <div className="prose prose-slate dark:prose-invert prose-sm max-w-none text-[var(--text-secondary)] leading-relaxed">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
          <ImageGrid images={images} onImageClick={onImageClick} />
        </div>
        
        {/* 交互栏 */}
        <div className="px-5 py-3 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* 点赞按钮 */}
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={onLike}
                disabled={likeStatus}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                  likeStatus 
                    ? "bg-pink-50 dark:bg-pink-900/20 text-pink-500" 
                    : "hover:bg-pink-50 dark:hover:bg-pink-900/20 text-[var(--text-muted)] hover:text-pink-500"
                )}
              >
                <Heart size={18} className={cn(likeStatus && "fill-current")} />
                <span className="text-sm font-medium">{post.likes || 0}</span>
              </motion.button>
              
              {/* 评论按钮 */}
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={onToggleComment}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                  isCommentOpen 
                    ? "bg-purple-50 dark:bg-purple-900/20 text-purple-500" 
                    : "hover:bg-purple-50 dark:hover:bg-purple-900/20 text-[var(--text-muted)] hover:text-purple-500"
                )}
              >
                <MessageSquare size={18} className={cn(isCommentOpen && "fill-current")} />
                <span className="text-sm font-medium">评论</span>
              </motion.button>
            </div>
            
            {/* 收藏按钮 */}
            <BookmarkButton 
              postId={post.id} 
              initialBookmarked={bookmarkStatus}
              size="sm"
            />
          </div>
        </div>
        
        {/* 评论区 */}
        <AnimatePresence>
          {isCommentOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-[var(--border-color)]"
            >
              <div className="p-5 bg-[var(--bg-secondary)]/50">
                <CommentSection postId={post.id} postAuthorId={post.user_id} currentUser={user} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
};

// --- 组件: 发布框 (美化版) ---
const PublishBox = ({ user, onPublish }: { user: any, onPublish: () => void }) => {
  const [newContent, setNewContent] = useState('');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handlePublish = async () => {
    if ((!newContent.trim() && uploadFiles.length === 0) || !user) return;
    setIsPublishing(true);

    try {
      const uploadedUrls: string[] = [];
      for (const file of uploadFiles) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          toast.error(validation.error || '文件验证失败');
          setIsPublishing(false);
          return;
        }
        
        const fileExt = file.name.split('.').pop();
        const fileName = `logs/${user.id}/${Date.now()}_${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
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

      toast.success('发布成功！');
      setNewContent('');
      setUploadFiles([]);
      setIsFocused(false);
      onPublish();
    } catch (err) {
      console.error(err);
      toast.error('发布失败，请稍后重试');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-[var(--bg-card)] backdrop-blur-xl rounded-3xl border shadow-lg transition-all duration-300",
        isFocused 
          ? "border-[var(--accent-color)] shadow-[var(--accent-color)]/10" 
          : "border-[var(--border-color)]"
      )}
    >
      <div className="p-5">
        <div className="flex gap-4">
          {/* 头像 */}
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-0.5 shadow-md flex-shrink-0">
            <img 
              src={user?.user_metadata?.avatar_url || '/default-avatar.png'} 
              className="w-full h-full object-cover rounded-[12px] bg-[var(--bg-secondary)]" 
            />
          </div>
          
          {/* 输入区 */}
          <div className="flex-1">
            <textarea 
              value={newContent} 
              onChange={(e) => setNewContent(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="分享此刻的想法..." 
              className={cn(
                "w-full bg-transparent resize-none outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-base leading-relaxed transition-all",
                isFocused ? "h-24" : "h-12"
              )}
            />
            
            {/* 图片预览 */}
            <AnimatePresence>
              {uploadFiles.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide"
                >
                  {uploadFiles.map((file, i) => (
                    <motion.div 
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden group ring-2 ring-[var(--border-color)]"
                    >
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setUploadFiles(files => files.filter((_, idx) => idx !== i))} 
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* 工具栏 */}
      <div className="flex justify-between items-center px-5 py-3 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30 rounded-b-3xl">
        <div className="flex gap-1">
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="p-2.5 hover:bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-xl transition-colors"
            title="添加图片"
          >
            <ImageIcon size={20} />
          </button>
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
                    toast.error(validation.error || '文件验证失败');
                    return false;
                  }
                  return true;
                });
                setUploadFiles(prev => [...prev, ...validFiles]);
              }
            }} 
          />
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePublish} 
          disabled={isPublishing || (!newContent.trim() && uploadFiles.length === 0)} 
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isPublishing ? (
            <Loader2 size={16} className="animate-spin"/>
          ) : (
            <>
              <Sparkles size={16} />
              <span>发布动态</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};


// --- 组件: 页面头部 Banner (使用 PageBanner) ---
const LogsBanner = ({ user, momentCount }: { user: any, momentCount: number }) => (
  <PageBanner
    title="我的动态"
    subtitle="记录生活的点滴时光"
    icon={MessageCircle}
    gradient="cyan"
    height="lg"
    decorationIcons={[Sparkles, Calendar]}
    stats={[{ label: '条动态', value: momentCount }]}
  >
    {/* 用户头像 - 通过 children 插槽添加 */}
    {user && (
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="hidden lg:block"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/90 to-white/70 p-0.5 shadow-xl">
          <img 
            src={user?.user_metadata?.avatar_url || '/default-avatar.png'} 
            alt="avatar" 
            className="w-full h-full object-cover rounded-[14px] bg-[var(--bg-secondary)]" 
          />
        </div>
      </motion.div>
    )}
  </PageBanner>
);

// --- 主页面 ---
export default function LogsPage() {
  const [user, setUser] = useState<any>(null);
  const [moments, setMoments] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  
  // 交互状态
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null);
  const [bookmarkStatuses, setBookmarkStatuses] = useState<Record<number, boolean>>({});
  const [likeStatuses, setLikeStatuses] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      fetchMoments();
    };
    init();
  }, []);

  // 批量加载收藏和点赞状态
  useEffect(() => {
    async function loadStatuses() {
      if (moments.length === 0) return;
      
      const postIds = moments.map(m => m.id);
      
      const likes = await checkLikedBatch(postIds, user?.id);
      setLikeStatuses(prev => ({ ...prev, ...likes }));
      
      if (user?.id) {
        const bookmarks = await getBookmarkStatuses(user.id, postIds);
        setBookmarkStatuses(prev => ({ ...prev, ...bookmarks }));
      }
    }
    
    loadStatuses();
  }, [user?.id, moments]);

  const fetchMoments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select(`*, profiles:user_id ( avatar_url, username )`)
      .eq('type', 'moment')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('加载动态失败');
    } else if (data) {
      setMoments(data as any);
    }
    setLoading(false);
  }, [toast]);

  const handleLike = async (id: number, currentLikes: number) => {
    if (likeStatuses[id]) return;
    
    const newLikes = currentLikes + 1;
    setMoments(prev => prev.map(m => m.id === id ? { ...m, likes: newLikes } : m));
    setLikeStatuses(prev => ({ ...prev, [id]: true }));
    
    const result = await likePost(id, user?.id);
    if (!result.success) {
      setMoments(prev => prev.map(m => m.id === id ? { ...m, likes: currentLikes } : m));
      setLikeStatuses(prev => ({ ...prev, [id]: false }));
    }
  };

  // 按日期分组
  const groupedMoments = moments.reduce((groups, moment) => {
    const date = formatDateGroup(new Date(moment.created_at));
    if (!groups[date]) groups[date] = [];
    groups[date].push(moment);
    return groups;
  }, {} as Record<string, Post[]>);

  return (
    <>
      <PageLayout maxWidth="3xl" className="pt-0">
        <LogsBanner user={user} momentCount={moments.length} />
        
        {/* 发布框 */}
        {user && (
          <div className="mb-10">
            <PublishBox user={user} onPublish={fetchMoments} />
          </div>
        )}

        {/* 动态列表 - 时间线样式 */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--accent-color)] mb-4"/>
            <p className="text-[var(--text-muted)]">加载中...</p>
          </div>
        ) : moments.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
              <Sparkles size={32} className="text-[var(--text-muted)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">还没有动态</h3>
            <p className="text-[var(--text-muted)]">发布你的第一条动态吧~</p>
          </div>
        ) : (
          <div className="relative">
            {/* 时间线 */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--accent-color)] via-[var(--border-color)] to-transparent hidden lg:block" style={{ left: '-25px' }} />
            
            {Object.entries(groupedMoments).map(([date, posts]) => (
              <div key={date} className="mb-10">
                {/* 日期标签 */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 mb-6"
                >
                  <div className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-[var(--accent-color)] text-white text-xs font-bold -ml-[45px] z-10">
                    <Calendar size={16} />
                  </div>
                  <span className="px-4 py-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full text-sm font-bold text-[var(--text-primary)] shadow-sm">
                    {date}
                  </span>
                </motion.div>
                
                {/* 该日期下的动态 */}
                <div className="space-y-6 lg:pl-0">
                  {posts.map((post) => (
                    <MomentCard
                      key={post.id}
                      post={post}
                      user={user}
                      likeStatus={likeStatuses[post.id] || false}
                      bookmarkStatus={bookmarkStatuses[post.id] || false}
                      isCommentOpen={activeCommentId === post.id}
                      onLike={() => handleLike(post.id, post.likes)}
                      onToggleComment={() => setActiveCommentId(activeCommentId === post.id ? null : post.id)}
                      onImageClick={setLightboxSrc}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </PageLayout>

      {/* 图片灯箱 */}
      <AnimatePresence>
        {lightboxSrc && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md" 
            onClick={() => setLightboxSrc(null)}
          >
            <button className="absolute top-6 right-6 text-white/70 hover:text-white p-3 hover:bg-white/10 rounded-full transition-colors">
              <X size={28} />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              src={lightboxSrc} 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
              onClick={(e) => e.stopPropagation()} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
