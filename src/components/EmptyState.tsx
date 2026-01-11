'use client';

import { ReactNode } from 'react';
import { FileText, Inbox, Search, Bookmark, MessageSquare } from 'lucide-react';
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

const defaultContent: Record<EmptyType, { icon: ReactNode; title: string; description: string }> = {
  posts: {
    icon: <FileText className="w-12 h-12" />,
    title: '暂无文章',
    description: '这里还没有任何文章，敬请期待',
  },
  search: {
    icon: <Search className="w-12 h-12" />,
    title: '未找到结果',
    description: '尝试使用其他关键词搜索',
  },
  bookmarks: {
    icon: <Bookmark className="w-12 h-12" />,
    title: '暂无收藏',
    description: '收藏喜欢的文章，方便以后查看',
  },
  comments: {
    icon: <MessageSquare className="w-12 h-12" />,
    title: '暂无评论',
    description: '来坐沙发，发表第一条评论吧',
  },
  default: {
    icon: <Inbox className="w-12 h-12" />,
    title: '暂无内容',
    description: '这里空空如也',
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
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-4 text-center',
      className
    )}>
      <div className="text-[var(--text-muted)] mb-4 opacity-50">
        {icon || content.icon}
      </div>
      <h3 className="text-lg font-bold text-[var(--text-secondary)] mb-2">
        {title || content.title}
      </h3>
      <p className="text-sm text-[var(--text-muted)] max-w-xs mb-6">
        {description || content.description}
      </p>
      {action}
    </div>
  );
}
