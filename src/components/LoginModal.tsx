"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async () => {
    setLoading(true);
    // 核心代码：向 Supabase 发起登录请求
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("登录失败：" + error.message);
    } else {
      alert("登录成功！");
      onClose();
      window.location.reload(); // 刷新一下页面同步状态
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-white rounded-[32px] p-10 shadow-2xl">
        <h3 className="text-2xl font-bold mb-6">登录系统</h3>
        
        <input 
          type="email" 
          placeholder="邮箱" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 bg-gray-50 rounded-2xl mb-4 outline-none" 
        />
        <input 
          type="password" 
          placeholder="密码" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 bg-gray-50 rounded-2xl mb-6 outline-none" 
        />
        
        <button 
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all"
        >
          {loading ? "验证中..." : "进入空间"}
        </button>
        
        <button onClick={onClose} className="w-full mt-4 text-gray-400 text-sm">取消</button>
      </div>
    </div>
  );
}