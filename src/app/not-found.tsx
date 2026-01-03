"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Terminal, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden text-cyan-50 font-mono selection:bg-red-500/30 selection:text-red-500">
      
      {/* === 1. 背景特效层 === */}
      
      {/* 噪点背景 */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* 赛博网格地板 (透视效果) */}
      <div className="absolute bottom-0 w-full h-1/2 bg-[linear-gradient(to_top,rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(to_right,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)] opacity-20 pointer-events-none" />

      {/* CRT 扫描线纹理 */}
      <div className="fixed inset-0 z-50 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none" />

      {/* === 2. 主要内容区 === */}
      <div className="relative z-10 flex flex-col items-center text-center p-6">
        
        {/* 顶部警告标志 */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0, 1, 1] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
          className="mb-8 text-red-500"
        >
          <AlertTriangle size={48} className="drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
        </motion.div>

        {/* Glitch 404 标题 */}
        <div className="relative mb-6 group">
          <h1 
            className="text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-600 relative z-10"
            data-text="404"
          >
            404
          </h1>
          
          {/* 故障重影层 1 (红色偏移) */}
          <div className="absolute inset-0 text-9xl font-black tracking-tighter text-red-500 opacity-70 animate-glitch-1 mix-blend-screen" aria-hidden="true">
            404
          </div>
          {/* 故障重影层 2 (蓝色偏移) */}
          <div className="absolute inset-0 text-9xl font-black tracking-tighter text-blue-500 opacity-70 animate-glitch-2 mix-blend-screen" aria-hidden="true">
            404
          </div>
        </div>

        {/* 错误信息打字机 */}
        <div className="space-y-2 mb-12">
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-[0.2em] text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]">
              系统严重故障
            </h2>
            <div className="text-xs md:text-sm text-slate-500 flex flex-col gap-1 items-center font-sans">
                <p>&gt; 错误代码：页面未找到 (PAGE_NOT_FOUND)</p>
                <p>&gt; 坐标信号丢失：NULL</p>
                <p>&gt; 正在启动紧急协议，请立即撤离...</p>
            </div>
        </div>

        {/* 返回按钮 (Cyber Button) */}
        <Link href="/">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-3 bg-transparent overflow-hidden cursor-pointer"
          >
            {/* 按钮边框特效 */}
            <div className="absolute inset-0 border border-cyan-500/50 skew-x-12 group-hover:bg-cyan-900/20 transition-all duration-300" />
            {/* 角标装饰 */}
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-cyan-500/20 border-l border-t border-cyan-500" />
            <div className="absolute top-0 left-0 w-4 h-4 bg-cyan-500/20 border-r border-b border-cyan-500" />
            
            <div className="relative flex items-center gap-3 text-cyan-400 font-bold tracking-widest uppercase group-hover:text-cyan-300">
               <Terminal size={16} />
               <span>返回安全区 (首页)</span>
            </div>
          </motion.div>
        </Link>

      </div>

      {/* 底部装饰字 */}
      <div className="absolute bottom-8 left-8 text-[10px] text-slate-700 font-black rotate-90 origin-bottom-left">
         系统版本.3.0 // SOYMILK
      </div>

      {/* CSS 关键帧动画 (内联样式，确保复制即用) */}
      <style jsx>{`
        @keyframes glitch-1 {
          0% { clip-path: inset(20% 0 80% 0); transform: translate(-2px, 2px); }
          20% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -2px); }
          40% { clip-path: inset(40% 0 50% 0); transform: translate(-2px, 2px); }
          60% { clip-path: inset(80% 0 5% 0); transform: translate(2px, -2px); }
          80% { clip-path: inset(10% 0 60% 0); transform: translate(-2px, 2px); }
          100% { clip-path: inset(30% 0 30% 0); transform: translate(2px, -2px); }
        }
        @keyframes glitch-2 {
          0% { clip-path: inset(10% 0 60% 0); transform: translate(2px, -2px); }
          20% { clip-path: inset(80% 0 5% 0); transform: translate(-2px, 2px); }
          40% { clip-path: inset(30% 0 20% 0); transform: translate(2px, -2px); }
          60% { clip-path: inset(10% 0 80% 0); transform: translate(-2px, 2px); }
          80% { clip-path: inset(50% 0 30% 0); transform: translate(2px, -2px); }
          100% { clip-path: inset(20% 0 70% 0); transform: translate(-2px, 2px); }
        }
        .animate-glitch-1 {
          animation: glitch-1 2.5s infinite linear alternate-reverse;
        }
        .animate-glitch-2 {
          animation: glitch-2 3s infinite linear alternate-reverse;
        }
      `}</style>
    </div>
  );
}
