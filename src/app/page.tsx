'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { ArrowRight, Mail, Code2, Cpu, Terminal, Sparkles, Music, Clock, Eye, Heart, FileText, MessageSquare, TrendingUp, Zap } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { getAnimeCover } from '@/lib/constants';
import type { Post } from '@/types';

// 基于索引的伪随机数生成器（确保服务端和客户端一致）
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

// --- 类型定义 ---
interface SiteStats {
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}

interface NowPlayingSong {
  name: string;
  artist: string;
  album: string;
  albumCover: string;
}

// --- 组件：科技栈卡片 ---
const TechBadge = ({ icon: Icon, label }: { icon: any, label: string }) => (
  <div className="flex items-center gap-2 bg-[var(--bg-card)] backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider shadow-sm hover:scale-105 transition-transform cursor-default">
    <Icon size={12} className="text-[var(--accent-color)]" />
    {label}
  </div>
);

// --- 组件：统计卡片 ---
const StatCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) => (
  <div className="flex items-center gap-3 p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
    <div className={`p-2 rounded-lg ${color}`}>
      <Icon size={16} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-black text-[var(--text-primary)]">{value.toLocaleString()}</p>
      <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{label}</p>
    </div>
  </div>
);

export default function HomePage() {
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [latestLogs, setLatestLogs] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [stats, setStats] = useState<SiteStats>({ totalPosts: 0, totalViews: 0, totalLikes: 0, totalComments: 0 });
  const [nowPlaying, setNowPlaying] = useState<NowPlayingSong | null>(null);
  const [musicLoading, setMusicLoading] = useState(true);

  // 获取最新文章
  useEffect(() => {
    async function fetchLatestPosts() {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('type', 'article')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (!error && data) {
        setLatestPosts(data);
      }
      setPostsLoading(false);
    }
    fetchLatestPosts();
  }, []);

  // 获取最新动态
  useEffect(() => {
    async function fetchLatestLogs() {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles:user_id ( avatar_url, username )')
        .eq('type', 'moment')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (!error && data) {
        setLatestLogs(data as any);
      }
      setLogsLoading(false);
    }
    fetchLatestLogs();
  }, []);

  // 获取站点统计
  useEffect(() => {
    async function fetchStats() {
      // 获取文章统计
      const { data: posts } = await supabase
        .from('posts')
        .select('views, likes');
      
      // 获取评论数
      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true });
      
      if (posts) {
        const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
        const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
        setStats({
          totalPosts: posts.length,
          totalViews,
          totalLikes,
          totalComments: commentsCount || 0
        });
      }
    }
    fetchStats();
  }, []);

  // 获取网易云音乐 - 通过 API Route 代理请求
  useEffect(() => {
    async function fetchNowPlaying() {
      try {
        const res = await fetch('/api/netease');
        const data = await res.json();
        
        if (data.success && data.data) {
          setNowPlaying(data.data);
        }
      } catch (error) {
        console.error('获取网易云音乐失败:', error);
      }
      setMusicLoading(false);
    }
    fetchNowPlaying();
  }, []);

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-purple-200 dark:selection:bg-purple-800 overflow-x-hidden">
      <Sidebar />

      {/* --- 动态背景 (星空粒子效果) --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        {/* 深空渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-primary)] to-[var(--bg-secondary)]" />
        
        {/* 星云光晕 - 紫色 */}
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[20%] w-[40%] h-[40%] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        
        {/* 星云光晕 - 青色 */}
        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-[20%] right-[15%] w-[35%] h-[35%] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)',
            filter: 'blur(35px)',
          }}
        />
        
        {/* 星云光晕 - 粉色 */}
        <motion.div
          animate={{
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[40%] right-[30%] w-[25%] h-[25%] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />
        
        {/* 静态星星 - 小 */}
        {[...Array(80)].map((_, i) => (
          <motion.div
            key={`star-s-${i}`}
            animate={{
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2 + seededRandom(i * 100) * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: seededRandom(i * 100 + 1) * 5,
            }}
            className="absolute rounded-full bg-white"
            style={{
              left: `${seededRandom(i * 100 + 2) * 100}%`,
              top: `${seededRandom(i * 100 + 3) * 100}%`,
              width: '1px',
              height: '1px',
              boxShadow: '0 0 2px rgba(255,255,255,0.5)',
            }}
          />
        ))}
        
        {/* 静态星星 - 中 */}
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={`star-m-${i}`}
            animate={{
              opacity: [0.4, 1, 0.4],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3 + seededRandom(i * 200) * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: seededRandom(i * 200 + 1) * 5,
            }}
            className="absolute rounded-full bg-white"
            style={{
              left: `${seededRandom(i * 200 + 2) * 100}%`,
              top: `${seededRandom(i * 200 + 3) * 100}%`,
              width: '2px',
              height: '2px',
              boxShadow: '0 0 4px rgba(255,255,255,0.6)',
            }}
          />
        ))}
        
        {/* 静态星星 - 大 (带颜色) */}
        {[...Array(15)].map((_, i) => {
          const colors = ['#ffffff', '#a5b4fc', '#c4b5fd', '#93c5fd', '#fcd34d'];
          return (
            <motion.div
              key={`star-l-${i}`}
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [0.9, 1.3, 0.9],
              }}
              transition={{
                duration: 4 + seededRandom(i * 300) * 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: seededRandom(i * 300 + 1) * 5,
              }}
              className="absolute rounded-full"
              style={{
                left: `${seededRandom(i * 300 + 2) * 100}%`,
                top: `${seededRandom(i * 300 + 3) * 100}%`,
                width: '3px',
                height: '3px',
                background: colors[i % colors.length],
                boxShadow: `0 0 8px ${colors[i % colors.length]}`,
              }}
            />
          );
        })}
        
        {/* 流星 */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`meteor-${i}`}
            animate={{
              x: [0, 300],
              y: [0, 200],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut",
              delay: 5 + i * 8,
              repeatDelay: 10 + i * 5,
            }}
            className="absolute"
            style={{
              left: `${20 + i * 25}%`,
              top: `${10 + i * 15}%`,
              width: '100px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, white, transparent)',
              transform: 'rotate(35deg)',
              filter: 'blur(0.5px)',
            }}
          />
        ))}
        
        {/* 漂浮粒子 */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            animate={{
              y: [0, -150, 0],
              x: [0, (seededRandom(i * 400) - 0.5) * 50, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 10 + seededRandom(i * 400 + 1) * 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8,
            }}
            className="absolute rounded-full"
            style={{
              left: `${seededRandom(i * 400 + 2) * 100}%`,
              bottom: '10%',
              width: `${2 + seededRandom(i * 400 + 3) * 3}px`,
              height: `${2 + seededRandom(i * 400 + 3) * 3}px`,
              background: ['#9333ea', '#06b6d4', '#ec4899', '#ffffff'][i % 4],
              opacity: 0.4,
            }}
          />
        ))}
        
        {/* 银河带效果 */}
        <div 
          className="absolute top-[30%] left-0 right-0 h-[20%] opacity-[0.03] dark:opacity-[0.06]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 20%, rgba(200,200,255,0.8) 50%, rgba(255,255,255,0.5) 80%, transparent 100%)',
            filter: 'blur(20px)',
            transform: 'rotate(-5deg)',
          }}
        />
        
        {/* 底部渐变遮罩 */}
        <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
      </div>

      <main className="relative z-10 w-full lg:ml-72 transition-all duration-300 min-h-screen p-6 lg:p-12 pt-12 lg:pt-16">
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
                <span className="px-3 py-1 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] text-[10px] font-black tracking-widest uppercase">
                  系统在线
                </span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>

              <h1 className="text-5xl lg:text-7xl font-black text-[var(--text-primary)] tracking-tighter leading-[1.1]">
                你好，我是Milk <br/>
              </h1>

              <p className="text-lg text-[var(--text-secondary)] max-w-xl leading-relaxed font-medium">
                欢迎来到 <span className="text-[var(--accent-color)] font-bold">SOYMILK</span>。
                <br />
                这里是现实与虚拟的交汇点。我用代码编织逻辑，用像素记录生活。探索未知的边界，构建数字的诗篇。
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/posts">
                  <button className="px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[var(--accent-color)] hover:shadow-lg hover:shadow-[var(--accent-color)]/30 transition-all flex items-center gap-2 group">
                    开始阅读 <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                  </button>
                </Link>
                <Link href="/logs">
                  <button className="px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[var(--bg-tertiary)] transition-colors">
                    查看动态
                  </button>
                </Link>
              </div>

              {/* Tech Stack */}
              <div className="space-y-3 pt-4">
                <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">技术栈状态</h3>
                <div className="flex flex-wrap gap-2">
                  <TechBadge icon={Code2} label="Next.js 16" />
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
                className="p-8 bg-[var(--bg-card)] backdrop-blur-xl rounded-[2rem] shadow-sm border border-[var(--border-color)] relative overflow-hidden group hover:shadow-xl transition-all duration-500"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Cpu size={100} />
                </div>
                <h2 className="text-2xl font-black text-[var(--text-primary)] mb-3">关于我(sks)</h2>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
                  全栈开发者 / 独立创造者 / 像素艺术家。(bushi
                  应该热衷于创造令人愉悦的交互体验。我相信代码不仅是逻辑的堆砌，更是数字世界的诗歌。(偷来的)
                </p>
                <div className="flex gap-3">
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-[var(--bg-tertiary)] rounded-full text-[var(--text-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors" title="GitHub">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-[var(--bg-tertiary)] rounded-full text-[var(--text-secondary)] hover:bg-blue-400 hover:text-white transition-colors" title="Twitter/X">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href="/about" className="p-2.5 bg-[var(--bg-tertiary)] rounded-full text-[var(--text-secondary)] hover:bg-[var(--accent-color)] hover:text-white transition-colors" title="关于我"><Mail size={18}/></a>
                </div>
              </motion.div>

              {/* 卡片 2: 正在播放 (Now Playing) - 网易云音乐 */}
              <motion.div 
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.3 }}
                 className="relative p-8 bg-[var(--bg-secondary)] dark:bg-slate-900 rounded-[2rem] shadow-xl border border-[var(--border-color)] flex items-center justify-between overflow-hidden group"
              >
                {/* 背景装饰 */}
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-color)]/10 to-transparent z-0" />
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[var(--accent-color)]/20 rounded-full blur-3xl group-hover:bg-[var(--accent-color)]/30 transition-colors" />

                <div className="relative z-10 flex items-center gap-6">
                  {/* 专辑封面或默认图标 */}
                  <div className="w-16 h-16 bg-[var(--bg-card)] backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 border border-[var(--border-color)] overflow-hidden">
                    {musicLoading ? (
                      <div className="w-full h-full bg-[var(--bg-tertiary)] animate-pulse" />
                    ) : nowPlaying?.albumCover ? (
                      <img src={nowPlaying.albumCover} alt={nowPlaying.album} className="w-full h-full object-cover" />
                    ) : (
                      <Music size={24} className="text-[var(--accent-color)]" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-[var(--text-primary)] font-bold text-lg mb-1 flex items-center gap-2">
                      喜欢的音乐 <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
                    </h3>
                    {musicLoading ? (
                      <>
                        <div className="h-3 w-32 bg-[var(--bg-tertiary)] rounded animate-pulse mb-2" />
                        <div className="h-2 w-24 bg-[var(--bg-tertiary)] rounded animate-pulse" />
                      </>
                    ) : nowPlaying ? (
                      <>
                        <p className="text-[var(--text-secondary)] text-xs font-mono line-clamp-1">{nowPlaying.name}</p>
                        <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider mt-1">{nowPlaying.artist}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-[var(--text-secondary)] text-xs font-mono line-clamp-1">暂无播放记录</p>
                        <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider mt-1">网易云音乐</p>
                      </>
                    )}
                  </div>
                </div>

                {/* 音频波形 */}
                <div className="relative z-10 flex gap-1 h-8 items-end ml-4">
                  {[...Array(5)].map((_,i) => (
                    <motion.div 
                      key={i}
                      animate={{ height: nowPlaying ? [8, 24, 8] : [8, 12, 8] }}
                      transition={{ duration: 0.6 + seededRandom(i * 500) * 0.4, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1 bg-[var(--accent-color)] rounded-full opacity-80"
                    />
                  ))}
                </div>
              </motion.div>

            </div>

          </div>

          {/* --- 最新文章区域 --- */}
          <motion.section 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 lg:mt-24"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-[var(--accent-color)]" />
                <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">最新文章</h2>
              </div>
              <Link href="/posts" className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-colors flex items-center gap-1 uppercase tracking-wider">
                查看全部 <ArrowRight size={12} />
              </Link>
            </div>

            {postsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-[var(--bg-card)] rounded-2xl p-6 animate-pulse">
                    <div className="h-4 bg-[var(--bg-tertiary)] rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-[var(--bg-tertiary)] rounded w-full mb-2"></div>
                    <div className="h-3 bg-[var(--bg-tertiary)] rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : latestPosts.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-muted)]">
                <Terminal size={32} className="mx-auto mb-4 opacity-50" />
                <p className="text-sm">暂无文章，快去写点什么吧~</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {latestPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="group relative"
                  >
                    <Link href={`/post/${post.id}`}>
                      <div className="bg-[var(--bg-card)] backdrop-blur-xl rounded-2xl border border-[var(--border-color)] overflow-hidden hover:shadow-xl hover:border-[var(--accent-color)]/30 transition-all duration-300">
                        {/* 封面图 */}
                        <div className="aspect-[16/9] overflow-hidden relative">
                          <img 
                            src={post.cover_url || getAnimeCover(post.id)} 
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-3 left-3 flex items-center gap-2">
                            {post.tags?.slice(0, 2).map(tag => (
                              <span key={tag} className="text-[9px] font-bold text-white/90 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full uppercase">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {/* 内容 */}
                        <div className="p-5">
                          <h3 className="font-bold text-[var(--text-primary)] mb-2 line-clamp-2 group-hover:text-[var(--accent-color)] transition-colors leading-snug">
                            {post.title}
                          </h3>
                          <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-4 leading-relaxed">
                            {post.content.slice(0, 80)}...
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                            <span className="font-mono">{format(new Date(post.created_at), 'yyyy/MM/dd')}</span>
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Eye size={10} /> {post.views || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart size={10} /> {post.likes || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            )}
          </motion.section>

          {/* --- 站点统计 & 最近动态 并排布局 --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16">
            
            {/* 站点统计 */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp size={16} className="text-[var(--accent-color)]" />
                <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">站点统计</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <StatCard icon={FileText} label="文章数" value={stats.totalPosts} color="bg-purple-500" />
                <StatCard icon={Eye} label="总浏览" value={stats.totalViews} color="bg-blue-500" />
                <StatCard icon={Heart} label="总点赞" value={stats.totalLikes} color="bg-pink-500" />
                <StatCard icon={MessageSquare} label="总评论" value={stats.totalComments} color="bg-green-500" />
              </div>
            </motion.section>

            {/* 最近动态 */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Zap size={16} className="text-[var(--accent-color)]" />
                  <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">最近动态</h2>
                </div>
                <Link href="/logs" className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-colors flex items-center gap-1 uppercase tracking-wider">
                  查看全部 <ArrowRight size={12} />
                </Link>
              </div>

              {logsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-[var(--bg-card)] rounded-xl p-4 animate-pulse">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-full" />
                        <div className="flex-1">
                          <div className="h-3 bg-[var(--bg-tertiary)] rounded w-1/4 mb-2" />
                          <div className="h-3 bg-[var(--bg-tertiary)] rounded w-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : latestLogs.length === 0 ? (
                <div className="text-center py-12 text-[var(--text-muted)] bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)]">
                  <Zap size={32} className="mx-auto mb-4 opacity-50" />
                  <p className="text-sm">暂无动态</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {latestLogs.map((log, index) => {
                    // 提取纯文本（去除图片 markdown）
                    const textContent = log.content.replace(/!\[.*?\]\(.*?\)/g, '').trim();
                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-color)] hover:shadow-lg hover:border-[var(--accent-color)]/30 transition-all group"
                      >
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] overflow-hidden flex-shrink-0">
                            <img 
                              src={log.profiles?.avatar_url || '/default-avatar.png'} 
                              alt="" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-sm text-[var(--text-primary)]">
                                {log.profiles?.username || '我'}
                              </span>
                              <span className="text-[10px] text-[var(--text-muted)]">
                                {formatDistanceToNow(new Date(log.created_at), { locale: zhCN, addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                              {textContent.slice(0, 100)}{textContent.length > 100 ? '...' : ''}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-[10px] text-[var(--text-muted)]">
                              <span className="flex items-center gap-1">
                                <Heart size={10} /> {log.likes || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.section>
          </div>

        </div>
      </main>
    </div>
  );
}
