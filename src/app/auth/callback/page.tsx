"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // 监听 URL 中的 hash (魔术链接通常带 hash)
    const handleAuth = async () => {
      // Supabase 客户端会自动处理 URL 中的 token
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        // 登录成功，跳转回首页
        router.push('/');
      } else if (error) {
        // 出错了，跳回首页（或者显示错误页）
        console.error('Login error:', error);
        router.push('/');
      } else {
        // 如果没有 session 也没有 error (可能是直接访问了这个页面)，也跳回
        // 这里稍微等一下，给 Supabase 一点时间处理
        setTimeout(() => {
           supabase.auth.getSession().then(({data}) => {
              if (data.session) router.push('/');
           });
        }, 1000);
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
      <Loader2 size={48} className="animate-spin text-purple-500 mb-4" />
      <h2 className="text-xl font-black tracking-widest animate-pulse">VERIFYING SIGNAL...</h2>
      <p className="text-xs text-slate-500 mt-2">Establishing secure connection.</p>
    </div>
  );
}
