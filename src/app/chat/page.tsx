'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import LoginModal from '@/components/LoginModal';
import { Send, Terminal, Activity, Lock, Hash, Shield, Search, UserPlus, UserMinus, Users, Radio } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// --- 类型定义 ---
type Message = {
  id: number;
  content: string;
  user_id: string;
  created_at: string;
  profiles: { username: string; avatar_url: string } | null;
};

type Profile = {
  id: string;
  username: string;
  avatar_url: string;
  bio?: string;
};

// 频道数据
const CHANNELS = [
  { id: 'global', name: '公共频道', type: 'public', status: 'active' },
  { id: 'dev', name: '开发者日志', type: 'read-only', status: 'locked' },
  { id: 'vip', name: '加密频段', type: 'private', status: 'locked' },
];

export default function SignalTowerPage() {
  const [user, setUser] = useState<any>(null);
  
  // 聊天相关状态
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChannel, setActiveChannel] = useState('global');
  const scrollRef = useRef<HTMLDivElement>(null);

  // 社交相关状态
  const [socialTab, setSocialTab] = useState<'friends' | 'search'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<Profile[]>([]);
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchFriends(currentUser.id);
    });

    fetchHistory();
    const channel = subscribeToMessages();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchHistory() {
    const { data } = await supabase.from('messages').select(`*, profiles:user_id ( username, avatar_url )`).order('created_at', { ascending: true }).limit(100);
    if (data) { setMessages(data as any); scrollToBottom(); }
  }

  function subscribeToMessages() {
    return supabase.channel('signal_tower_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        const { data } = await supabase.from('messages').select(`*, profiles:user_id ( username, avatar_url )`).eq('id', payload.new.id).single();
        if (data) { setMessages(prev => [...prev, data as any]); scrollToBottom(); }
      })
      .subscribe();
  }

  async function handleSend() {
    if (!newMessage.trim()) return;
    if (!user) { setIsLoginOpen(true); return; }
    const content = newMessage.trim();
    setNewMessage('');
    try { await supabase.from('messages').insert({ content, user_id: user.id }); } 
    catch (err: any) { alert(`发送失败: ${err.message}`); }
  }

  async function fetchFriends(userId: string) {
    const { data } = await supabase.from('friends').select(`friend_id, profiles:friend_id ( id, username, avatar_url, bio )`).eq('user_id', userId);
    if (data) setFriends(data.map((f: any) => f.profiles));
  }

  async function handleSearchUsers(query: string) {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    const { data } = await supabase.from('profiles').select('*').ilike('username', `%${query}%`).limit(10);
    if (data) setSearchResults(data);
  }

  async function addFriend(targetId: string) {
    if (!user) return setIsLoginOpen(true);
    const { error } = await supabase.from('friends').insert({ user_id: user.id, friend_id: targetId });
    if (!error) { fetchFriends(user.id); alert("链路连接成功！"); } 
    else { alert("连接失败或已存在连接。"); }
  }

  function scrollToBottom() {
    setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 100);
  }

  const UserAvatar = ({ url, isMe, size = 'md' }: { url: string, isMe?: boolean, size?: 'sm'|'md'|'lg' }) => {
    const sizeClass = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
    return (
      <div className={`flex-shrink-0 ${sizeClass} rounded-lg border ${isMe ? 'border-cyan-500/50' : 'border-purple-500/50'} overflow-hidden bg-[#0b0d14] shadow-lg`}>
        <img src={url || '/default-avatar.png'} className="w-full h-full object-cover" />
      </div>
    );
  };

  return (
    <div className="flex min-h-screen text-slate-300 font-mono selection:bg-cyan-500/30 selection:text-cyan-200 overflow-hidden fixed inset-0 z-50" style={{ backgroundColor: '#0b0d14' }}>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <Sidebar />

      <main className="flex-1 lg:ml-72 flex h-screen relative w-full overflow-hidden">
        
        {/* === 左侧栏：频道控制 (xl:flex = 1280px以上显示) === */}
        <div className="w-64 border-r border-white/5 bg-[#080a10] flex-col hidden xl:flex z-20 flex-shrink-0">
          <div className="h-16 border-b border-white/5 flex items-center px-6 gap-2 bg-[#0b0d14]">
            <Activity size={16} className="text-cyan-500 animate-pulse" />
            <span className="font-bold text-slate-100 tracking-wider text-xs">SIGNAL_CONTROL</span>
          </div>
          <div className="p-4 space-y-6">
            <div>
              <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-3">可用频段</h3>
              <div className="space-y-1">
                {CHANNELS.map(channel => (
                  <div key={channel.id} onClick={() => channel.status === 'active' && setActiveChannel(channel.id)} className={`flex items-center justify-between px-3 py-3 rounded border transition-all cursor-pointer group ${activeChannel === channel.id ? 'bg-cyan-900/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'bg-transparent border-transparent hover:bg-white/5 text-slate-500 hover:text-slate-300'} ${channel.status === 'locked' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <div className="flex items-center gap-3">{channel.status === 'locked' ? <Lock size={14} /> : <Hash size={14} />}<span className="text-xs font-bold">{channel.name}</span></div>
                    {channel.status === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* === 中间栏：聊天主窗口 (Flex-1) === */}
        <div className="flex-1 flex flex-col relative bg-[#0b0d14]/80 backdrop-blur-sm min-w-0">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a2333] via-[#0b0d14] to-[#0b0d14] opacity-60"></div>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: [0.95, 1.0, 0.95] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="flex flex-col items-center justify-center z-0">
              <h1 className="text-[10vw] leading-none font-black text-[#1a1f2e] tracking-tighter whitespace-nowrap select-none">SOYMILK</h1>
            </motion.div>
          </div>

          <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0b0d14]/90 backdrop-blur z-20 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded text-cyan-500"><Hash size={18} /></div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white tracking-wide">公共频道</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Public Frequency</span>
              </div>
            </div>
            <div className="hidden sm:block text-[10px] text-cyan-500 font-mono border border-cyan-500/30 px-2 py-1 rounded bg-cyan-500/5">● 实时信号</div>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent z-10">
            {messages.length === 0 && <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-0"></div>}
            {messages.map((msg) => {
              const isMe = user?.id === msg.user_id;
              return (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {isMe ? (
                    <div className="flex gap-4 max-w-[85%] justify-end">
                      <div className="flex flex-col items-end min-w-0">
                        <div className="flex items-center gap-2 mb-1"><span className="text-[10px] text-slate-500 font-mono">{format(new Date(msg.created_at), 'HH:mm')}</span><span className="text-[10px] font-bold text-cyan-400">我</span></div>
                        <div className="relative px-4 py-3 rounded-2xl rounded-tr-none border text-sm leading-relaxed shadow-lg bg-cyan-900/20 border-cyan-500/30 text-cyan-50 text-left backdrop-blur-md break-all break-words whitespace-pre-wrap">{msg.content}</div>
                      </div>
                      <UserAvatar url={msg.profiles?.avatar_url || ''} isMe={true} />
                    </div>
                  ) : (
                    <div className="flex gap-4 max-w-[85%] justify-start">
                      <UserAvatar url={msg.profiles?.avatar_url || ''} isMe={false} />
                      <div className="flex flex-col items-start min-w-0">
                        <div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-bold text-purple-400">{msg.profiles?.username || '幽灵用户'}</span><span className="text-[10px] text-slate-500 font-mono">{format(new Date(msg.created_at), 'HH:mm')}</span></div>
                        <div className="relative px-4 py-3 rounded-2xl rounded-tl-none border text-sm leading-relaxed shadow-lg bg-purple-900/20 border-purple-500/30 text-slate-200 text-left backdrop-blur-md break-all break-words whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="p-4 bg-[#0b0d14] border-t border-white/10 z-20 flex-shrink-0">
            <div className="relative flex items-center bg-[#15171e] border border-white/10 rounded-xl focus-within:border-cyan-500 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all">
              <div className="pl-4 text-slate-500"><Terminal size={18} /></div>
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={user ? "输入指令序列..." : "需要建立连接..."} disabled={!user} className="flex-1 bg-transparent border-none text-white text-sm px-4 py-4 focus:ring-0 placeholder:text-slate-600 font-mono"/>
              <button onClick={handleSend} disabled={!newMessage.trim() || !user} className="mr-2 p-2 text-slate-500 hover:text-cyan-400 disabled:opacity-30 transition-colors"><Send size={18} /></button>
            </div>
          </div>
        </div>

        {/* === 右侧栏：社交枢纽 (lg:flex = 1024px以上显示) === */}
        {/* ✨ 修改点：这里改为 lg:flex，让它更容易出现 */}
        <div className="w-72 border-l border-white/5 bg-[#080a10] flex-col hidden lg:flex z-20 flex-shrink-0">
          <div className="h-16 border-b border-white/5 flex items-center justify-around px-2 bg-[#0b0d14]">
            <button onClick={() => setSocialTab('friends')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider text-center transition-colors border-b-2 ${socialTab === 'friends' ? 'text-cyan-400 border-cyan-500' : 'text-slate-600 border-transparent hover:text-slate-400'}`}>已连接</button>
            <button onClick={() => setSocialTab('search')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider text-center transition-colors border-b-2 ${socialTab === 'search' ? 'text-cyan-400 border-cyan-500' : 'text-slate-600 border-transparent hover:text-slate-400'}`}>雷达搜索</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {socialTab === 'friends' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest mb-2"><span>Connected Nodes</span><span>{friends.length}</span></div>
                {friends.length === 0 && <div className="text-center py-10 text-slate-600 text-xs"><Radio size={32} className="mx-auto mb-2 opacity-20" />暂无连接<br/>尝试使用雷达搜索</div>}
                {friends.map(friend => (
                  <div key={friend.id} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors cursor-pointer group">
                    <UserAvatar url={friend.avatar_url} size="sm" isMe={false} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-300 truncate group-hover:text-white">{friend.username}</div>
                      <div className="text-[10px] text-slate-600 truncate">{friend.bio || '无信号签名'}</div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_lime]"></div>
                  </div>
                ))}
              </div>
            )}

            {socialTab === 'search' && (
              <div className="space-y-4">
                <div className="relative">
                  <input type="text" placeholder="输入代号搜索..." className="w-full bg-[#15171e] border border-white/10 rounded p-2 pl-8 text-xs text-white focus:border-cyan-500 outline-none" value={searchQuery} onChange={(e) => handleSearchUsers(e.target.value)}/>
                  <Search size={14} className="absolute left-2.5 top-2.5 text-slate-500" />
                </div>
                <div className="space-y-2">
                  {searchResults.map(profile => (
                    <div key={profile.id} className="flex items-center gap-3 p-3 rounded border border-white/5 bg-white/[0.02] hover:border-cyan-500/30 transition-all">
                      <UserAvatar url={profile.avatar_url} size="sm" isMe={false} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-300">{profile.username}</div>
                        <div className="text-[10px] text-slate-600 truncate">{profile.id.slice(0, 8)}...</div>
                      </div>
                      <button onClick={() => addFriend(profile.id)} className="p-1.5 bg-cyan-900/30 text-cyan-400 rounded hover:bg-cyan-500 hover:text-white transition-colors" title="建立连接"><UserPlus size={16} /></button>
                    </div>
                  ))}
                  {searchQuery && searchResults.length === 0 && <div className="text-center text-[10px] text-slate-600 py-4">无目标信号</div>}
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-white/5 text-[10px] text-slate-600 font-mono text-center uppercase">Social Module V1.0</div>
        </div>

      </main>
    </div>
  );
}
