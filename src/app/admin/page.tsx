"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Settings, Save, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  // 1. 定义一个配置对象，管理多个参数
  const [config, setConfig] = useState({
    site_title: '',
    sidebar_subtext: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  // 2. 权限检查：只有登录用户才能访问后台
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("未授权访问！请先从主页面登录。");
        router.push('/'); // 没登录直接踢回首页
      } else {
        setIsAdmin(true);
        loadSettings();
      }
    }
    checkAuth();
  }, []);

  // 3. 加载所有设置
  async function loadSettings() {
    const { data } = await supabase.from('site_settings').select('*');
    if (data) {
      const settingsMap = data.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      setConfig(prev => ({ ...prev, ...settingsMap }));
    }
    setLoading(false);
  }

  // 4. 保存所有设置
  const handleSave = async () => {
    setIsSaving(true);
    const updates = Object.entries(config).map(([key, value]) => ({
      key,
      value
    }));

    const { error } = await supabase
      .from('site_settings')
      .upsert(updates);
    
    if (!error) alert("CORE: 系统配置已全局重写！");
    else alert("ERROR: " + error.message);
    setIsSaving(false);
  };

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center text-purple-400 font-mono">
        <Loader2 className="animate-spin mr-2" /> 正在同步终端权限...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white p-6 md:p-20 font-mono selection:bg-purple-500">
      <div className="max-w-2xl mx-auto">
        
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between mb-12 border-b border-purple-500/30 pb-6">
          <div className="flex items-center space-x-4">
            <Settings className="text-purple-400 animate-spin-slow" size={32} />
            <h1 className="text-2xl font-black italic tracking-tighter">ADMIN / 核心控制台</h1>
          </div>
          <div className="flex items-center text-[10px] text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
            <ShieldCheck size={12} className="mr-1"/> 系统已授权
          </div>
        </div>

        {/* 核心配置区 */}
        <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-10 border border-white/10 shadow-2xl space-y-10">
          
          {/* 修改主标题 */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.3em] text-purple-400 mb-4 font-black">
              System Title / 站点主名称
            </label>
            <input 
              value={config.site_title}
              onChange={(e) => setConfig({...config, site_title: e.target.value})}
              className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl outline-none focus:border-purple-500 transition-all text-xl font-bold italic"
              placeholder="e.g. SOYMILK"
            />
          </div>

          {/* 修改副标题 */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.3em] text-purple-400 mb-4 font-black">
              Sub Text / 侧边栏副标题
            </label>
            <input 
              value={config.sidebar_subtext}
              onChange={(e) => setConfig({...config, sidebar_subtext: e.target.value})}
              className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl outline-none focus:border-purple-500 transition-all"
              placeholder="e.g. Digital Frontier"
            />
          </div>

          {/* 执行按钮 */}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-2xl font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-xl shadow-purple-500/20"
          >
            {isSaving ? <Loader2 className="animate-spin"/> : <Save size={18}/>}
            <span>{isSaving ? "Writing..." : "Execute Global Update"}</span>
          </button>
        </div>

        {/* 返回链接 */}
        <button 
          onClick={() => router.push('/')}
          className="mt-12 flex items-center space-x-2 text-slate-500 hover:text-purple-400 transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform"/> 
          <span className="text-xs uppercase font-black">返回主终端系统</span>
        </button>
      </div>
    </div>
  );
}