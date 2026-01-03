"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import LoginModal from '@/components/LoginModal'; 
import PostSkeleton from '@/components/PostSkeleton'; 
import ParallaxImage from '@/components/ParallaxImage'; 
import Link from 'next/link'; 
import { format } from 'date-fns';
import { 
  Ghost, Home, User, LogIn, LogOut, 
  Github, Heart, Menu, X, Terminal, Camera // ✨ 引入 Camera 图标
} from 'lucide-react'; 
import React, { useState, useEffect } from 'react';

// --- 🌸 你的专属二次元图库 ---
const ANIME_COVERS = [
  "/covers/cimgtwjgu000szrs56jyqr0mg.1200.jpg",
  "/covers/cit9ejr5100c6z35nrc61fd7j.1200.jpg",
  "/covers/ciuur1ym5000cbsjb09bof78s.1200.jpg",
  "/covers/claodyl1v0068m78hgrbs3myq.2160p.jpg",
  "/covers/clba9t5hw007qm78hd3cocnrm.2160p.jpg",
  "/covers/clbihqun3007ym78h7rsq6cda.2160p.jpg",
  "/covers/clc7emns2000w6v8hdu5d1k17.2160p.jpg",
  "/covers/cm7rftv17000hkl8h1gjn9e1v.2160p.jpg",
  "/covers/cm9lnaup3001ikl8h044j19za.2160p.jpg",
  "/covers/cm9za5ads001skl8h125v2zrw.2160p.jpg",
  "/covers/cmabaj7od001xkl8hbdm96tlk.2160p.jpg",
  "/covers/cmatsfxm100041k8h93jd61z7.2160p.jpg",
  "/covers/cmbmb7mr3000f1k8hefiqenx7.2160p.jpg",
  "/covers/cmju6k1jb00168w8hcb4pgdnd.2160p.jpg"
];

const getAnimeCover = (id: number) => ANIME_COVERS[id % ANIME_COVERS.length];

// --- 🛡️ 类型定义 ---
interface SiteSettings {
  sidebar_subtext: string;
  site_title: string;
  [key: string]: string;
}

interface Post {
  id: number;
  title: string;
  content: string; 
  author_email: string;
  likes: number;
  created_at: string;
  tags: string[]; 
  cover_url?: string; 
  type?: string; // ✨ 新增类型字段
}

