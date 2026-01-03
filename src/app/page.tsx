"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import LoginModal from '@/components/LoginModal'; 
import PostSkeleton from '@/components/PostSkeleton'; // ✨ 新增：骨架屏组件
import ReactMarkdown from 'react-markdown'; 
import remarkGfm from 'remark-gfm'; 
import { format } from 'date-fns';
import { 
  Ghost, Home, Archive, User, LogIn, LogOut, 
  Github, Heart, Menu, X, MessageSquare, Terminal 
} from 'lucide-react'; 
import React, { useState, useEffect } from 'react';

// --- 🛡️ 类型定义区 ---
interface SiteSettings {
  sidebar_subtext: string;
  site_title: string;
  [key: string]: string;
}

interface Comment {
  id: number;
  user_email: string;
  content: string;
  created_at: string;
}

interface Post {
  id: number;
  title: string;
  content: string; 
  author_email: string;
  likes: number;
  created_at: string;
  tags: string[]; // ✨ 新增：标签数组
}

// --- 🧩 子组件：评论模块 ---
const CommentsSection = ({ postId, user }: { postId: number, user: any }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchComments();
  }, [isOpen]);

  async function fetchComments() {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    setComments(data || []);
  }

  async function handleSend() {
    if (!newComment.trim() || !user) return;
    setLoading(true);
    await supabase.from('comments').insert({
      post_id: postId,
      user_id: user.id,
      user_email: user.email,
      content: newComment
    });
    setNewComment('');
    fetchComments();
    setLoading(false);
  }

  return (
    <div className="mt-8 pt-6 border-t border-slate-200/60">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-purple-600 transition-colors"
      >
        <MessageSquare size={12} />
        <span>{isOpen ? 'Hide Signals' : `Load Signals`}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }} 
            className="overflow-hidden"
          >
            <div className="py-6 space-y-4">
              {comments.length === 0 && <p className="text-xs text-slate-300 italic pl-2">No signals detected yet...</p>}
              {comments.map(c => (
                <div key={c.id} className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-purple-500 uppercase">{c.user_email?.split('@')[0]}</span>
                    <span className="text-[10px] text-slate-300 font-mono">{format(new Date(c.created_at), 'MM/dd HH:mm')}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>

            {user ? (
              <div className="flex gap-3">
                <input 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Transmit your thought..."
                  className="flex-1 bg-white/80 border-none rounded-xl px-4 py-3 text-sm shadow-inner outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                />
                <button 
                  disabled={loading} 
                  onClick={handleSend} 
                  className="bg-slate-900 text-white px-6 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 transition-colors"
                >
                  {loading ? '...' : 'SEND'}
                </button>
              </div>
            ) : (
              <div className="text-center p-4 bg-slate-100 rounded-xl">
                <span className="text-xs text-slate-400 font-medium">Authentication required to transmit.</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- 🚀 主程序入口 ---
export default function Page() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true); // ✨ 新增：全局加载状态
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ 
    sidebar_subtext: 'Digital Frontier',
    site_title: 'SOYMILK' 
  });

  const PAGE_SIZE = 5;

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
    if (reset) setLoading(true); // 开始加载时显示骨架屏
    
    const from = pageIndex * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).range(from, to);

    if (data) {
      if (data.length < PAGE_SIZE) setHasMore(false);
      setPosts(prev => reset ? data : [...prev, ...data]);
    }
    setLoading(false); // 加载结束
  }

  async function handleLike(postId: number, currentLikes: number) {
    const newLikes = (currentLikes || 0) + 1;
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: newLikes } : p));
    await supabase.from('posts').update({ likes: newLikes }).eq('id', postId);
  }

  return (
    <div className="relative min-h-screen bg-[#f0f2f5] text-slate-900 font-sans selection:bg-purple-200 overflow-x-hidden">
      
      {/* ✨ 背景层 */}
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

      {/* 📱 移动端导航 */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-white/20">
        <h1 className="text-lg font-black italic tracking-tighter text-slate-800 uppercase">{siteSettings.site_title}</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* 🖥️ 侧边栏 */}
      <aside className={`
        fixed inset-0 z-40 bg-white/90 backdrop-blur-3xl transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        lg:translate-x-0 lg:left-0 lg:top-0 lg:w-80 lg:h-full lg:bg-white/30 lg:backdrop-blur-2xl lg:border-r lg:border-white/40
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
          <input type="file" id="avatar-input" className="hidden" accept="image/*" onChange={async (e) => { /* 头像上传逻辑保持不变 */ }} />
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { name: 'HOME', label: '首页', icon: <Home size={18}/> },
            { name: 'LOGS', label: '动态', icon: <Archive size={18}/> },
            { name: 'ABOUT', label: '关于', icon: <User size={18}/> }
          ].map((item, idx) => (
            <motion.a 
              key={item.name} whileHover={{ x: 8 }} href="#" 
              className={`flex items-center space-x-4 p-4 rounded-xl text-sm font-bold transition-all ${idx === 0 ? 'bg-white/50 text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-900'}`}
            >
              {item.icon} <span>{item.name} <span className="opacity-40 font-normal">/ {item.label}</span></span>
            </motion.a>
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

      {/* 📄 内容展示区 */}
      <main className="w-full lg:ml-80 flex-1 py-24 px-6 lg:px-24 min-h-screen">
        <div className="max-w-3xl mx-auto">
          
          {/* 发布框 (仅登录可见) */}
          <AnimatePresence>
            {user && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-20">
                <div className="p-6 lg:p-8 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white shadow-xl hover:shadow-2xl hover:bg-white/80 transition-all duration-500">
                  <div className="flex items-center space-x-2 mb-4 text-purple-400 opacity-60">
                    <Terminal size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">New Entry Mode</span>
                  </div>
                  <input id="post-title" type="text" placeholder="Entry Title //" className="w-full bg-transparent text-2xl font-black mb-4 outline-none placeholder:text-slate-300" />
                  
                  {/* ✨ 新增：标签输入框 */}
                  <input id="post-tags" type="text" placeholder="Tags (separated by comma, e.g. Code, Life)" className="w-full bg-transparent text-sm font-mono text-purple-500 mb-4 outline-none placeholder:text-slate-300/50" />
                  
                  <textarea id="post-content" placeholder="Type in Markdown..." className="w-full bg-transparent text-slate-600 outline-none h-24 resize-none font-medium placeholder:text-slate-300 font-mono text-sm"></textarea>
                  
                  <div className="flex justify-end mt-4">
                    <button 
                      onClick={async () => {
                        const title = (document.getElementById('post-title') as HTMLInputElement).value;
                        const content = (document.getElementById('post-content') as HTMLTextAreaElement).value;
                        // ✨ 解析标签
                        const tagsInput = (document.getElementById('post-tags') as HTMLInputElement).value;
                        const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [];

                        if(!title || !content) return;
                        
                        await supabase.from('posts').insert([{ 
                          title, content, author_email: user.email, likes: 0, tags 
                        }]);
                        
                        (document.getElementById('post-title') as HTMLInputElement).value = "";
                        (document.getElementById('post-content') as HTMLTextAreaElement).value = "";
                        (document.getElementById('post-tags') as HTMLInputElement).value = "";
                        fetchPosts(0, true);
                      }}
                      className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg"
                    >
                      Sync Post
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 文章流 */}
          <div className="space-y-24">
            {/* ✨ 骨架屏加载逻辑 */}
            {loading && posts.length === 0 
              ? Array(3).fill(0).map((_, i) => <PostSkeleton key={i} />) 
              : posts.map((post, index) => (
                <motion.article 
                  initial={{ opacity: 0, y: 30 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true, margin: "-100px" }}
                  key={post.id} 
                  className="group relative"
                >
                  <span className="absolute -left-16 -top-8 text-[8rem] font-black text-slate-400/5 -z-10 select-none hidden xl:block font-serif">
                    {String(post.id).padStart(2, '0')}
                  </span>

                  <div className="flex items-center space-x-4 mb-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-[10px] font-bold">LOG #{post.id}</span>
                    <span className="text-[10px] text-slate-300 font-mono tracking-wide">{format(new Date(post.created_at), 'yyyy.MM.dd')}</span>
                  </div>

                  {/* ✨ 渲染标签 */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <h2 className="text-3xl lg:text-4xl font-black tracking-tighter mb-6 text-slate-800 group-hover:text-purple-600 transition-colors cursor-pointer">
                    {post.title}
                  </h2>
                  
                  <div className="prose prose-slate prose-lg hover:prose-purple transition-colors mb-8 text-slate-500 opacity-90 prose-headings:font-black prose-a:text-purple-500">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {post.content}
                    </ReactMarkdown>
                  </div>

                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => handleLike(post.id, post.likes || 0)}
                      className="flex items-center space-x-2 group/heart bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all border border-transparent hover:border-pink-100"
                    >
                      <Heart 
                        size={18} 
                        className={`transition-all ${(post.likes || 0) > 0 ? 'fill-pink-500 text-pink-500' : 'text-slate-300 group-hover/heart:text-pink-400'}`} 
                      />
                      <span className={`text-xs font-black ${(post.likes || 0) > 0 ? 'text-slate-700' : 'text-slate-300'}`}>
                        {post.likes || 0} Likes
                      </span>
                    </button>
                  </div>

                  <CommentsSection postId={post.id} user={user} />

                </motion.article>
            ))}
          </div>

          {hasMore && !loading && (
            <div className="mt-32 flex justify-center">
              <button 
                onClick={() => { const next = page + 1; setPage(next); fetchPosts(next); }}
                className="group relative px-8 py-3"
              >
                <div className="absolute inset-0 bg-slate-200 rounded-full opacity-20 group-hover:scale-110 transition-transform"/>
                <span className="relative text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-purple-600 transition-colors">
                  Load More Signals
                </span>
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
