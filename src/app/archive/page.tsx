'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Tag, ChevronRight } from 'lucide-react';
import { ContentLoading } from '@/components/LoadingSpinner';
import PageLayout, { PageCard, PageFooter } from '@/components/PageLayout';
import type { Post } from '@/types';

interface ArchiveGroup {
  year: number;
  months: {
    month: number;
    posts: Post[];
  }[];
}

export default function ArchivePage() {
  const [archives, setArchives] = useState<ArchiveGroup[]>([]);
  const [allTags, setAllTags] = useState<{ tag: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, thisYear: 0 });

  useEffect(() => {
    fetchArchives();
  }, []);

  async function fetchArchives() {
    setLoading(true);
    
    const { data: posts } = await supabase
      .from('posts')
      .select('*')
      .eq('type', 'article')
      .order('created_at', { ascending: false });

    if (posts) {
      const grouped: Record<number, Record<number, Post[]>> = {};
      const tagCount: Record<string, number> = {};
      const currentYear = new Date().getFullYear();
      let thisYearCount = 0;

      posts.forEach(post => {
        const date = new Date(post.created_at);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        if (!grouped[year]) grouped[year] = {};
        if (!grouped[year][month]) grouped[year][month] = [];
        grouped[year][month].push(post);

        if (year === currentYear) thisYearCount++;

        post.tags?.forEach((tag: string) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      });

      const archiveList: ArchiveGroup[] = Object.entries(grouped)
        .map(([year, months]) => ({
          year: parseInt(year),
          months: Object.entries(months)
            .map(([month, posts]) => ({
              month: parseInt(month),
              posts
            }))
            .sort((a, b) => b.month - a.month)
        }))
        .sort((a, b) => b.year - a.year);

      const sortedTags = Object.entries(tagCount)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);

      setArchives(archiveList);
      setAllTags(sortedTags);
      setStats({ total: posts.length, thisYear: thisYearCount });
    }
    
    setLoading(false);
  }

  const monthNames = ['', '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

  return (
    <PageLayout title="文章归档" subtitle="时间线上的所有文章记录">

          {loading ? (
            <ContentLoading text="加载归档中..." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* 左侧：时间线 */}
              <div className="lg:col-span-2 space-y-8">
                {archives.map((yearGroup) => (
                  <motion.div
                    key={yearGroup.year}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <PageCard>
                      <h2 className="text-2xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-3">
                        <Calendar className="text-purple-500" size={24} />
                        {yearGroup.year} 年
                        <span className="text-sm font-normal text-[var(--text-muted)]">
                          ({yearGroup.months.reduce((acc, m) => acc + m.posts.length, 0)} 篇)
                        </span>
                      </h2>

                      <div className="space-y-6">
                        {yearGroup.months.map((monthGroup) => (
                          <div key={monthGroup.month}>
                            <h3 className="text-sm font-bold text-purple-600 dark:text-purple-400 mb-3 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-purple-500" />
                              {monthNames[monthGroup.month]}
                              <span className="text-[var(--text-muted)] font-normal">
                                · {monthGroup.posts.length} 篇
                              </span>
                            </h3>
                            
                            <div className="space-y-2 pl-4 border-l-2 border-[var(--border-color)]">
                              {monthGroup.posts.map((post) => (
                                <Link
                                  key={post.id}
                                  href={`/post/${post.id}`}
                                  className="block p-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors group"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-bold text-[var(--text-primary)] truncate group-hover:text-purple-600 transition-colors">
                                        {post.title || '无标题'}
                                      </h4>
                                      <p className="text-xs text-[var(--text-muted)] mt-1">
                                        {new Date(post.created_at).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}
                                      </p>
                                    </div>
                                    <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-purple-500 transition-colors" />
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </PageCard>
                  </motion.div>
                ))}
              </div>

              {/* 右侧：统计和标签 */}
              <div className="space-y-6">
                <PageCard>
                  <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-4">
                    统计
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-2xl">
                      <div className="text-3xl font-black text-purple-600">{stats.total}</div>
                      <div className="text-xs text-[var(--text-muted)] mt-1">总文章</div>
                    </div>
                    <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-2xl">
                      <div className="text-3xl font-black text-cyan-600">{stats.thisYear}</div>
                      <div className="text-xs text-[var(--text-muted)] mt-1">今年发布</div>
                    </div>
                  </div>
                </PageCard>

                <PageCard>
                  <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Tag size={14} /> 标签云
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(({ tag, count }) => (
                      <Link
                        key={tag}
                        href={`/tags/${encodeURIComponent(tag)}`}
                        className="px-3 py-1.5 bg-[var(--bg-secondary)] hover:bg-purple-100 dark:hover:bg-purple-900/30 text-[var(--text-secondary)] hover:text-purple-600 rounded-full text-xs font-bold transition-colors"
                      >
                        {tag}
                        <span className="ml-1 text-[var(--text-muted)]">({count})</span>
                      </Link>
                    ))}
                  </div>
                </PageCard>
              </div>
            </div>
          )}
          
          <PageFooter text="--- End of Archive ---" />
    </PageLayout>
  );
}
