"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ArrowLeft, Clock, User, Tag } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import PostSkeleton from '@/components/PostSkeleton';
import ParallaxImage from '@/components/ParallaxImage';
import Sidebar from '@/components/Sidebar';
import BookmarkButton from '@/components/BookmarkButton';
import CommentSection from '@/components/comments/CommentSection';

interface Post {
  id: number;
  title: string;
  content: string;
  author_email: string;
  created_at: string;
  tags: string[];
  cover_url?: string;
  user_id?: string;
}

export default function PostDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  // 默认封面图库
  const ANIME_COVERS = ["/covers/cimgtwjgu000szrs56jyqr0mg.1200.jpg", "/covers/cit9ejr5100c6z35nrc61fd7j.1200.jpg", "/covers/ciuur1ym5000cbsjb09bof78s.1200.jpg", "/covers/claodyl1v0068m78hgrbs3myq.2160p.jpg", "/covers/clba9t5hw007qm78hd3cocnrm.2160p.jpg", "/covers/clbihqun3007ym78h7rsq6cda.2160p.jpg", "/covers/clc7emns2000w6v8hdu5d1k17.2160p.jpg", "/covers/cm7rftv17000hkl8h1gjn9e1v.2160p.jpg", "/covers/cm9lnaup3001ikl8h044j19za.2160p.jpg", "/covers/cm9za5ads001skl8h125v2zrw.2160p.jpg", "/covers/cmabaj7od001xkl8hbdm96tlk.2160p.jpg", "/covers/cmatsfxm100041k8h93jd61z7.2160p.jpg", "/covers/cmbmb7mr3000f1k8hefiqenx7.2160p.jpg", "/covers/cmju6k1jb00168w8hcb4pgdnd.2160p.jpg"];
  const getAnimeCover = (pid: number) => ANIME_COVERS[pid % ANIME_COVERS.length];

  useEffect(() => {
    if (id) fetchPost();
  }, [id]);

  async function fetchPost() {
    setLoading(true);
    const { data } = await supabase.from('posts').select('*').eq('id', id).single();
    setPost(data);
    setLoading(false);
  }

  // 加载中骨架屏
  if (loading) return (
      <div className="min-h-screen bg-[var(--bg-primary)] font-sans flex">
          <Sidebar />
          <div className="flex-1 lg:ml-72 2xl:ml-80 p-10 flex justify-center">
              <PostSkeleton />
          </div>
      </div>
  );

  // 404 状态
  if (!post) return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-muted)] font-mono">
          信号丢失 (SIGNAL_LOST_404)
      </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-sans selection:bg-purple-200 dark:selection:bg-purple-800 pb-20">
      <Sidebar />
      
      {/* 顶部透明导航 */}
      <nav className="fixed top-0 right-0 left-0 lg:left-72 2xl:left-80 z-30 px-6 py-4 flex justify-between items-center bg-[var(--bg-primary)]/70 backdrop-blur-xl border-b border-[var(--border-color)] transition-all duration-300">
        <button 
            onClick={() => router.back()} 
            className="p-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] rounded-full transition-all flex items-center gap-2 text-[var(--text-secondary)] font-bold text-xs uppercase tracking-wider shadow-sm border border-[var(--border-color)] group"
        >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> <span>返回</span>
        </button>
        <div className="flex items-center gap-4">
          <BookmarkButton postId={post.id} size="md" />
          <div className="text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase border border-[var(--border-color)] px-2 py-1 rounded">
              日志编号 #{post.id}
          </div>
        </div>
      </nav>

      {/* 主体偏移，留出侧边栏空间 */}
      <div className="lg:pl-72 2xl:pl-80 transition-all duration-300">
        
        {/* 视差封面图区域 */}
        <div className="h-[60vh] w-full relative overflow-hidden bg-[var(--bg-secondary)] group">
          <ParallaxImage src={post.cover_url || getAnimeCover(post.id)} />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* 文章内容卡片 */}
        <main className="max-w-4xl mx-auto px-4 lg:px-8 relative -mt-40 z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-[var(--bg-card)]/80 backdrop-blur-xl rounded-[2.5rem] p-8 lg:p-16 shadow-2xl border border-[var(--border-color)]"
          >
            {/* 文章头部信息 */}
            <div className="mb-12 text-center border-b border-[var(--border-color)] pb-10">
              
              <div className="flex justify-center flex-wrap gap-2 mb-6">
                  {post.tags?.map((tag: string) => (
                      <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-[10px] font-black uppercase tracking-wider border border-purple-100/50 dark:border-purple-800/50">
                          <Tag size={10} /> {tag}
                      </span>
                  ))}
              </div>
              
              <h1 className="text-3xl lg:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-6 leading-tight">
                  {post.title}
              </h1>
              
              <div className="flex items-center justify-center gap-6 text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  <span className="flex items-center gap-2">
                      <Clock size={14} /> {format(new Date(post.created_at), 'yyyy年MM月dd日', { locale: zhCN })}
                  </span>
                  <span className="flex items-center gap-2">
                      <User size={14} /> {post.author_email?.split('@')[0]}
                  </span>
              </div>
            </div>

            {/* Markdown 正文 */}
            <article className="
                prose prose-slate dark:prose-invert prose-lg max-w-none 
                prose-headings:font-black prose-headings:tracking-tight prose-headings:text-[var(--text-primary)]
                prose-p:text-[var(--text-secondary)] prose-p:leading-8
                prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-3xl prose-img:shadow-lg prose-img:border prose-img:border-[var(--border-color)]
                prose-blockquote:border-l-4 prose-blockquote:border-purple-400 prose-blockquote:bg-purple-50/30 dark:prose-blockquote:bg-purple-900/20 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                prose-code:text-purple-600 dark:prose-code:text-purple-400 prose-code:bg-[var(--bg-secondary)] prose-code:px-1 prose-code:rounded prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-slate-900 prose-pre:rounded-2xl prose-pre:shadow-xl
                prose-strong:text-[var(--text-primary)]
                prose-li:text-[var(--text-secondary)]
            ">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
            </article>

            {/* 评论区 */}
            <CommentSection postId={post.id} />

          </motion.div>
        </main>
      </div>
    </div>
  );
}
