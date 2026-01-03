'use client';

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { ArrowRight, Github, Twitter, Mail, Code2, Cpu, Terminal, Sparkles, Music } from 'lucide-react';

// --- 组件：故障文字效果 ---
const GlitchText = ({ text }: { text: string }) => {
  return (
    <div className="relative group inline-block">
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -z-10 w-full h-full text-purple-500 opacity-0 group-hover:opacity-70 group-hover:animate-pulse translate-x-[2px]">{text}</span>
      <span className="absolute top-0 left-0 -z-10 w-full h-full text-cyan-500 opacity-0 group-hover:opacity-70 group-hover:animate-pulse -translate-x-[2px]">{text}</span>
    </div>
  );
};

// --- 组件：科技栈卡片 ---
const TechBadge = ({ icon: Icon, label }: { icon: any, label: string }) => (
  <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/50 text-slate-700 text-[10px] font-bold uppercase tracking-wider shadow-sm hover:scale-105 transition-transform cursor-default">
    <Icon size={12} className="text-purple-600" />
    {label}
  </div>
);

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
  }, []);

  return (
    <div className="relative min-h-screen bg-[#f0f2f5] text-slate-900 font-sans selection:bg-purple-200 overflow-x-hidden">
      <Sidebar />

      {/* --- 动态背景 --- */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <motion.div style={{ y: y1, x: -100 }} className="absolute top-20 left-10 w-96 h-96 bg-purple-200/40 rounded-full blur-[100px]" />
        <motion.div style={{ y: y2, x: 100 }} className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-cyan-200/40 rounded-full blur-[120px]" />
      </div>

      <main className="w-full lg:ml-72 transition-all duration-300 min-h-screen flex items-center p-6 lg:p-12">
        <div className="max-w-7xl mx-auto w-full">
          
          {/* --- 仪表盘网格布局 --- */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            {/* 左侧：自我介绍 (Hero) */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black tracking-widest uppercase">
                  系统在线
                </span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>

              <h1 className="text-5xl lg:text-7xl font-black text-slate-800 tracking-tighter leading-[1.1]">
                你好，我是Milk <br/>
              </h1>

              <p className="text-lg text-slate-500 max-w-xl leading-relaxed font-medium">
                欢迎来到 <span className="text-purple-600 font-bold">SOYMILK</span>。
                <br />
                这里是现实与虚拟的交汇点。我用代码编织逻辑，用像素记录生活。探索未知的边界，构建数字的诗篇。
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/posts">
                  <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center gap-2 group">
                    开始阅读 <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                  </button>
                </Link>
                <Link href="/logs">
                  <button className="px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors">
                    查看动态
                  </button>
                </Link>
              </div>

              {/* Tech Stack */}
              <div className="space-y-3 pt-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">技术栈状态</h3>
                <div className="flex flex-wrap gap-2">
                  <TechBadge icon={Code2} label="Next.js 14" />
                  <TechBadge icon={Terminal} label="TypeScript" />
                  <TechBadge icon={Cpu} label="Supabase" />
                  <TechBadge icon={Sparkles} label="Tailwind" />
                </div>
              </div>
            </motion.div>

            {/* 右侧：卡片组 (堆叠显示) */}
            <div className="grid grid-cols-1 gap-6">
              
              {/* 卡片 1: 关于我 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-8 bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/60 relative overflow-hidden group hover:shadow-xl transition-all duration-500"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Cpu size={100} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-3">关于我(sks)</h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  全栈开发者 / 独立创造者 / 像素艺术家。(bushi
                  应该热衷于创造令人愉悦的交互体验。我相信代码不仅是逻辑的堆砌，更是数字世界的诗歌。(偷来的)
                </p>
                <div className="flex gap-3">
                  <a href="#" className="p-2.5 bg-slate-100 rounded-full text-slate-600 hover:bg-black hover:text-white transition-colors"><Github size={18}/></a>
                  <a href="#" className="p-2.5 bg-slate-100 rounded-full text-slate-600 hover:bg-blue-400 hover:text-white transition-colors"><Twitter size={18}/></a>
                  <a href="mailto:your@email.com" className="p-2.5 bg-slate-100 rounded-full text-slate-600 hover:bg-purple-500 hover:text-white transition-colors"><Mail size={18}/></a>
                </div>
              </motion.div>

              {/* 卡片 2: 正在播放 (Now Playing) */}
              <motion.div 
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.3 }}
                 className="relative p-8 bg-slate-900 rounded-[2rem] shadow-xl flex items-center justify-between overflow-hidden group"
              >
                {/* 背景装饰 */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-slate-900 z-0" />
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-colors" />

                <div className="relative z-10 flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/10">
                    <Music size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
                      正在播放 <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
                    </h3>
                    <p className="text-slate-400 text-xs font-mono line-clamp-1">I Really Want to Stay At Your House</p>
                    <p className="text-slate-500 text-[10px] uppercase tracking-wider mt-1">Cyberpunk 2077 OST</p>
                  </div>
                </div>

                {/* 音频波形 */}
                <div className="relative z-10 flex gap-1 h-8 items-end ml-4">
                  {[...Array(5)].map((_,i) => (
                    <motion.div 
                      key={i}
                      animate={{ height: [8, 24, 8] }}
                      transition={{ duration: 0.6 + Math.random() * 0.4, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1 bg-purple-500 rounded-full opacity-80"
                    />
                  ))}
                </div>
              </motion.div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
