'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, ChevronRight, X } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  // 从 Markdown 内容提取标题
  useEffect(() => {
    const lines = content.split('\n');
    const items: TocItem[] = [];
    
    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')}`;
        items.push({ id, text, level });
      }
    });
    
    setHeadings(items);
  }, [content]);

  // 监听滚动，高亮当前标题
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    // 延迟观察，等待 DOM 渲染
    setTimeout(() => {
      headings.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) observer.observe(element);
      });
    }, 500);

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  if (headings.length < 2) return null;

  return (
    <>
      {/* 移动端悬浮按钮 */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-40 right-8 z-40 w-12 h-12 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-full shadow-lg flex items-center justify-center hover:bg-purple-500 hover:text-white hover:border-purple-500 transition-all xl:hidden"
        whileTap={{ scale: 0.9 }}
        title="文章目录"
      >
        <List size={20} />
      </motion.button>

      {/* 移动端目录弹窗 */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 xl:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-[var(--bg-card)] border-l border-[var(--border-color)] z-50 p-6 overflow-y-auto xl:hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-[var(--text-primary)]">目录</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                >
                  <X size={18} className="text-[var(--text-muted)]" />
                </button>
              </div>
              <TocList
                headings={headings}
                activeId={activeId}
                onSelect={scrollToHeading}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 桌面端侧边目录 */}
      <div className="hidden xl:block fixed right-8 top-32 w-64 max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-4 shadow-lg">
          <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
            <List size={14} /> 目录
          </h3>
          <TocList
            headings={headings}
            activeId={activeId}
            onSelect={scrollToHeading}
          />
        </div>
      </div>
    </>
  );
}

// 目录列表组件
function TocList({
  headings,
  activeId,
  onSelect,
}: {
  headings: TocItem[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav className="space-y-1">
      {headings.map((heading) => (
        <button
          key={heading.id}
          onClick={() => onSelect(heading.id)}
          className={`w-full text-left text-sm py-1.5 px-2 rounded-lg transition-all flex items-center gap-1 ${
            activeId === heading.id
              ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
          }`}
          style={{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }}
        >
          {activeId === heading.id && (
            <ChevronRight size={12} className="flex-shrink-0" />
          )}
          <span className="truncate">{heading.text}</span>
        </button>
      ))}
    </nav>
  );
}
