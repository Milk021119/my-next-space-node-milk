"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟系统启动过程，2秒后关闭
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="fixed inset-0 z-[9999] bg-slate-900 flex items-center justify-center overflow-hidden"
        >
          {/* 背景网格装饰 */}
          <div className="absolute inset-0 opacity-20" 
               style={{ backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
          />

          <div className="relative z-10 text-center">
            {/* 故障风 LOGO */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative inline-block mb-8"
            >
              <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                <Terminal size={48} className="text-black" />
              </div>
              {/* 装饰性光晕 */}
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 bg-purple-500 rounded-2xl blur-xl -z-10"
              />
            </motion.div>

            {/* 文字打字机效果 */}
            <h1 className="text-4xl font-black text-white tracking-widest mb-2 font-mono">
              SOYMILK
            </h1>
            <div className="h-4">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-[10px] text-purple-400 uppercase tracking-[0.5em]"
              >
                System Initializing...
              </motion.p>
            </div>

            {/* 进度条 */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 200 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-1 bg-purple-600 mt-8 rounded-full mx-auto"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
