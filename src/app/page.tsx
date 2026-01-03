"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import LoginModal from '@/components/LoginModal'; 
import Sidebar from '@/components/Sidebar';
import PostSkeleton from '@/components/PostSkeleton'; 
import ParallaxImage from '@/components/ParallaxImage'; 
import Link from 'next/link'; 
import { format } from 'date-fns';
import { Heart, Terminal, MessageSquare } from 'lucide-react'; 
import React, { useState, useEffect } from 'react';

const ANIME_COVERS = ["/covers/cimgtwjgu000szrs56jyqr0mg.1200.jpg", "/covers/cit9ejr5100c6z35nrc61fd7j.1200.jpg", "/covers/ciuur1ym5000cbsjb09bof78s.1200.jpg", "/covers/claodyl1v0068m78hgrbs3myq.2160p.jpg", "/covers/clba9t5hw007qm78hd3cocnrm.2160p.jpg", "/covers/clbihqun3007ym78h7rsq6cda.2160p.jpg", "/covers/clc7emns2000w6v8hdu5d1k17.2160p.jpg", "/covers/cm7rftv17000hkl8h1gjn9e1v.2160p.jpg", "/covers/cm9lnaup3001ikl8h044j19za.2160p.jpg", "/covers/cm9za5ads001skl8h125v2zrw.2160p.jpg", "/covers/cmabaj7od001xkl8hbdm96tlk.2160p.jpg", "/covers/cmatsfxm100041k8h93jd61z7.2160p.jpg", "/covers/cmbmb7mr3000f1k8hefiqenx7.2160p.jpg", "/covers/cmju6k1jb00168w8hcb4pgdnd.2160p.jpg"];
const getAnimeCover = (id: number) => ANIME_COVERS[id % ANIME_COVERS.length];

interface Comment { id: number; user_email: string; content: string; created_at: string; }
interface Post { id: number; title: string; content: string; author_email: string; likes: number; created_at: string; tags: string[]; cover_url?: string; type?: string; user_id?: string; } // ✨ 加上 user_id

