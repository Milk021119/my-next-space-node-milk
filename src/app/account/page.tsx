"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { ShieldCheck, Mail, Smartphone } from 'lucide-react';

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user));
  }, []);

  async function handleUpdatePassword() {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert('❌ 修改失败: ' + error.message);
    else alert('✅ 密码修改成功！');
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans flex">
      <Sidebar />
      {/* ✨ 布局调整 */}
      <main className="flex-1 lg:ml-72 2xl:ml-80 p-10 transition-all duration-300">
        <div className="max-w-4xl mx-auto pt-10">
          <h1 className="text-3xl font-black text-slate-800 mb-8">账号安全中心</h1>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-8">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">账号绑定</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3"><Mail className="text-purple-500" size={20}/><div><p className="font-bold text-slate-700">邮箱绑定</p><p className="text-xs text-slate-400">{user?.email}</p></div></div>
                  <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded">已绑定</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl opacity-60">
                  <div className="flex items-center gap-3"><Smartphone className="text-slate-400" size={20}/><div><p className="font-bold text-slate-700">手机号</p><p className="text-xs text-slate-400">暂不支持</p></div></div>
                  <button disabled className="text-xs font-bold text-slate-400">去绑定</button>
                </div>
              </div>
            </div>
            <hr className="border-slate-100"/>
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><ShieldCheck size={16}/> 安全设置</h3>
              <div className="flex gap-4">
                <input type="password" placeholder="输入新密码" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm outline-none focus:border-purple-500"/>
                <button onClick={handleUpdatePassword} disabled={loading || !newPassword} className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-purple-600 transition-colors">{loading ? '保存中...' : '修改密码'}</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
