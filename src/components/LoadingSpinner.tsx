'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
};

export default function LoadingSpinner({ 
  size = 'md', 
  className,
  text 
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-purple-500', sizes[size])} />
      {text && <span className="text-sm text-[var(--text-muted)]">{text}</span>}
    </div>
  );
}

// 全屏加载
export function FullPageLoading({ text = '加载中...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg-primary)]/80 backdrop-blur-sm z-50">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

// 内容区加载
export function ContentLoading({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <LoadingSpinner size="md" text={text} />
    </div>
  );
}
