'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  backLink?: string;
  backText?: string;
  showBackground?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  centered?: boolean;
  className?: string;
  // 新增属性
  showSidebar?: boolean;      // 是否显示侧边栏，默认 true
  fullWidth?: boolean;        // 是否全宽布局（用于首页等特殊页面）
  headerSlot?: ReactNode;     // 自定义头部插槽（用于动态页 Banner）
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  full: 'max-w-full',
};

export default function PageLayout({
  children,
  title,
  subtitle,
  backLink,
  backText = '返回',
  showBackground = true,
  maxWidth = '5xl',
  centered = false,
  className = '',
  showSidebar = true,
  fullWidth = false,
  headerSlot,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-sans">
      {showSidebar && <Sidebar />}
      
      {/* 背景特效 */}
      {showBackground && (
        <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
          {/* 网格背景 */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          {/* 动态光晕 */}
          <motion.div
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-purple-200/40 dark:bg-purple-500/20 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-cyan-200/40 dark:bg-cyan-500/20 rounded-full blur-[120px]"
          />
          
          {/* 噪点纹理 */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
      )}

      <main
        className={`${showSidebar ? 'lg:ml-72 2xl:ml-80' : ''} min-h-screen transition-all duration-300 ${
          centered ? 'flex items-center justify-center p-6' : 'py-12 px-6 lg:px-10'
        } ${className}`}
      >
        {/* 自定义头部插槽 */}
        {headerSlot && (
          <div className={`${fullWidth ? '' : `${maxWidthMap[maxWidth]} mx-auto w-full`} mb-8`}>
            {headerSlot}
          </div>
        )}

        <div className={`${fullWidth ? 'w-full' : `${maxWidthMap[maxWidth]} mx-auto w-full`}`}>
          {/* 返回链接 */}
          {backLink && (
            <Link
              href={backLink}
              className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-purple-600 transition-colors mb-6"
            >
              <ArrowLeft size={16} />
              {backText}
            </Link>
          )}

          {/* 页面标题 */}
          {title && (
            <div className="mb-12">
              <h1 className="text-4xl font-black text-[var(--text-primary)] mb-3">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[var(--text-muted)]">{subtitle}</p>
              )}
            </div>
          )}

          {children}
        </div>
      </main>
    </div>
  );
}

// 统一的卡片组件
export function PageCard({
  children,
  className = '',
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`bg-[var(--bg-card)] backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-[var(--border-color)] shadow-sm ${
        hover ? 'hover:shadow-xl transition-shadow' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

// 统一的页面区块标题
export function SectionTitle({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
      {icon}
      {children}
    </h3>
  );
}

// 统一的页脚
export function PageFooter({ text = '--- End of Signal ---' }: { text?: string }) {
  return (
    <footer className="mt-40 pb-20 text-center text-[10px] text-[var(--text-muted)] font-black tracking-[0.5em] uppercase opacity-50">
      {text}
    </footer>
  );
}
