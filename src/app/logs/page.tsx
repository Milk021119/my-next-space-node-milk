"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import LoginModal from '@/components/LoginModal'; 
import Link from 'next/link';
import { format } from 'date-fns';
import { 
  Ghost, Home, Archive, User, LogIn, LogOut, 
  Github, Heart, MessageSquare, Image as ImageIcon, Camera
} from 'lucide-react'; 
import React, { useState, useEffect } from 'react';

// --- 朋友圈九宫格组件 ---
const ImageGrid = ({ images }: { images: string[] }) => {
  if (!images || images.length === 0) return null;

  // 1张图：大图模式
  if (images.length === 1) {
    return (
      <div className="mt-3 max-w-[70%]">
        <img src={images[0]} className="rounded-lg max-h-[400px] object-cover border border-slate-200" />
      </div>
    );
  }

  // 4张图：2x2 模式
  if (images.length === 4) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 max-w-[240px]">
        {images.map((img, i) => (
          <div key={i} className="aspect-square bg-slate-100 overflow-hidden">
            <img src={img} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    );
  }

  // 其他：3列模式 (九宫格)
  return (
    <div className="mt-3 grid grid-cols-3 gap-1 max-w-[360px]">
      {images.map((img, i) => (
        <div key={i} className="aspect-square bg-slate-100 overflow-hidden">
          <img src={img} className="w-full h-full object-cover" />
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
  const [newImages, setNewImages] = useState(''); // 用逗号分隔的图片链接

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    fetchMoments();
  }, []);

  // 只拉取 type = 'moment' 的数据
  async function fetchMoments() {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('type', 'moment') 
      .order('created_at', { ascending: false });
    setMoments(data || []);
  }

  async function handlePublish() {
    if (!newContent && !newImages) return;
    
    // 处理图片：按逗号分割，去空格
    const imagesArray = newImages ? newImages.split(',').map(url => url.trim()).filter(url => url.length > 0) : [];

    await supabase.from('posts').insert([{
      content: newContent,
      author_email: user.email,
      type: 'moment', // 👈 标记为朋友圈动态
      images: imagesArray,
      likes: 0
    }]);

    setNewContent('');
    setNewImages('');
    fetchMoments();
  }

  return (
    <div className="min-h-screen bg-[#ffffff] text-slate-900 font-sans flex">
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* --- 侧边栏 (保持一致) --- */}
      <aside className="fixed left-0 top-0 w-80 h-full bg-slate-50 border-r border-slate-200 hidden lg:flex flex-col p-10 z-50">
        <h1 className="text-3xl font-black italic tracking-tighter mb-10">SOYMILK</h1>
        <nav className="space-y-2 flex-1">
          <Link href="/">
            <div className="flex items-center space-x-4 p-4 rounded-xl text-sm font-bold text-slate-400 hover:text-black hover:bg-white transition-all cursor-pointer">
              <Home size={18}/> <span>ARTICLES / 文章</span>
            </div>
          </Link>
          <Link href="/logs">
            <div className="flex items-center space-x-4 p-4 rounded-xl text-sm font-bold text-purple-600 bg-purple-50 transition-all cursor-pointer">
              <Archive size={18}/> <span>MOMENTS / 朋友圈</span>
            </div>
          </Link>
          <Link href="/about">
             <div className="flex items-center space-x-4 p-4 rounded-xl text-sm font-bold text-slate-400 hover:text-black hover:bg-white transition-all cursor-pointer">
              <User size={18}/> <span>ABOUT / 关于</span>
            </div>
          </Link>
        </nav>
      </aside>

      {/* --- 朋友圈内容区 --- */}
      <main className="flex-1 lg:ml-80">
        
        {/* 朋友圈头部背景 */}
        <div className="relative h-80 bg-slate-800 overflow-hidden group">
          <img src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200" className="w-full h-full object-cover opacity-80" />
          <div className="absolute bottom-[-30px] right-10 flex items-end gap-4 z-10">
            <span className="text-white font-bold text-lg mb-8 drop-shadow-md">{user?.email?.split('@')[0] || 'Guest'}</span>
            <div className="w-20 h-20 bg-white p-1 rounded-xl shadow-lg">
               <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.email || 'milk'}`} className="w-full h-full rounded-lg bg-slate-100" />
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto pt-20 pb-20 px-6">
          
          {/* 发布框 */}
          {user && (
            <div className="mb-12 flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                 <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.email}`} />
              </div>
              <div className="flex-1">
                <textarea 
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="这一刻的想法..." 
                  className="w-full h-24 bg-slate-50 rounded-xl p-4 text-sm outline-none resize-none focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all"
                />
                <input 
                  value={newImages}
                  onChange={(e) => setNewImages(e.target.value)}
                  placeholder="图片链接 (用逗号分隔: https://a.jpg, https://b.jpg)"
                  className="w-full mt-2 bg-slate-50 rounded-lg p-3 text-xs font-mono text-slate-500 outline-none"
                />
                <div className="flex justify-end mt-2">
                  <button onClick={handlePublish} className="bg-green-500 text-white px-4 py-1.5 rounded-md text-xs font-bold hover:bg-green-600">发表</button>
                </div>
              </div>
            </div>
          )}

          {/* 动态列表 */}
          <div className="space-y-10">
            {moments.map(moment => (
              <div key={moment.id} className="flex gap-4 border-b border-slate-100 pb-10">
                {/* 左侧头像 */}
                <div className="w-10 h-10 rounded-lg bg-slate-200 flex-shrink-0 overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${moment.author_email}`} />
                </div>
                
                {/* 右侧内容 */}
                <div className="flex-1">
                  <div className="font-bold text-slate-700 text-sm mb-1">{moment.author_email?.split('@')[0]}</div>
                  <p className="text-slate-800 text-base leading-relaxed whitespace-pre-wrap">{moment.content}</p>
                  
                  {/* ✨ 九宫格图片 */}
                  <ImageGrid images={moment.images} />

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-300">{format(new Date(moment.created_at), 'HH:mm')}</span>
                    
                    {/* 点赞评论按钮 (这里做个样子，交互逻辑可以后续加) */}
                    <div className="bg-slate-100 px-2 py-1 rounded text-slate-400 cursor-pointer hover:bg-slate-200">
                      <MessageSquare size={14} />
                    </div>
                  </div>
                  
                  {/* 简单的点赞/评论区展示 */}
                  {(moment.likes > 0) && (
                    <div className="mt-3 bg-slate-50 rounded p-2 text-xs text-purple-600 font-bold flex items-center gap-1">
                      <Heart size={10} className="fill-purple-600"/> {moment.likes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
