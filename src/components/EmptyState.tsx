'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FileText, Inbox, Search, Bookmark, MessageSquare, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type EmptyType = 'posts' | 'search' | 'bookmarks' | 'comments' | 'default';

interface EmptyStateProps {
  type?: EmptyType;
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

const defaultContent: Record<EmptyType, { icon: ReactNode; title: string; description: string; gradient: string }> = {
  posts: {
    icon: <FileText className="w-12 h-12" />,
    title: '暂无文章',
    description: '这里还没有任何文章，敬请期待',
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  search: {
    icon: <Search className="w-12 h-12" />,
    title: '未找到结果',
    description: '尝试使用其他关键词搜索',
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  bookmarks: {
    icon: <Bookmark className="w-12 h-12" />,
    title: '暂无收藏',
    description: '收藏喜欢的文章，方便以后查看',
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
  comments: {
    icon: <MessageSquare className="w-12 h-12" />,
    title: '暂无评论',
    description: '来坐沙发，发表第一条评论吧',
    gradient: 'from-green-500/20 to-emerald-500/20',
  },
  default: {
    icon: <Inbox className="w-12 h-12" />,
    title: '暂无内容',
    description: '这里空空如也',
    gradient: 'from-slate-500/20 to-slate-600/20',
  },
};

export default function EmptyState({
  type = 'default',
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  const content = defaultContent[type];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative flex flex-col items-center justify-center py-20 px-6 text-center rounded-3xl bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-color)] overflow-hidden',
        className
      )}
    >
      {/* 背景装饰 */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-30',
        content.gradient
      )} />
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-8 right-8 text-[var(--text-muted)] opacity-20"
      >
        <Sparkles size={24} />
      </motion.div>
      
      {/* 图标 */}
      <motion.div 
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring" }}
        className="relative z-10 mb-6"
      >
        <motion.div 
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="p-5 bg-[var(--bg-secondary)] rounded-2xl shadow-lg border border-[var(--border-color)] text-[var(--text-muted)]"
        >
          {icon || content.icon}
        </motion.div>
      </motion.div>
      
      {/* 标题 */}
      <motion.h3 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 text-xl font-black text-[var(--text-primary)] mb-3"
      >
        {title || content.title}
      </motion.h3>
      
      {/* 描述 */}
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 text-sm text-[var(--text-muted)] max-w-xs mb-6 leading-relaxed"
      >
        {description || content.description}
      </motion.p>
      
      {/* 操作按钮 */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative z-10"
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}
