"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import PostSkeleton from '@/components/PostSkeleton';
import ParallaxImage from '@/components/ParallaxImage';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { Heart, Hash, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

// --- 🌸 封面图库 (和首页保持一致) ---
const ANIME_COVERS = ["/covers/cimgtwjgu000szrs56jyqr0mg.1200.jpg", "/covers/cit9ejr5100c6z35nrc61fd7j.1200.jpg", "/covers/ciuur1ym5000cbsjb09bof78s.1200.jpg", "/covers/claodyl1v0068m78hgrbs3myq.2160p.jpg", "/covers/clba9t5hw007qm78hd3cocnrm.2160p.jpg", "/covers/clbihqun3007ym78h7rsq6cda.2160p.jpg", "/covers/clc7emns2000w6v8hdu5d1k17.2160p.jpg", "/covers/cm7rftv17000hkl8h1gjn9e1v.2160p.jpg", "/covers/cm9lnaup3001ikl8h044j19za.2160p.jpg", "/covers/cm9za5ads001skl8h125v2zrw.2160p.jpg", "/covers/cmabaj7od001xkl8hbdm96tlk.2160p.jpg", "/covers/cmatsfxm100041k8h93jd61z7.2160p.jpg", "/covers/cmbmb7mr3000f1k8hefiqenx7.2160p.jpg", "/covers/cmju6k1jb00168w8hcb4pgdnd.2160p.jpg"];
const getAnimeCover = (id: number) => ANIME_COVERS[id % ANIME_COVERS.length];

export default function TagPage() {
  const { tag } = useParams(); // 获取 URL 里的 tag
  // 解码 URL (比如 %20 变空格)
  const decodedTag = decodeURIComponent(tag as string);

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (decodedTag) fetchPosts();
  }, [decodedTag]);

  async function fetchPosts() {
    setLoading(true);
    // ✨ 核心查询：tags 数组包含 decodedTag
    const { data } = await supabase
      .from('posts')
      .select('*')
      .contains('tags', [decodedTag]) 
      .eq('type', 'article') // 只搜文章
      .order('created_at', { ascending: false });
    
    setPosts(data || []);
    setLoading(false);
  }

  return (
    <div className="relative min-h-screen bg-[#f0f2f5] font-sans">
      <Sidebar />

      <main className="w-full lg:ml-72 2xl:ml-80 flex-1 py-24 min-h-screen transition-all duration-300">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          
          {/* 🏷️ 标签头部 */}
          <div className="mb-12 flex items-center gap-4">
            <div className="p-4 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-200">
              <Hash size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tight">{decodedTag}</h1>
              <p className="text-slate-400 font-mono text-sm mt-1">Found {posts.length} signals with this tag.</p>
            </div>
          </div>

          {/* 文章列表 (复用首页样式) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {loading ? Array(2).fill(0).map((_, i) => <PostSkeleton key={i} />) : posts.map((post) => (
              <Link href={`/post/${post.id}`} key={post.id} className="block h-full group">
                <motion.article 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -8 }} 
                  className="relative flex flex-col h-full bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/60 shadow-sm group-hover:shadow-2xl transition-all duration-500 overflow-hidden"
                >
                  <div className="aspect-video w-full overflow-hidden relative bg-slate-200">
                     <ParallaxImage src={post.cover_url || getAnimeCover(post.id)} />
                  </div>
                  <div className="flex-1 p-6 lg:p-8 flex flex-col">
                    <h2 className="text-2xl font-black mb-4 text-slate-800 group-hover:text-purple-700 transition-colors">{post.title}</h2>
                    <p className="flex-1 text-slate-500 text-sm line-clamp-3 mb-6 opacity-70">{post.content.slice(0, 150)}...</p>
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100/50 mt-auto">
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Heart size={14}/> {post.likes}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1">Read <Terminal size={10} /></span>
                    </div>
                  </div>
                </motion.article>
              </Link>
            ))}
            {!loading && posts.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-400 italic">No posts found with this tag.</div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
