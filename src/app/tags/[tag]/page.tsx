'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Tag, Heart, Terminal } from 'lucide-react';
import PostSkeleton from '@/components/PostSkeleton';
import ParallaxImage from '@/components/ParallaxImage';
import { getAnimeCover } from '@/lib/constants';
import EmptyState from '@/components/EmptyState';
import PageLayout, { PageFooter } from '@/components/PageLayout';
import type { Post } from '@/types';

export default function TagPage() {
  const { tag } = useParams();
  const decodedTag = decodeURIComponent(tag as string);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPostsByTag();
  }, [tag]);

  async function fetchPostsByTag() {
    setLoading(true);
    const { data } = await supabase
      .from('posts')
      .select('*')
      .contains('tags', [decodedTag])
      .order('created_at', { ascending: false });
    
    setPosts(data || []);
    setLoading(false);
  }

  return (
    <PageLayout backLink="/posts" backText="返回文章列表">
      {/* 头部 */}
      <div className="mb-12">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
            <Tag size={32} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-primary)]">
              #{decodedTag}
            </h1>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              共 {posts.length} 篇文章
            </p>
          </div>
        </div>
      </div>

      {/* 文章列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading ? (
          Array(4).fill(0).map((_, i) => <PostSkeleton key={i} />)
        ) : posts.length === 0 ? (
          <div className="col-span-full">
            <EmptyState 
              type="posts" 
              title="暂无文章"
              description={`还没有标记为 #${decodedTag} 的文章`}
            />
          </div>
        ) : (
          posts.map((post) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8 }}
              className="relative group bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border-color)] shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
            >
              <Link href={`/post/${post.id}`} className="block">
                <div className="aspect-video w-full overflow-hidden relative bg-slate-200">
                  <ParallaxImage src={post.cover_url || getAnimeCover(post.id)} />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      {format(new Date(post.created_at), 'yyyy/MM/dd')}
                    </span>
                    <div className="flex gap-2">
                      {post.tags?.map(t => (
                        <span 
                          key={t} 
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            t === decodedTag 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-black text-[var(--text-primary)] mb-3 group-hover:text-purple-600 transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-[var(--text-secondary)] text-sm line-clamp-2">
                    {post.content.slice(0, 100)}...
                  </p>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border-color)]">
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                      <Heart size={14} className={post.likes > 0 ? 'fill-pink-500 text-pink-500' : ''} />
                      <span className="text-xs">{post.likes || 0}</span>
                    </div>
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1">
                      阅读 <Terminal size={10} />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))
        )}
      </div>
      
      <PageFooter />
    </PageLayout>
  );
}
