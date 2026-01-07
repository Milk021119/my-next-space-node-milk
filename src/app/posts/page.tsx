'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import LoginModal from '@/components/LoginModal'; 
import Sidebar from '@/components/Sidebar'; 
import PostSkeleton from '@/components/PostSkeleton'; 
import ParallaxImage from '@/components/ParallaxImage'; 
import Link from 'next/link'; 
import { format } from 'date-fns';
import { Heart, Terminal, Send } from 'lucide-react'; 
import React, { useState, useEffect } from 'react';
import { getAnimeCover } from '@/lib/constants';
import { hasLiked, markAsLiked } from '@/lib/likes';

interface Post {
  id: number;
  title: string;
  content: string; 
  author_email: string;
  likes: number;
  created_at: string;
  tags: string[]; 
  cover_url?: string; 
  type?: string;
  user_id?: string;
}

export default function BlogPage() {
  const [user, setUser] = useState<any>(null);

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

  // 初始化加载
  useEffect(() => {
    fetchPosts(0, true);
  }, []);

  // 获取文章列表
  async function fetchPosts(pageIndex: number, reset = false) {
    if (reset) setLoading(true);
    const from = pageIndex * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    
    // 仅筛选 type 为 'article' 的文章
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('type', 'article') 
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (data) {
      if (data.length < PAGE_SIZE) setHasMore(false);
      setPosts(prev => reset ? data : [...prev, ...data]);
    }
    setLoading(false);
  }

  // 点赞逻辑 - 添加防重复点赞
  async function handleLike(e: React.MouseEvent, postId: number, currentLikes: number) {
    e.preventDefault(); 
    e.stopPropagation();
    
    // 检查是否已点赞
    if (hasLiked(postId)) {
      return; // 已点赞，不执行
    }
    
    const newLikes = (currentLikes || 0) + 1;
    // 乐观更新
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: newLikes } : p));
    // 记录点赞
    markAsLiked(postId);
    await supabase.from('posts').update({ likes: newLikes }).eq('id', postId);
  }

  // 发布文章逻辑
  const handlePublish = async () => {
    const title = (document.getElementById('post-title') as HTMLInputElement).value;
    const content = (document.getElementById('post-content') as HTMLTextAreaElement).value;
    const tagsInput = (document.getElementById('post-tags') as HTMLInputElement).value;
    const cover_url = (document.getElementById('post-cover') as HTMLInputElement).value;
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [];
    
    if(!title || !content) return;
    
    await supabase.from('posts').insert([{ 
      title, 
      content, 
      author_email: user.email, 
      user_id: user.id, 
      likes: 0, 
      tags, 
      cover_url, 
      type: 'article' 
    }]);
    
    fetchPosts(0, true); // 刷新列表
    
    // 清空表单
    (document.getElementById('post-title') as HTMLInputElement).value = "";
    (document.getElementById('post-content') as HTMLTextAreaElement).value = "";
    (document.getElementById('post-tags') as HTMLInputElement).value = "";
    (document.getElementById('post-cover') as HTMLInputElement).value = "";
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-purple-200 dark:selection:bg-purple-800 overflow-x-hidden">
      
      {/* 🔮 背景特效 */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <motion.div animate={{ x: [0, 50, 0], y: [0, 30, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-cyan-100/40 dark:bg-cyan-900/20 rounded-full blur-[120px]" />
        <motion.div animate={{ x: [0, -50, 0], y: [0, -30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-pink-100/40 dark:bg-pink-900/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <Sidebar />

      {/* --- 🎨 内容区 --- */}
      <main className="w-full lg:ml-72 2xl:ml-80 flex-1 py-24 min-h-screen transition-all duration-300">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          
          {/* 发布框 (仅登录可见) */}
          <AnimatePresence>
            {user && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
                <div className="p-6 bg-[var(--bg-card)] backdrop-blur-md rounded-[2rem] border border-[var(--border-color)] shadow-xl hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-center space-x-2 mb-6 text-purple-500/60"><Terminal size={14} /><span className="text-[10px] font-bold uppercase tracking-widest">发布新文章</span></div>
                  <div className="flex flex-col gap-4">
                      <input id="post-title" type="text" placeholder="输入文章标题..." className="w-full bg-transparent text-xl font-black outline-none placeholder:text-[var(--text-muted)] text-[var(--text-primary)]" />
                      <div className="flex gap-4">
                          <input id="post-tags" type="text" placeholder="标签 (如: Code, Life)" className="flex-1 bg-[var(--bg-tertiary)] rounded-lg px-4 py-2 text-sm font-mono text-purple-600 dark:text-purple-400 outline-none placeholder:text-[var(--text-muted)]" />
                          <input id="post-cover" type="text" placeholder="封面图链接 (可选)" className="flex-1 bg-[var(--bg-tertiary)] rounded-lg px-4 py-2 text-sm text-[var(--text-secondary)] outline-none placeholder:text-[var(--text-muted)]" />
                      </div>
                      <textarea id="post-content" placeholder="在此输入正文 (支持 Markdown)..." className="w-full bg-transparent text-[var(--text-secondary)] outline-none h-24 resize-none font-medium placeholder:text-[var(--text-muted)] font-mono text-sm p-2"></textarea>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button onClick={handlePublish} className="px-6 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg flex items-center gap-2">
                      <Send size={12} /> 发布文章
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 文章画廊 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {loading && posts.length === 0 
              ? Array(4).fill(0).map((_, i) => <PostSkeleton key={i} />) 
              : posts.map((post) => (
                // ✅ 修复：外层改为普通 div，避免 <a> 嵌套错误
                <motion.article 
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true, margin: "-50px" }}
                  whileHover={{ y: -8 }} 
                  className="relative group flex flex-col h-full bg-[var(--bg-card)] backdrop-blur-md rounded-[2rem] border border-[var(--border-color)] shadow-sm hover:shadow-2xl hover:bg-[var(--bg-card-hover)] transition-all duration-500 overflow-hidden"
                >
                  {/* 1. 全局链接：铺满整个卡片，设为绝对定位且层级较低 */}
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
                    {/* pointer-events-none 让点击穿透给底下的 Link */}
                    
                    <div className="flex items-center space-x-3 mb-4 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-mono tracking-wide uppercase">
                        {format(new Date(post.created_at), 'MM/dd')}
                      </span>
                      
                      {/* ✅ Tags 链接：恢复点击事件并提高层级 */}
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
                      {/* 点赞按钮需要可点击 */}
                      <button 
                        onClick={(e) => handleLike(e, post.id, post.likes || 0)}
                        disabled={hasLiked(post.id)}
                        className={`flex items-center space-x-2 transition-colors group/like z-20 relative ${hasLiked(post.id) ? 'text-pink-500 cursor-default' : 'text-slate-400 hover:text-pink-500'}`}
                      >
                        <Heart size={16} className={hasLiked(post.id) || (post.likes || 0) > 0 ? 'fill-pink-500 text-pink-500' : ''} />
                        <span className="text-xs font-bold">{post.likes || 0}</span>
                      </button>
                      
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

          <footer className="mt-40 pb-20 text-center text-[10px] text-[var(--text-muted)] font-black tracking-[0.5em] uppercase opacity-50">
              --- End of Signal ---
          </footer>
        </div>
      </main>
    </div>
  );
}
