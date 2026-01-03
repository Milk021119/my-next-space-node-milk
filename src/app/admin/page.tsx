// @ts-nocheck
"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Trash2, Plus, Copy, BarChart3, FileText, Settings, Key, 
  RefreshCw, LayoutDashboard, Save, Terminal, ShieldAlert, LogOut, 
  Loader2, Users, MessageSquare, Search, Lock, Unlock, Eye, EyeOff, Pin, Megaphone, Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPage() {
  const router = useRouter();
  
  // 核心状态
  const [isAdmin, setIsAdmin] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'users' | 'comments' | 'invites' | 'system'>('overview');
  const [loadingData, setLoadingData] = useState(false);

  // 数据集
  const [stats, setStats] = useState({ posts: 0, users: 0, comments: 0, reports: 0 });
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [codes, setCodes] = useState<any[]>([]);
  
  // 交互状态
  const [searchTerm, setSearchTerm] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');

  // 🛡️ 鉴权
  useEffect(() => { checkAdminAccess(); }, []);

  async function checkAdminAccess() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/?login=true'); return; }

      const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
      
      // 兼容：如果数据库没设 admin，回退到邮箱检查
      const isEmailMatch = user.email === 's2285627839@outlook.com';

      if (profile?.is_admin || isEmailMatch) {
        setIsAdmin(true);
        fetchOverview();
      } else {
        setVerifying(false); // 渲染 403
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
    const [p, u, c] = await Promise.all([
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('comments').select('*', { count: 'exact', head: true })
    ]);
    setStats({ posts: p.count || 0, users: u.count || 0, comments: c.count || 0, reports: 0 });
    setLoadingData(false);
    setVerifying(false);
  }

  async function fetchPosts() {
    setLoadingData(true);
    // 这里的 profiles(username, email) 需要你在数据库建立好外键关联
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
    // 这里的 posts(title) 需要外键关联
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
    await supabase.from('posts').update({ is_pinned: !current }).eq('id', id);
    fetchPosts();
  }
  async function togglePostPublic(id: number, current: boolean) {
    await supabase.from('posts').update({ is_public: !current }).eq('id', id);
    fetchPosts();
  }
  async function deletePost(id: number) {
    if(!confirm('🔥 确定删除此文章？不可恢复！')) return;
    await supabase.from('posts').delete().eq('id', id);
    fetchPosts();
  }

  // 2. 用户管理
  async function toggleBanUser(id: string, current: boolean) {
    if(!confirm(current ? '解封该用户？' : '⚠️ 确定封禁该用户？他将无法登录。')) return;
    await supabase.from('profiles').update({ is_banned: !current }).eq('id', id);
    fetchUsers();
  }
  async function toggleAdminUser(id: string, current: boolean) {
    if(!confirm('修改管理员权限？慎重操作。')) return;
    await supabase.from('profiles').update({ is_admin: !current }).eq('id', id);
    fetchUsers();
  }

  // 3. 评论管理
  async function deleteComment(id: number) {
    await supabase.from('comments').delete().eq('id', id);
    fetchComments();
  }

  // 4. 系统广播
  async function sendBroadcast() {
    if(!broadcastMsg) return;
    alert(`📢 模拟广播发送成功: "${broadcastMsg}" \n(真实环境需接入 Edge Function 遍历用户发送)`);
    setBroadcastMsg('');
  }

  // 5. 邀请码
  async function generateCode() {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    await supabase.from('invite_codes').insert([{ code }]);
    fetchCodes();
  }

  // --- 渲染辅助 ---
  if (verifying) return <div className="h-screen bg-slate-950 flex items-center justify-center text-purple-500"><Loader2 className="animate-spin mr-2"/> 正在验证神经连接...</div>;
  if (!isAdmin) return <ForbiddenView />;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex text-slate-800 font-sans">
      
      {/* === 左侧导航栏 === */}
      <aside className="w-20 lg:w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-50 transition-all duration-300 fixed h-full">
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800/50 bg-slate-950/50">
           <Terminal className="text-purple-500" size={24} />
           <div className="hidden lg:block ml-3">
             <h1 className="text-lg font-black tracking-widest">NEXUS</h1>
             <p className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">Admin System v3.0</p>
           </div>
        </div>
        
        <nav className="flex-1 py-6 px-2 space-y-1 overflow-y-auto">
          <NavButton active={activeTab} id="overview" icon={LayoutDashboard} label="控制台" onClick={() => {setActiveTab('overview'); fetchOverview();}} />
          <div className="pt-4 pb-1 pl-4 text-[10px] font-bold text-slate-600 uppercase hidden lg:block">Data Center</div>
          <NavButton active={activeTab} id="posts" icon={FileText} label="内容管理" onClick={() => {setActiveTab('posts'); fetchPosts();}} />
          <NavButton active={activeTab} id="comments" icon={MessageSquare} label="评论监控" onClick={() => {setActiveTab('comments'); fetchComments();}} />
          <div className="pt-4 pb-1 pl-4 text-[10px] font-bold text-slate-600 uppercase hidden lg:block">User & System</div>
          <NavButton active={activeTab} id="users" icon={Users} label="用户管理" onClick={() => {setActiveTab('users'); fetchUsers();}} />
          <NavButton active={activeTab} id="invites" icon={Key} label="邀请码 / 权限" onClick={() => {setActiveTab('invites'); fetchCodes();}} />
          <NavButton active={activeTab} id="system" icon={Settings} label="全局设置" onClick={() => setActiveTab('system')} />
        </nav>

        <div className="p-4 border-t border-slate-800/50 bg-slate-950/30">
            <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
                <span className="text-[10px] text-slate-400 hidden lg:inline">System Operational</span>
            </div>
            <button onClick={() => router.push('/')} className="flex items-center justify-center lg:justify-start gap-3 text-slate-400 hover:text-white text-xs font-bold transition-colors w-full p-2 hover:bg-white/5 rounded-lg">
                <LogOut size={16} /> <span className="hidden lg:block">退出系统</span>
            </button>
        </div>
      </aside>

      {/* === 主内容区 === */}
      <main className="flex-1 ml-20 lg:ml-64 transition-all duration-300">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-8 py-4 border-b border-slate-200 flex justify-between items-center">
           <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{getPageTitle(activeTab)}</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">ADMINISTRATOR_SESSION_ACTIVE</p>
           </div>
           <div className="flex items-center gap-4">
               {/* 顶部搜索框 (仅在部分Tab显示) */}
               {['posts', 'users'].includes(activeTab) && (
                   <div className="relative hidden md:block">
                       <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                         type="text" 
                         placeholder="快速搜索..." 
                         value={searchTerm}
                         onChange={e => setSearchTerm(e.target.value)}
                         className="bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-purple-200 outline-none"
                       />
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
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-8">
                        {/* 数据卡片 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard label="文章总数" value={stats.posts} color="bg-blue-500" icon={FileText} />
                            <StatCard label="注册用户" value={stats.users} color="bg-purple-500" icon={Users} />
                            <StatCard label="评论/反馈" value={stats.comments} color="bg-pink-500" icon={MessageSquare} />
                            <StatCard label="系统负载" value="正常" color="bg-green-500" icon={Activity} />
                        </div>

                        {/* 快捷入口 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Megaphone size={16}/> 发送全局广播</h3>
                                <div className="flex gap-2">
                                    <input 
                                        value={broadcastMsg}
                                        onChange={e => setBroadcastMsg(e.target.value)}
                                        placeholder="输入通知内容..." 
                                        className="flex-1 bg-slate-50 border-none rounded-xl px-4 text-sm"
                                    />
                                    <button onClick={sendBroadcast} className="bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-purple-600 transition-colors">发送</button>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
                                <Terminal className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32" />
                                <h3 className="font-bold mb-2">开发者日志</h3>
                                <div className="text-xs text-slate-400 font-mono space-y-1">
                                    <p>&gt; System init... OK</p>
                                    <p>&gt; Database connection... OK (Latency: 24ms)</p>
                                    <p>&gt; Storage usage: 12%</p>
                                    <p>&gt; All systems nominal.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 2. 内容管理 */}
                {activeTab === 'posts' && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase">
                                    <tr>
                                        <th className="p-5">文章标题 / ID</th>
                                        <th className="p-5">作者</th>
                                        <th className="p-5">状态</th>
                                        <th className="p-5 text-right">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-sm">
                                    {posts.filter(p => p.title?.includes(searchTerm) || p.content?.includes(searchTerm)).map(post => (
                                        <tr key={post.id} className="hover:bg-slate-50 group">
                                            <td className="p-5 max-w-md">
                                                <div className="font-bold text-slate-700 truncate">{post.title || post.content}</div>
                                                <div className="text-[10px] text-slate-400 mt-1 font-mono">ID: {post.id}</div>
                                            </td>
                                            <td className="p-5 text-slate-500">{post.profiles?.username || 'Unknown'}</td>
                                            <td className="p-5">
                                                <div className="flex gap-2">
                                                    {post.is_pinned && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px] font-bold">置顶</span>}
                                                    {!post.is_public && <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold">私密</span>}
                                                    {post.is_public && !post.is_pinned && <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded text-[10px] font-bold">正常</span>}
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

                {/* 3. 用户管理 */}
                {activeTab === 'users' && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase">
                                    <tr>
                                        <th className="p-5">用户 / 邮箱</th>
                                        <th className="p-5">角色</th>
                                        <th className="p-5">账号状态</th>
                                        <th className="p-5 text-right">管理操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-sm">
                                    {users.filter(u => u.username?.includes(searchTerm) || u.id.includes(searchTerm)).map(user => (
                                        <tr key={user.id} className="hover:bg-slate-50">
                                            <td className="p-5">
                                                <div className="font-bold text-slate-700">{user.username || 'Unset'}</div>
                                                <div className="text-xs text-slate-400 font-mono">{user.id}</div>
                                            </td>
                                            <td className="p-5">
                                                {user.is_admin ? <span className="text-purple-600 font-black text-xs flex items-center gap-1"><ShieldAlert size={12}/> ADMIN</span> : <span className="text-slate-500 text-xs">User</span>}
                                            </td>
                                            <td className="p-5">
                                                {user.is_banned 
                                                    ? <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-[10px] font-bold">已封禁</span>
                                                    : <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-[10px] font-bold">活跃</span>
                                                }
                                            </td>
                                            <td className="p-5 text-right flex justify-end gap-2">
                                                <button onClick={() => toggleBanUser(user.id, user.is_banned)} className={`p-2 rounded transition-colors ${user.is_banned ? 'text-green-500 bg-green-50' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`} title={user.is_banned ? '解封' : '封禁'}>
                                                    {user.is_banned ? <Unlock size={16}/> : <Lock size={16}/>}
                                                </button>
                                                <button onClick={() => toggleAdminUser(user.id, user.is_admin)} className="p-2 text-slate-300 hover:text-purple-500 hover:bg-purple-50 rounded" title="切换管理员权限">
                                                    <ShieldAlert size={16}/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* 4. 评论管理 */}
                {activeTab === 'comments' && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                        <div className="space-y-4">
                            {comments.map(comment => (
                                <div key={comment.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-start hover:shadow-md transition-shadow">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold text-slate-700">{comment.user_email}</span>
                                            <span className="text-slate-300 text-xs">•</span>
                                            <span className="text-slate-400 text-xs">评论于文章: {comment.posts?.title?.slice(0, 20)}...</span>
                                        </div>
                                        <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100 inline-block">{comment.content}</p>
                                    </div>
                                    <button onClick={() => deleteComment(comment.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors" title="删除评论">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* 5. 邀请码管理 */}
                {activeTab === 'invites' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <button onClick={generateCode} className="mb-6 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-purple-600 transition-colors">
                            <Plus size={16} /> 生成新邀请码
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {codes.map(code => (
                                <div key={code.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                                    <div>
                                        <div className="text-lg font-mono font-bold text-slate-800">{code.code}</div>
                                        <div className={`text-[10px] uppercase font-bold mt-1 ${code.is_used ? 'text-red-500' : 'text-green-500'}`}>{code.is_used ? '已使用' : '未使用'}</div>
                                    </div>
                                    <button onClick={() => {navigator.clipboard.writeText(code.code); alert('复制成功');}} className="text-slate-400 hover:text-purple-600"><Copy size={16}/></button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                 {/* 6. 系统设置 */}
                 {activeTab === 'system' && (
                    <div className="bg-white p-10 rounded-3xl text-center border border-slate-200">
                        <Settings size={48} className="mx-auto text-slate-200 mb-4" />
                        <h3 className="text-lg font-bold text-slate-700">系统维护模式</h3>
                        <p className="text-slate-400 text-sm mb-6">开启后，除管理员外所有用户将无法访问站点。</p>
                        <button disabled className="px-6 py-2 bg-slate-100 text-slate-400 rounded-full font-bold text-xs cursor-not-allowed">
                            功能开发中...
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
        <button onClick={onClick} className={`w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all relative group ${isActive ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <Icon size={18} />
            <span className="hidden lg:block">{label}</span>
            <div className="lg:hidden absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">{label}</div>
        </button>
    )
}

function StatCard({ label, value, color, icon: Icon }: any) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-md`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-2xl font-black text-slate-800">{value}</p>
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
         <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">403 FORBIDDEN</h1>
         <p className="text-red-500 font-mono text-sm border border-red-900 bg-red-900/20 px-4 py-2 rounded">
            ERROR: INSUFFICIENT_CLEARANCE_LEVEL
         </p>
      </div>
    )
}
