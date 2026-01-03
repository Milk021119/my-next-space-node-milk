"use client";

import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import LoginModal from '@/components/LoginModal'; 
import Sidebar from '@/components/Sidebar';
import { format } from 'date-fns';
import { Heart, MessageSquare } from 'lucide-react'; 
import React, { useState, useEffect } from 'react';

const ImageGrid = ({ images }: { images: string[] }) => {
  if (!images || images.length === 0) return null;
  if (images.length === 1) return <div className="mt-3 max-w-[80%]"><img src={images[0]} className="rounded-lg max-h-[400px] object-cover border border-slate-200 cursor-zoom-in" /></div>;
  if (images.length === 4) return <div className="mt-3 grid grid-cols-2 gap-1 max-w-[240px]">{images.map((img, i) => <div key={i} className="aspect-square bg-slate-100 overflow-hidden cursor-zoom-in"><img src={img} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" /></div>)}</div>;
  return <div className="mt-3 grid grid-cols-3 gap-1 max-w-[360px]">{images.map((img, i) => <div key={i} className="aspect-square bg-slate-100 overflow-hidden cursor-zoom-in"><img src={img} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" /></div>)}</div>;
};

export default function LogsPage() {
  const [user, setUser] = useState<any>(null);
  const [moments, setMoments] = useState<any[]>([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newImages, setNewImages] = useState(''); 

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    fetchMoments();
  }, []);

  async function fetchMoments() {
    // ✨ 核心修改：关联查询 profiles 表
    const { data } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id ( avatar_url, username )
      `)
      .eq('type', 'moment') 
      .order('created_at', { ascending: false });
    setMoments(data || []);
  }

  async function handlePublish() {
    if (!newContent && !newImages) return;
    const imagesArray = newImages ? newImages.split(',').map(url => url.trim()).filter(url => url.length > 0) : [];
    
    // ✨ 发布时带上 user_id
    await supabase.from('posts').insert([{
      content: newContent,
      author_email: user.email,
      user_id: user.id, 
      type: 'moment',
      images: imagesArray,
      likes: 0
    }]);

    setNewContent('');
    setNewImages('');
    fetchMoments();
  }

  async function handleLike(momentId: number, currentLikes: number) {
    const newLikes = (currentLikes || 0) + 1;
    setMoments(prev => prev.map(m => m.id === momentId ? { ...m, likes: newLikes } : m));
    await supabase.from('posts').update({ likes: newLikes }).eq('id', momentId);
  }

  return (
    <div className="relative min-h-screen bg-white text-slate-900 font-sans">
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <Sidebar />

      <main className="w-full lg:ml-80 min-h-screen pb-20">
        {/* Parallax Header */}
        <div className="relative h-72 lg:h-96 bg-slate-800 overflow-hidden group">
          <img src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-[20s]" />
          <div className="absolute bottom-[-30px] right-6 lg:right-10 flex items-end gap-4 z-10">
            <span className="text-white font-bold text-lg mb-10 drop-shadow-md tracking-wider">{user?.email?.split('@')[0] || 'Guest'}</span>
            <div className="w-20 h-20 bg-white p-1 rounded-2xl shadow-xl rotate-3 hover:rotate-0 transition-transform cursor-pointer">
               {/* 这里的头像不重要，因为是当前用户的，Sidebar 会处理好 */}
               <img src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.email || 'milk'}`} className="w-full h-full rounded-xl bg-slate-100 object-cover" />
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto pt-24 px-6 lg:px-0">
          {user && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16 bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex-shrink-0 shadow-sm">
                   <img src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.email}`} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-3">
                  <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="What's on your mind?" className="w-full h-20 bg-transparent text-sm outline-none resize-none placeholder:text-slate-400"/>
                  <input value={newImages} onChange={(e) => setNewImages(e.target.value)} placeholder="Image URLs..." className="w-full bg-white rounded-lg px-3 py-2 text-xs font-mono text-slate-500 outline-none border border-slate-200 focus:border-purple-300 transition-colors"/>
                  <div className="flex justify-end pt-2 border-t border-slate-200"><button onClick={handlePublish} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-purple-600 transition-colors">Post Moment</button></div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="space-y-12">
            {moments.map((moment) => (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} key={moment.id} className="flex gap-4 border-b border-slate-100 pb-10 last:border-0">
                {/* ✨ 左侧头像：使用联表查询出来的 profiles.avatar_url */}
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden cursor-pointer hover:opacity-80">
                   <img 
                     src={moment.profiles?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${moment.author_email}`} 
                     className="w-full h-full object-cover" 
                   />
                </div>
                
                <div className="flex-1">
                  <div className="font-bold text-slate-800 text-sm mb-1 hover:text-purple-600 cursor-pointer">
                    {/* 优先显示昵称，没有则显示邮箱前缀 */}
                    {moment.profiles?.username || moment.author_email?.split('@')[0]}
                  </div>
                  <p className="text-slate-700 text-[15px] leading-relaxed whitespace-pre-wrap">{moment.content}</p>
                  <ImageGrid images={moment.images} />
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-mono">{format(new Date(moment.created_at), 'HH:mm')}</span>
                    <div className="flex items-center gap-4 opacity-60 hover:opacity-100 transition-opacity">
                      <button onClick={() => handleLike(moment.id, moment.likes)} className="flex items-center gap-1 cursor-pointer hover:text-pink-500">
                        <Heart size={16} className={moment.likes > 0 ? "fill-pink-500 text-pink-500" : "text-slate-400"} />
                        {moment.likes > 0 && <span className="text-xs font-bold text-slate-500">{moment.likes}</span>}
                      </button>
                      <button className="hover:text-purple-600"><MessageSquare size={16} className="text-slate-400" /></button>
                    </div>
                  </div>
                  {moment.likes > 0 && <div className="mt-3 bg-slate-50/50 rounded p-2 text-xs text-slate-500 flex items-center gap-2"><Heart size={10} className="fill-slate-400 text-slate-400"/> <span className="font-bold">{moment.likes} people</span> liked this.</div>}
                </div>
              </motion.div>
            ))}
            {moments.length === 0 && !user && <div className="text-center py-20 text-slate-300 italic">Login to view moments...</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
