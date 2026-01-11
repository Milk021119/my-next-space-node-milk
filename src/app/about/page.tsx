"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Code2, Cpu, Github, Twitter, Sparkles, Heart, Coffee } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

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
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ y: [0, -30, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-[10%] w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-[10%] w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl"
        />
      </div>

      {/* 关于卡片 */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-2xl w-full bg-[var(--bg-card)] backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-[var(--border-color)] shadow-2xl shadow-purple-500/5 text-center relative z-10 overflow-hidden"
      >
        {/* 卡片内装饰 */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        {/* 头像 */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative mx-auto mb-8"
        >
          <div className="w-36 h-36 mx-auto rounded-3xl overflow-hidden border-4 border-white dark:border-slate-700 shadow-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-1 rotate-3 hover:rotate-0 transition-transform duration-500 group">
            <div className="w-full h-full rounded-[20px] overflow-hidden bg-[var(--bg-tertiary)]">
              <Image 
                src="https://api.dicebear.com/7.x/adventurer/svg?seed=milk" 
                alt="avatar" 
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110" 
              />
            </div>
          </div>
          {/* 在线状态 */}
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-[var(--bg-card)] flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
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
        
        {/* 技术栈徽章 */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {techStack.map((tech, index) => (
            <motion.span 
              key={tech.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className={`px-4 py-2 bg-gradient-to-r ${tech.color} text-white rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-lg`}
            >
              {tech.name}
            </motion.span>
          ))}
        </motion.div>

        {/* 社交链接 */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center gap-4"
        >
          <Link href="https://github.com" target="_blank">
            <motion.button 
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-[var(--bg-secondary)] rounded-2xl text-[var(--text-muted)] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-lg border border-[var(--border-color)] hover:border-slate-300 dark:hover:border-slate-600"
            >
              <Github size={22} />
            </motion.button>
          </Link>
          <Link href="https://twitter.com" target="_blank">
            <motion.button 
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-[var(--bg-secondary)] rounded-2xl text-[var(--text-muted)] hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-lg border border-[var(--border-color)] hover:border-blue-200 dark:hover:border-blue-800"
            >
              <Twitter size={22} />
            </motion.button>
          </Link>
          <Link href="mailto:hi@example.com" target="_blank">
            <motion.button 
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-[var(--bg-secondary)] rounded-2xl text-[var(--text-muted)] hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all shadow-lg border border-[var(--border-color)] hover:border-purple-200 dark:hover:border-purple-800"
            >
              <Mail size={22} />
            </motion.button>
          </Link>
          <motion.button 
            whileHover={{ y: -5, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 bg-[var(--bg-secondary)] rounded-2xl text-[var(--text-muted)] hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all shadow-lg border border-[var(--border-color)] hover:border-amber-200 dark:hover:border-amber-800"
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
