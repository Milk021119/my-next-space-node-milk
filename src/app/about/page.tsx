"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Code2, Cpu } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

export default function AboutPage() {
  return (
    <PageLayout centered={true} showBackground={true}>
      {/* 关于卡片 */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-[var(--bg-card)] backdrop-blur-xl rounded-[3rem] p-10 md:p-14 border border-[var(--border-color)] shadow-2xl text-center relative z-10"
      >
        {/* 头像 */}
        <div className="w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden border-4 border-[var(--bg-secondary)] shadow-xl bg-[var(--bg-tertiary)] relative group">
           <Image 
              src="https://api.dicebear.com/7.x/adventurer/svg?seed=milk" 
              alt="avatar" 
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110" 
           />
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-3 tracking-tight">
          SOYMILK
        </h1>
        <p className="text-purple-500 font-bold tracking-[0.2em] text-xs uppercase mb-10 flex items-center justify-center gap-2">
           <Code2 size={14}/> Digital Creator / Developer
        </p>

        <div className="prose prose-slate dark:prose-invert mx-auto mb-12 text-[var(--text-secondary)] leading-relaxed">
          <p>
            Hi! 这里是 SOYMILK(sks) 的数字驻地。我是一名热爱二次元、设计与代码的开发者。
          </p>
          <p>
            这个网站是大家的聚集地
          </p>
        </div>
        
        {/* 技术栈徽章 */}
        <div className="flex flex-wrap justify-center gap-3 mb-10 opacity-70">
            {['Next.js 16', 'TypeScript', 'Tailwind', 'Supabase', 'Motion'].map(tech => (
                <span key={tech} className="px-3 py-1 bg-[var(--bg-tertiary)] text-[var(--text-muted)] rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {tech}
                </span>
            ))}
        </div>

        {/* 社交链接 */}
        <div className="flex justify-center gap-6">
          <Link href="https://github.com" target="_blank">
            <motion.button 
              whileHover={{ y: -5 }}
              className="p-4 bg-[var(--bg-secondary)] rounded-2xl text-[var(--text-muted)] hover:text-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all shadow-sm border border-[var(--border-color)]"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </motion.button>
          </Link>
          <Link href="https://twitter.com" target="_blank">
            <motion.button 
              whileHover={{ y: -5 }}
              className="p-4 bg-[var(--bg-secondary)] rounded-2xl text-[var(--text-muted)] hover:text-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all shadow-sm border border-[var(--border-color)]"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </motion.button>
          </Link>
          <Link href="mailto:hi@example.com" target="_blank">
            <motion.button 
              whileHover={{ y: -5 }}
              className="p-4 bg-[var(--bg-secondary)] rounded-2xl text-[var(--text-muted)] hover:text-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all shadow-sm border border-[var(--border-color)]"
            >
              <Mail size={20} />
            </motion.button>
          </Link>
        </div>
        
        <div className="mt-12 pt-8 border-t border-[var(--border-color)]">
           <p className="text-[10px] text-[var(--text-muted)] font-mono flex items-center justify-center gap-2">
              <Cpu size={12}/> SYSTEM ONLINE • VER 3.0.1
           </p>
        </div>

      </motion.div>
    </PageLayout>
  );
}
