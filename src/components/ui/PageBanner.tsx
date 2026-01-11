'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

// 渐变主题配置
const gradientThemes = {
  purple: {
    bg: 'from-indigo-600 via-purple-600 to-pink-500',
    accent: 'bg-purple-600',
    glow1: 'bg-white/10',
    glow2: 'bg-pink-400/20',
  },
  blue: {
    bg: 'from-cyan-500 via-blue-600 to-indigo-600',
    accent: 'bg-blue-600',
    glow1: 'bg-white/10',
    glow2: 'bg-cyan-400/20',
  },
  pink: {
    bg: 'from-pink-500 via-rose-500 to-purple-600',
    accent: 'bg-pink-600',
    glow1: 'bg-white/10',
    glow2: 'bg-rose-400/20',
  },
  cyan: {
    bg: 'from-purple-600 via-indigo-600 to-cyan-500',
    accent: 'bg-indigo-600',
    glow1: 'bg-white/10',
    glow2: 'bg-cyan-400/20',
  },
  green: {
    bg: 'from-emerald-500 via-teal-500 to-cyan-500',
    accent: 'bg-emerald-600',
    glow1: 'bg-white/10',
    glow2: 'bg-teal-400/20',
  },
};

// 图标颜色映射
const iconColors = {
  purple: 'text-purple-600',
  blue: 'text-blue-600',
  pink: 'text-pink-600',
  cyan: 'text-indigo-600',
  green: 'text-emerald-600',
};

interface PageBannerProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  gradient?: keyof typeof gradientThemes;
  decorations?: boolean;
  decorationIcons?: LucideIcon[];
  stats?: { label: string; value: number | string }[];
  children?: ReactNode;
  height?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PageBanner({
  title,
  subtitle,
  icon: Icon,
  gradient = 'purple',
  decorations = true,
  decorationIcons = [],
  stats,
  children,
  height = 'md',
  className = '',
}: PageBannerProps) {
  const theme = gradientThemes[gradient];
  const iconColor = iconColors[gradient];
  
  const heightClasses = {
    sm: 'h-48 lg:h-56',
    md: 'h-64 lg:h-72',
    lg: 'h-72 lg:h-80',
  };

  return (
    <div className={`relative -mx-6 lg:-mx-10 -mt-12 mb-10 ${className}`}>
      {/* 渐变背景 */}
      <div className={`${heightClasses[height]} bg-gradient-to-br ${theme.bg} overflow-hidden`}>
        {/* 网格装饰 */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className={`absolute top-10 right-10 w-72 h-72 ${theme.glow1} rounded-full blur-3xl`} />
          <div className={`absolute bottom-0 left-10 w-96 h-96 ${theme.glow2} rounded-full blur-3xl`} />
        </div>
        
        {/* 浮动装饰图标 */}
        {decorations && decorationIcons.length > 0 && (
          <>
            {decorationIcons[0] && (
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-16 right-[15%] text-white/20"
              >
                {(() => {
                  const DecorIcon1 = decorationIcons[0];
                  return <DecorIcon1 size={48} />;
                })()}
              </motion.div>
            )}
            {decorationIcons[1] && (
              <motion.div 
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-24 left-[10%] text-white/15"
              >
                {(() => {
                  const DecorIcon2 = decorationIcons[1];
                  return <DecorIcon2 size={36} />;
                })()}
              </motion.div>
            )}
          </>
        )}
      </div>
      
      {/* 底部渐变过渡 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
      
      {/* 内容区域 */}
      <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end gap-4"
          >
            {/* 图标 */}
            {Icon && (
              <div className="p-4 bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-xl">
                <Icon size={32} className={iconColor} />
              </div>
            )}
            
            {/* 标题和副标题 */}
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-black text-[var(--text-primary)] mb-1">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[var(--text-secondary)] flex items-center gap-2 flex-wrap">
                  {subtitle}
                  {/* 统计数据 */}
                  {stats && stats.map((stat, index) => (
                    <span 
                      key={index}
                      className="px-2 py-0.5 bg-[var(--bg-card)] rounded-full text-xs font-bold text-[var(--accent-color)]"
                    >
                      {stat.value} {stat.label}
                    </span>
                  ))}
                </p>
              )}
            </div>
            
            {/* 自定义内容插槽 */}
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// 导出渐变主题类型供外部使用
export type GradientTheme = keyof typeof gradientThemes;
