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

// 封面图数组
const ANIME_COVERS = ["/covers/cimgtwjgu000szrs56jyqr0mg.1200.jpg", "/covers/cit9ejr5100c6z35nrc61fd7j.1200.jpg", "/covers/ciuur1ym5000cbsjb09bof78s.1200.jpg", "/covers/claodyl1v0068m78hgrbs3myq.2160p.jpg", "/covers/clba9t5hw007qm78hd3cocnrm.2160p.jpg", "/covers/clbihqun3007ym78h7rsq6cda.2160p.jpg", "/covers/clc7emns2000w6v8hdu5d1k17.2160p.jpg", "/covers/cm7rftv17000hkl8h1gjn9e1v.2160p.jpg", "/covers/cm9lnaup3001ikl8h044j19za.2160p.jpg", "/covers/cm9za5ads001skl8h125v2zrw.2160p.jpg", "/covers/cmabaj7od001xkl8hbdm96tlk.2160p.jpg", "/covers/cmatsfxm100041k8h93jd61z7.2160p.jpg", "/covers/cmbmb7mr3000f1k8hefiqenx7.2160p.jpg", "/covers/cmju6k1jb00168w8hcb4pgdnd.2160p.jpg"];
const getAnimeCover = (id: number) => ANIME_COVERS[id % ANIME_COVERS.length];

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

  // 点赞逻辑
  async function handleLike(e: React.MouseEvent, postId: number, currentLikes: number) {
    e.preventDefault(); 
    e.stopPropagation();
    const newLikes = (currentLikes || 0) + 1;
    // 乐观更新
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: newLikes } : p));
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
    <div className="relative min-h-screen bg-[#f0f2f5] text-slate-900 font-sans selection:bg-purple-200 overflow-x-hidden">
      
      {/* 🔮 背景特效 */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <motion.div animate={{ x: [0, 50, 0], y: [0, 30, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-cyan-100/40 rounded-full blur-[120px]" />
        <motion.div animate={{ x: [0, -50, 0], y: [0, -30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-pink-100/40 rounded-full blur-[120px]" />
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
                <div className="p-6 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-center space-x-2 mb-6 text-purple-500/60"><Terminal size={14} /><span className="text-[10px] font-bold uppercase tracking-widest">发布新文章</span></div>
                  <div className="flex flex-col gap-4">
                      <input id="post-title" type="text" placeholder="输入文章标题..." className="w-full bg-transparent text-xl font-black outline-none placeholder:text-slate-300" />
                      <div className="flex gap-4">
                          <input id="post-tags" type="text" placeholder="标签 (如: Code, Life)" className="flex-1 bg-white/50 rounded-lg px-4 py-2 text-sm font-mono text-purple-600 outline-none placeholder:text-slate-300" />
                          <input id="post-cover" type="text" placeholder="封面图链接 (可选)" className="flex-1 bg-white/50 rounded-lg px-4 py-2 text-sm text-slate-600 outline-none placeholder:text-slate-300" />
                      </div>
                      <textarea id="post-content" placeholder="在此输入正文 (支持 Markdown)..." className="w-full bg-transparent text-slate-600 outline-none h-24 resize-none font-medium placeholder:text-slate-300 font-mono text-sm p-2"></textarea>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button onClick={handlePublish} className="px-6 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg flex items-center gap-2">
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
                  className="relative group flex flex-col h-full bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/60 shadow-sm hover:shadow-2xl hover:bg-white/70 transition-all duration-500 overflow-hidden"
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

                    <h2 className="text-2xl font-black tracking-tighter mb-4 text-slate-800 group-hover:text-purple-700 transition-colors leading-tight">
                      {post.title}
                    </h2>
                    
                    <p className="flex-1 text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6 opacity-70 font-medium">
                      {post.content.slice(0, 150)}{post.content.length > 150 ? '...' : ''}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-100/50 mt-auto pointer-events-auto">
                      {/* 点赞按钮需要可点击 */}
                      <button 
                        onClick={(e) => handleLike(e, post.id, post.likes || 0)}
                        className="flex items-center space-x-2 text-slate-400 hover:text-pink-500 transition-colors group/like z-20 relative"
                      >
                        <Heart size={16} className={(post.likes || 0) > 0 ? 'fill-pink-500 text-pink-500' : ''} />
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
                className="px-8 py-3 bg-white/50 rounded-full text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-white hover:text-purple-600 transition-all shadow-sm"
              >
                加载更多
              </button>
            </div>
          )}

          <footer className="mt-40 pb-20 text-center text-[10px] text-slate-300 font-black tracking-[0.5em] uppercase opacity-50">
              --- End of Signal ---
          </footer>
        </div>
      </main>
    </div>
  );
}
