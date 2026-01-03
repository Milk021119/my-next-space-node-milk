"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Github, Twitter, Mail } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* 你的专属背景 (复制过来的) */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <motion.div animate={{ x: [0, 50, 0], y: [0, 30, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-cyan-100/40 rounded-full blur-[120px]" />
        <motion.div animate={{ x: [0, -50, 0], y: [0, -30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-pink-100/40 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white/60 backdrop-blur-xl rounded-[3rem] p-12 border border-white shadow-2xl text-center"
      >
        {/* 返回按钮 */}
        <Link href="/" className="absolute top-8 left-8 p-3 bg-white rounded-full hover:scale-110 transition-transform shadow-sm text-slate-600">
          <ArrowLeft size={20} />
        </Link>

        {/* 头像 */}
        <div className="w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden border-4 border-white shadow-lg">
           <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=milk" alt="avatar" className="w-full h-full object-cover" />
        </div>

        <h1 className="text-4xl font-black text-slate-800 mb-2">SOYMILK</h1>
        <p className="text-purple-500 font-bold tracking-widest text-xs uppercase mb-8">Digital Creator / Developer</p>

        <div className="prose prose-slate mx-auto mb-10 text-slate-600">
          <p>
            Hi! 这里是 SOYMILK 的数字驻地。我是一名热爱二次元和代码的开发者。
            这个网站是我的个人实验场，用来记录灵感、技术和生活碎片。
          </p>
          <p>
            Powered by Next.js, Supabase & Framer Motion.
          </p>
        </div>

        {/* 社交链接 */}
        <div className="flex justify-center gap-6">
          {[Github, Twitter, Mail].map((Icon, i) => (
            <button key={i} className="p-4 bg-white rounded-2xl text-slate-400 hover:text-purple-600 hover:scale-110 transition-all shadow-sm">
              <Icon size={20} />
            </button>
          ))}
        </div>

      </motion.div>
    </div>
  );
}
