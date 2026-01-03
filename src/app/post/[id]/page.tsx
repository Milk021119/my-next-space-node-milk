"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale'; // ✨ 引入中文日期包
import { ArrowLeft, MessageSquare, Clock, User, Tag, Send } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import PostSkeleton from '@/components/PostSkeleton';
import ParallaxImage from '@/components/ParallaxImage';
import Sidebar from '@/components/Sidebar';

// 定义接口，防止 TS 报错
interface Comment { 
  id: number; 
  user_email: string; 
  content: string; 
  created_at: string; 
}

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

// 评论组件
const DetailComments = ({ postId, user, postAuthorId }: { postId: number, user: any, postAuthorId?: string }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchComments(); }, []);

  async function fetchComments() {
    const { data } = await supabase.from('comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
    setComments(data || []);
  }

  async function handleSend() {
    if (!newComment.trim() || !user) return;
    setLoading(true);
    
    // 插入评论
    await supabase.from('comments').insert({ 
      post_id: postId, 
      user_id: user.id, 
      user_email: user.email, 
      content: newComment 
    });
    
    // 触发通知给作者 (如果是别人评论的话)
    if (postAuthorId && user.id !== postAuthorId) {
      await supabase.from('notifications').insert({
        recipient_id: postAuthorId,
        sender_email: user.email,
        post_id: postId,
        content: newComment
      });
    }
    
    setNewComment('');
    fetchComments();
    setLoading(false);
  }

  return (
    <div className="mt-16 pt-10 border-t border-slate-100">
      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
        <MessageSquare size={16} /> 信号反馈 / 评论 ({comments.length})
      </h3>
      
      <div className="space-y-6 mb-10">
        {comments.length === 0 && (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 italic text-sm">暂无信号接入。成为第一个发送者吧。</p>
            </div>
        )}
        {comments.map(c => (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={c.id} className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 hover:border-purple-100 transition-colors">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-400 to-blue-500 shadow-sm" />
                  <span className="font-bold text-slate-700 text-sm">{c.user_email?.split('@')[0]}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                  {format(new Date(c.created_at), 'MM/dd HH:mm')}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm pl-8">{c.content}</p>
          </motion.div>
        ))}
      </div>

      {user ? (
        <div className="bg-white p-1 rounded-3xl shadow-sm border border-slate-200 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
          <textarea 
            value={newComment} 
            onChange={(e) => setNewComment(e.target.value)} 
            placeholder="向网络发送你的想法..." 
            className="w-full bg-transparent border-none rounded-xl p-4 text-sm outline-none min-h-[100px] resize-none text-slate-700 placeholder:text-slate-300" 
          />
          <div className="flex justify-between items-center px-4 pb-4">
             <span className="text-[10px] text-slate-300 font-mono">支持 Markdown 语法</span>
             <button 
                disabled={loading} 
                onClick={handleSend} 
                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-purple-600 transition-all disabled:opacity-50 flex items-center gap-2"
             >
                {loading ? '发送中...' : <><Send size={12}/> 发送信号</>}
             </button>
          </div>
        </div>
      ) : (
        <div className="text-center p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-slate-500 text-sm font-bold mb-2">访问被拒绝 (ACCESS DENIED)</p>
            <p className="text-xs text-slate-400">需要登录才能发送信号。</p>
        </div>
      )}
    </div>
  );
};

