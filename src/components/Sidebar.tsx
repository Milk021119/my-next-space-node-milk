'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home, 
  BookOpen, 
  Coffee, 
  Settings, 
  UserCircle, // 个人中心图标
  LogOut, 
  Menu, 
  X,
  User,
  Radio
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import MiniPlayer from '@/components/player/MiniPlayer'; 

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // ✅ 1. 基础菜单 (前三个)
  const navItems = [
    { name: '首页', path: '/', icon: Home },
    { name: '文章', path: '/posts', icon: BookOpen },
    { name: '动态', path: '/logs', icon: Coffee },
    { name: '信号塔', path: '/chat', icon: Radio },
  ];

  // ✅ 2. 第四个：个人中心 (每个人都有)
  // 逻辑：如果登录了去 /u/id，没登录去 /auth/login
  navItems.push({
    name: '个人中心',
    path: user ? `/u/${user.id}` : '/auth/login', 
    icon: UserCircle
  });

  // ✅ 3. 第五个：后台管理 (仅限管理员)
  // 权限判断：你的邮箱 OR 数据库 is_admin 字段
  const isAdmin = user?.email === 's2285627839@outlook.com' || user?.user_metadata?.is_admin === true;
  
  if (isAdmin) {
    navItems.push({
      name: '后台管理',
      path: '/admin',
      icon: Settings
    });
  }

  return (
    <>
      {/* 移动端汉堡菜单按钮 */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-3 bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/50 text-slate-800"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* 侧边栏容器 */}
      <motion.aside 
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white/80 backdrop-blur-2xl border-r border-slate-100 shadow-2xl 
          lg:shadow-none lg:translate-x-0 lg:fixed transition-transform duration-300 ease-in-out`}
        style={{ x: undefined }}
      >
        <div className="h-full flex flex-col px-6 py-6">
          
          {/* Logo 区域 */}
          <div className="flex-shrink-0 mb-8 flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-md shadow-purple-900/20">
              <span className="font-black text-lg">S</span>
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tighter text-slate-900">SOYMILK</h1>
              <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">个人数字空间</p>
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
                        ? 'bg-slate-900 text-white shadow-lg shadow-purple-900/20' 
                        : 'text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                      }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="active-nav"
                        className="absolute inset-0 bg-slate-900 z-0"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    
                    <div className="relative z-10 flex items-center gap-4">
                      <Icon size={18} className={isActive ? "text-purple-400" : "group-hover:text-purple-600 transition-colors"} />
                      <span>{item.name}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* 底部区域 */}
          <div className="flex-shrink-0 mt-6 pt-6 border-t border-slate-100 space-y-6 bg-white/0">
            
            <MiniPlayer />

            {user ? (
              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                 <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                    <img 
                      src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.email}`} 
                      alt="avatar" 
                      className="w-full h-full object-cover"
                    />
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {user.user_metadata?.username || user.email?.split('@')[0]}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                      在线
                    </div>
                 </div>
                 <button 
                   onClick={handleLogout}
                   className="p-2 text-slate-300 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg"
                   title="退出登录"
                 >
                   <LogOut size={16} />
                 </button>
              </div>
            ) : (
              <Link href="/auth/login" className="flex items-center justify-center gap-2 p-3 w-full bg-slate-900 text-white rounded-xl text-xs font-bold uppercase hover:bg-purple-600 transition-colors shadow-lg shadow-slate-900/10">
                <User size={16} />
                <span>登录 / 注册</span>
              </Link>
            )}
          </div>
        </div>
      </motion.aside>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
