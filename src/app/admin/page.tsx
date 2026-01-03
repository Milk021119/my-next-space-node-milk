"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Trash2, Plus, Copy, BarChart3, FileText, Settings, Key, 
  RefreshCw, LayoutDashboard, Save, Terminal, ShieldAlert
} from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'settings' | 'invites'>('overview');

  // 数据状态
  const [stats, setStats] = useState({ posts: 0, moments: 0, comments: 0, likes: 0 });
  const [posts, setPosts] = useState<any[]>([]);
  const [codes, setCodes] = useState<any[]>([]);
  const [settings, setSettings] = useState({ site_title: '', sidebar_subtext: '' });

  // ⚠️ 记得确保这里填的是你的邮箱
  const ADMIN_EMAIL = 's2285627839@outlook.com';

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        fetchStats(); 
      }
    } finally {
      setLoading(false);
    }
  }

  // --- 📡 数据获取 ---
  async function fetchStats() {
    setLoading(true);
    const { count: postCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('type', 'article');
    const { count: momentCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('type', 'moment');
    const { count: commentCount } = await supabase.from('comments').select('*', { count: 'exact', head: true });
    
    setStats({ posts: postCount || 0, moments: momentCount || 0, comments: commentCount || 0, likes: 0 });
    
    if (activeTab === 'posts') fetchPosts();
    if (activeTab === 'invites') fetchCodes();
    if (activeTab === 'settings') fetchSettings();
    
    setLoading(false);
  }

  async function fetchPosts() {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(20);
    setPosts(data || []);
  }

  async function fetchCodes() {
    const { data } = await supabase.from('invite_codes').select('*').order('created_at', { ascending: false });
    setCodes(data || []);
  }

  async function fetchSettings() {
    const { data } = await supabase.from('site_settings').select('*');
    if (data) {
      const map: any = {};
      data.forEach((item: any) => map[item.key] = item.value);
      setSettings({ site_title: map.site_title || '', sidebar_subtext: map.sidebar_subtext || '' });
    }
  }

  // --- 🛠️ 操作逻辑 ---
  async function handleDeletePost(id: number) {
    if (!confirm('⚠️ 警告：确定要彻底删除这条内容吗？此操作不可恢复！')) return;
    await supabase.from('posts').delete().eq('id', id);
    fetchPosts(); 
  }

  async function handleSaveSettings() {
    await supabase.from('site_settings').update({ value: settings.site_title }).eq('key', 'site_title');
    await supabase.from('site_settings').update({ value: settings.sidebar_subtext }).eq('key', 'sidebar_subtext');
    alert('✅ 设置已保存！前台页面刷新后生效。');
  }

  async function generateCode() {
    const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    await supabase.from('invite_codes').insert([{ code: randomCode }]);
    fetchCodes();
  }

  async function deleteCode(id: number) {
    if (!confirm('确定删除这个邀请码吗？')) return;
    await supabase.from('invite_codes').delete().eq('id', id);
    fetchCodes();
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`已复制: ${text}`);
  };

  // --- 🚫 权限拦截界面 ---
  if (!isAdmin && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-red-500 font-mono">
        <ShieldAlert size={64} className="mb-4" />
        <h1 className="text-4xl font-black mb-2">403 禁止访问</h1>
        <p className="text-lg tracking-widest border border-red-500/30 bg-red-500/10 px-4 py-2 rounded">ACCESS DENIED</p>
        <p className="mt-4 text-slate-500 text-sm">该区域仅限管理员进入</p>
        <button onClick={() => router.push('/')} className="mt-8 px-6 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors">返回首页</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex">
      {/* 侧边导航 */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6 shadow-2xl z-10">
        <div className="mb-10 flex items-center gap-3 text-purple-400">
          <Terminal size={24} />
          <div>
            <h1 className="text-xl font-black tracking-widest">后台管理</h1>
            <p className="text-[10px] text-slate-500 font-mono">ADMIN CONSOLE</p>
          </div>
        </div>
        
        <nav className="space-y-2 flex-1">
          {[
            { id: 'overview', label: '数据概览', icon: LayoutDashboard },
            { id: 'posts', label: '内容管理', icon: FileText },
            { id: 'settings', label: '系统设置', icon: Settings },
            { id: 'invites', label: '邀请码', icon: Key },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); if(item.id !== 'overview') setLoading(true); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === item.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>

        <button onClick={() => router.push('/')} className="mt-auto flex items-center gap-2 text-slate-500 hover:text-white text-xs font-bold transition-colors w-full px-4 py-2 hover:bg-white/5 rounded-lg">
          <RefreshCw size={14} /> 返回前台
        </button>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              {activeTab === 'overview' && '数据概览'}
              {activeTab === 'posts' && '内容管理'}
              {activeTab === 'settings' && '系统设置'}
              {activeTab === 'invites' && '邀请码管理'}
            </h2>
            <p className="text-slate-400 text-xs mt-2 font-mono uppercase tracking-wide">
              System Status: {loading ? 'Loading...' : 'Online'}
            </p>
          </div>
          {loading && <RefreshCw className="animate-spin text-purple-500" />}
        </header>

        {/* 📊 Tab 1: 概览面板 */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="累计文章" value={stats.posts} color="bg-blue-500" icon={FileText} />
            <StatCard label="累计动态" value={stats.moments} color="bg-green-500" icon={LayoutDashboard} />
            <StatCard label="评论总数" value={stats.comments} color="bg-pink-500" icon={BarChart3} />
          </div>
        )}

        {/* 📝 Tab 2: 内容管理 */}
        {activeTab === 'posts' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-700">最近发布 (Top 20)</h3>
              <button onClick={fetchPosts} className="text-xs text-purple-600 font-bold hover:underline">刷新列表</button>
            </div>
            <div className="divide-y divide-slate-100">
              {posts.map(post => (
                <div key={post.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${post.type === 'moment' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                        {post.type === 'moment' ? '动态' : '文章'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{format(new Date(post.created_at), 'yyyy-MM-dd HH:mm')}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 line-clamp-1">{post.title || post.content}</p>
                    <p className="text-xs text-slate-400">作者: {post.author_email}</p>
                  </div>
                  <button onClick={() => handleDeletePost(post.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="删除">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ⚙️ Tab 3: 系统设置 */}
        {activeTab === 'settings' && (
          <div className="max-w-xl bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">网站标题 (Site Title)</label>
                <input 
                  value={settings.site_title}
                  onChange={e => setSettings({...settings, site_title: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 outline-none focus:border-purple-500 transition-all"
                  placeholder="例如: SOYMILK"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">侧边栏副标题 (Sidebar Subtext)</label>
                <input 
                  value={settings.sidebar_subtext}
                  onChange={e => setSettings({...settings, sidebar_subtext: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 outline-none focus:border-purple-500 transition-all"
                  placeholder="例如: Digital Frontier"
                />
              </div>
              <button 
                onClick={handleSaveSettings}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-purple-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
              >
                <Save size={18} /> 保存更改
              </button>
            </div>
          </div>
        )}

        {/* 🔑 Tab 4: 邀请码管理 */}
        {activeTab === 'invites' && (
          <div>
            <button onClick={generateCode} className="mb-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-200 transition-all active:scale-95">
              <Plus size={18} /> 生成新邀请码
            </button>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-widest">
                  <tr><th className="p-4">邀请码</th><th className="p-4">状态</th><th className="p-4">创建时间</th><th className="p-4 text-right">操作</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {codes.map(code => (
                    <tr key={code.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-700 flex items-center gap-2">
                        {code.code}
                        <button onClick={() => copyToClipboard(code.code)} className="p-1 rounded hover:bg-slate-200 text-slate-400 transition-colors" title="复制">
                          <Copy size={12} />
                        </button>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${code.is_used ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          {code.is_used ? '已使用' : '未使用'}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-400">{format(new Date(code.created_at), 'yyyy/MM/dd')}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => deleteCode(code.id)} className="text-slate-300 hover:text-red-500 transition-colors" title="删除">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {codes.length === 0 && <div className="p-10 text-center text-slate-400 text-sm">暂无数据，请点击生成按钮。</div>}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// 统计卡片
function StatCard({ label, value, color, icon: Icon }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-default">
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg opacity-90`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}
