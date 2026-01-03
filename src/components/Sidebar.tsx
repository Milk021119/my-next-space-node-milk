"use client";

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image'; // ✨ 引入 Image 组件优化性能
import { usePathname } from 'next/navigation'; 
import { supabase } from '@/lib/supabase';
import { 
  Home, User, LogIn, LogOut, 
  Github, Ghost, Camera, Zap, Menu, X 
} from 'lucide-react'; 
import { useState, useEffect } from 'react';
import LoginModal from './LoginModal';
import NotificationCenter from './NotificationCenter';

// ✨ 静态配置提到组件外，避免重复创建
const NAV_ITEMS = [
  { name: 'ARTICLES', label: '文章', icon: <Home size={18}/>, path: '/' },
  { name: 'MOMENTS', label: '动态', icon: <Camera size={18}/>, path: '/logs' },
  { name: 'LOUNGE', label: '聊天室', icon: <Zap size={18}/>, path: '/lounge' },
  { name: 'ABOUT', label: '关于', icon: <User size={18}/>, path: '/about' }
];

export default function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname(); 
  const [user, setUser] = useState<any>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    async function initUser() {
      // 1. ⚡️ 优先读取本地缓存 (秒开)
      const cachedUser = localStorage.getItem('soymilk_user_cache');
      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
      }
      setIsMounted(true); // 允许渲染头像

      // 2. 📡 异步校验并更新
      const { data: { session } } = await supabase.auth.getSession();
      let currentUser = session?.user ?? null;

      if (currentUser) {
        // 查 profile 表获取最新头像
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', currentUser.id)
          .single();
        
        if (profile?.avatar_url) {
          currentUser.user_metadata.avatar_url = profile.avatar_url;
        }

        // ✨ 智能更新：只有数据变了才写缓存和重渲染
        const newUserStr = JSON.stringify(currentUser);
        if (cachedUser !== newUserStr) {
          localStorage.setItem('soymilk_user_cache', newUserStr);
          setUser(currentUser);
        }
      } else {
        if (cachedUser) { // 如果之前有缓存现在没了，说明过期了，清空
          localStorage.removeItem('soymilk_user_cache');
          setUser(null);
        }
      }
    }

    initUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      initUser();
    });
    return () => subscription.unsubscribe();
  }, []);

  // 路由跳转时自动关闭菜单
  useEffect(() => { setIsMobileMenuOpen(false); }, [pathname]);

  return (
    <>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* 📱 Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-white/20">
        <h1 className="text-lg font-black italic tracking-tighter text-slate-800 uppercase">SOYMILK</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 active:scale-95 transition-transform">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* ✨ 遮罩层：点击空白处关闭菜单 */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* 🖥️ Sidebar Body */}
      <aside className={`
        fixed inset-0 z-40 bg-white/80 backdrop-blur-3xl border-r border-white/50 flex flex-col p-10 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        lg:translate-x-0 lg:left-0 lg:top-0 lg:w-72 2xl:w-80 lg:h-full lg:bg-white/40 lg:backdrop-blur-xl
        ${isMobileMenuOpen ? 'translate-x-0 pt-24' : '-translate-x-full'}
        ${className}
      `}>
        <div className="relative mb-10 hidden lg:block">
          <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-purple-400" />
          <h1 className="text-3xl font-black italic tracking-tighter text-slate-800 mb-1 uppercase">SOYMILK</h1>
          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.3em]">Digital Frontier</p>
        </div>

        {/* 头像区域 */}
        <div className="relative group w-24 h-24 mb-10 mx-auto lg:mx-0">
          {!isMounted ? (
            <div className="w-24 h-24 rounded-2xl bg-slate-200 animate-pulse border-4 border-white/50" />
          ) : (
            <Link href={user ? `/u/${user.id}` : '#'} onClick={() => !user && setIsLoginOpen(true)}>
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl cursor-pointer bg-slate-100 transition-transform hover:scale-105">
                {/* ✨ 使用 Next.js Image 优化 */}
                <Image 
                  src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.email || 'milk'}`} 
                  alt="avatar" 
                  fill
                  className="object-cover"
                  sizes="96px"
                  priority // 优先加载头像
                />
              </div>
            </Link>
          )}
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 space-y-2">
          {NAV_ITEMS.map((item) => {
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

        {/* 底部功能区 */}
        <div className="space-y-6 pt-10 border-t border-slate-200/50 mt-auto">
          {/* 固定高度防止跳动 */}
          <div className="flex items-center justify-between px-2 h-6">
            <div className="flex space-x-4 text-slate-400">
               <Link href="https://github.com" target="_blank"><Github size={18} className="hover:text-black cursor-pointer transition-colors" /></Link>
               <Ghost size={18} className="hover:text-purple-400 cursor-pointer transition-colors" />
            </div>
            {isMounted && user && <NotificationCenter userId={user.id} />}
          </div>
          
          <button 
            onClick={async () => {
              if (user) {
                localStorage.removeItem('soymilk_user_cache'); // 立即清缓存
                await supabase.auth.signOut();
                window.location.reload();
              } else {
                setIsLoginOpen(true);
              }
            }}
            className={`flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest justify-center lg:justify-start w-full lg:w-auto ${user ? 'text-red-400 hover:text-red-600' : 'text-slate-400 hover:text-purple-600'}`}
          >
             {!isMounted ? (
               <span className="opacity-0">...</span> // 占位隐藏
             ) : (
               <>
                 {user ? <LogOut size={14}/> : <LogIn size={14}/>} 
                 <span>{user ? 'Terminal Exit' : 'System Login'}</span>
               </>
             )}
          </button>
        </div>
      </aside>
    </>
  );
}
