"use client";

import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import LoginModal from '@/components/LoginModal'; 
import Sidebar from '@/components/Sidebar';
import { format } from 'date-fns';
import { Heart, MessageSquare, Send } from 'lucide-react'; 
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// ✨ 强力校验函数 (修复 Invalid URL 报错)
const isValidUrl = (url: string) => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;
  
  // 1. 允许以 / 开头的本地路径 (例如 /covers/1.jpg)
  if (trimmed.startsWith('/')) return true;
  
  // 2. 允许 http:// 或 https:// 开头的网络路径
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return true;
  
  // 其他情况 (比如 "1", "abc", "www.baidu.com") 统统视为非法，过滤掉！
  return false;
};

// --- 🖼️ 九宫格组件 ---
const ImageGrid = ({ images }: { images: string[] }) => {
  // ✨ 过滤非法图片
  const validImages = images?.filter(img => isValidUrl(img)) || [];

  if (validImages.length === 0) return null;

  // 1张图
  if (validImages.length === 1) {
    return (
      <div className="mt-3 relative w-full max-w-[80%] aspect-video rounded-lg overflow-hidden border border-slate-200 cursor-zoom-in">
        <Image 
          src={validImages[0]} 
          alt="moment" 
          fill 
          className="object-cover"
          sizes="(max-width: 768px) 80vw, 600px" 
        />
      </div>
    );
  }

  // 4张图
  if (validImages.length === 4) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 max-w-[240px]">
        {validImages.map((img, i) => (
          <div key={i} className="relative aspect-square bg-slate-100 overflow-hidden cursor-zoom-in">
            <Image 
              src={img} 
              alt={`img-${i}`} 
              fill 
              className="object-cover hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 40vw, 120px"
            />
          </div>
        ))}
      </div>
    );
  }

  // 其他：3列九宫格
  return (
    <div className="mt-3 grid grid-cols-3 gap-1 max-w-[360px]">
      {validImages.map((img, i) => (
        <div key={i} className="relative aspect-square bg-slate-100 overflow-hidden cursor-zoom-in">
          <Image 
            src={img} 
            alt={`img-${i}`} 
            fill 
            className="object-cover hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 30vw, 120px"
          />
        </div>
      ))}
    </div>
  );
};

export default function LogsPage() {
  const [user, setUser] = useState<any>(null);
  const [moments, setMoments] = useState<any[]>([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newImages, setNewImages] = useState('');

  useEffect(() => {
    async function fetchUser() {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      if (currentUser) {
        const { data: profile } = await supabase.from('profiles').select('avatar_url').eq('id', currentUser.id).single();
        if (profile?.avatar_url) currentUser.user_metadata.avatar_url = profile.avatar_url;
      }
      setUser(currentUser);
    }
    fetchUser();
    fetchMoments();
  }, []);

  async function fetchMoments() {
    const { data } = await supabase
      .from('posts')
      .select(`*, profiles:user_id ( avatar_url, username )`)
      .eq('type', 'moment') 
      .order('created_at', { ascending: false });
    setMoments(data || []);
  }

  async function handlePublish() {
    if (!newContent && !newImages) return;
    
    // ✨ 发布前也做一次清洗
    const imagesArray = newImages 
      ? newImages.split(',').map(url => url.trim()).filter(url => isValidUrl(url)) 
      : [];
    
    await supabase.from('posts').insert([{
      content: newContent, author_email: user.email, user_id: user.id, type: 'moment', images: imagesArray, likes: 0
    }]);
    setNewContent(''); setNewImages(''); fetchMoments();
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
        <div className="relative h-72 lg:h-96 bg-slate-800 overflow-hidden group">
          <Image 
            src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200" 
            alt="header"
            fill
            className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-[20s]" 
            priority
          />
          <div className="absolute bottom-[-30px] right-6 lg:right-10 flex items-end gap-4 z-10">
            <span className="text-white font-bold text-lg mb-10 drop-shadow-md tracking-wider">{user?.email?.split('@')[0] || 'Guest'}</span>
            <div className="w-20 h-20 bg-white p-1 rounded-2xl shadow-xl rotate-3 hover:rotate-0 transition-transform cursor-pointer relative">
               <Image 
                 src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.email || 'milk'}`} 
                 alt="avatar"
                 fill
                 className="rounded-xl bg-slate-100 object-cover" 
               />
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto pt-24 px-6 lg:px-0">
          {user && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16 bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex-shrink-0 shadow-sm relative">
                   <Image src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.email}`} alt="avatar" fill className="object-cover" />
                </div>
                <div className="flex-1 space-y-3">
                  <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="分享你的新鲜事..." className="w-full h-20 bg-transparent text-sm outline-none resize-none placeholder:text-slate-400"/>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <input value={newImages} onChange={(e) => setNewImages(e.target.value)} placeholder="图片链接 (逗号分隔)..." className="flex-1 bg-transparent text-xs font-mono text-slate-500 outline-none mr-4"/>
                    <button onClick={handlePublish} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-purple-600 transition-colors flex items-center gap-2">
                      <Send size={12} /> 发布
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="space-y-12">
            {moments.map((moment) => (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} key={moment.id} className="flex gap-4 border-b border-slate-100 pb-10 last:border-0">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden cursor-pointer hover:opacity-80 relative">
                   <Image 
                     src={moment.profiles?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${moment.author_email}`} 
                     alt="avatar"
                     fill
                     className="object-cover" 
                   />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-800 text-sm mb-1 hover:text-purple-600 cursor-pointer">
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
                  {moment.likes > 0 && <div className="mt-3 bg-slate-50/50 rounded p-2 text-xs text-slate-500 flex items-center gap-2"><Heart size={10} className="fill-slate-400 text-slate-400"/> <span className="font-bold">{moment.likes}</span> 次赞</div>}
                </div>
              </motion.div>
            ))}
            {moments.length === 0 && !user && <div className="text-center py-20 text-slate-300 italic">登录后查看动态...</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
