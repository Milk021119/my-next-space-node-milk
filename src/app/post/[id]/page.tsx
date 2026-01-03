"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { ArrowLeft, Heart, MessageSquare } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import PostSkeleton from '@/components/PostSkeleton';
import ParallaxImage from '@/components/ParallaxImage';
import LoginModal from '@/components/LoginModal';

// --- 类型定义 ---
interface Comment {
  id: number;
  user_email: string;
  content: string;
  created_at: string;
}

// 详情页单独的评论组件
const DetailComments = ({ postId, user }: { postId: number, user: any }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, []);

  async function fetchComments() {
    const { data } = await supabase.from('comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
    setComments(data || []);
  }

  async function handleSend() {
    if (!newComment.trim() || !user) return;
    setLoading(true);
    await supabase.from('comments').insert({
      post_id: postId,
      user_id: user.id,
      user_email: user.email,
      content: newComment
    });
    setNewComment('');
    fetchComments();
    setLoading(false);
  }

  return (
    <div className="mt-16 pt-10 border-t border-slate-200">
      <h3 className="text-xl font-black mb-8 flex items-center gap-2">
        <MessageSquare size={20} />
        SIGNALS ({comments.length})
      </h3>

      <div className="space-y-6 mb-10">
        {comments.length === 0 && <p className="text-slate-400 italic">No signals detected yet. Be the first to transmit.</p>}
        {comments.map(c => (
          <div key={c.id} className="bg-white/60 p-6 rounded-2xl border border-white shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-purple-600">{c.user_email?.split('@')[0]}</span>
              <span className="text-xs text-slate-400 font-mono">{format(new Date(c.created_at), 'yyyy/MM/dd HH:mm')}</span>
            </div>
            <p className="text-slate-700 leading-relaxed">{c.content}</p>
          </div>
        ))}
      </div>

      {user ? (
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
          <textarea 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Transmit your thought..."
            className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-purple-200 min-h-[100px] resize-none mb-4"
          />
          <div className="flex justify-end">
            <button 
              disabled={loading} 
              onClick={handleSend} 
              className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-purple-600 transition-colors"
            >
              {loading ? 'Sending...' : 'Transmit Signal'}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center p-8 bg-slate-100 rounded-3xl">
          <p className="text-slate-500 mb-4">Login required to transmit signals.</p>
        </div>
      )}
    </div>
  );
};

export default function PostDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 这里的图库保持一致，用于匹配封面
  const ANIME_COVERS = [
    "/covers/cimgtwjgu000szrs56jyqr0mg.1200.jpg",
    "/covers/cit9ejr5100c6z35nrc61fd7j.1200.jpg",
    "/covers/ciuur1ym5000cbsjb09bof78s.1200.jpg",
    "/covers/claodyl1v0068m78hgrbs3myq.2160p.jpg",
    "/covers/clba9t5hw007qm78hd3cocnrm.2160p.jpg",
    "/covers/clbihqun3007ym78h7rsq6cda.2160p.jpg",
    "/covers/clc7emns2000w6v8hdu5d1k17.2160p.jpg",
    "/covers/cm7rftv17000hkl8h1gjn9e1v.2160p.jpg",
    "/covers/cm9lnaup3001ikl8h044j19za.2160p.jpg",
    "/covers/cm9za5ads001skl8h125v2zrw.2160p.jpg",
    "/covers/cmabaj7od001xkl8hbdm96tlk.2160p.jpg",
    "/covers/cmatsfxm100041k8h93jd61z7.2160p.jpg",
    "/covers/cmbmb7mr3000f1k8hefiqenx7.2160p.jpg",
    "/covers/cmju6k1jb00168w8hcb4pgdnd.2160p.jpg"
  ];
  const getAnimeCover = (pid: number) => ANIME_COVERS[pid % ANIME_COVERS.length];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    if (id) fetchPost();
  }, [id]);

  async function fetchPost() {
    setLoading(true);
    const { data } = await supabase.from('posts').select('*').eq('id', id).single();
    setPost(data);
    setLoading(false);
  }

  if (loading) return <div className="min-h-screen bg-[#f0f2f5] p-10"><PostSkeleton /></div>;
  if (!post) return <div className="min-h-screen flex items-center justify-center text-slate-400">Signal Lost (404)</div>;

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans selection:bg-purple-200 pb-20">
      
      {/* 顶部导航 */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-white/20">
        <button onClick={() => router.back()} className="p-2 hover:bg-white rounded-full transition-colors flex items-center gap-2 text-slate-600 font-bold text-sm">
          <ArrowLeft size={20} /> <span>BACK</span>
        </button>
        <div className="text-xs font-black tracking-widest text-slate-400 uppercase">LOG #{post.id}</div>
      </nav>

      {/* 巨型封面图 */}
      <div className="h-[50vh] w-full relative overflow-hidden bg-slate-200">
        <ParallaxImage src={post.cover_url || getAnimeCover(post.id)} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f0f2f5] via-transparent to-transparent" />
      </div>

      {/* 内容容器 */}
      <main className="max-w-4xl mx-auto px-6 relative -mt-32 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-8 lg:p-16 shadow-2xl border border-white"
        >
          {/* 标题区 */}
          <div className="mb-10 text-center">
            <div className="flex justify-center gap-2 mb-6">
              {post.tags?.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-100">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter mb-6 leading-tight">
              {post.title}
            </h1>
            <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">
              {format(new Date(post.created_at), 'MMMM dd, yyyy')} • By {post.author_email?.split('@')[0]}
            </p>
          </div>

          {/* 正文区 */}
          <article className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-img:rounded-3xl prose-a:text-purple-600">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </article>

          {/* 评论区 */}
          <DetailComments postId={post.id} user={user} />

        </motion.div>
      </main>
    </div>
  );
}
