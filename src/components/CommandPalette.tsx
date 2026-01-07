"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, User, Loader2, CornerDownLeft, Tag, AlignLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  type: 'post' | 'user';
  id: number | string;
  title: string;
  preview?: string;
  tags?: string[];
  matchField?: 'title' | 'content' | 'tags';
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 监听快捷键 (Ctrl+J)
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

  // 增强搜索逻辑：支持标题、内容、标签搜索
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) { setResults([]); return; }
      setLoading(true);
      
      const searchQuery = query.trim().toLowerCase();
      
      // 搜索文章：标题、内容、标签
      const { data: postsData } = await supabase
        .from('posts')
        .select('id, title, content, tags')
        .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
        .limit(10);

      // 搜索用户
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, username')
        .ilike('username', `%${searchQuery}%`)
        .limit(3);

      // 处理文章结果，确定匹配字段
      const postResults: SearchResult[] = (postsData || []).map((p: any) => {
        const titleMatch = p.title?.toLowerCase().includes(searchQuery);
        const contentMatch = p.content?.toLowerCase().includes(searchQuery);
        const tagsMatch = p.tags?.some((t: string) => t.toLowerCase().includes(searchQuery));
        
        let matchField: 'title' | 'content' | 'tags' = 'title';
        if (titleMatch) matchField = 'title';
        else if (tagsMatch) matchField = 'tags';
        else if (contentMatch) matchField = 'content';

        // 生成内容预览
        let preview = '';
        if (contentMatch && p.content) {
          const idx = p.content.toLowerCase().indexOf(searchQuery);
          const start = Math.max(0, idx - 30);
          const end = Math.min(p.content.length, idx + searchQuery.length + 70);
          preview = (start > 0 ? '...' : '') + p.content.slice(start, end) + (end < p.content.length ? '...' : '');
        } else if (p.content) {
          preview = p.content.slice(0, 100) + (p.content.length > 100 ? '...' : '');
        }

        return {
          type: 'post' as const,
          id: p.id,
          title: p.title,
          preview,
          tags: p.tags?.filter((t: string) => t.toLowerCase().includes(searchQuery)),
          matchField
        };
      });

      // 额外搜索标签匹配的文章
      const { data: tagPosts } = await supabase
        .from('posts')
        .select('id, title, content, tags')
        .contains('tags', [searchQuery])
        .limit(5);

      // 合并标签搜索结果（去重）
      const existingIds = new Set(postResults.map(r => r.id));
      const tagResults: SearchResult[] = (tagPosts || [])
        .filter((p: any) => !existingIds.has(p.id))
        .map((p: any) => ({
          type: 'post' as const,
          id: p.id,
          title: p.title,
          preview: p.content?.slice(0, 100) + (p.content?.length > 100 ? '...' : ''),
          tags: p.tags?.filter((t: string) => t.toLowerCase().includes(searchQuery)),
          matchField: 'tags' as const
        }));

      // 用户结果
      const userResults: SearchResult[] = (usersData || []).map((u: any) => ({
        type: 'user' as const,
        id: u.id,
        title: u.username || '未命名用户'
      }));

      setResults([...postResults, ...tagResults, ...userResults].slice(0, 10));
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

  const handleSelect = (item: SearchResult) => {
    setIsOpen(false); setQuery('');
    router.push(item.type === 'post' ? `/post/${item.id}` : `/u/${item.id}`);
  };

  // 获取匹配类型图标
  const getMatchIcon = (matchField?: string) => {
    switch (matchField) {
      case 'content': return <AlignLeft size={12} className="text-blue-400" />;
      case 'tags': return <Tag size={12} className="text-green-400" />;
      default: return <FileText size={12} />;
    }
  };

  return (
    <>
      {/* 悬浮按钮 (FAB) */}
      <motion.button
        onClick={() => setIsOpen(true)}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 z-[90] w-14 h-14 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full shadow-2xl flex items-center justify-center hover:bg-purple-600 dark:hover:bg-purple-400 transition-colors"
        title="搜索 (Ctrl+J)"
      >
        <Search size={24} />
      </motion.button>

      {/* 搜索弹窗 */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsOpen(false)} 
              className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[100]" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg bg-[var(--bg-primary)] rounded-2xl shadow-2xl overflow-hidden z-[101] border border-[var(--border-color)]"
            >
              
              {/* 搜索框头部 */}
              <div className="flex items-center px-4 border-b border-[var(--border-color)] p-4">
                <Search className="text-[var(--text-muted)] mr-3" size={20} />
                <input 
                  ref={inputRef} 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                  onKeyDown={handleNavigation} 
                  placeholder="搜索文章标题、内容或标签..." 
                  className="flex-1 bg-transparent outline-none text-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                />
                <div className="text-[10px] bg-[var(--bg-secondary)] text-[var(--text-muted)] px-2 py-1 rounded font-mono">ESC</div>
              </div>

              {/* 搜索结果列表 */}
              <div className="max-h-[400px] overflow-y-auto p-2">
                {loading ? (
                  <div className="py-8 flex justify-center text-[var(--text-muted)]">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : results.length > 0 ? (
                  results.map((item, index) => (
                    <div 
                      key={`${item.type}-${item.id}`} 
                      onClick={() => handleSelect(item)} 
                      onMouseEnter={() => setActiveIndex(index)} 
                      className={`px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                        index === activeIndex 
                          ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {item.type === 'post' ? getMatchIcon(item.matchField) : <User size={14} />}
                          <div className="flex-1 min-w-0">
                            <span className="font-medium truncate block">{item.title}</span>
                            {/* 内容预览 */}
                            {item.preview && (
                              <p className="text-xs text-[var(--text-muted)] truncate mt-1">
                                {item.preview}
                              </p>
                            )}
                            {/* 匹配的标签 */}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {item.tags.slice(0, 3).map(tag => (
                                  <span 
                                    key={tag} 
                                    className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        {index === activeIndex && <CornerDownLeft size={14} className="text-purple-400 flex-shrink-0 ml-2" />}
                      </div>
                    </div>
                  ))
                ) : query ? (
                  <div className="py-8 text-center text-[var(--text-muted)] text-sm">未找到相关结果</div>
                ) : (
                  <div className="py-8 text-center text-[var(--text-muted)] text-xs">
                    <p className="mb-2">输入关键词搜索文章或用户</p>
                    <p className="text-[10px]">支持搜索：标题 · 内容 · 标签</p>
                  </div>
                )}
              </div>
              
              {/* 底部信息 */}
              <div className="bg-[var(--bg-secondary)] px-4 py-2 text-[10px] text-[var(--text-muted)] border-t border-[var(--border-color)] flex justify-between">
                <span>↑↓ 导航 · ↵ 选择</span>
                <span>Ctrl + J</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
