"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PageLayout, { PageCard, SectionTitle } from '@/components/PageLayout';
import { ShieldCheck, Mail, Smartphone, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  
  // 密码表单
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 反馈消息状态
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user));
  }, []);

  // 3秒后自动清除消息
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  async function handleUpdatePassword() {
    // 1. 基础校验
    if (newPassword.length < 6) {
        setMessage({ type: 'error', text: '密码长度至少需要 6 位' });
        return;
    }
    if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: '两次输入的密码不一致' });
        return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
        setMessage({ type: 'error', text: '修改失败: ' + error.message });
    } else {
        setMessage({ type: 'success', text: '密码修改成功！下次请使用新密码登录。' });
        setNewPassword('');
        setConfirmPassword('');
    }
    setLoading(false);
  }

  return (
    <PageLayout
      title="账号安全中心"
      subtitle="管理您的登录方式与安全凭证。"
      maxWidth="3xl"
    >
      {/* 消息提示弹窗 (Toast) */}
      <AnimatePresence>
        {message && (
            <motion.div 
                initial={{ opacity: 0, y: -20, x: '-50%' }} 
                animate={{ opacity: 1, y: 0, x: '-50%' }} 
                exit={{ opacity: 0, y: -20, x: '-50%' }}
                className={`fixed top-8 left-1/2 z-50 px-6 py-3 rounded-full shadow-xl flex items-center gap-2 text-sm font-bold border ${
                    message.type === 'success' 
                    ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                    : 'bg-red-50 text-red-500 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                }`}
            >
                {message.type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
                {message.text}
            </motion.div>
        )}
      </AnimatePresence>

      <PageCard className="p-8 lg:p-10 rounded-[2rem] space-y-10">
        
        {/* 1. 账号绑定 */}
        <div>
          <SectionTitle>账号绑定</SectionTitle>
          <div className="space-y-4 mt-6">
            
            {/* 邮箱 (已绑定) */}
            <div className="flex items-center justify-between p-5 bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--border-color)]">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                      <Mail size={20}/>
                  </div>
                  <div>
                      <p className="font-bold text-[var(--text-primary)] text-sm">邮箱绑定</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{user?.email}</p>
                  </div>
              </div>
              <span className="text-[10px] font-black text-green-500 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-full border border-green-100 dark:border-green-800 uppercase tracking-wide">
                  已绑定
              </span>
            </div>

            {/* 手机号 (暂不可用) */}
            <div className="flex items-center justify-between p-5 bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--border-color)] opacity-60 grayscale">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-[var(--bg-tertiary)] text-[var(--text-muted)] rounded-xl">
                      <Smartphone size={20}/>
                  </div>
                  <div>
                      <p className="font-bold text-[var(--text-primary)] text-sm">手机号</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">暂不支持绑定</p>
                  </div>
              </div>
              <button disabled className="text-xs font-bold text-[var(--text-muted)] px-3 py-1.5 border border-[var(--border-color)] rounded-full">去绑定</button>
            </div>

          </div>
        </div>

        <hr className="border-[var(--border-color)]"/>

        {/* 2. 修改密码 */}
        <div>
          <SectionTitle icon={<ShieldCheck size={16}/>}>安全设置</SectionTitle>
          
          <div className="bg-[var(--bg-tertiary)] rounded-2xl p-6 border border-[var(--border-color)] mt-6">
              <div className="grid gap-4 mb-6">
                  <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"/>
                      <input 
                        type="password" 
                        placeholder="输入新密码 (至少6位)" 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)} 
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl py-3 pl-12 pr-4 text-sm text-[var(--text-primary)] outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                      />
                  </div>
                  <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"/>
                      <input 
                        type="password" 
                        placeholder="再次确认新密码" 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)} 
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl py-3 pl-12 pr-4 text-sm text-[var(--text-primary)] outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                      />
                  </div>
              </div>
              
              <div className="flex justify-end">
                  <button 
                    onClick={handleUpdatePassword} 
                    disabled={loading || !newPassword} 
                    className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-purple-600 dark:hover:bg-purple-400 hover:shadow-lg hover:shadow-purple-200 dark:hover:shadow-purple-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                      {loading ? '处理中...' : '确认修改'}
                  </button>
              </div>
          </div>
        </div>

      </PageCard>
    </PageLayout>
  );
}
