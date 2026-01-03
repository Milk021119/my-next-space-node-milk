'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // 监听认证状态变化 (比单纯 getSession 更可靠地捕获回调瞬间)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || session) {
        // 登录成功，跳转回首页
        router.push('/');
      }
    });

    // 保底逻辑：如果 2秒内没有触发事件，尝试手动检查一次
    const timeout = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) router.push('/');
      else {
        // 如果依然没有 session，可能是链接失效或直接访问，回首页让用户重新登录
        router.push('/');
      }
    }, 2000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-purple-50">
      {/* 赛博朋克风格加载动画 */}
      <div className="relative">
        <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 animate-pulse"></div>
        <Loader2 size={48} className="relative z-10 animate-spin text-purple-500 mb-6" />
      </div>
      
      <h2 className="text-2xl font-black tracking-[0.2em] animate-pulse bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
        信号接入中...
      </h2>
      
      <p className="text-xs font-mono text-slate-500 mt-3 uppercase tracking-wider">
        Establishing Secure Uplink
      </p>
    </div>
  );
}
