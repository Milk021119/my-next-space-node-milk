"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image'; // ✨ 引入 Image 组件
import { ArrowLeft, Github, Twitter, Mail, Code2, Cpu, Globe } from 'lucide-react';
import Sidebar from '@/components/Sidebar'; // ✨ 引入侧边栏

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans flex">
      {/* 1. 侧边栏 */}
      <Sidebar />

      {/* 2. 主内容区 (留出侧边栏位置) */}
      <main className="flex-1 lg:ml-72 2xl:ml-80 transition-all duration-300 min-h-screen relative overflow-hidden flex items-center justify-center p-6">
        
        {/* 背景特效 (与首页保持一致) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <motion.div 
             animate={{ x: [0, 50, 0], y: [0, 30, 0] }} 
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }} 
             className="absolute top-0 left-0 w-[60%] h-[60%] bg-cyan-100/40 rounded-full blur-[120px]" 
          />
          <motion.div 
             animate={{ x: [0, -50, 0], y: [0, -30, 0] }} 
             transition={{ duration: 15, repeat: Infinity, ease: "linear" }} 
             className="absolute bottom-0 right-0 w-[60%] h-[60%] bg-pink-100/40 rounded-full blur-[120px]" 
          />
        </div>

        {/* 关于卡片 */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full bg-white/70 backdrop-blur-xl rounded-[3rem] p-10 md:p-14 border border-white/60 shadow-2xl text-center relative z-10"
        >
          {/* 移动端返回按钮 (桌面端有侧边栏，其实可以不需要这个箭头，保留着也没事) */}
          <Link href="/" className="lg:hidden absolute top-6 left-6 p-3 bg-white/80 rounded-full hover:scale-110 transition-transform shadow-sm text-slate-600">
            <ArrowLeft size={20} />
          </Link>

          {/* 头像 */}
          <div className="w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100 relative group">
             <Image 
                src="https://api.dicebear.com/7.x/adventurer/svg?seed=milk" 
                alt="avatar" 
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110" 
             />
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3 tracking-tight">
            SOYMILK
          </h1>
          <p className="text-purple-500 font-bold tracking-[0.2em] text-xs uppercase mb-10 flex items-center justify-center gap-2">
             <Code2 size={14}/> Digital Creator / Developer
          </p>

          <div className="prose prose-slate mx-auto mb-12 text-slate-600 leading-relaxed">
            <p>
              Hi! 这里是 SOYMILK(sks) 的数字驻地。我是一名热爱二次元、设计与代码的开发者。
            </p>
            <p>
              这个网站是大家的聚集地
            </p>
          </div>
          
          {/* 技术栈徽章 */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 opacity-70">
              {['Next.js 14', 'TypeScript', 'Tailwind', 'Supabase', 'Motion'].map(tech => (
                  <span key={tech} className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {tech}
                  </span>
              ))}
          </div>

          {/* 社交链接 */}
          <div className="flex justify-center gap-6">
            {[
                { icon: Github, href: "https://github.com", label: "Github" },
                { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
                { icon: Mail, href: "mailto:hi@example.com", label: "Email" }
            ].map((item, i) => (
              <Link href={item.href} key={i} target="_blank">
                  <motion.button 
                    whileHover={{ y: -5 }}
                    className="p-4 bg-white rounded-2xl text-slate-400 hover:text-purple-600 hover:shadow-lg hover:shadow-purple-100 transition-all shadow-sm border border-slate-50"
                  >
                    <item.icon size={20} />
                  </motion.button>
              </Link>
            ))}
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-100/50">
             <p className="text-[10px] text-slate-300 font-mono flex items-center justify-center gap-2">
                <Cpu size={12}/> SYSTEM ONLINE • VER 3.0.1
             </p>
          </div>

        </motion.div>
      </main>
    </div>
  );
}
