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
  Radio
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import MiniPlayer from '@/components/player/MiniPlayer'; 
import LoginModal from '@/components/LoginModal';
import ThemeToggle from '@/components/ThemeToggle';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  // ✨ 新增：控制登录弹窗的状态
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
  ];

  // 动态菜单逻辑
  if (user) {
    navItems.push({
      name: '个人中心',
      path: `/u/${user.id}`, 
      icon: UserCircle
    });
  }

  // 管理员判断：只依赖数据库字段，不硬编码邮箱
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
      {/* ✨ 挂载登录弹窗组件 */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* 移动端汉堡菜单 */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-3 bg-[var(--bg-card)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--border-color)] text-[var(--text-primary)]"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* 侧边栏容器 */}
      <motion.aside 
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-[var(--bg-card)] backdrop-blur-2xl border-r border-[var(--border-color)] shadow-2xl 
          lg:shadow-none lg:translate-x-0 lg:fixed transition-transform duration-300 ease-in-out`}
        style={{ x: undefined }}
      >
        <div className="h-full flex flex-col px-6 py-6">
          
          {/* Logo 区域 */}
          <div className="flex-shrink-0 mb-8 flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-slate-900 dark:bg-slate-100 rounded-xl flex items-center justify-center text-white dark:text-slate-900 shadow-md shadow-purple-900/20">
              <span className="font-black text-lg">S</span>
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tighter text-[var(--text-primary)]">SOYMILK</h1>
              <p className="text-[10px] font-bold text-[var(--text-muted)] tracking-[0.2em] uppercase">个人数字空间</p>
            </div>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {navItems.map((item) => {
              const isActive = pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path));
              const Icon = item.icon;

              return (
                <Link key={item.name} href={item.path} onClick={() => setIsOpen(false)} className="block w-full">
                  <div 
                    className={`relative flex items-center space-x-4 p-4 rounded-xl text-xs font-black tracking-widest transition-all duration-300 group overflow-hidden
                      ${isActive 
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg shadow-purple-900/20' 
                        : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] hover:shadow-sm'
                      }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="active-nav"
                        className="absolute inset-0 bg-slate-900 dark:bg-slate-100 z-0"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    
                    <div className="relative z-10 flex items-center gap-4">
                      <Icon size={18} className={isActive ? "text-purple-400 dark:text-purple-600" : "group-hover:text-purple-600 transition-colors"} />
                      <span>{item.name}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* 底部区域 */}
          <div className="flex-shrink-0 mt-6 pt-6 border-t border-[var(--border-color)] space-y-6 bg-transparent">
            
            <MiniPlayer />

            {/* 主题切换按钮 */}
            <div className="flex justify-center">
              <ThemeToggle />
            </div>

            {user ? (
              <div className="flex items-center gap-3 p-3 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm hover:shadow-md transition-shadow">
                 <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden border border-[var(--border-color)] flex-shrink-0">
                    <img 
                      src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.email}`} 
                      alt="avatar" 
                      className="w-full h-full object-cover"
                    />
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {user.user_metadata?.username || user.email?.split('@')[0]}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] truncate flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                      在线
                    </div>
                 </div>
                 <button 
                   onClick={handleLogout}
                   className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                   title="退出登录"
                 >
                   <LogOut size={16} />
                 </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center justify-center gap-2 p-3 w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold uppercase hover:bg-purple-600 dark:hover:bg-purple-400 transition-colors shadow-lg shadow-slate-900/10"
              >
                <User size={16} />
                <span>登录 / 注册</span>
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* 移动端遮罩 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
