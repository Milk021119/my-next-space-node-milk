"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Code2, Cpu, Sparkles, Heart, Coffee, ExternalLink } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

// 自定义 GitHub 图标
const GitHubIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

// 自定义 X (Twitter) 图标
const XIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export default function AboutPage() {
  const techStack = [
    { name: 'Next.js 16', color: 'from-slate-600 to-slate-800' },
    { name: 'TypeScript', color: 'from-blue-500 to-blue-700' },
    { name: 'Tailwind', color: 'from-cyan-500 to-cyan-700' },
    { name: 'Supabase', color: 'from-emerald-500 to-emerald-700' },
    { name: 'Motion', color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <PageLayout centered={true} showBackground={true}>
      {/* 背景装饰 - 增强版 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* 主光晕 */}
        <motion.div 
          animate={{ y: [0, -30, 0], rotate: [0, 5, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-[10%] w-72 h-72 bg-purple-500/15 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-[10%] w-96 h-96 bg-pink-500/15 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/8 rounded-full blur-3xl"
        />
        
        {/* 星星装饰 */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              boxShadow: '0 0 6px rgba(255,255,255,0.5)'
            }}
          />
        ))}
      </div>

      {/* 关于卡片 - 增强版 */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-2xl w-full bg-[var(--bg-card)] backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-[var(--border-color)] shadow-2xl shadow-purple-500/10 text-center relative z-10 overflow-hidden hover:shadow-purple-500/20 transition-shadow duration-500"
      >
        {/* 卡片内装饰 - 增强 */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-500/15 to-pink-500/15 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-cyan-500/15 to-blue-500/15 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-[2.5rem]" />
        
        {/* 头像 - 增强版 */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative mx-auto mb-8"
        >
          <motion.div
            whileHover={{ rotate: 0, scale: 1.05 }}
            className="w-36 h-36 mx-auto rounded-3xl overflow-hidden border-4 border-white dark:border-slate-700 shadow-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-1 rotate-3 transition-all duration-500 group cursor-pointer"
          >
            <div className="w-full h-full rounded-[20px] overflow-hidden bg-[var(--bg-tertiary)]">
              <Image 
                src="https://api.dicebear.com/7.x/adventurer/svg?seed=milk" 
                alt="avatar" 
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110" 
              />
            </div>
          </motion.div>
          {/* 在线状态 - 增强 */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="absolute -bottom-1 -right-1 w-9 h-9 bg-green-500 rounded-full border-4 border-[var(--bg-card)] flex items-center justify-center shadow-lg shadow-green-500/30"
          >
            <span className="text-white text-sm font-bold">✓</span>
          </motion.div>
          {/* 发光环 */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 blur-xl opacity-30 -z-10 scale-110" />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-3 tracking-tight"
        >
          SOYMILK
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-[var(--accent-color)] font-bold tracking-[0.15em] text-xs uppercase mb-8 flex items-center justify-center gap-2"
        >
          <Code2 size={14}/> Digital Creator / Developer
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-10 space-y-4 text-[var(--text-secondary)] leading-relaxed"
        >
          <p className="flex items-center justify-center gap-2">
            <Sparkles size={16} className="text-yellow-500" />
            Hi! 这里是 SOYMILK(sks) 的数字驻地
          </p>
          <p>
            我是一名热爱二次元、设计与代码的开发者
          </p>
          <p className="flex items-center justify-center gap-2">
            <Heart size={16} className="text-pink-500" />
            这个网站是大家的聚集地
          </p>
        </motion.div>
        
        {/* 技术栈徽章 - 增强版 */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-2.5 mb-10"
        >
          {techStack.map((tech, index) => (
            <motion.span 
              key={tech.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.08, y: -3 }}
              className={`px-4 py-2.5 bg-gradient-to-r ${tech.color} text-white rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-lg cursor-pointer transition-shadow hover:shadow-xl`}
            >
              {tech.name}
            </motion.span>
          ))}
        </motion.div>

        {/* 社交链接 - 增强版 */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center gap-4"
        >
          <Link href="https://github.com" target="_blank">
            <motion.button 
              whileHover={{ y: -6, scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-[var(--bg-secondary)] rounded-2xl text-[var(--text-muted)] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-lg border border-[var(--border-color)] hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xl cursor-pointer"
            >
              <GitHubIcon size={22} />
            </motion.button>
          </Link>
          <Link href="https://twitter.com" target="_blank">
            <motion.button 
              whileHover={{ y: -6, scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-[var(--bg-secondary)] rounded-2xl text-[var(--text-muted)] hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-lg border border-[var(--border-color)] hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer"
            >
              <XIcon size={22} />
            </motion.button>
          </Link>
          <Link href="mailto:hi@example.com" target="_blank">
            <motion.button 
              whileHover={{ y: -6, scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-[var(--bg-secondary)] rounded-2xl text-[var(--text-muted)] hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all shadow-lg border border-[var(--border-color)] hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer"
            >
              <Mail size={22} />
            </motion.button>
          </Link>
          <motion.button 
            whileHover={{ y: -6, scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 bg-[var(--bg-secondary)] rounded-2xl text-[var(--text-muted)] hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all shadow-lg border border-[var(--border-color)] hover:border-amber-200 dark:hover:border-amber-800 hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer"
            title="请我喝杯咖啡"
          >
            <Coffee size={22} />
          </motion.button>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 pt-8 border-t border-[var(--border-color)]"
        >
          <p className="text-[10px] text-[var(--text-muted)] font-mono flex items-center justify-center gap-2">
            <Cpu size={12}/> 
            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">ONLINE</span>
            SYSTEM VER 3.0.1
          </p>
        </motion.div>

      </motion.div>
    </PageLayout>
  );
}
