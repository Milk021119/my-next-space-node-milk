"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
import { supabase } from '@/lib/supabase';
import { 
  Home, User, LogIn, LogOut, 
  Github, Ghost, Camera, Zap, Menu, X 
} from 'lucide-react'; 
import { useState, useEffect } from 'react';
import LoginModal from './LoginModal';
import NotificationCenter from './NotificationCenter';

export default function Sidebar() {
  const pathname = usePathname(); 
  const [user, setUser] = useState<any>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // ✨ 核心修改：获取用户时，顺便去查最新的 profile 头像
    async function fetchUser() {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;

      if (currentUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', currentUser.id)
          .single();
        
        // 覆盖旧头像
        if (profile?.avatar_url) {
          currentUser.user_metadata.avatar_url = profile.avatar_url;
        }
      }
      setUser(currentUser);
    }

    fetchUser();

    // 监听登录状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUser(); // 重新拉取
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [pathname]);

  const navItems = [
    { name: 'ARTICLES', label: '文章', icon: <Home size={18}/>, path: '/' },
    { name: 'MOMENTS', label: '动态', icon: <Camera size={18}/>, path: '/logs' },
    { name: 'LOUNGE', label: '聊天室', icon: <Zap size={18}/>, path: '/lounge' },
    { name: 'ABOUT', label: '关于', icon: <User size={18}/>, path: '/about' }
  ];

  return (
    <>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-white/20">
        <h1 className="text-lg font-black italic tracking-tighter text-slate-800 uppercase">SOYMILK</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>
      
      {/* Sidebar Body */}
      <aside className={`
        fixed inset-0 z-40 bg-white/80 backdrop-blur-3xl border-r border-white/50 flex flex-col p-10 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        lg:translate-x-0 lg:left-0 lg:top-0 lg:w-80 lg:h-full lg:bg-white/40 lg:backdrop-blur-xl
        ${isMobileMenuOpen ? 'translate-x-0 pt-24' : '-translate-x-full'}
      `}>
        <div className="relative mb-10 hidden lg:block">
          <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-purple-400" />
          <h1 className="text-3xl font-black italic tracking-tighter text-slate-800 mb-1 uppercase">SOYMILK</h1>
          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.3em]">Digital Frontier</p>
        </div>

        {/* 头像区域：这里的 src 已经是最新的了 */}
        <div className="relative group w-24 h-24 mb-10 mx-auto lg:mx-0">
          <Link href={user ? `/u/${user.id}` : '#'} onClick={() => !user && setIsLoginOpen(true)}>
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl cursor-pointer bg-slate-100 transition-transform hover:scale-105">
              <img 
                src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.email || 'milk'}`} 
                alt="avatar" className="w-full h-full object-cover" 
              />
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
            return (
              <Link key={item.name} href={item.path} className="block w-full">
                <motion.div 
                  whileHover={{ x: 8 }} 
                  className={`flex items-center space-x-4 p-4 rounded-xl text-sm font-bold transition-all cursor-pointer 
                    ${isActive 
                      ? 'bg-white/80 text-purple-600 shadow-sm border border-white/50' 
                      : 'text-slate-400 hover:text-slate-900 hover:bg-white/40'}`}
                >
                  {item.icon} 
                  <span>{item.name} <span className={`font-normal ${isActive ? 'opacity-60' : 'opacity-30'}`}>/ {item.label}</span></span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-6 pt-10 border-t border-slate-200/50 mt-auto">
          <div className="flex items-center justify-between px-2">
            <div className="flex space-x-4 text-slate-400">
               <Link href="https://github.com" target="_blank"><Github size={18} className="hover:text-black cursor-pointer transition-colors" /></Link>
               <Ghost size={18} className="hover:text-purple-400 cursor-pointer transition-colors" />
            </div>
            {user && <NotificationCenter userId={user.id} />}
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
    </>
  );
}
