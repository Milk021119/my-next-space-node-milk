'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Tag, ChevronRight, Archive, Clock, Sparkles } from 'lucide-react';
import { ContentLoading } from '@/components/LoadingSpinner';
import PageLayout, { PageCard, PageFooter } from '@/components/PageLayout';
import { PageBanner } from '@/components/ui';
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
    <PageLayout maxWidth="5xl" className="pt-0">
      {/* 页面头部 Banner */}
      <PageBanner
        title="文章归档"
        subtitle="时间线上的所有文章记录"
        icon={Archive}
        gradient="blue"
        decorationIcons={[Archive, Clock]}
      />

      {loading ? (
        <ContentLoading text="加载归档中..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 左侧：时间线 */}
          <div className="lg:col-span-2 space-y-8">
            {archives.map((yearGroup, yearIndex) => (
              <motion.div
                key={yearGroup.year}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: yearIndex * 0.1 }}
              >
                <div className="bg-[var(--bg-card)] backdrop-blur-xl rounded-3xl border border-[var(--border-color)] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
                  {/* 年份头部 - 增强 */}
                  <div className="p-6 bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-blue-900/20 border-b border-[var(--border-color)] relative overflow-hidden">
                    {/* 装饰 */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <h2 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-3 relative">
                      <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl text-white shadow-lg shadow-blue-500/25">
                        <Calendar size={20} />
                      </div>
                      {yearGroup.year} 年
                      <span className="ml-auto text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-4 py-1.5 rounded-full shadow-sm">
                        {yearGroup.months.reduce((acc, m) => acc + m.posts.length, 0)} 篇
                      </span>
                    </h2>
                  </div>

                  <div className="p-6 space-y-6">
                    {yearGroup.months.map((monthGroup, monthIndex) => (
                      <motion.div 
                        key={monthGroup.month}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: monthIndex * 0.05 }}
                      >
                        <h3 className="text-sm font-bold text-[var(--accent-color)] mb-3 flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm" />
                          {monthNames[monthGroup.month]}
                          <span className="text-[var(--text-muted)] font-normal">
                            · {monthGroup.posts.length} 篇
                          </span>
                        </h3>
                        
                        <div className="space-y-2 pl-5 border-l-2 border-[var(--border-color)] hover:border-[var(--accent-color)]/50 transition-colors">
                          {monthGroup.posts.map((post, postIndex) => (
                            <motion.div
                              key={post.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: postIndex * 0.03 }}
                            >
                              <Link
                                href={`/post/${post.id}`}
                                className="block p-4 rounded-2xl hover:bg-[var(--bg-secondary)] transition-all group/item border border-transparent hover:border-[var(--border-color)] hover:shadow-md cursor-pointer"
                              >
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-[var(--text-primary)] truncate group-hover/item:text-[var(--accent-color)] transition-colors">
                                      {post.title || '无标题'}
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-2">
                                      <Clock size={12} />
                                      {new Date(post.created_at).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}
                                    </p>
                                  </div>
                                  <ChevronRight size={16} className="text-[var(--text-muted)] group-hover/item:text-[var(--accent-color)] group-hover/item:translate-x-2 transition-all" />
                                </div>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 右侧：统计和标签 */}
          <div className="space-y-6">
            {/* 统计卡片 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[var(--bg-card)] backdrop-blur-xl rounded-3xl border border-[var(--border-color)] p-6 shadow-sm"
            >
              <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-5 flex items-center gap-2">
                <Sparkles size={14} className="text-[var(--accent-color)]" />
                统计数据
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-100 dark:border-purple-800/30">
                  <div className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{stats.total}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-1 font-medium">总文章</div>
                </div>
                <div className="text-center p-5 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl border border-cyan-100 dark:border-cyan-800/30">
                  <div className="text-4xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">{stats.thisYear}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-1 font-medium">今年发布</div>
                </div>
              </div>
            </motion.div>

            {/* 标签云 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[var(--bg-card)] backdrop-blur-xl rounded-3xl border border-[var(--border-color)] p-6 shadow-sm"
            >
              <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-5 flex items-center gap-2">
                <Tag size={14} className="text-[var(--accent-color)]" /> 标签云
              </h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map(({ tag, count }, index) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Link
                      href={`/tags/${encodeURIComponent(tag)}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[var(--bg-secondary)] hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 text-[var(--text-secondary)] hover:text-white rounded-xl text-xs font-bold transition-all hover:shadow-lg hover:shadow-purple-500/25 border border-[var(--border-color)] hover:border-transparent cursor-pointer hover:-translate-y-1"
                    >
                      {tag}
                      <span className="text-[10px] opacity-60 bg-black/10 px-1.5 py-0.5 rounded-md">({count})</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}
      
      <PageFooter text="--- End of Archive ---" />
    </PageLayout>
  );
}