// --- 评论组件 (含通知逻辑) ---
const CommentsSection = ({ postId, user, postAuthorId }: { postId: number, user: any, postAuthorId?: string }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (isOpen) fetchComments(); }, [isOpen]);

  async function fetchComments() {
    const { data } = await supabase.from('comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
    setComments(data || []);
  }

  async function handleSend() {
    if (!newComment.trim() || !user) return;
    setLoading(true);
    await supabase.from('comments').insert({ post_id: postId, user_id: user.id, user_email: user.email, content: newComment });

    // ✨ 触发通知：如果不做判断，每个人评论都会发通知；加判断是为了只通知作者
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
    <div className="w-full">
      <button onClick={() => setIsOpen(!isOpen)} className="ml-auto flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-purple-600 transition-colors">
        <MessageSquare size={12} /><span>{isOpen ? 'Close' : `View Signals`}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="py-4 space-y-3 mt-2 border-t border-slate-50">
              {comments.length === 0 && <p className="text-xs text-slate-300 italic">No signals yet...</p>}
              {comments.map(c => (<div key={c.id} className="bg-slate-50 p-3 rounded-lg text-sm"><div className="flex justify-between items-center mb-1"><span className="text-[10px] font-black text-purple-500 uppercase">{c.user_email?.split('@')[0]}</span><span className="text-[10px] text-slate-300 font-mono">{format(new Date(c.created_at), 'MM/dd')}</span></div><p className="text-slate-600">{c.content}</p></div>))}
            </div>
            {user ? (<div className="flex gap-2 mt-4"><input value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Transmit..." className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs outline-none focus:border-purple-300 transition-colors"/><button disabled={loading} onClick={handleSend} className="w-16 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-purple-600 transition-colors flex items-center justify-center">{loading ? '...' : 'Send'}</button></div>) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Page() {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 6;
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    fetchPosts(0, true);
    return () => subscription.unsubscribe();
  }, []);

  async function fetchPosts(pageIndex: number, reset = false) {
    if (reset) setLoading(true);
    const from = pageIndex * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data } = await supabase.from('posts').select('*').eq('type', 'article').order('created_at', { ascending: false }).range(from, to);
    if (data) {
      if (data.length < PAGE_SIZE) setHasMore(false);
      setPosts(prev => reset ? data : [...prev, ...data]);
    }
    setLoading(false);
  }

  async function handleLike(e: React.MouseEvent, postId: number, currentLikes: number) {
    e.preventDefault(); e.stopPropagation();
    const newLikes = (currentLikes || 0) + 1;
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: newLikes } : p));
    await supabase.from('posts').update({ likes: newLikes }).eq('id', postId);
  }

  return (
    <div className="relative min-h-screen bg-[#f0f2f5] text-slate-900 font-sans selection:bg-purple-200 overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden -z-10">
        <motion.div animate={{ x: [0, 50, 0], y: [0, 30, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-cyan-100/40 rounded-full blur-[120px]" />
        <motion.div animate={{ x: [0, -50, 0], y: [0, -30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-pink-100/40 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <Sidebar />

      <main className="w-full lg:ml-80 flex-1 py-24 px-6 lg:px-12 xl:px-16 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence>
            {user && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
                <div className="p-6 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-center space-x-2 mb-6 text-purple-500/60"><Terminal size={14} /><span className="text-[10px] font-bold uppercase tracking-widest">New Article</span></div>
                  <div className="flex flex-col gap-4">
                     <input id="post-title" type="text" placeholder="Title..." className="w-full bg-transparent text-xl font-black outline-none placeholder:text-slate-300" />
                     <div className="flex gap-4">
                        <input id="post-tags" type="text" placeholder="Tags (e.g. Code)" className="flex-1 bg-white/50 rounded-lg px-4 py-2 text-sm font-mono text-purple-600 outline-none placeholder:text-slate-300" />
                        <input id="post-cover" type="text" placeholder="Cover Image URL (Optional)" className="flex-1 bg-white/50 rounded-lg px-4 py-2 text-sm text-slate-600 outline-none placeholder:text-slate-300" />
                     </div>
                     <textarea id="post-content" placeholder="Write in Markdown..." className="w-full bg-transparent text-slate-600 outline-none h-24 resize-none font-medium placeholder:text-slate-300 font-mono text-sm p-2"></textarea>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button onClick={async () => {
                        const title = (document.getElementById('post-title') as HTMLInputElement).value;
                        const content = (document.getElementById('post-content') as HTMLTextAreaElement).value;
                        const tagsInput = (document.getElementById('post-tags') as HTMLInputElement).value;
                        const cover_url = (document.getElementById('post-cover') as HTMLInputElement).value;
                        const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [];
                        if(!title || !content) return;
                        // ✨ 插入时带上 user_id，方便后续发通知
                        await supabase.from('posts').insert([{ title, content, author_email: user.email, user_id: user.id, likes: 0, tags, cover_url, type: 'article' }]);
                        fetchPosts(0, true);
                        (document.getElementById('post-title') as HTMLInputElement).value = "";
                        (document.getElementById('post-content') as HTMLTextAreaElement).value = "";
                      }}
                      className="px-6 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg"
                    >Publish</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {loading && posts.length === 0 ? Array(4).fill(0).map((_, i) => <PostSkeleton key={i} />) : posts.map((post) => (
                <Link href={`/post/${post.id}`} key={post.id} className="block h-full group">
                  <motion.article initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} whileHover={{ y: -8 }} className="relative flex flex-col h-full bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/60 shadow-sm group-hover:shadow-2xl group-hover:bg-white/70 transition-all duration-500 overflow-hidden cursor-pointer">
                    <div className="aspect-video w-full overflow-hidden relative bg-slate-200">
                       <ParallaxImage src={post.cover_url || getAnimeCover(post.id)} />
                       <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-slate-800 shadow-sm pointer-events-none z-10">LOG #{post.id}</div>
                    </div>
                    <div className="flex-1 p-6 lg:p-8 flex flex-col">
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-[10px] text-slate-400 font-mono tracking-wide uppercase">{format(new Date(post.created_at), 'MMMM dd, yyyy')}</span>
                        {post.tags?.map(tag => <span key={tag} className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full uppercase">{tag}</span>)}
                      </div>
                      <h2 className="text-2xl font-black tracking-tighter mb-4 text-slate-800 group-hover:text-purple-700 transition-colors leading-tight">{post.title}</h2>
                      <p className="flex-1 text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6 opacity-70 font-medium">{post.content.slice(0, 150)}...</p>
                      <div className="flex items-center justify-between pt-6 border-t border-slate-100/50 mt-auto">
                        <button onClick={(e) => handleLike(e, post.id, post.likes || 0)} className="flex items-center space-x-2 text-slate-400 hover:text-pink-500 transition-colors group/like z-20 relative">
                          <Heart size={16} className={(post.likes || 0) > 0 ? 'fill-pink-500 text-pink-500' : ''} />
                          <span className="text-xs font-bold">{post.likes || 0}</span>
                        </button>
                        <div className="flex-1 ml-4" onClick={(e) => e.preventDefault()}> {/* 阻止冒泡 */}
                           <CommentsSection postId={post.id} user={user} postAuthorId={post.user_id} />
                        </div>
                      </div>
                    </div>
                  </motion.article>
                </Link>
            ))}
          </div>
          {hasMore && !loading && <div className="mt-32 flex justify-center"><button onClick={() => { const next = page + 1; setPage(next); fetchPosts(next); }} className="px-8 py-3 bg-white/50 rounded-full text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-white hover:text-purple-600 transition-all shadow-sm">Load More</button></div>}
          <footer className="mt-40 pb-20 text-center text-[10px] text-slate-300 font-black tracking-[0.5em] uppercase opacity-50">--- End of Signal ---</footer>
        </div>
      </main>
    </div>
  );
}
