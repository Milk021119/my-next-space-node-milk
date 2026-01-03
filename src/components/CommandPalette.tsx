"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, User, Loader2, CornerDownLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ type: 'post' | 'user', id: any, title: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 1. 监听快捷键 (Ctrl+J)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 自动聚焦
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  // 搜索逻辑
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) { setResults([]); return; }
      setLoading(true);
      
      const [postsRes, usersRes] = await Promise.all([
        supabase.from('posts').select('id, title').ilike('title', `%${query}%`).limit(5),
        supabase.from('profiles').select('id, username').ilike('username', `%${query}%`).limit(3)
      ]);

      setResults([
        ...(postsRes.data || []).map((p: any) => ({ type: 'post' as const, id: p.id, title: p.title })),
        ...(usersRes.data || []).map((u: any) => ({ type: 'user' as const, id: u.id, title: u.username }))
      ]);
      setActiveIndex(0);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // 键盘导航
  const handleNavigation = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(prev => (prev + 1) % results.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(prev => (prev - 1 + results.length) % results.length); }
    else if (e.key === 'Enter' && results.length > 0) handleSelect(results[activeIndex]);
  };

  const handleSelect = (item: { type: 'post' | 'user', id: any }) => {
    setIsOpen(false); setQuery('');
    router.push(item.type === 'post' ? `/post/${item.id}` : `/u/${item.id}`);
  };

  return (
    <>
      {/* 悬浮按钮 (FAB) */}
      <motion.button
        onClick={() => setIsOpen(true)}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 z-[90] w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-purple-600 transition-colors"
        title="搜索 (Ctrl+J)"
      >
        <Search size={24} />
      </motion.button>

      {/* 搜索弹窗 */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden z-[101] border border-slate-200">
              
              {/* 搜索框头部 */}
              <div className="flex items-center px-4 border-b border-slate-100 p-4">
                <Search className="text-slate-400 mr-3" size={20} />
                <input 
                  ref={inputRef} 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                  onKeyDown={handleNavigation} 
                  placeholder="搜索文章标题或用户昵称..." 
                  className="flex-1 bg-transparent outline-none text-lg text-slate-800 placeholder:text-slate-300"
                />
                <div className="text-[10px] bg-slate-100 text-slate-400 px-2 py-1 rounded font-mono">ESC 关闭</div>
              </div>

              {/* 搜索结果列表 */}
              <div className="max-h-[300px] overflow-y-auto p-2">
                {loading ? (
                  <div className="py-8 flex justify-center text-slate-400"><Loader2 className="animate-spin" /></div>
                ) : results.length > 0 ? (
                  results.map((item, index) => (
                    <div 
                      key={`${item.type}-${item.id}`} 
                      onClick={() => handleSelect(item)} 
                      onMouseEnter={() => setActiveIndex(index)} 
                      className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors ${index === activeIndex ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        {/* 图标区分文章和用户 */}
                        {item.type === 'post' ? <FileText size={16} /> : <User size={16} />}
                        <span className="font-medium truncate max-w-[300px]">{item.title}</span>
                      </div>
                      {index === activeIndex && <CornerDownLeft size={14} className="text-purple-400" />}
                    </div>
                  ))
                ) : query ? (
                  <div className="py-8 text-center text-slate-400 text-sm">未找到相关结果</div>
                ) : (
                  <div className="py-8 text-center text-slate-300 text-xs">输入关键词开始搜索...</div>
                )}
              </div>
              
              {/* 底部信息 */}
              <div className="bg-slate-50 px-4 py-2 text-[10px] text-slate-400 border-t border-slate-100 flex justify-between">
                <span>全局搜索控制台</span>
                <span>快捷键: Ctrl + J</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
