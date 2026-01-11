'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { 
  ArrowRight, ArrowDown, Mail, Code2, Cpu, Terminal, Sparkles, Music, 
  Clock, Eye, Heart, FileText, MessageSquare, TrendingUp, Zap,
  Rocket, Star, Globe, Layers, ChevronRight, Play, Pause,
  BookOpen, Users, Award, Coffee
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { getAnimeCover } from '@/lib/constants';
import type { Post } from '@/types';

// 伪随机数生成器
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

// 类型定义
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

// ============ 组件 ============

// 渐变文字组件
const GradientText = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <span className={`bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent ${className}`}>
    {children}
  </span>
);

// 浮动卡片组件
const FloatingCard = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={className}
  >
    {children}
  </motion.div>
);

// 特性卡片
const FeatureCard = ({ icon: Icon, title, description, color, delay = 0 }: { 
  icon: any; title: string; description: string; color: string; delay?: number 
}) => (
  <FloatingCard delay={delay}>
    <div className="group relative p-8 bg-[var(--bg-card)]/80 backdrop-blur-xl rounded-3xl border border-[var(--border-color)] hover:border-[var(--accent-color)]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 overflow-hidden">
      {/* 背景光效 */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 ${color} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
      
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={24} className="text-white" />
      </div>
      <h3 className="text-xl font-black text-[var(--text-primary)] mb-3">{title}</h3>
      <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{description}</p>
    </div>
  </FloatingCard>
);

// 统计数字动画
const AnimatedNumber = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{displayValue.toLocaleString()}{suffix}</span>;
};

// 技术栈徽章
const TechBadge = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <motion.div 
    whileHover={{ scale: 1.05, y: -2 }}
    className="flex items-center gap-2 bg-[var(--bg-card)]/80 backdrop-blur-sm px-4 py-2 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] text-xs font-bold shadow-lg hover:shadow-xl hover:border-[var(--accent-color)]/30 transition-all cursor-default"
  >
    <Icon size={14} className="text-[var(--accent-color)]" />
    {label}
  </motion.div>
);

