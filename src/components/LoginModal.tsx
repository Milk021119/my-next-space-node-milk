'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Github, Mail, Loader2, Sparkles, KeyRound, UserPlus, ArrowLeft, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
// ✅ 引入 createPortal
import { createPortal } from 'react-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [view, setView] = useState<'login' | 'register' | 'reset'>('login');
  const [loginMethod, setLoginMethod] = useState<'magic' | 'password'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  
  // ✅ Portal 需要的挂载状态
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // 客户端加载完毕后设为 true
  }, []);

  // 倒计时逻辑
  const [countdown, setCountdown] = useState(0); 
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const resetForm = () => {
    setMessage(null);
    setLoading(false);
  };

  // --- 登录/注册逻辑保持不变 ---
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (countdown > 0) return;
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setMessage({ type: 'success', text: '✨ 登录链接已发送！请查收邮件。' });
      setCountdown(60); 
    } catch (error: any) {
      setMessage({ type: 'error', text: '发送失败，请检查邮箱格式。' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error('账号或密码错误。');
      onClose();
      window.location.reload();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { data: codes, error: codeError } = await supabase.from('invite_codes').select('*').eq('code', inviteCode).eq('is_used', false).single();
      if (codeError || !codes) throw new Error('无效的邀请码，或者已被使用。');
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback`, data: { username: email.split('@')[0] } } });
      if (error) throw error;
      await supabase.from('invite_codes').update({ is_used: true }).eq('id', codes.id);
      setMessage({ type: 'success', text: '🎉 注册成功！请前往邮箱验证激活账号。' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (countdown > 0) return;
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/account/reset` });
      if (error) throw error;
      setMessage({ type: 'success', text: '📧 重置邮件已发送！请查收。' });
      setCountdown(60);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: `${window.location.origin}/auth/callback` } });
  };

  // ✅ 如果还没挂载到客户端，不渲染任何东西
  if (!mounted) return null;

  // ✅ 使用 createPortal 将弹窗渲染到 document.body
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="relative z-[99999]"> {/* 这里的 z-index 现在相对于 body 生效，绝对最高 */}
          {/* 遮罩层 */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-md"
          />
          
          {/* 弹窗主体 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6"
          >
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl relative border border-white/20">
              <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors z-10">
                <X size={20} />
              </button>

              <div className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">
                    {view === 'login' && '身份验证'}
                    {view === 'register' && '新用户注册'}
                    {view === 'reset' && '重置密码'}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    {view === 'login' && '连接至 SOYMILK 终端'}
                    {view === 'register' && '请输入邀请码以获取权限'}
                    {view === 'reset' && '我们将向您的邮箱发送重置链接'}
                  </p>
                </div>

                {message && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 p-3 rounded-xl text-xs font-bold text-center ${message.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                    {message.text}
                  </motion.div>
                )}

                {/* --- 表单区域保持不变 --- */}
                {view === 'login' && (
                  <>
                    {loginMethod === 'magic' ? (
                      <form onSubmit={handleMagicLink} className="space-y-4">
                        <div className="relative">
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="请输入邮箱" className="w-full bg-slate-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-purple-100" />
                        </div>
                        <button disabled={loading || countdown > 0} className={`w-full py-3 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${countdown > 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-slate-900 hover:bg-purple-600'}`}>
                          {loading ? <Loader2 size={16} className="animate-spin" /> : countdown > 0 ? `${countdown}秒后重试` : <><Sparkles size={16} /> 发送免密链接</>}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handlePasswordLogin} className="space-y-4">
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="邮箱地址" className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-purple-100" />
                        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码" className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-purple-100" />
                        <div className="flex justify-end">
                          <button type="button" onClick={() => { setView('reset'); resetForm(); }} className="text-xs text-slate-400 hover:text-purple-600 font-medium">忘记密码？</button>
                        </div>
                        <button disabled={loading} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-purple-600 transition-all">
                          {loading ? <Loader2 size={16} className="animate-spin" /> : '登 录'}
                        </button>
                      </form>
                    )}
                    <button onClick={() => { setLoginMethod(loginMethod === 'magic' ? 'password' : 'magic'); setMessage(null); }} className="w-full mt-4 py-2 text-xs font-bold text-slate-400 hover:text-purple-600 transition-colors flex items-center justify-center gap-1">
                      {loginMethod === 'magic' ? <><KeyRound size={14}/> 切换到密码登录</> : <><Sparkles size={14}/> 切换到免密登录</>}
                    </button>
                    <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-300">或</span></div></div>
                    <button onClick={handleGithubLogin} className="w-full py-3 bg-white border-2 border-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:border-slate-900 hover:text-slate-900 transition-all flex items-center justify-center gap-2">
                      <Github size={18} /> GitHub 登录
                    </button>
                    <div className="mt-6 text-center">
                      <button onClick={() => { setView('register'); resetForm(); }} className="text-xs text-purple-500 font-bold hover:underline flex items-center justify-center gap-1 mx-auto">
                        没有账号？去注册 <UserPlus size={14} />
                      </button>
                    </div>
                  </>
                )}

                {/* 注册表单 */}
                {view === 'register' && (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="邮箱地址" className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-purple-100" />
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="设置密码 (至少6位)" minLength={6} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-purple-100" />
                    <div className="relative">
                      <input type="text" required value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="请输入邀请码" className="w-full bg-yellow-50 border border-yellow-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-yellow-200 text-yellow-800 placeholder:text-yellow-400/70" />
                    </div>
                    <button disabled={loading} className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-purple-700 transition-all shadow-lg shadow-purple-200">
                      {loading ? <Loader2 size={16} className="animate-spin inline" /> : '立即注册'}
                    </button>
                    <button type="button" onClick={() => { setView('login'); resetForm(); }} className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 font-bold flex items-center justify-center gap-1">
                      <ArrowLeft size={12} /> 返回登录
                    </button>
                  </form>
                )}

                {/* 重置密码表单 */}
                {view === 'reset' && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="请输入注册邮箱" className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-purple-100" />
                    <button disabled={loading || countdown > 0} className={`w-full py-3 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${countdown > 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-slate-900 hover:bg-purple-600'}`}>
                      {loading ? <Loader2 size={16} className="animate-spin" /> : countdown > 0 ? `${countdown}秒后重试` : <><RefreshCw size={16} /> 发送重置邮件</>}
                    </button>
                    <button type="button" onClick={() => { setView('login'); resetForm(); }} className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 font-bold flex items-center justify-center gap-1">
                      <ArrowLeft size={12} /> 返回登录
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body // ✨ 关键：挂载到 body 上
  );
}