// --- 🚀 主页面 ---
export default function Page() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ 
    sidebar_subtext: 'Digital Frontier',
    site_title: 'SOYMILK' 
  });

  const PAGE_SIZE = 6;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    fetchPosts(0, true);
    loadSiteSettings();
    return () => subscription.unsubscribe();
  }, []);

  async function loadSiteSettings() {
    const { data } = await supabase.from('site_settings').select('*');
    if (data) {
      const settingsMap = data.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
      setSiteSettings(prev => ({ ...prev, ...settingsMap }));
    }
  }

  async function fetchPosts(pageIndex: number, reset = false) {
    if (reset) setLoading(true);
    
    const from = pageIndex * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    
    // ✨ 关键修改：只加载 type 为 'article' 的文章，过滤掉朋友圈
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

  async function handleLike(e: React.MouseEvent, postId: number, currentLikes: number) {
    e.preventDefault(); 
    e.stopPropagation();
    
    const newLikes = (currentLikes || 0) + 1;
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: newLikes } : p));
    await supabase.from('posts').update({ likes: newLikes }).eq('id', postId);
  }

  return (
    <div className="relative min-h-screen bg-[#f0f2f5] text-slate-900 font-sans selection:bg-purple-200 overflow-x-hidden">
      
      {/* 🔮 背景 */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-cyan-100/40 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-pink-100/40 rounded-full blur-[120px]" 
        />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* 📱 移动端 Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-white/20">
        <h1 className="text-lg font-black italic tracking-tighter text-slate-800 uppercase">{siteSettings.site_title}</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* 🖥️ 侧边栏 */}
      <aside className={`
        fixed inset-0 z-40 bg-white/90 backdrop-blur-3xl transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        lg:translate-x-0 lg:left-0 lg:top-0 lg:w-80 lg:h-full lg:bg-white/40 lg:backdrop-blur-xl lg:border-r lg:border-white/50
        ${isMobileMenuOpen ? 'translate-x-0 pt-24 px-8' : '-translate-x-full lg:p-10'}
        flex flex-col
      `}>
        <div className="relative mb-10 hidden lg:block">
          <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-purple-400" />
          <h1 className="text-3xl font-black italic tracking-tighter text-slate-800 mb-1 uppercase">
            {siteSettings.site_title}
          </h1>
          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.3em]">
            {siteSettings.sidebar_subtext}
          </p>
        </div>

        <div className="relative group w-24 h-24 mb-10 mx-auto lg:mx-0">
          <div 
            onClick={() => user && document.getElementById('avatar-input')?.click()}
            className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl lg:rotate-3 lg:hover:rotate-0 transition-all duration-500 cursor-pointer bg-slate-100"
          >
            <img 
              src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.email || 'milk'}`} 
              alt="avatar" className="w-full h-full object-cover"
            />
          </div>
          <input type="file" id="avatar-input" className="hidden" accept="image/*" onChange={async (e) => { /* 上传逻辑 */ }} />
        </div>

        {/* ✨ 更新后的导航栏：包含朋友圈入口 */}
        <nav className="flex-1 space-y-2">
          {[
            { name: 'ARTICLES', label: '文章', icon: <Home size={18}/>, path: '/' },
            { name: 'MOMENTS', label: '动态', icon: <Camera size={18}/>, path: '/logs' }, // 👈 新增
            { name: 'ABOUT', label: '关于', icon: <User size={18}/>, path: '/about' }
          ].map((item, idx) => (
            <Link key={item.name} href={item.path} legacyBehavior>
              <motion.a 
                whileHover={{ x: 8 }} 
                className={`flex items-center space-x-4 p-4 rounded-xl text-sm font-bold transition-all cursor-pointer ${idx === 0 ? 'bg-white/60 text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-900 hover:bg-white/40'}`}
              >
                {item.icon} 
                <span>{item.name} <span className="opacity-40 font-normal">/ {item.label}</span></span>
              </motion.a>
            </Link>
          ))}
        </nav>

        <div className="space-y-6 pt-10 border-t border-slate-200/50 mt-auto">
          <div className="flex space-x-5 text-slate-400 justify-center lg:justify-start">
             <Github size={18} className="hover:text-black cursor-pointer transition-colors" />
             <Ghost size={18} className="hover:text-purple-400 cursor-pointer transition-colors" />
          </div>
          <button 
            onClick={() => user ? supabase.auth.signOut().then(() => window.location.reload()) : setIsLoginOpen(true)}
            className={`flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest justify-center lg:justify-start w-full lg:w-auto ${user ? 'text-red-400 hover:text-red-600' : 'text-slate-400 hover:text-purple-600'}`}
          >
             {user ? <LogOut size={14}/> : <LogIn size={14}/>} 
             <span>{user ? 'Terminal Exit' : 'System Login'}</span>
          </button>
        </div>
      </aside>

      {/* --- 🎨 内容区 --- */}
      <main className="w-full lg:ml-80 flex-1 py-24 px-6 lg:px-12 xl:px-16 min-h-screen">
        <div className="max-w-6xl mx-auto">
          
          {/* 发布框 (仅发文章) */}
          <AnimatePresence>
            {user && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
                <div className="p-6 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-center space-x-2 mb-6 text-purple-500/60">
                    <Terminal size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">New Article</span>
                  </div>
                  <div className="flex flex-col gap-4">
                     <input id="post-title" type="text" placeholder="Title..." className="w-full bg-transparent text-xl font-black outline-none placeholder:text-slate-300" />
                     <div className="flex gap-4">
                        <input id="post-tags" type="text" placeholder="Tags (e.g. Code)" className="flex-1 bg-white/50 rounded-lg px-4 py-2 text-sm font-mono text-purple-600 outline-none placeholder:text-slate-300" />
                        <input id="post-cover" type="text" placeholder="Cover Image URL (Optional)" className="flex-1 bg-white/50 rounded-lg px-4 py-2 text-sm text-slate-600 outline-none placeholder:text-slate-300" />
                     </div>
                     <textarea id="post-content" placeholder="Write in Markdown..." className="w-full bg-transparent text-slate-600 outline-none h-24 resize-none font-medium placeholder:text-slate-300 font-mono text-sm p-2"></textarea>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button 
                      onClick={async () => {
                        const title = (document.getElementById('post-title') as HTMLInputElement).value;
                        const content = (document.getElementById('post-content') as HTMLTextAreaElement).value;
                        const tagsInput = (document.getElementById('post-tags') as HTMLInputElement).value;
                        const cover_url = (document.getElementById('post-cover') as HTMLInputElement).value;
                        
                        const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [];
                        if(!title || !content) return;
                        
                        // ✨ 标记为 type: 'article'
                        await supabase.from('posts').insert([{ 
                          title, content, author_email: user.email, likes: 0, tags, cover_url, type: 'article' 
                        }]);
                        
                        (document.getElementById('post-title') as HTMLInputElement).value = "";
                        (document.getElementById('post-content') as HTMLTextAreaElement).value = "";
                        (document.getElementById('post-tags') as HTMLInputElement).value = "";
                        (document.getElementById('post-cover') as HTMLInputElement).value = "";
                        fetchPosts(0, true);
                      }}
                      className="px-6 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg"
                    >
                      Publish Article
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ✨ 文章画廊 (Grid Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {loading && posts.length === 0 
              ? Array(4).fill(0).map((_, i) => <PostSkeleton key={i} />) 
              : posts.map((post) => (
                <Link href={`/post/${post.id}`} key={post.id} className="block h-full group">
                  <motion.article 
                    initial={{ opacity: 0, y: 30 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true, margin: "-50px" }}
                    whileHover={{ y: -8 }} 
                    className="relative flex flex-col h-full bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/60 shadow-sm group-hover:shadow-2xl group-hover:bg-white/70 transition-all duration-500 overflow-hidden cursor-pointer"
                  >
                    {/* 封面图 */}
                    <div className="aspect-video w-full overflow-hidden relative bg-slate-200">
                       <ParallaxImage src={post.cover_url || getAnimeCover(post.id)} />
                       
                       <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-slate-800 shadow-sm pointer-events-none z-10">
                          LOG #{post.id}
                       </div>
                    </div>

                    {/* 内容 */}
                    <div className="flex-1 p-6 lg:p-8 flex flex-col">
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-[10px] text-slate-400 font-mono tracking-wide uppercase">
                          {format(new Date(post.created_at), 'MMMM dd, yyyy')}
                        </span>
                        {post.tags?.map(tag => (
                          <span key={tag} className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full uppercase">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <h2 className="text-2xl font-black tracking-tighter mb-4 text-slate-800 group-hover:text-purple-700 transition-colors leading-tight">
                        {post.title}
                      </h2>
                      
                      {/* 摘要 */}
                      <p className="flex-1 text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6 opacity-70 font-medium">
                        {post.content.slice(0, 150)}{post.content.length > 150 ? '...' : ''}
                      </p>

                      <div className="flex items-center justify-between pt-6 border-t border-slate-100/50 mt-auto">
                        <button 
                          onClick={(e) => handleLike(e, post.id, post.likes || 0)}
                          className="flex items-center space-x-2 text-slate-400 hover:text-pink-500 transition-colors group/like z-20 relative"
                        >
                          <Heart size={16} className={(post.likes || 0) > 0 ? 'fill-pink-500 text-pink-500' : ''} />
                          <span className="text-xs font-bold">{post.likes || 0}</span>
                        </button>
                        
                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 group-hover:text-purple-600 flex items-center gap-1">
                          Read Signal <Terminal size={10} />
                        </span>
                      </div>
                    </div>
                  </motion.article>
                </Link>
            ))}
          </div>

          {hasMore && !loading && (
            <div className="mt-32 flex justify-center">
              <button 
                onClick={() => { const next = page + 1; setPage(next); fetchPosts(next); }}
                className="px-8 py-3 bg-white/50 rounded-full text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-white hover:text-purple-600 transition-all shadow-sm"
              >
                Load More
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