// 文章卡片
const PostCard = ({ post, index }: { post: Post; index: number }) => (
  <FloatingCard delay={index * 0.1}>
    <Link href={`/post/${post.id}`} className="block group">
      <div className="relative bg-[var(--bg-card)]/80 backdrop-blur-xl rounded-3xl border border-[var(--border-color)] overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 hover:border-[var(--accent-color)]/30 transition-all duration-500">
        {/* 封面 */}
        <div className="aspect-[16/10] overflow-hidden relative">
          <img 
            src={post.cover_url || getAnimeCover(post.id)} 
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* 标签 */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            {post.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] font-bold text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full uppercase tracking-wider">
                {tag}
              </span>
            ))}
          </div>
          
          {/* 悬浮阅读按钮 */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="px-6 py-3 bg-white/90 backdrop-blur-md rounded-full text-slate-900 text-sm font-bold flex items-center gap-2 shadow-xl">
              <BookOpen size={16} /> 阅读文章
            </div>
          </div>
        </div>
        
        {/* 内容 */}
        <div className="p-6">
          <h3 className="font-black text-lg text-[var(--text-primary)] mb-3 line-clamp-2 group-hover:text-[var(--accent-color)] transition-colors leading-tight">
            {post.title}
          </h3>
          <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-4 leading-relaxed">
            {post.content.slice(0, 100)}...
          </p>
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-mono">{format(new Date(post.created_at), 'yyyy/MM/dd')}</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Eye size={12} /> {post.views || 0}
              </span>
              <span className="flex items-center gap-1.5">
                <Heart size={12} className={(post.likes || 0) > 0 ? 'fill-pink-500 text-pink-500' : ''} /> {post.likes || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  </FloatingCard>
);


// ============ 主页面组件 ============
export default function HomePage() {
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [latestLogs, setLatestLogs] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [stats, setStats] = useState<SiteStats>({ totalPosts: 0, totalViews: 0, totalLikes: 0, totalComments: 0 });
  const [nowPlaying, setNowPlaying] = useState<NowPlayingSong | null>(null);
  const [musicLoading, setMusicLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  // 数据获取
  useEffect(() => {
    async function fetchLatestPosts() {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('type', 'article')
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (!error && data) setLatestPosts(data);
      setPostsLoading(false);
    }
    fetchLatestPosts();
  }, []);

  useEffect(() => {
    async function fetchLatestLogs() {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles:user_id ( avatar_url, username )')
        .eq('type', 'moment')
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (!error && data) setLatestLogs(data as any);
      setLogsLoading(false);
    }
    fetchLatestLogs();
  }, []);

  useEffect(() => {
    async function fetchStats() {
      const { data: posts } = await supabase.from('posts').select('views, likes');
      const { count: commentsCount } = await supabase.from('comments').select('*', { count: 'exact', head: true });
      
      if (posts) {
        const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
        const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
        setStats({ totalPosts: posts.length, totalViews, totalLikes, totalComments: commentsCount || 0 });
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    async function fetchNowPlaying() {
      try {
        const res = await fetch('/api/netease');
        const data = await res.json();
        if (data.success && data.data) setNowPlaying(data.data);
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

      {/* ============ 动态星空背景 ============ */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-primary)] to-[var(--bg-secondary)]" />
        
        {/* 星云光晕 */}
        <motion.div
          animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[5%] left-[10%] w-[50%] h-[50%] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <motion.div
          animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute bottom-[10%] right-[5%] w-[45%] h-[45%] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)', filter: 'blur(50px)' }}
        />
        <motion.div
          animate={{ opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[30%] right-[20%] w-[30%] h-[30%] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />
        
        {/* 星星 */}
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2 + seededRandom(i * 100) * 4, repeat: Infinity, ease: "easeInOut", delay: seededRandom(i * 100 + 1) * 5 }}
            className="absolute rounded-full bg-white"
            style={{
              left: `${seededRandom(i * 100 + 2) * 100}%`,
              top: `${seededRandom(i * 100 + 3) * 100}%`,
              width: `${1 + seededRandom(i * 100 + 4) * 2}px`,
              height: `${1 + seededRandom(i * 100 + 4) * 2}px`,
              boxShadow: `0 0 ${4 + seededRandom(i * 100 + 5) * 6}px rgba(255,255,255,0.5)`,
            }}
          />
        ))}
        
        {/* 流星 */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`meteor-${i}`}
            animate={{ x: [0, 400], y: [0, 250], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 8 + i * 10, repeatDelay: 15 + i * 5 }}
            className="absolute"
            style={{
              left: `${15 + i * 20}%`,
              top: `${5 + i * 10}%`,
              width: '150px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, white, transparent)',
              transform: 'rotate(35deg)',
              filter: 'blur(1px)',
            }}
          />
        ))}
        
        {/* 底部渐变 */}
        <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
      </div>

      {/* ============ 主内容区 ============ */}
      <main className="relative z-10 w-full lg:ml-72 transition-all duration-300">
        
        {/* ============ Hero Section ============ */}
        <section ref={heroRef} className="min-h-screen flex items-center justify-center px-6 lg:px-12 relative">
          <motion.div 
            style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
            className="max-w-5xl mx-auto text-center"
          >
            {/* 状态标签 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 mb-8"
            >
              <span className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-sm font-bold text-[var(--text-primary)] backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block mr-2 animate-pulse" />
                系统在线 · 欢迎访问
              </span>
            </motion.div>
            
            {/* 主标题 */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter mb-8 leading-[1.1]"
            >
              <span className="text-[var(--text-primary)]">你好，我是</span>
              <br />
              <GradientText className="text-6xl sm:text-7xl lg:text-9xl">Milk</GradientText>
            </motion.h1>
            
            {/* 副标题 */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-lg lg:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              欢迎来到 <span className="text-[var(--accent-color)] font-bold">SOYMILK</span>，
              这里是现实与虚拟的交汇点。我用代码编织逻辑，用像素记录生活，探索未知的边界，构建数字的诗篇。
            </motion.p>
            
            {/* CTA 按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap justify-center gap-4 mb-16"
            >
              <Link href="/posts">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl text-sm font-bold uppercase tracking-widest shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center gap-3 group"
                >
                  <Rocket size={18} />
                  开始探索
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <Link href="/about">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-[var(--bg-card)]/80 backdrop-blur-xl text-[var(--text-primary)] border border-[var(--border-color)] rounded-2xl text-sm font-bold uppercase tracking-widest hover:border-[var(--accent-color)]/50 transition-all flex items-center gap-3"
                >
                  <Users size={18} />
                  了解更多
                </motion.button>
              </Link>
            </motion.div>
            
            {/* 技术栈 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex flex-wrap justify-center gap-3"
            >
              <TechBadge icon={Code2} label="Next.js 16" />
              <TechBadge icon={Terminal} label="TypeScript" />
              <TechBadge icon={Cpu} label="Supabase" />
              <TechBadge icon={Sparkles} label="Tailwind CSS" />
              <TechBadge icon={Layers} label="Framer Motion" />
            </motion.div>
          </motion.div>
          
          {/* 向下滚动提示 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2 text-[var(--text-muted)]"
            >
              <span className="text-[10px] uppercase tracking-widest">向下滚动</span>
              <ArrowDown size={20} />
            </motion.div>
          </motion.div>
        </section>


        {/* ============ 统计数据区 ============ */}
        <section className="py-24 px-6 lg:px-12 relative">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: FileText, label: '文章数', value: stats.totalPosts, color: 'from-purple-500 to-indigo-500' },
                { icon: Eye, label: '总浏览', value: stats.totalViews, color: 'from-blue-500 to-cyan-500' },
                { icon: Heart, label: '总点赞', value: stats.totalLikes, color: 'from-pink-500 to-rose-500' },
                { icon: MessageSquare, label: '总评论', value: stats.totalComments, color: 'from-green-500 to-emerald-500' },
              ].map((stat, i) => (
                <FloatingCard key={stat.label} delay={i * 0.1}>
                  <div className="relative p-8 bg-[var(--bg-card)]/80 backdrop-blur-xl rounded-3xl border border-[var(--border-color)] text-center group hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                      <stat.icon size={24} className="text-white" />
                    </div>
                    <p className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-2">
                      <AnimatedNumber value={stat.value} />
                    </p>
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold">{stat.label}</p>
                  </div>
                </FloatingCard>
              ))}
            </div>
          </div>
        </section>

        {/* ============ 特性展示区 ============ */}
        <section className="py-24 px-6 lg:px-12 relative">
          <div className="max-w-6xl mx-auto">
            <FloatingCard>
              <div className="text-center mb-16">
                <span className="inline-block px-4 py-2 rounded-full bg-purple-500/10 text-purple-500 text-xs font-bold uppercase tracking-widest mb-4">
                  Features
                </span>
                <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-4">
                  探索 <GradientText>SOYMILK</GradientText>
                </h2>
                <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
                  一个融合了技术与艺术的数字空间，记录思考、分享创作
                </p>
              </div>
            </FloatingCard>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard 
                icon={BookOpen} 
                title="技术博客" 
                description="深入浅出的技术文章，分享开发经验与最佳实践，涵盖前端、后端、DevOps 等领域。"
                color="bg-gradient-to-br from-purple-500 to-indigo-500"
                delay={0.1}
              />
              <FeatureCard 
                icon={Zap} 
                title="生活动态" 
                description="记录日常点滴，分享生活感悟，用文字和图片捕捉每一个值得纪念的瞬间。"
                color="bg-gradient-to-br from-pink-500 to-rose-500"
                delay={0.2}
              />
              <FeatureCard 
                icon={Music} 
                title="音乐空间" 
                description="分享喜欢的音乐，记录听歌心情，让旋律成为连接彼此的桥梁。"
                color="bg-gradient-to-br from-cyan-500 to-blue-500"
                delay={0.3}
              />
              <FeatureCard 
                icon={MessageSquare} 
                title="互动社区" 
                description="开放的评论系统，支持实时讨论，让每一篇文章都能引发思想的碰撞。"
                color="bg-gradient-to-br from-green-500 to-emerald-500"
                delay={0.4}
              />
              <FeatureCard 
                icon={Star} 
                title="收藏系统" 
                description="一键收藏喜欢的文章，建立个人阅读清单，随时回顾精彩内容。"
                color="bg-gradient-to-br from-amber-500 to-orange-500"
                delay={0.5}
              />
              <FeatureCard 
                icon={Globe} 
                title="开放分享" 
                description="支持多平台分享，RSS 订阅，让优质内容触达更多读者。"
                color="bg-gradient-to-br from-violet-500 to-purple-500"
                delay={0.6}
              />
            </div>
          </div>
        </section>

        {/* ============ 正在播放 ============ */}
        <section className="py-12 px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <FloatingCard>
              <div className="relative p-8 lg:p-12 bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden group">
                {/* 背景装饰 */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-cyan-500/10" />
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[var(--accent-color)]/20 rounded-full blur-3xl group-hover:bg-[var(--accent-color)]/30 transition-colors duration-500" />
                <div className="absolute -left-20 -top-20 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl" />
                
                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
                  {/* 专辑封面 */}
                  <div className="relative">
                    <motion.div
                      animate={isPlaying ? { rotate: 360 } : {}}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-[var(--border-color)] shadow-2xl"
                    >
                      {musicLoading ? (
                        <div className="w-full h-full bg-[var(--bg-tertiary)] animate-pulse" />
                      ) : nowPlaying?.albumCover ? (
                        <img src={nowPlaying.albumCover} alt={nowPlaying.album} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Music size={48} className="text-white" />
                        </div>
                      )}
                    </motion.div>
                    {/* 播放按钮 */}
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="absolute -bottom-2 -right-2 w-12 h-12 bg-[var(--accent-color)] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                    </button>
                  </div>
                  
                  {/* 歌曲信息 */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                      <span className="text-xs font-bold text-[var(--accent-color)] uppercase tracking-widest">正在播放</span>
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    </div>
                    {musicLoading ? (
                      <>
                        <div className="h-8 w-48 bg-[var(--bg-tertiary)] rounded-lg animate-pulse mb-3 mx-auto lg:mx-0" />
                        <div className="h-4 w-32 bg-[var(--bg-tertiary)] rounded animate-pulse mx-auto lg:mx-0" />
                      </>
                    ) : nowPlaying ? (
                      <>
                        <h3 className="text-2xl lg:text-3xl font-black text-[var(--text-primary)] mb-2 line-clamp-1">
                          {nowPlaying.name}
                        </h3>
                        <p className="text-[var(--text-secondary)] font-medium">{nowPlaying.artist}</p>
                        <p className="text-sm text-[var(--text-muted)] mt-1">{nowPlaying.album}</p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-2xl lg:text-3xl font-black text-[var(--text-primary)] mb-2">暂无播放</h3>
                        <p className="text-[var(--text-secondary)]">网易云音乐</p>
                      </>
                    )}
                  </div>
                  
                  {/* 音频波形 */}
                  <div className="flex gap-1.5 h-16 items-end">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={isPlaying ? { height: [12, 48, 12] } : { height: 12 }}
                        transition={{ duration: 0.5 + seededRandom(i * 500) * 0.5, repeat: Infinity, delay: i * 0.1 }}
                        className="w-2 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </FloatingCard>
          </div>
        </section>


        {/* ============ 最新文章区 ============ */}
        <section className="py-24 px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <FloatingCard>
              <div className="flex items-center justify-between mb-12">
                <div>
                  <span className="inline-block px-4 py-2 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold uppercase tracking-widest mb-4">
                    Latest Posts
                  </span>
                  <h2 className="text-3xl lg:text-4xl font-black text-[var(--text-primary)]">
                    最新文章
                  </h2>
                </div>
                <Link href="/posts" className="hidden sm:flex items-center gap-2 px-6 py-3 bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border-color)] rounded-2xl text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)]/50 transition-all group">
                  查看全部
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </FloatingCard>
            
            {postsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-[var(--bg-card)]/80 rounded-3xl p-6 animate-pulse">
                    <div className="aspect-[16/10] bg-[var(--bg-tertiary)] rounded-2xl mb-6" />
                    <div className="h-6 bg-[var(--bg-tertiary)] rounded-lg w-3/4 mb-4" />
                    <div className="h-4 bg-[var(--bg-tertiary)] rounded w-full mb-2" />
                    <div className="h-4 bg-[var(--bg-tertiary)] rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : latestPosts.length === 0 ? (
              <FloatingCard>
                <div className="text-center py-20 bg-[var(--bg-card)]/80 backdrop-blur-xl rounded-3xl border border-[var(--border-color)]">
                  <Terminal size={48} className="mx-auto mb-6 text-[var(--text-muted)] opacity-50" />
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">暂无文章</h3>
                  <p className="text-[var(--text-muted)]">快去写点什么吧~</p>
                </div>
              </FloatingCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestPosts.slice(0, 6).map((post, index) => (
                  <PostCard key={post.id} post={post} index={index} />
                ))}
              </div>
            )}
            
            <Link href="/posts" className="sm:hidden flex items-center justify-center gap-2 mt-8 px-6 py-4 bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border-color)] rounded-2xl text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors">
              查看全部文章
              <ChevronRight size={16} />
            </Link>
          </div>
        </section>

        {/* ============ 最近动态区 ============ */}
        <section className="py-24 px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <FloatingCard>
              <div className="flex items-center justify-between mb-12">
                <div>
                  <span className="inline-block px-4 py-2 rounded-full bg-pink-500/10 text-pink-500 text-xs font-bold uppercase tracking-widest mb-4">
                    Recent Logs
                  </span>
                  <h2 className="text-3xl lg:text-4xl font-black text-[var(--text-primary)]">
                    最近动态
                  </h2>
                </div>
                <Link href="/logs" className="hidden sm:flex items-center gap-2 px-6 py-3 bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border-color)] rounded-2xl text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)]/50 transition-all group">
                  查看全部
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </FloatingCard>
            
            {logsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-[var(--bg-card)]/80 rounded-3xl p-6 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-[var(--bg-tertiary)] rounded-full" />
                      <div className="flex-1">
                        <div className="h-4 bg-[var(--bg-tertiary)] rounded w-1/4 mb-3" />
                        <div className="h-4 bg-[var(--bg-tertiary)] rounded w-full mb-2" />
                        <div className="h-4 bg-[var(--bg-tertiary)] rounded w-3/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : latestLogs.length === 0 ? (
              <FloatingCard>
                <div className="text-center py-20 bg-[var(--bg-card)]/80 backdrop-blur-xl rounded-3xl border border-[var(--border-color)]">
                  <Zap size={48} className="mx-auto mb-6 text-[var(--text-muted)] opacity-50" />
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">暂无动态</h3>
                  <p className="text-[var(--text-muted)]">去发布第一条动态吧~</p>
                </div>
              </FloatingCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {latestLogs.map((log, index) => {
                  const textContent = log.content.replace(/!\[.*?\]\(.*?\)/g, '').trim();
                  return (
                    <FloatingCard key={log.id} delay={index * 0.1}>
                      <div className="p-6 bg-[var(--bg-card)]/80 backdrop-blur-xl rounded-3xl border border-[var(--border-color)] hover:shadow-2xl hover:shadow-purple-500/10 hover:border-[var(--accent-color)]/30 transition-all duration-500 group">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[var(--border-color)] group-hover:ring-[var(--accent-color)]/50 transition-all">
                            <img 
                              src={log.profiles?.avatar_url || '/default-avatar.png'} 
                              alt="" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-[var(--text-primary)]">
                                {log.profiles?.username || '我'}
                              </span>
                              <span className="text-xs text-[var(--text-muted)]">
                                {formatDistanceToNow(new Date(log.created_at), { locale: zhCN, addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-[var(--text-secondary)] leading-relaxed line-clamp-3 mb-4">
                              {textContent.slice(0, 150)}{textContent.length > 150 ? '...' : ''}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                              <span className="flex items-center gap-1.5">
                                <Heart size={14} className={(log.likes || 0) > 0 ? 'fill-pink-500 text-pink-500' : ''} />
                                {log.likes || 0}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <MessageSquare size={14} />
                                评论
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </FloatingCard>
                  );
                })}
              </div>
            )}
            
            <Link href="/logs" className="sm:hidden flex items-center justify-center gap-2 mt-8 px-6 py-4 bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border-color)] rounded-2xl text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors">
              查看全部动态
              <ChevronRight size={16} />
            </Link>
          </div>
        </section>

        {/* ============ 关于我 CTA ============ */}
        <section className="py-24 px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <FloatingCard>
              <div className="relative p-12 lg:p-16 bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 rounded-[3rem] overflow-hidden text-center">
                {/* 背景装饰 */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')] opacity-10" />
                <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                
                <div className="relative z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-24 h-24 mx-auto mb-8 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center"
                  >
                    <Coffee size={40} className="text-white" />
                  </motion.div>
                  
                  <h2 className="text-3xl lg:text-5xl font-black text-white mb-6">
                    想了解更多？
                  </h2>
                  <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                    欢迎来到我的数字空间，这里有我的故事、我的代码、我的生活。让我们一起探索这个充满可能的世界。
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/about">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-white text-purple-600 rounded-2xl text-sm font-bold uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
                      >
                        <Award size={18} />
                        关于我
                      </motion.button>
                    </Link>
                    <a href="mailto:contact@soymilk.dev">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-white/20 backdrop-blur-xl text-white border border-white/30 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-white/30 transition-all flex items-center gap-2"
                      >
                        <Mail size={18} />
                        联系我
                      </motion.button>
                    </a>
                  </div>
                </div>
              </div>
            </FloatingCard>
          </div>
        </section>

        {/* ============ Footer ============ */}
        <footer className="py-16 px-6 lg:px-12 border-t border-[var(--border-color)]">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-8">
              <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2">SOYMILK</h3>
              <p className="text-sm text-[var(--text-muted)]">用代码编织逻辑，用像素记录生活</p>
            </div>
            
            <div className="flex justify-center gap-4 mb-8">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-color)]/50 transition-all">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-color)]/50 transition-all">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <Link href="/feed.xml" className="w-12 h-12 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-color)]/50 transition-all">
                <Globe size={20} />
              </Link>
            </div>
            
            <p className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-widest">
              © {new Date().getFullYear()} SOYMILK · Built with Next.js & Supabase
            </p>
          </div>
        </footer>

      </main>
    </div>
  );
}
