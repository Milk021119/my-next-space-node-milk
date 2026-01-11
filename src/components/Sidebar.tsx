'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  BookOpen, 
  Coffee, 
  Settings, 
  UserCircle, 
  LogOut, 
  Menu, 
  X,
  User,
  Radio,
  Rss,
  Archive,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import MiniPlayer from '@/components/player/MiniPlayer'; 
import NeteasePlayer from '@/components/player/NeteasePlayer';
import LoginModal from '@/components/LoginModal';
import ThemeToggle from '@/components/ThemeToggle';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const navItems = [
    { name: '首页', path: '/', icon: Home },
    { name: '文章', path: '/posts', icon: BookOpen },
    { name: '动态', path: '/logs', icon: Coffee },
    { name: '信号塔', path: '/chat', icon: Radio },
    { name: '归档', path: '/archive', icon: Archive },
  ];

  if (user) {
    navItems.push({
      name: '个人中心',
      path: `/u/${user.id}`, 
      icon: UserCircle
    });
  }

  const isAdmin = user?.user_metadata?.is_admin === true;
  if (isAdmin) {
    navItems.push({
      name: '后台管理',
      path: '/admin',
      icon: Settings
    });
  }

  return (
    <>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* 移动端汉堡菜单 */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)} 
          className="p-3 bg-[var(--bg-card)] backdrop-blur-xl rounded-2xl shadow-lg border border-[var(--border-color)] text-[var(--text-primary)] hover:shadow-xl transition-shadow"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X size={20} />
              </motion.div>
            ) : (
              <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <Menu size={20} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* 侧边栏容器 */}
      <motion.aside 
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-[var(--bg-card)] backdrop-blur-2xl border-r border-[var(--border-color)] shadow-2xl 
          lg:shadow-none lg:translate-x-0 lg:fixed transition-transform duration-300 ease-in-out`}
        style={{ x: undefined }}
      >
        <div className="h-full flex flex-col px-5 py-6">
          
          {/* Logo 区域 - 增强版 */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0 mb-8 flex items-center gap-3 px-2"
          >
            <motion.div 
              whileHover={{ rotate: 0, scale: 1.05 }}
              className="relative w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30 rotate-3 transition-all cursor-pointer"
            >
              <span className="font-black text-xl">S</span>
              {/* 发光效果 */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 blur-lg opacity-50 -z-10" />
            </motion.div>
            <div>
              <h1 className="font-black text-xl tracking-tight text-[var(--text-primary)] bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">SOYMILK</h1>
              <p className="text-[10px] font-bold text-[var(--text-muted)] tracking-[0.15em] uppercase flex items-center gap-1">
                <Sparkles size={10} className="text-purple-500 animate-pulse" />
                个人数字空间
              </p>
            </div>
          </motion.div>

          {/* 导航菜单 - 增强版 */}
          <nav className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-2 scrollbar-thin scrollbar-thumb-[var(--border-color)]">
            {navItems.map((item, index) => {
              const isActive = pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path));
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={item.path} onClick={() => setIsOpen(false)} className="block w-full">
                    <motion.div 
                      whileHover={{ x: 6 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative flex items-center gap-4 p-4 rounded-2xl text-sm font-bold transition-all duration-300 group overflow-hidden cursor-pointer
                        ${isActive 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25' 
                          : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                    >
                      {/* 悬停背景光效 */}
                      {!isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}
                      
                      <div className={`relative p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-white/20' : 'bg-[var(--bg-tertiary)] group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 group-hover:shadow-md'}`}>
                        <Icon size={18} className={`transition-colors duration-300 ${isActive ? "text-white" : "text-[var(--text-muted)] group-hover:text-purple-600 dark:group-hover:text-purple-400"}`} />
                      </div>
                      <span className="relative">{item.name}</span>
                      {isActive && (
                        <motion.div 
                          layoutId="nav-indicator"
                          className="absolute right-3 w-2 h-2 bg-white rounded-full shadow-lg shadow-white/50"
                        />
                      )}
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* 底部区域 */}
          <div className="flex-shrink-0 mt-6 pt-6 border-t border-[var(--border-color)] space-y-5">
            
            <NeteasePlayer />

            {/* 主题切换和 RSS */}
            <div className="flex justify-center items-center gap-2">
              <ThemeToggle />
              <motion.a 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/feed.xml" 
                target="_blank"
                className="p-2.5 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all border border-[var(--border-color)] hover:border-orange-200 dark:hover:border-orange-800"
                title="RSS 订阅"
              >
                <Rss size={18} />
              </motion.a>
            </div>

            {user ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm hover:shadow-md transition-all group"
              >
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-0.5 shadow-md">
                    <img 
                      src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.email}`} 
                      alt="avatar" 
                      className="w-full h-full object-cover rounded-[10px] bg-[var(--bg-tertiary)]"
                    />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[var(--bg-secondary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[var(--text-primary)] truncate">
                    {user.user_metadata?.username || user.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-green-500 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    在线
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogout}
                  className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                  title="退出登录"
                >
                  <LogOut size={16} />
                </motion.button>
              </motion.div>
            ) : (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center justify-center gap-2 p-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl text-sm font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                <User size={18} />
                <span>登录 / 注册</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* 移动端遮罩 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
