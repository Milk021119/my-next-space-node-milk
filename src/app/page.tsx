"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import LoginModal from '@/components/LoginModal';
import { Ghost, Home, Archive, User, Send, LogIn, LogOut, Github, Twitter } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export default function Page() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  
  // 1. 设置仓库，增加默认值保护
  const [siteSettings, setSiteSettings] = useState({ 
    sidebar_subtext: 'Digital Frontier',
    site_title: 'SOYMILK' 
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    fetchPosts();
    loadSiteSettings();
  }, []);

  // 2. 加载系统设置
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

  async function fetchPosts() {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    setPosts(data || []);
  }

  return (
    <div className="relative min-h-screen bg-[#f0f2f5] text-slate-900 font-sans selection:bg-purple-200">
      
      {/* --- 1. 二次元氛围背景 --- */}
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

      {/* --- 2. 侧边栏 --- */}
      <aside className="fixed left-0 top-0 w-80 h-full p-10 flex flex-col border-r border-white/40 bg-white/30 backdrop-blur-2xl z-50">
        <div className="relative">
          <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-purple-400" />
          
          <h1 className="text-3xl font-black italic tracking-tighter text-slate-800 mb-1">
            {siteSettings.site_title || 'SOYMILK'}
          </h1>

          {/* 这里就是你刚才改成功的活变量！ */}
          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.3em] mb-10">
            {siteSettings.sidebar_subtext}
          </p>

          {/* 头像区域 */}
          <div className="relative group w-24 h-24 mb-10">
            <div 
              onClick={() => user && document.getElementById('avatar-input')?.click()}
              className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl rotate-3 hover:rotate-0 transition-all duration-500 cursor-pointer bg-slate-100"
            >
              <img 
                src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.email || 'milk'}`} 
                alt="avatar" 
                className="w-full h-full object-cover"
              />
              {user && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[10px] text-white font-black uppercase tracking-tighter">Change</span>
                </div>
              )}
            </div>
            <input 
              type="file" id="avatar-input" className="hidden" accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !user) return;
                try {
                  const fileExt = file.name.split('.').pop();
                  const fileName = `${user.id}-${Math.random()}.${fileExt}`;
                  let { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
                  if (uploadError) throw uploadError;
                  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
                  await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
                  window.location.reload();
                } catch (error: any) { alert("同步失败: " + error.message); }
              }}
            />
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 space-y-2">
          {[
            { name: 'HOME / 首页', icon: <Home size={18}/> },
            { name: 'LOGS / 动态', icon: <Archive size={18}/> },
            { name: 'ABOUT / 关于', icon: <User size={18}/> }
          ].map((item, idx) => (
            <motion.a 
              key={item.name}
              whileHover={{ x: 8, backgroundColor: "rgba(255,255,255,0.5)" }}
              href="#" 
              className={`flex items-center space-x-4 p-4 rounded-xl text-sm font-bold transition-all ${idx === 0 ? 'text-purple-600' : 'text-slate-400 hover:text-slate-900'}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </motion.a>
          ))}
        </nav>

        <div className="space-y-6 pt-10 border-t border-slate-200/50">
          <div className="flex space-x-5 text-slate-400">
            <Github size={18} className="hover:text-black cursor-pointer transition-colors" />
            <Ghost size={18} className="hover:text-purple-400 cursor-pointer transition-colors" />
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

      {/* --- 3. 内容区 --- */}
      <main className="ml-80 flex-1 py-20 px-24">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence>
            {user && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-20 p-8 bg-white/80 backdrop-blur-md rounded-[2.5rem] border-2 border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Send size={40}/></div>
                <input id="post-title" type="text" placeholder="Entry Title //" className="w-full bg-transparent text-2xl font-black mb-4 outline-none placeholder:text-slate-200" />
                <textarea id="post-content" placeholder="Syncing thoughts to cloud..." className="w-full bg-transparent text-slate-600 outline-none h-24 resize-none font-medium placeholder:text-slate-200"></textarea>
                <button 
                  onClick={async () => {
                    const title = (document.getElementById('post-title') as HTMLInputElement).value;
                    const content = (document.getElementById('post-content') as HTMLTextAreaElement).value;
                    await supabase.from('posts').insert([{ title, content, author_email: user.email }]);
                    fetchPosts();
                  }}
                  className="mt-4 px-10 py-3 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all"
                >
                  Sync Post
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-20">
            {posts.map((post, index) => (
              <motion.article initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} key={post.id} className="group">
                <div className="flex items-baseline space-x-4 mb-6">
                  <span className="text-[10px] text-purple-300 font-black italic tracking-widest">#{posts.length - index}</span>
                  <span className="text-[10px] text-slate-300 font-mono">{new Date(post.created_at).toLocaleDateString()}</span>
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-purple-50 to-transparent"></div>
                </div>
                <h2 className="text-4xl font-black tracking-tighter mb-4 group-hover:text-purple-600 transition-colors">{post.title}</h2>
                <p className="text-slate-500 leading-relaxed text-lg font-medium opacity-80">{post.content}</p>
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