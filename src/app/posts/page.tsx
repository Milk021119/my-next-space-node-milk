'use client';

import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import LoginModal from '@/components/LoginModal'; 
import PostSkeleton from '@/components/PostSkeleton'; 
import ParallaxImage from '@/components/ParallaxImage'; 
import Link from 'next/link'; 
import { format } from 'date-fns';
import { Heart, Terminal, Eye, Plus, BookOpen, Sparkles, TrendingUp } from 'lucide-react'; 
import React, { useState, useEffect, useCallback } from 'react';
import { getAnimeCover } from '@/lib/constants';
import { checkLikedBatch, likePost } from '@/lib/likesDb';
import { getBookmarkStatuses } from '@/lib/bookmarks';
import BookmarkButton from '@/components/BookmarkButton';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/context/ToastContext';
import PageLayout, { PageFooter } from '@/components/PageLayout';
import type { Post } from '@/types';

export default function BlogPage() {
  const [user, setUser] = useState<any>(null);
  const toast = useToast();

  // 监听用户登录状态
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 6;
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [bookmarkStatuses, setBookmarkStatuses] = useState<Record<number, boolean>>({});
  const [likeStatuses, setLikeStatuses] = useState<Record<number, boolean>>({});

  // 初始化加载
  useEffect(() => {
    fetchPosts(0, true);
  }, []);

  // 批量加载收藏和点赞状态
  useEffect(() => {
    async function loadStatuses() {
      if (posts.length === 0) return;
      
      const postIds = posts.map(p => p.id);
      
      // 加载点赞状态
      const likes = await checkLikedBatch(postIds, user?.id);
      setLikeStatuses(prev => ({ ...prev, ...likes }));
      
      // 加载收藏状态（仅登录用户）
      if (user?.id) {
        const bookmarks = await getBookmarkStatuses(user.id, postIds);
        setBookmarkStatuses(prev => ({ ...prev, ...bookmarks }));
      }
    }
    
    loadStatuses();
  }, [user?.id, posts]);

  // 获取文章列表
  const fetchPosts = useCallback(async (pageIndex: number, reset = false) => {
    if (reset) setLoading(true);
    const from = pageIndex * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('type', 'article') 
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {
      toast.error('加载文章失败');
      setLoading(false);
      return;
    }
    
    if (data) {
      if (data.length < PAGE_SIZE) setHasMore(false);
      setPosts(prev => reset ? data : [...prev, ...data]);
    }
    setLoading(false);
  }, [toast]);

  // 点赞逻辑 - 使用数据库记录
  async function handleLike(e: React.MouseEvent, postId: number, currentLikes: number) {
    e.preventDefault(); 
    e.stopPropagation();
    
    if (likeStatuses[postId]) return;
    
    // 乐观更新
    const newLikes = (currentLikes || 0) + 1;
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: newLikes } : p));
    setLikeStatuses(prev => ({ ...prev, [postId]: true }));
    
    const result = await likePost(postId, user?.id);
    if (!result.success) {
      // 回滚
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: currentLikes } : p));
      setLikeStatuses(prev => ({ ...prev, [postId]: false }));
    }
  }

  return (
    <PageLayout maxWidth="5xl" className="pt-0">
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      
      {/* 美化页面头部 Banner */}
      <div className="relative -mx-6 lg:-mx-10 -mt-12 mb-10">
        <div className="h-64 lg:h-72 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
          {/* 装饰图案 */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-10 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl" />
          </div>
          
          {/* 浮动装饰 */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-16 right-[15%] text-white/20"
          >
            <BookOpen size={48} />
          </motion.div>
          <motion.div 
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-24 left-[10%] text-white/15"
          >
            <Sparkles size={36} />
          </motion.div>
        </div>
        
        {/* 底部渐变 */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
        
        {/* 内容 */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end gap-4"
            >
              <div className="p-4 bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-xl">
                <BookOpen size={32} className="text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-black text-[var(--text-primary)] mb-1">
                  文章
                </h1>
                <p className="text-[var(--text-secondary)] flex items-center gap-2">
                  探索技术与创意的交汇点
                  <span className="px-2 py-0.5 bg-[var(--bg-card)] rounded-full text-xs font-bold text-[var(--accent-color)]">
                    {posts.length} 篇
                  </span>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 发布入口按钮 (仅登录可见) */}
      {user && (
        <Link href="/write">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.01 }}
            className="mb-10 w-full p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 backdrop-blur-md rounded-2xl border border-dashed border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 flex items-center justify-center gap-3 text-purple-600 dark:text-purple-400 group cursor-pointer shadow-sm hover:shadow-md"
          >
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm group-hover:shadow-md transition-all group-hover:scale-110">
              <Plus size={22} className="text-purple-500" />
            </div>
            <span className="text-sm font-bold">写一篇新文章</span>
          </motion.div>
        </Link>
      )}

      {/* 文章画廊 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading && posts.length === 0 
          ? Array(4).fill(0).map((_, i) => <PostSkeleton key={i} />) 
          : posts.length === 0 
          ? <div className="col-span-full"><EmptyState type="posts" /></div>
          : posts.map((post, index) => (
            <motion.article 
              key={post.id}
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }} 
              className="relative group flex flex-col h-full bg-[var(--bg-card)] backdrop-blur-xl rounded-3xl border border-[var(--border-color)] shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-500 overflow-hidden"
            >
              {/* 全局链接：铺满整个卡片 */}
              <Link 
                href={`/post/${post.id}`} 
                className="absolute inset-0 z-0"
                aria-label={`阅读 ${post.title}`}
              />

              {/* 封面区 */}
              <div className="aspect-video w-full overflow-hidden relative bg-[var(--bg-tertiary)]">
                  <ParallaxImage src={post.cover_url || getAnimeCover(post.id)} />
                  {/* 渐变遮罩 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* 编号标签 */}
                  <div className="absolute top-4 right-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-700 dark:text-slate-200 shadow-lg pointer-events-none z-10 flex items-center gap-1.5">
                      <TrendingUp size={10} className="text-purple-500" />
                      #{post.id}
                  </div>
              </div>

              {/* 内容区 */}
              <div className="flex-1 p-6 lg:p-7 flex flex-col relative z-10 pointer-events-none">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="text-[10px] text-[var(--text-muted)] font-mono tracking-wide uppercase bg-[var(--bg-tertiary)] px-2 py-1 rounded-md">
                    {format(new Date(post.created_at), 'yyyy.MM.dd')}
                  </span>
                  
                  {/* Tags 链接 */}
                  <div className="flex gap-2 pointer-events-auto">
                    {post.tags?.slice(0, 2).map(tag => (
                      <Link 
                        key={tag} 
                        href={`/tags/${tag}`}
                        className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2.5 py-1 rounded-lg uppercase cursor-pointer hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 transition-all relative z-20"
                      >
                         {tag}
                      </Link>
                    ))}
                  </div>
                </div>

                <h2 className="text-xl lg:text-2xl font-black tracking-tight mb-3 text-[var(--text-primary)] group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-tight line-clamp-2">
                  {post.title}
                </h2>
                
                <p className="flex-1 text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-2 mb-5 font-medium">
                  {post.content.slice(0, 120)}{post.content.length > 120 ? '...' : ''}
                </p>

                <div className="flex items-center justify-between pt-5 border-t border-[var(--border-color)] mt-auto pointer-events-auto">
                  {/* 交互按钮 */}
                  <div className="flex items-center gap-1">
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleLike(e, post.id, post.likes || 0)}
                      disabled={likeStatuses[post.id]}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all z-20 relative ${likeStatuses[post.id] ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-500 cursor-default' : 'text-[var(--text-muted)] hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-500'}`}
                    >
                      <Heart size={14} className={likeStatuses[post.id] || (post.likes || 0) > 0 ? 'fill-current' : ''} />
                      <span className="text-xs font-bold">{post.likes || 0}</span>
                    </motion.button>
                    
                    {/* 浏览量 */}
                    <span className="flex items-center gap-1.5 px-3 py-1.5 text-[var(--text-muted)] z-20 relative">
                      <Eye size={14} />
                      <span className="text-xs font-bold">{post.views || 0}</span>
                    </span>
                    
                    {/* 收藏按钮 */}
                    <BookmarkButton 
                      postId={post.id} 
                      initialBookmarked={bookmarkStatuses[post.id] || false}
                      size="sm"
                      className="z-20 relative"
                    />
                  </div>
                  
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-color)] group-hover:text-purple-600 flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                    阅读 <Terminal size={12} />
                  </span>
                </div>
              </div>
            </motion.article>
        ))}
      </div>

      {/* 加载更多 */}
      {hasMore && !loading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-16 flex justify-center"
        >
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { const next = page + 1; setPage(next); fetchPosts(next); }}
            className="px-8 py-3.5 bg-[var(--bg-card)] backdrop-blur-xl rounded-2xl text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--accent-color)] border border-[var(--border-color)] hover:border-[var(--accent-color)] transition-all shadow-sm hover:shadow-lg flex items-center gap-2"
          >
            <Sparkles size={16} />
            加载更多文章
          </motion.button>
        </motion.div>
      )}

      <PageFooter />
    </PageLayout>
  );
}