export default function PostDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 默认封面图库
  const ANIME_COVERS = ["/covers/cimgtwjgu000szrs56jyqr0mg.1200.jpg", "/covers/cit9ejr5100c6z35nrc61fd7j.1200.jpg", "/covers/ciuur1ym5000cbsjb09bof78s.1200.jpg", "/covers/claodyl1v0068m78hgrbs3myq.2160p.jpg", "/covers/clba9t5hw007qm78hd3cocnrm.2160p.jpg", "/covers/clbihqun3007ym78h7rsq6cda.2160p.jpg", "/covers/clc7emns2000w6v8hdu5d1k17.2160p.jpg", "/covers/cm7rftv17000hkl8h1gjn9e1v.2160p.jpg", "/covers/cm9lnaup3001ikl8h044j19za.2160p.jpg", "/covers/cm9za5ads001skl8h125v2zrw.2160p.jpg", "/covers/cmabaj7od001xkl8hbdm96tlk.2160p.jpg", "/covers/cmatsfxm100041k8h93jd61z7.2160p.jpg", "/covers/cmbmb7mr3000f1k8hefiqenx7.2160p.jpg", "/covers/cmju6k1jb00168w8hcb4pgdnd.2160p.jpg"];
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

  // 加载中骨架屏
  if (loading) return (
      <div className="min-h-screen bg-[#f0f2f5] font-sans flex">
          <Sidebar />
          <div className="flex-1 lg:ml-72 2xl:ml-80 p-10 flex justify-center">
              <PostSkeleton />
          </div>
      </div>
  );

  // 404 状态
  if (!post) return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center text-slate-400 font-mono">
          信号丢失 (SIGNAL_LOST_404)
      </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans selection:bg-purple-200 pb-20">
      <Sidebar />
      
      {/* 顶部透明导航 */}
      <nav className="fixed top-0 right-0 left-0 lg:left-72 2xl:left-80 z-30 px-6 py-4 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-white/20 transition-all duration-300">
        <button 
            onClick={() => router.back()} 
            className="p-2 bg-white/50 hover:bg-white rounded-full transition-all flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-wider shadow-sm border border-white/50 group"
        >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> <span>返回</span>
        </button>
        <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase border border-slate-200 px-2 py-1 rounded">
            日志编号 #{post.id}
        </div>
      </nav>

      {/* 主体偏移，留出侧边栏空间 */}
      <div className="lg:pl-72 2xl:pl-80 transition-all duration-300">
        
        {/* 视差封面图区域 */}
        <div className="h-[60vh] w-full relative overflow-hidden bg-slate-200 group">
          <ParallaxImage src={post.cover_url || getAnimeCover(post.id)} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f0f2f5] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* 文章内容卡片 */}
        <main className="max-w-4xl mx-auto px-4 lg:px-8 relative -mt-40 z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 lg:p-16 shadow-2xl border border-white/60"
          >
            {/* 文章头部信息 */}
            <div className="mb-12 text-center border-b border-slate-100 pb-10">
              
              <div className="flex justify-center flex-wrap gap-2 mb-6">
                  {post.tags?.map((tag: string) => (
                      <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-purple-100/50">
                          <Tag size={10} /> {tag}
                      </span>
                  ))}
              </div>
              
              <h1 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight mb-6 leading-tight">
                  {post.title}
              </h1>
              
              <div className="flex items-center justify-center gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-2">
                      <Clock size={14} /> {format(new Date(post.created_at), 'yyyy年MM月dd日', { locale: zhCN })}
                  </span>
                  <span className="flex items-center gap-2">
                      <User size={14} /> {post.author_email?.split('@')[0]}
                  </span>
              </div>
            </div>

            {/* Markdown 正文 (已深度优化样式) */}
            <article className="
                prose prose-slate prose-lg max-w-none 
                prose-headings:font-black prose-headings:tracking-tight 
                prose-p:text-slate-600 prose-p:leading-8
                prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-3xl prose-img:shadow-lg prose-img:border prose-img:border-slate-100
                prose-blockquote:border-l-4 prose-blockquote:border-purple-400 prose-blockquote:bg-purple-50/30 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                prose-code:text-purple-600 prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-slate-900 prose-pre:rounded-2xl prose-pre:shadow-xl
            ">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
            </article>

            {/* 评论区 */}
            <DetailComments postId={post.id} user={user} postAuthorId={post.user_id} />

          </motion.div>
        </main>
      </div>
    </div>
  );
}
