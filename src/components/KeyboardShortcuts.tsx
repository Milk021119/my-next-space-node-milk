'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';

const shortcuts = [
  { keys: ['Ctrl', 'K'], description: '打开搜索' },
  { keys: ['Ctrl', 'B'], description: '切换侧边栏' },
  { keys: ['Ctrl', 'D'], description: '切换深色模式' },
  { keys: ['↑', '↓'], description: '导航搜索结果' },
  { keys: ['Enter'], description: '选择搜索结果' },
  { keys: ['Esc'], description: '关闭弹窗' },
];

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* 触发按钮 - 放在搜索按钮上方 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-8 z-40 p-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all group"
        aria-label="键盘快捷键"
        title="按 Shift+? 查看快捷键"
      >
        <Keyboard size={20} className="text-[var(--text-secondary)] group-hover:text-purple-500 transition-colors" />
      </button>

      {/* 快捷键弹窗 */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">键盘快捷键</h2>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-[var(--bg-tertiary)] rounded-lg">
                  <X size={20} className="text-[var(--text-secondary)]" />
                </button>
              </div>
              <div className="space-y-3">
                {shortcuts.map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)] text-sm">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, j) => (
                        <kbd key={j} className="px-2 py-1 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded text-xs font-mono text-[var(--text-primary)]">
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
