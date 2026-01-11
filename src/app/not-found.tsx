'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6">
      {/* 使用统一的背景特效组件 */}
      <AnimatedBackground variant="default" showGrid={true} showGlow={true} showNoise={true} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg"
      >
        {/* 404 数字 */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="mb-8"
        >
          <h1 className="text-[150px] md:text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-br from-[var(--accent-color)] to-cyan-500 leading-none select-none">
            404
          </h1>
        </motion.div>

        {/* 错误信息 */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-[var(--text-primary)] mb-3">
            信号丢失
          </h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            你访问的页面似乎已经消失在数字虚空中了。
            <br />
            可能是链接错误，或者页面已被移除。
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <button className="w-full sm:w-auto px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[var(--accent-color)] transition-colors shadow-lg">
              <Home size={16} />
              返回首页
            </button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <ArrowLeft size={16} />
            返回上页
          </button>
        </div>

        {/* 底部提示 */}
        <p className="mt-12 text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-widest">
          ERROR_CODE: SIGNAL_LOST_404
        </p>
      </motion.div>
    </div>
  );
}
