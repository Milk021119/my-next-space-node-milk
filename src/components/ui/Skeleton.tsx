'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
  lines?: number; // 用于 text 变体，生成多行
}

export default function Skeleton({
  variant = 'text',
  width,
  height,
  animation = 'wave',
  className,
  lines = 1,
}: SkeletonProps) {
  // 动画样式
  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'skeleton', // 使用 globals.css 中定义的 shimmer 动画
    none: '',
  };

  // 基础样式
  const baseStyles = cn(
    'bg-[var(--bg-tertiary)]',
    animationStyles[animation]
  );

  // 变体样式
  const variantStyles = {
    text: 'h-4 rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    card: 'rounded-2xl',
  };

  // 处理宽高
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  // 文本变体支持多行
  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(baseStyles, variantStyles.text)}
            style={{
              ...style,
              width: index === lines - 1 ? '70%' : style.width || '100%',
            }}
          />
        ))}
      </div>
    );
  }

  // 圆形变体默认宽高相等
  if (variant === 'circular' && !height && width) {
    style.height = style.width;
  }

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={style}
    />
  );
}

// 预设骨架屏组件

// 文章卡片骨架屏
export function ArticleCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] overflow-hidden', className)}>
      {/* 封面 */}
      <Skeleton variant="rectangular" height={200} className="w-full rounded-none" />
      
      {/* 内容 */}
      <div className="p-6 space-y-4">
        {/* 标签和日期 */}
        <div className="flex items-center gap-3">
          <Skeleton variant="text" width={60} height={20} className="rounded-full" />
          <Skeleton variant="text" width={80} height={16} />
        </div>
        
        {/* 标题 */}
        <Skeleton variant="text" width="90%" height={24} />
        
        {/* 描述 */}
        <Skeleton variant="text" lines={2} />
        
        {/* 底部 */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <Skeleton variant="text" width={50} height={24} className="rounded-lg" />
            <Skeleton variant="text" width={50} height={24} className="rounded-lg" />
          </div>
          <Skeleton variant="text" width={60} height={16} />
        </div>
      </div>
    </div>
  );
}

// 动态卡片骨架屏
export function MomentCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] p-5', className)}>
      {/* 头部 */}
      <div className="flex items-start gap-4 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width={120} height={16} />
          <Skeleton variant="text" width={80} height={12} />
        </div>
      </div>
      
      {/* 内容 */}
      <div className="space-y-2 mb-4">
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="85%" />
        <Skeleton variant="text" width="60%" />
      </div>
      
      {/* 图片占位 */}
      <Skeleton variant="rectangular" height={180} className="w-full mb-4" />
      
      {/* 交互栏 */}
      <div className="flex items-center gap-4 pt-4 border-t border-[var(--border-color)]">
        <Skeleton variant="text" width={60} height={32} className="rounded-full" />
        <Skeleton variant="text" width={60} height={32} className="rounded-full" />
        <Skeleton variant="text" width={32} height={32} className="rounded-full ml-auto" />
      </div>
    </div>
  );
}

// 用户信息骨架屏
export function UserInfoSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Skeleton variant="circular" width={40} height={40} />
      <div className="space-y-2">
        <Skeleton variant="text" width={100} height={14} />
        <Skeleton variant="text" width={60} height={12} />
      </div>
    </div>
  );
}

// 统计卡片骨架屏
export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-5 text-center', className)}>
      <Skeleton variant="text" width={60} height={40} className="mx-auto mb-2" />
      <Skeleton variant="text" width={80} height={14} className="mx-auto" />
    </div>
  );
}

// 列表项骨架屏
export function ListItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-4 p-4 rounded-xl', className)}>
      <Skeleton variant="rectangular" width={60} height={60} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="70%" height={16} />
        <Skeleton variant="text" width="40%" height={12} />
      </div>
      <Skeleton variant="circular" width={24} height={24} />
    </div>
  );
}

// 评论骨架屏
export function CommentSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex gap-3', className)}>
      <Skeleton variant="circular" width={32} height={32} />
      <div className="flex-1">
        <div className="bg-[var(--bg-tertiary)] rounded-2xl rounded-tl-sm p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton variant="text" width={80} height={12} />
            <Skeleton variant="text" width={50} height={10} />
          </div>
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="60%" />
        </div>
      </div>
    </div>
  );
}
