'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Trash2, Plus, Copy, FileText, Settings, Key, 
  RefreshCw, LayoutDashboard, Terminal, ShieldAlert, LogOut, 
  Loader2, Users, MessageSquare, Search, Lock, Unlock, Eye, EyeOff, Pin, 
  Download, Activity, Server, AlertTriangle, CheckCircle2, MoreHorizontal, Filter
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

// --- 类型定义 ---
type AdminTab = 'overview' | 'posts' | 'users' | 'comments' | 'invites' | 'system';

interface StatCardProps {
  label: string;
  value: number | string;
  color: string;
  icon: any;
  trend?: string;
}

// --- 组件：自定义 Toast ---
const Toast = ({ msg, type }: { msg: string, type: 'success' | 'error' }) => (
  <motion.div 
    initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
    className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border ${type === 'success' ? 'bg-green-900/90 border-green-500 text-green-100' : 'bg-red-900/90 border-red-500 text-red-100'} backdrop-blur-md min-w-[300px]`}
  >
    {type === 'success' ? <CheckCircle2 size={20}/> : <AlertTriangle size={20}/>}
    <span className="text-sm font-bold tracking-wide">{msg}</span>
  </motion.div>
);

export default function AdminPage() {
  const router = useRouter();
  
  // 核心状态
  const [isAdmin, setIsAdmin] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loadingData, setLoadingData] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  // 数据集
  const [stats, setStats] = useState({ posts: 0, users: 0, comments: 0, invites: 0 });
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [codes, setCodes] = useState<any[]>([]);
  
  // 邀请码增强状态
  const [customCode, setCustomCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // 交互状态
  const [searchTerm, setSearchTerm] = useState('');
  const [systemLogs, setSystemLogs] = useState<string[]>([]);

  // 辅助函数：显示提示
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
    const time = new Date().toLocaleTimeString();
    setSystemLogs(prev => [`[${time}] ${type === 'success' ? '成功' : '错误'}: ${msg}`, ...prev].slice(0, 50));
  };

  // 🛡️ 鉴权
  useEffect(() => { checkAdminAccess(); }, []);

  async function checkAdminAccess() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; }
      
      const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
      const isEmailMatch = user.email === 's2285627839@outlook.com';
      
      if (profile?.is_admin || isEmailMatch) {
        setIsAdmin(true);
        fetchOverview();
        if (isEmailMatch && !profile?.is_admin) {
           await supabase.from('profiles').update({ is_admin: true }).eq('id', user.id);
        }
      } else {
        setVerifying(false); 
      }
    } catch {
      router.push('/');
    } finally {
      if (isAdmin) setVerifying(false);
    }
  }

  // --- 📡 数据获取 ---
  async function fetchOverview() {
    setLoadingData(true);
    const [p, u, c, i] = await Promise.all([
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('comments').select('*', { count: 'exact', head: true }),
        supabase.from('invite_codes').select('*', { count: 'exact', head: true })
    ]);
    setStats({ posts: p.count || 0, users: u.count || 0, comments: c.count || 0, invites: i.count || 0 });
    setLoadingData(false);
    setVerifying(false);
  }

  async function fetchPosts() {
    setLoadingData(true);
    const { data } = await supabase.from('posts').select('*, profiles(username, email)').order('created_at', { ascending: false });
    setPosts(data || []);
    setLoadingData(false);
  }

  async function fetchUsers() {
    setLoadingData(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoadingData(false);
  }

  async function fetchComments() {
    setLoadingData(true);
    const { data } = await supabase.from('comments').select('*, posts(title)').order('created_at', { ascending: false }).limit(50);
    setComments(data || []);
    setLoadingData(false);
  }

  async function fetchCodes() {
    const { data } = await supabase.from('invite_codes').select('*').order('created_at', { ascending: false });
    setCodes(data || []);
  }

  // --- 🛠️ 核心操作逻辑 ---

  // 1. 内容管理
  async function togglePostPin(id: number, current: boolean) {
    const { error } = await supabase.from('posts').update({ is_pinned: !current }).eq('id', id);
    if (error) showToast('操作失败', 'error'); else { showToast(current ? '已取消置顶' : '已置顶文章'); fetchPosts(); }
  }

  async function togglePostPublic(id: number, current: boolean) {
    const { error } = await supabase.from('posts').update({ is_public: !current }).eq('id', id);
    if (error) showToast('操作失败', 'error'); else { showToast(current ? '已转为私密' : '已公开文章'); fetchPosts(); }
  }

  async function deletePost(id: number) {
    if(!confirm('🔥 确定删除此文章？不可恢复！')) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) showToast('删除失败', 'error'); else { showToast('文章已删除'); fetchPosts(); }
  }

  // 2. 用户管理
  async function toggleBanUser(id: string, current: boolean) {
    if(!confirm(current ? '解封该用户？' : '⚠️ 确定封禁该用户？')) return;
    const { error } = await supabase.from('profiles').update({ is_banned: !current }).eq('id', id);
    if (error) showToast('操作失败', 'error'); else { showToast(current ? '用户已解封' : '用户已封禁'); fetchUsers(); }
  }

  // 3. 邀请码增强功能 (自定义 + 删除)
  async function createInviteCode(type: 'random' | 'custom') {
    setIsGenerating(true);
    let code = customCode.trim().toUpperCase();
    
    if (type === 'random') {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
    } else {
      if (!code) { showToast('请输入自定义邀请码', 'error'); setIsGenerating(false); return; }
      if (code.length < 4) { showToast('邀请码太短了', 'error'); setIsGenerating(false); return; }
    }

    // 检查重复
    const { data: exist } = await supabase.from('invite_codes').select('id').eq('code', code).single();
    if (exist) { showToast('该邀请码已存在', 'error'); setIsGenerating(false); return; }

    const { error } = await supabase.from('invite_codes').insert([{ code }]);
    if (error) showToast('生成失败', 'error');
    else {
        showToast(`邀请码 ${code} 创建成功`);
        setCustomCode('');
        fetchCodes();
    }
    setIsGenerating(false);
  }

  async function deleteInviteCode(id: number) {
    if(!confirm('删除此邀请码？')) return;
    const { error } = await supabase.from('invite_codes').delete().eq('id', id);
    if (error) showToast('删除失败', 'error'); else { showToast('邀请码已删除'); fetchCodes(); }
  }

  const exportData = (data: any[], filename: string) => {
    if (!data.length) return showToast('没有数据可导出', 'error');
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(v => typeof v === 'object' ? JSON.stringify(v) : v).join(','));
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}_export.csv`);
    document.body.appendChild(link);
    link.click();
    showToast('数据导出成功');
  };

  if (verifying) return (
    <div className="h-screen bg-[#0f172a] flex flex-col items-center justify-center text-purple-500 gap-4">
      <Loader2 className="animate-spin w-10 h-10"/> 
      <p className="text-xs font-mono tracking-widest animate-pulse">正在验证权限...</p>
    </div>
  );

  if (!isAdmin) return <ForbiddenView />;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex text-slate-800 font-sans">
      <AnimatePresence>{toast && <Toast msg={toast.msg} type={toast.type} />}</AnimatePresence>

      {/* 左侧导航 */}
      <aside className="w-20 lg:w-64 bg-[#0f172a] text-slate-300 flex flex-col shadow-2xl z-50 fixed h-full border-r border-slate-800">
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800/50 bg-[#020617]">
           <Terminal className="text-purple-500" size={24} />
           <div className="hidden lg:block ml-3">
             <h1 className="text-lg font-black tracking-widest text-white">NEXUS</h1>
             <p className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">总控中心 V5.0</p>
           </div>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          <NavButton active={activeTab} id="overview" icon={LayoutDashboard} label="控制台" onClick={() => {setActiveTab('overview'); fetchOverview();}} />
          
          <div className="pt-4 pb-1 pl-4 text-[9px] font-black text-slate-600 uppercase hidden lg:block tracking-widest">数据管理</div>
          <NavButton active={activeTab} id="posts" icon={FileText} label="文章管理" onClick={() => {setActiveTab('posts'); fetchPosts();}} />
          <NavButton active={activeTab} id="comments" icon={MessageSquare} label="评论审核" onClick={() => {setActiveTab('comments'); fetchComments();}} />
          
          <div className="pt-4 pb-1 pl-4 text-[9px] font-black text-slate-600 uppercase hidden lg:block tracking-widest">用户与权限</div>
          <NavButton active={activeTab} id="users" icon={Users} label="用户列表" onClick={() => {setActiveTab('users'); fetchUsers();}} />
          <NavButton active={activeTab} id="invites" icon={Key} label="邀请码生成" onClick={() => {setActiveTab('invites'); fetchCodes();}} />
          
          <div className="pt-4 pb-1 pl-4 text-[9px] font-black text-slate-600 uppercase hidden lg:block tracking-widest">系统</div>
          <NavButton active={activeTab} id="system" icon={Settings} label="全局设置" onClick={() => setActiveTab('system')} />
        </nav>

        <div className="p-4 border-t border-slate-800/50 bg-[#020617]">
           <button onClick={() => router.push('/')} className="flex items-center justify-center lg:justify-start gap-3 text-slate-400 hover:text-white text-xs font-bold transition-colors w-full p-2 hover:bg-white/5 rounded-lg group">
               <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> 
               <span className="hidden lg:block">退出系统</span>
           </button>
        </div>
      </aside>

      {/* 主内容 */}
      <main className="flex-1 ml-20 lg:ml-64 transition-all duration-300">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-8 py-4 border-b border-slate-200 flex justify-between items-center shadow-sm">
           <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{getPageTitle(activeTab)}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-xs text-slate-400 font-mono">系统运行中</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
               {['posts', 'users'].includes(activeTab) && (
                   <div className="relative hidden md:block group">
                       <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                       <input type="text" placeholder="全局检索..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-purple-200 outline-none transition-all"/>
                   </div>
               )}
               <button onClick={() => window.location.reload()} className="p-2 bg-slate-50 hover:bg-purple-50 rounded-full text-slate-400 hover:text-purple-600 transition-colors">
                  <RefreshCw size={18} className={loadingData ? 'animate-spin' : ''}/>
               </button>
           </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto min-h-[calc(100vh-80px)]">
            <AnimatePresence mode="wait">
                
                {/* 1. 仪表盘 */}
                {activeTab === 'overview' && (
                    <motion.div initial={{opacity:0, y: 20}} animate={{opacity:1, y: 0}} exit={{opacity:0, y: -20}} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard label="总文章数" value={stats.posts} color="bg-blue-600" icon={FileText} trend="+2 本周" />
                            <StatCard label="注册用户" value={stats.users} color="bg-purple-600" icon={Users} trend="+5 本周" />
                            <StatCard label="待审评论" value={stats.comments} color="bg-pink-600" icon={MessageSquare} trend="无异常" />
                            <StatCard label="有效邀请码" value={stats.invites} color="bg-orange-500" icon={Key} trend="充足" />
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity size={18} className="text-purple-500"/> 系统操作日志</h3>
                                <div className="bg-slate-900 rounded-xl p-4 h-64 overflow-y-auto font-mono text-xs text-green-400 space-y-1 shadow-inner">
                                    {systemLogs.length === 0 && <span className="text-slate-600">Waiting for events...</span>}
                                    {systemLogs.map((log, i) => <div key={i} className="border-b border-white/5 pb-1">{log}</div>)}
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-8 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col justify-center items-center text-center group">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                                <ShieldAlert size={48} className="text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="font-bold text-xl mb-2">安全中心</h3>
                                <p className="text-slate-400 text-sm mb-6 max-w-xs">当前系统版本 V5.0.2。数据库连接正常，RLS 策略已启用。</p>
                                <div className="flex gap-3">
                                    <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full text-xs font-bold transition-colors border border-white/10">查看报告</button>
                                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full text-xs font-bold transition-colors">系统备份</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 2. 内容管理 */}
                {activeTab === 'posts' && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-300">全部</button>
                                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:text-purple-600">已发布</button>
                                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:text-purple-600">草稿箱</button>
                            </div>
                            <button onClick={() => exportData(posts, 'posts')} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-purple-600 hover:border-purple-200 transition-colors">
                                <Download size={14}/> 导出 CSV
                            </button>
                        </div>
                        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="p-5">文章信息</th>
                                        <th className="p-5">作者</th>
                                        <th className="p-5">状态标签</th>
                                        <th className="p-5 text-right">管理</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-sm">
                                    {posts.filter(p => p.title?.includes(searchTerm) || p.content?.includes(searchTerm)).map(post => (
                                        <tr key={post.id} className="hover:bg-slate-50 group transition-colors">
                                            <td className="p-5 max-w-md">
                                                <div className="font-bold text-slate-800 truncate">{post.title || '无标题动态'}</div>
                                                <div className="text-[10px] text-slate-400 mt-1 font-mono">ID: {post.id}</div>
                                            </td>
                                            <td className="p-5 text-slate-500 font-medium">{post.profiles?.username || 'Unknown'}</td>
                                            <td className="p-5">
                                                <div className="flex gap-2">
                                                    {post.is_pinned && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px] font-bold border border-yellow-200">置顶</span>}
                                                    {!post.is_public && <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold border border-slate-200">私密</span>}
                                                    {post.is_public && !post.is_pinned && <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded text-[10px] font-bold border border-green-200">公开</span>}
                                                </div>
                                            </td>
                                            <td className="p-5 text-right flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => togglePostPin(post.id, post.is_pinned)} className={`p-2 rounded hover:bg-yellow-50 ${post.is_pinned ? 'text-yellow-600' : 'text-slate-300'}`} title="置顶"><Pin size={16}/></button>
                                                <button onClick={() => togglePostPublic(post.id, post.is_public)} className={`p-2 rounded hover:bg-blue-50 ${post.is_public ? 'text-slate-300' : 'text-blue-600'}`} title="可见性">{post.is_public ? <Eye size={16}/> : <EyeOff size={16}/>}</button>
                                                <button onClick={() => deletePost(post.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded" title="删除"><Trash2 size={16}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* 3. 用户管理 (代码结构类似，省略重复部分，保持原样即可，这里为了完整性保留) */}
                {activeTab === 'users' && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                        <div className="flex justify-end mb-4">
                            <button onClick={() => exportData(users, 'users')} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-purple-600 hover:border-purple-200 transition-colors">
                                <Download size={14}/> 导出名单
                            </button>
                        </div>
                        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="p-5">用户资料</th>
                                        <th className="p-5">权限</th>
                                        <th className="p-5">状态</th>
                                        <th className="p-5 text-right">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-sm">
                                    {users.filter(u => u.username?.includes(searchTerm) || u.id.includes(searchTerm)).map(user => (
                                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-slate-100 rounded-full overflow-hidden">
                                                        <img src={user.avatar_url || '/default-avatar.png'} className="w-full h-full object-cover"/>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800">{user.username || 'Unset'}</div>
                                                        <div className="text-[10px] text-slate-400 font-mono">{user.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                {user.is_admin ? <span className="text-purple-600 font-black text-[10px] flex items-center gap-1 border border-purple-200 bg-purple-50 px-2 py-1 rounded w-fit"><ShieldAlert size={10}/> 管理员</span> : <span className="text-slate-500 text-xs">普通用户</span>}
                                            </td>
                                            <td className="p-5">
                                                {user.is_banned 
                                                    ? <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-[10px] font-bold border border-red-200">封禁中</span>
                                                    : <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-[10px] font-bold border border-green-200">正常</span>
                                                }
                                            </td>
                                            <td className="p-5 text-right">
                                                <button onClick={() => toggleBanUser(user.id, user.is_banned)} className={`p-2 rounded transition-colors ${user.is_banned ? 'text-green-500 bg-green-50' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`} title={user.is_banned ? '解封' : '封禁'}>
                                                    {user.is_banned ? <Unlock size={16}/> : <Lock size={16}/>}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* 4. 评论 (略，保持不变) */}
                {activeTab === 'comments' && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                        <div className="space-y-4">
                            {comments.map(comment => (
                                <div key={comment.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-start hover:shadow-md transition-shadow group">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold text-slate-700 text-sm">{comment.user_email || '匿名用户'}</span>
                                            <span className="text-slate-300 text-xs">•</span>
                                            <span className="text-slate-400 text-xs">评论文章: {comment.posts?.title?.slice(0, 20) || '未知'}</span>
                                        </div>
                                        <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100 inline-block">{comment.content}</p>
                                    </div>
                                    <button onClick={() => {
                                        if(confirm('删除此评论？')) {
                                            supabase.from('comments').delete().eq('id', comment.id).then(() => {
                                                showToast('评论已删除');
                                                fetchComments();
                                            });
                                        }
                                    }} className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* 5. 邀请码管理 (增强版) */}
                {activeTab === 'invites' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Key size={18} className="text-purple-500"/> 生成新邀请码</h3>
                            <div className="flex gap-4 flex-wrap">
                                <button onClick={() => createInviteCode('random')} disabled={isGenerating} className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-purple-600 transition-colors shadow-lg shadow-purple-900/20 disabled:opacity-50">
                                    {isGenerating ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16} />} 随机生成
                                </button>
                                <div className="flex gap-2 flex-1 min-w-[200px]">
                                    <input 
                                      type="text" 
                                      placeholder="自定义邀请码 (如 VIP888)..." 
                                      value={customCode}
                                      onChange={e => setCustomCode(e.target.value.toUpperCase())}
                                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-mono uppercase focus:ring-2 focus:ring-purple-200 outline-none"
                                    />
                                    <button onClick={() => createInviteCode('custom')} disabled={isGenerating || !customCode} className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl text-sm font-bold hover:text-purple-600 hover:border-purple-200 transition-colors disabled:opacity-50">
                                        创建
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {codes.map(code => (
                                <div key={code.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-purple-200 transition-colors relative overflow-hidden">
                                    <div>
                                        <div className="text-lg font-mono font-bold text-slate-800 tracking-wider">{code.code}</div>
                                        <div className={`text-[10px] uppercase font-bold mt-1 ${code.is_used ? 'text-red-500' : 'text-green-500'}`}>{code.is_used ? '已使用' : '未使用'}</div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => {navigator.clipboard.writeText(code.code); showToast('已复制到剪贴板');}} className="text-slate-300 hover:text-purple-600 p-2 rounded hover:bg-purple-50"><Copy size={16}/></button>
                                        <button onClick={() => deleteInviteCode(code.id)} className="text-slate-300 hover:text-red-600 p-2 rounded hover:bg-red-50"><Trash2 size={16}/></button>
                                    </div>
                                    {code.is_used && <div className="absolute -right-4 -top-4 w-12 h-12 bg-slate-100 rotate-45 transform"></div>}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                 {/* 6. 系统设置 */}
                 {activeTab === 'system' && (
                    <div className="bg-white p-12 rounded-3xl text-center border border-slate-200 shadow-sm flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <Settings size={40} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">全局系统配置</h3>
                        <p className="text-slate-400 text-sm mb-8 max-w-md">在此处配置全站维护模式、SEO 元数据及第三方 API 密钥。 (模块开发中)</p>
                        <button disabled className="px-8 py-3 bg-slate-100 text-slate-400 rounded-xl font-bold text-xs cursor-not-allowed border border-slate-200">
                            系统锁定
                        </button>
                    </div>
                 )}
            </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// === 辅助组件 ===
function NavButton({ active, id, icon: Icon, label, onClick }: any) {
    const isActive = active === id;
    return (
        <button onClick={onClick} className={`w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-3 rounded-xl text-xs font-bold transition-all relative group ${isActive ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <Icon size={18} />
            <span className="hidden lg:block tracking-wide">{label}</span>
        </button>
    )
}

function StatCard({ label, value, color, icon: Icon, trend }: StatCardProps) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform group">
            <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black text-slate-800">{value}</p>
                    {trend && <span className="text-[10px] font-bold text-green-500 bg-green-50 px-1.5 py-0.5 rounded">{trend}</span>}
                </div>
            </div>
        </div>
    )
}

function getPageTitle(tab: string) {
    const map: any = { overview: '仪表盘控制台', posts: '内容管理中心', users: '用户与权限', comments: '舆情监控', invites: '通行证管理', system: '全局系统设置' };
    return map[tab] || 'Console';
}

function ForbiddenView() {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6">
         <ShieldAlert size={80} className="text-red-600 mb-6 animate-pulse" />
         <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">403 禁止访问</h1>
         <p className="text-red-500 font-mono text-sm border border-red-900 bg-red-900/20 px-4 py-2 rounded">
            ERROR: 权限不足，请联系管理员
         </p>
         <a href="/" className="mt-8 text-slate-500 hover:text-white text-xs uppercase tracking-widest underline">返回安全区域</a>
      </div>
    )
}
