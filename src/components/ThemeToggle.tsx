'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative p-3 rounded-xl overflow-hidden transition-all duration-300 ${
        isDark 
          ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700 hover:shadow-lg hover:shadow-yellow-500/20' 
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:shadow-lg hover:shadow-purple-500/10'
      } ${className}`}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      title={isDark ? '切换到浅色模式' : '切换到深色模式'}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isDark ? 'dark' : 'light'}
          initial={{ y: -20, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 20, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </motion.div>
      </AnimatePresence>
      
      {/* 切换时的闪烁效果 */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={false}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 0.3 }}
        key={theme}
      >
        <div className={`w-full h-full ${isDark ? 'bg-yellow-400' : 'bg-purple-400'} rounded-xl`} />
      </motion.div>
    </motion.button>
  );
}
