'use client';

import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import LoginModal from '@/components/LoginModal'; 
import PostSkeleton from '@/components/PostSkeleton'; 
import ParallaxImage from '@/components/ParallaxImage'; 
import Link from 'next/link'; 
import { format } from 'date-fns';
import { Heart, Terminal, Eye, Plus } from 'lucide-react'; 
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
    <PageLayout maxWidth="5xl" className="py-24">
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      
      {/* 页面头部 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-3">
          文章
        </h1>
        <p className="text-[var(--text-secondary)] text-lg">
          探索技术与创意的交汇点
        </p>
      </motion.div>

      {/* 发布入口按钮 (仅登录可见) */}
      {user && (
        <Link href="/write">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-10 w-full p-5 bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] backdrop-blur-md rounded-2xl border border-dashed border-[var(--border-color)] hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 flex items-center justify-center gap-3 text-[var(--text-muted)] hover:text-purple-600 group cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors">
              <Plus size={20} className="text-purple-500" />
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
          : posts.map((post) => (
            <motion.article 
              key={post.id}
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -8 }} 
              className="relative group flex flex-col h-full bg-[var(--bg-card)] backdrop-blur-md rounded-[2rem] border border-[var(--border-color)] shadow-sm hover:shadow-2xl hover:bg-[var(--bg-card-hover)] transition-all duration-500 overflow-hidden"
            >
              {/* 全局链接：铺满整个卡片 */}
              <Link 
                href={`/post/${post.id}`} 
                className="absolute inset-0 z-0"
                aria-label={`阅读 ${post.title}`}
              />

              {/* 封面区 */}
              <div className="aspect-video w-full overflow-hidden relative bg-slate-200">
                  <ParallaxImage src={post.cover_url || getAnimeCover(post.id)} />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-slate-800 shadow-sm pointer-events-none z-10">
                      LOG #{post.id}
                  </div>
              </div>

              {/* 内容区 */}
              <div className="flex-1 p-6 lg:p-8 flex flex-col relative z-10 pointer-events-none">
                <div className="flex items-center space-x-3 mb-4 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-mono tracking-wide uppercase">
                    {format(new Date(post.created_at), 'MM/dd')}
                  </span>
                  
                  {/* Tags 链接 */}
                  <div className="flex gap-2 pointer-events-auto">
                    {post.tags?.map(tag => (
                      <Link 
                        key={tag} 
                        href={`/tags/${tag}`}
                        className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full uppercase cursor-pointer hover:bg-purple-600 hover:text-white transition-colors relative z-20"
                      >
                         {tag}
                      </Link>
                    ))}
                  </div>
                </div>

                <h2 className="text-2xl font-black tracking-tighter mb-4 text-[var(--text-primary)] group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors leading-tight">
                  {post.title}
                </h2>
                
                <p className="flex-1 text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-3 mb-6 opacity-70 font-medium">
                  {post.content.slice(0, 150)}{post.content.length > 150 ? '...' : ''}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-[var(--border-color)] mt-auto pointer-events-auto">
                  {/* 点赞按钮 */}
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={(e) => handleLike(e, post.id, post.likes || 0)}
                      disabled={likeStatuses[post.id]}
                      className={`flex items-center space-x-2 transition-colors group/like z-20 relative ${likeStatuses[post.id] ? 'text-pink-500 cursor-default' : 'text-slate-400 hover:text-pink-500'}`}
                    >
                      <Heart size={16} className={likeStatuses[post.id] || (post.likes || 0) > 0 ? 'fill-pink-500 text-pink-500' : ''} />
                      <span className="text-xs font-bold">{post.likes || 0}</span>
                    </button>
                    
                    {/* 浏览量 */}
                    <span className="flex items-center space-x-1 text-slate-400 z-20 relative">
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
                  
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 group-hover:text-purple-600 flex items-center gap-1">
                    阅读全文 <Terminal size={10} />
                  </span>
                </div>
              </div>
            </motion.article>
        ))}
      </div>

      {/* 加载更多 */}
      {hasMore && !loading && (
        <div className="mt-32 flex justify-center">
          <button 
            onClick={() => { const next = page + 1; setPage(next); fetchPosts(next); }}
            className="px-8 py-3 bg-[var(--bg-card)] rounded-full text-xs font-black text-[var(--text-muted)] uppercase tracking-widest hover:bg-[var(--bg-secondary)] hover:text-purple-600 transition-all shadow-sm"
          >
            加载更多
          </button>
        </div>
      )}

      <PageFooter />
    </PageLayout>
  );
}
