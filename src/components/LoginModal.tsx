"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Github, Mail, Loader2, Sparkles, KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  // 默认使用 "免密链接" (magic)，点击切换可以使用 "密码" (password)
  const [authMethod, setAuthMethod] = useState<'magic' | 'password'>('magic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  // ✨ 发送免密链接逻辑
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setMessage({ type: 'success', text: '✨ 登录链接已发送！请前往邮箱点击链接进入。' });
    } catch (error: any) {
      setMessage({ type: 'error', text: '发送失败，请检查邮箱格式。' });
    } finally {
      setLoading(false);
    }
  };

  // 🔑 密码登录逻辑
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // 尝试登录
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // 如果登录失败，尝试注册 (方便用户直接用密码注册)
        if (error.message.includes('Invalid login')) {
           // 这里也可以选择报错，或者提示用户去注册。
           // 为了体验顺滑，我们直接提示错误即可，因为推荐用 Magic Link 注册。
           throw new Error('账号或密码错误。');
        }
        throw error;
      }
      onClose();
      window.location.reload();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
          />
          
          {/* 弹窗主体 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[70] p-6"
          >
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl relative border border-white/20">
              <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>

              <div className="p-8">
                {/* 顶部标题 */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">终端接入</h2>
                  <p className="text-slate-400 text-sm">验证身份以连接至数字领域。</p>
                </div>

                {/* 消息提示框 */}
                {message && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 p-3 rounded-xl text-xs font-bold text-center ${message.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                    {message.text}
                  </motion.div>
                )}

                {/* 🌟 模式 A: 免密链接 (推荐) */}
                {authMethod === 'magic' ? (
                  <form onSubmit={handleMagicLink} className="space-y-4">
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="email" required value={email} onChange={(e) => setEmail(e.target.value)} 
                        placeholder="请输入您的邮箱"
                        className="w-full bg-slate-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-slate-300"
                      />
                    </div>
                    <button disabled={loading} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-purple-600 transition-all flex items-center justify-center gap-2">
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <><Sparkles size={16} /> 发送免密登录链接</>}
                    </button>
                  </form>
                ) : (
                  // 🔑 模式 B: 密码登录
                  <form onSubmit={handlePasswordLogin} className="space-y-4">
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="邮箱地址" className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-purple-100" />
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码" className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-purple-100" />
                    <button disabled={loading} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-purple-600 transition-all">
                      {loading ? <Loader2 size={16} className="animate-spin" /> : '登 录'}
                    </button>
                  </form>
                )}

                {/* 分割线 */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-300">或</span></div>
                </div>

                {/* 底部按钮组 */}
                <div className="space-y-3">
                  <button onClick={handleGithubLogin} className="w-full py-3 bg-white border-2 border-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:border-slate-900 hover:text-slate-900 transition-all flex items-center justify-center gap-2">
                    <Github size={18} /> GitHub 登录
                  </button>
                  
                  {/* 切换登录方式按钮 */}
                  <button 
                    onClick={() => { setAuthMethod(authMethod === 'magic' ? 'password' : 'magic'); setMessage(null); }}
                    className="w-full py-2 text-xs font-bold text-slate-400 hover:text-purple-600 transition-colors flex items-center justify-center gap-1"
                  >
                    {authMethod === 'magic' ? <><KeyRound size={14}/> 使用密码登录</> : <><Sparkles size={14}/> 使用免密链接登录</>}
                  </button>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
