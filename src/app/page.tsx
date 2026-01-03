"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import LoginModal from '@/components/LoginModal';
import { 
  Ghost, Home, Archive, User, Send, LogIn, LogOut, 
  Github, Twitter, Heart 
} from 'lucide-react'; 
import React, { useState, useEffect } from 'react';

export default function Page() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  
  // 1. 系统设置仓库（侧边栏文字、标题等）
  const [siteSettings, setSiteSettings] = useState({ 
    sidebar_subtext: 'Digital Frontier',
    site_title: 'SOYMILK' 
  });

  useEffect(() => {
    // 初始化登录状态
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    // 监听登录/注销变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    fetchPosts();
    loadSiteSettings();

    return () => subscription.unsubscribe();
  }, []);

  // 2. 加载系统设置（从后台修改的内容）
  async function loadSiteSettings() {
    const { data } = await supabase.from('site_settings').select('*');
    if (data) {
      const settingsMap = data.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      setSiteSettings(prev => ({ ...prev, ...settingsMap }));
    }
  }

  // 3. 从云端抓取所有文章
  async function fetchPosts() {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    setPosts(data || []);
  }

  // 4. 【核心逻辑】处理点赞
  async function handleLike(postId: number, currentLikes: number) {
    const newLikes = (currentLikes || 0) + 1;
    
    // 同步到数据库
    const { error } = await supabase
      .from('posts')
      .update({ likes: newLikes })
      .eq('id', postId);

    if (error) {
      console.error("点赞同步失败:", error.message);
    } else {
      // 乐观更新：立刻让网页上的数字跳动，不需要等刷新
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: newLikes } : p));
    }
  }

  return (
    <div className="relative min-h-screen bg-[#f0f2f5] text-slate-900 font-sans selection:bg-purple-200">
      
      {/* --- 背景：二次元动态光晕 --- */}
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

      {/* --- 2. 侧边栏：终端式布局 --- */}
      <aside className="fixed left-0 top-0 w-80 h-full p-10 flex flex-col border-r border-white/40 bg-white/30 backdrop-blur-2xl z-50 text-left">
        <div className="relative">
          <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-purple-400" />
          
          <h1 className="text-3xl font-black italic tracking-tighter text-slate-800 mb-1 uppercase">
            {siteSettings.site_title}
          </h1>

          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.3em] mb-10">
            {siteSettings.sidebar_subtext}
          </p>

          {/* 头像点击上传 */}
          <div className="relative group w-24 h-24 mb-10">
            <div 
              onClick={() => user && document.getElementById('avatar-input')?.click()}
              className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl rotate-3 hover:rotate-0 transition-all duration-500 cursor-pointer bg-slate-100"
            >
              <img 
                src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.email || 'milk'}`} 
                alt="avatar" className="w-full h-full object-cover"
              />
              {user && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[10px] text-white font-black uppercase">Change</span>
                </div>
              )}
            </div>
            <input 
              type="file" id="avatar-input" className="hidden" accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !user) return;
                try {
                  const fileName = `${user.id}-${Date.now()}`;
                  await supabase.storage.from('avatars').upload(fileName, file);
                  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
                  await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
                  window.location.reload();
                } catch (err: any) { alert(err.message); }
              }}
            />
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { name: 'HOME / 首页', icon: <Home size={18}/> },
            { name: 'LOGS / 动态', icon: <Archive size={18}/> },
            { name: 'ABOUT / 关于', icon: <User size={18}/> }
          ].map((item, idx) => (
            <motion.a 
              key={item.name} whileHover={{ x: 8 }} href="#" 
              className={`flex items-center space-x-4 p-4 rounded-xl text-sm font-bold transition-all ${idx === 0 ? 'text-purple-600' : 'text-slate-400 hover:text-slate-900'}`}
            >
              {item.icon} <span>{item.name}</span>
            </motion.a>
          ))}
        </nav>

        <div className="space-y-6 pt-10 border-t border-slate-200/50">
          <div className="flex space-x-5 text-slate-400">
             <Github size={18} className="hover:text-black cursor-pointer" />
             <Ghost size={18} className="hover:text-purple-400 cursor-pointer" />
          </div>
          {!user ? (
            <button onClick={() => setIsLoginOpen(true)} className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-purple-600">
               <LogIn size={14}/> <span>System Login</span>
            </button>
          ) : (
            <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-red-400">
               <LogOut size={14}/> <span>Terminal Exit</span>
            </button>
          )}
        </div>
      </aside>

      {/* --- 3. 内容区：文章流 --- */}
      <main className="ml-80 flex-1 py-20 px-24">
        <div className="max-w-3xl mx-auto">
          
          {/* 只有登录才显示的发布框 */}
          <AnimatePresence>
            {user && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-24 p-8 bg-white/80 backdrop-blur-md rounded-[2.5rem] border-2 border-white shadow-xl">
                <input id="post-title" type="text" placeholder="Entry Title //" className="w-full bg-transparent text-2xl font-black mb-4 outline-none placeholder:text-slate-200" />
                <textarea id="post-content" placeholder="Syncing thoughts to cloud..." className="w-full bg-transparent text-slate-600 outline-none h-24 resize-none font-medium placeholder:text-slate-200"></textarea>
                <button 
                  onClick={async () => {
                    const title = (document.getElementById('post-title') as HTMLInputElement).value;
                    const content = (document.getElementById('post-content') as HTMLTextAreaElement).value;
                    await supabase.from('posts').insert([{ title, content, author_email: user.email, likes: 0 }]);
                    (document.getElementById('post-title') as HTMLInputElement).value = "";
                    (document.getElementById('post-content') as HTMLTextAreaElement).value = "";
                    fetchPosts();
                  }}
                  className="mt-4 px-10 py-3 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                >
                  Sync Post
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 文章展示列表 */}
          <div className="space-y-32">
            {posts.map((post, index) => (
              <motion.article 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }}
                key={post.id} 
                className="group"
              >
                <div className="flex items-baseline space-x-4 mb-6">
                  <span className="text-[10px] text-purple-300 font-black italic tracking-widest">#{posts.length - index}</span>
                  <span className="text-[10px] text-slate-300 font-mono">{new Date(post.created_at).toLocaleDateString()}</span>
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-purple-50 to-transparent"></div>
                </div>
                
                <h2 className="text-4xl font-black tracking-tighter mb-4 group-hover:text-purple-600 transition-colors">{post.title}</h2>
                <p className="text-slate-500 leading-relaxed text-lg font-medium opacity-80 mb-8">{post.content}</p>

                {/* 点赞按钮 */}
                <button 
                  onClick={() => handleLike(post.id, post.likes || 0)}
                  className="flex items-center space-x-2 group/heart"
                >
                  <div className="p-2 rounded-full group-hover/heart:bg-pink-50 transition-colors">
                    <Heart 
                      size={20} 
                      className={`transition-all ${ (post.likes || 0) > 0 ? 'fill-pink-500 text-pink-500' : 'text-slate-300 group-hover/heart:text-pink-400'}`} 
                    />
                  </div>
                  <span className={`text-xs font-black ${ (post.likes || 0) > 0 ? 'text-pink-500' : 'text-slate-300'}`}>
                    {post.likes || 0}
                  </span>
                </button>
              </motion.article>
            ))}
          </div>

          <footer className="mt-40 pb-20 text-center text-[10px] text-slate-300 font-black tracking-[0.5em] uppercase">
             --- End of Signal ---
          </footer>
        </div>
      </main>
    </div>
  );
}