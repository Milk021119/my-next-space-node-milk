'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Clock } from 'lucide-react';

interface RelatedPost {
  id: number;
  title: string;
  created_at: string;
  tags: string[];
}

interface RelatedPostsProps {
  currentPostId: number;
  tags: string[];
  limit?: number;
}

export default function RelatedPosts({ currentPostId, tags, limit = 3 }: RelatedPostsProps) {
  const [posts, setPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      if (!tags || tags.length === 0) {
        // 没有标签时，获取最新文章
        const { data } = await supabase
          .from('posts')
          .select('id, title, created_at, tags')
          .eq('type', 'article')
          .eq('is_public', true)
          .neq('id', currentPostId)
          .order('created_at', { ascending: false })
          .limit(limit);
        
        setPosts(data || []);
      } else {
        // 有标签时，查找相同标签的文章
        const { data } = await supabase
          .from('posts')
          .select('id, title, created_at, tags')
          .eq('type', 'article')
          .eq('is_public', true)
          .neq('id', currentPostId)
          .overlaps('tags', tags)
          .order('created_at', { ascending: false })
          .limit(limit * 2); // 多取一些用于排序
        
        if (data && data.length > 0) {
          // 按标签匹配度排序
          const sorted = data
            .map(post => ({
              ...post,
              matchCount: post.tags?.filter((t: string) => tags.includes(t)).length || 0
            }))
            .sort((a, b) => b.matchCount - a.matchCount)
            .slice(0, limit);
          
          setPosts(sorted);
        } else {
          // 没有匹配的，获取最新文章
          const { data: latest } = await supabase
            .from('posts')
            .select('id, title, created_at, tags')
            .eq('type', 'article')
            .eq('is_public', true)
            .neq('id', currentPostId)
            .order('created_at', { ascending: false })
            .limit(limit);
          
          setPosts(latest || []);
        }
      }
      setLoading(false);
    }

    fetchRelated();
  }, [currentPostId, tags, limit]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="bg-[var(--bg-secondary)] rounded-2xl p-6 border border-[var(--border-color)]">
      <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">
        相关推荐
      </h3>
      <div className="space-y-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="group block p-3 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-purple-600 transition-colors line-clamp-2 mb-1">
              {post.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <Clock size={12} />
              <span>{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
              {post.tags && post.tags.length > 0 && (
                <>
                  <span>·</span>
                  <span className="text-purple-500">{post.tags[0]}</span>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>
      <Link
        href="/posts"
        className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-purple-600 transition-colors"
      >
        查看更多文章 <ArrowRight size={14} />
      </Link>
    </div>
  );
}
