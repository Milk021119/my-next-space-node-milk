'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Sparkles, Ghost } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6 overflow-hidden">
      {/* 使用统一的背景特效组件 */}
      <AnimatedBackground variant="default" showGrid={true} showGlow={true} showNoise={true} />

      {/* 浮动装饰元素 */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[15%] text-purple-500/20"
      >
        <Ghost size={60} />
      </motion.div>
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[25%] right-[10%] text-cyan-500/20"
      >
        <Sparkles size={48} />
      </motion.div>
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[30%] right-[20%] w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg relative z-10"
      >
        {/* 404 数字 - 带浮动效果 */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1, y: [0, -10, 0] }}
          transition={{ 
            scale: { type: 'spring', stiffness: 200 },
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
          className="mb-8 relative"
        >
          <h1 className="text-[150px] md:text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-br from-[var(--accent-color)] via-pink-500 to-cyan-500 leading-none select-none animate-gradient-shift bg-[length:200%_200%]">
            404
          </h1>
          {/* 发光效果 */}
          <div className="absolute inset-0 text-[150px] md:text-[200px] font-black text-purple-500/20 blur-2xl leading-none select-none -z-10">
            404
          </div>
        </motion.div>

        {/* 错误信息 */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-black text-[var(--text-primary)] mb-3 flex items-center justify-center gap-2">
            <Ghost size={24} className="text-purple-500" />
            信号丢失
          </h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            你访问的页面似乎已经消失在数字虚空中了。
            <br />
            可能是链接错误，或者页面已被移除。
          </p>
        </motion.div>

        {/* 操作按钮 */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link href="/">
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
            >
              <Home size={16} />
              返回首页
            </motion.button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[var(--bg-tertiary)] hover:border-purple-300 transition-all"
          >
            <ArrowLeft size={16} />
            返回上页
          </motion.button>
        </motion.div>

        {/* 底部提示 */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-widest"
        >
          ERROR_CODE: SIGNAL_LOST_404
        </motion.p>
      </motion.div>
    </div>
  );
}
