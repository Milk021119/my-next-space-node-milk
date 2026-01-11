'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { getUserBookmarks, type Post } from '@/lib/bookmarks';
import Sidebar from '@/components/Sidebar';
import AnimatedBackground from '@/components/AnimatedBackground';
import BookmarkButton from '@/components/BookmarkButton';
import ParallaxImage from '@/components/ParallaxImage';
import Link from 'next/link';
import { format } from 'date-fns';
import { Loader2, Bookmark, ArrowLeft, Heart, Terminal } from 'lucide-react';
import { getAnimeCover } from '@/lib/constants';
import { hasLiked, markAsLiked } from '@/lib/likes';

export default function BookmarksPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [bookmarks, setBookmarks] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
      setIsOwner(user?.id === id);
      
      // 获取用户名
      if (id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', id)
          .single();
        setUsername(profile?.username || '用户');
      }
      
      await fetchBookmarks();
    }
    
    if (id) init();
  }, [id]);

  async function fetchBookmarks() {
    if (!id || typeof id !== 'string') return;
    
    setLoading(true);
    try {
      const posts = await getUserBookmarks(id);
      setBookmarks(posts);
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
    } finally {
      setLoading(false);
    }
  }

  // 当取消收藏后从列表移除
  const handleBookmarkRemoved = (postId: number) => {
    setBookmarks(prev => prev.filter(p => p.id !== postId));
  };

  // 点赞逻辑
  async function handleLike(e: React.MouseEvent, postId: number, currentLikes: number) {
    e.preventDefault();
    e.stopPropagation();
    
    if (hasLiked(postId)) return;
    
    const newLikes = (currentLikes || 0) + 1;
    setBookmarks(prev => prev.map(p => p.id === postId ? { ...p, likes: newLikes } : p));
    markAsLiked(postId);
    await supabase.from('posts').update({ likes: newLikes }).eq('id', postId);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-sans flex">
      <Sidebar />
      <AnimatedBackground />
      
      <main className="flex-1 lg:ml-72 2xl:ml-80 transition-all duration-300 min-h-screen py-24 relative z-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          
          {/* 页面头部 */}
          <div className="mb-12">
            <button 
              onClick={() => router.push(`/u/${id}`)}
              className="flex items-center gap-2 text-[var(--text-muted)] hover:text-purple-600 transition-colors mb-6 text-sm font-medium"
            >
              <ArrowLeft size={16} />
              返回个人主页
            </button>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Bookmark size={24} className="text-amber-500" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[var(--text-primary)]">
                  {isOwner ? '我的收藏' : `${username}的收藏`}
                </h1>
                <p className="text-sm text-[var(--text-muted)]">
                  共 {bookmarks.length} 篇文章
                </p>
              </div>
            </div>
          </div>

          {/* 收藏列表 */}
          {bookmarks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Bookmark size={40} className="text-slate-300 dark:text-slate-600" />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                暂无收藏
              </h2>
              <p className="text-[var(--text-muted)] mb-6">
                {isOwner ? '快去发现感兴趣的文章并收藏吧！' : '该用户还没有收藏任何文章'}
              </p>
              {isOwner && (
                <Link 
                  href="/posts"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform"
                >
                  <Terminal size={14} />
                  浏览文章
                </Link>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnimatePresence mode="popLayout">
                {bookmarks.map((post) => (
                  <motion.article
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -8 }}
                    className="relative group flex flex-col h-full bg-[var(--bg-card)] backdrop-blur-md rounded-[2rem] border border-[var(--border-color)] shadow-sm hover:shadow-2xl hover:bg-[var(--bg-card-hover)] transition-all duration-500 overflow-hidden"
                  >
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
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={(e) => handleLike(e, post.id, post.likes || 0)}
                            disabled={hasLiked(post.id)}
                            className={`flex items-center space-x-2 transition-colors group/like z-20 relative ${hasLiked(post.id) ? 'text-pink-500 cursor-default' : 'text-slate-400 hover:text-pink-500'}`}
                          >
                            <Heart size={16} className={hasLiked(post.id) || (post.likes || 0) > 0 ? 'fill-pink-500 text-pink-500' : ''} />
                            <span className="text-xs font-bold">{post.likes || 0}</span>
                          </button>

                          {/* 收藏按钮 - 当前用户可以取消收藏 */}
                          {currentUserId === id && (
                            <BookmarkButton
                              postId={post.id}
                              initialBookmarked={true}
                              size="sm"
                              className="z-20 relative"
                              onToggle={(newState) => {
                                if (!newState) handleBookmarkRemoved(post.id);
                              }}
                            />
                          )}
                        </div>

                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 group-hover:text-purple-600 flex items-center gap-1">
                          阅读全文 <Terminal size={10} />
                        </span>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          )}

          <footer className="mt-40 pb-20 text-center text-[10px] text-[var(--text-muted)] font-black tracking-[0.5em] uppercase opacity-50">
            --- End of Bookmarks ---
          </footer>
        </div>
      </main>
    </div>
  );
}
