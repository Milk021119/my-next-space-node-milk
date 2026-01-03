'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import LoginModal from '@/components/LoginModal';
import { Send, Terminal, Activity, Lock, Hash, Shield, Search, UserPlus, MessageSquare, AlertTriangle, Users } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// --- 类型定义 ---
type Message = {
  id: number;
  content: string;
  user_id?: string;
  sender_id?: string;
  created_at: string;
  profiles: { username: string; avatar_url: string } | null;
};

type Profile = {
  id: string;
  username: string;
  avatar_url: string;
  bio?: string;
};

type Session = 
  | { type: 'global', id: 'global', name: '公共频道' }
  | { type: 'dm', id: string, user: Profile };

const CHANNELS = [
  { id: 'global', name: '公共频道', type: 'public', status: 'active' },
  { id: 'dev', name: '开发者日志', type: 'read-only', status: 'locked' },
];

export default function SignalTowerPage() {
  const [user, setUser] = useState<any>(null);
  
  // 聊天状态
  const [activeSession, setActiveSession] = useState<Session>({ type: 'global', id: 'global', name: '公共频道' });
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [dmContacts, setDmContacts] = useState<Profile[]>([]); 
  
  // 社交状态
  const [socialTab, setSocialTab] = useState<'friends' | 'search'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<Profile[]>([]);
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchFriends(currentUser.id);
      }
    });
  }, []);

  // 监听会话切换
  useEffect(() => {
    setMessages([]); 
    let channel: any;

    if (activeSession.type === 'global') {
      fetchGlobalHistory();
      channel = subscribeToGlobal();
    } else {
      fetchDmHistory(activeSession.id);
      channel = subscribeToDm();
    }

    return () => { if (channel) supabase.removeChannel(channel); };
  }, [activeSession, user]);

  // --- API ---

  async function fetchGlobalHistory() {
    const { data } = await supabase.from('messages').select(`*, profiles:user_id ( username, avatar_url )`).order('created_at', { ascending: true }).limit(100);
    if (data) { setMessages(data as any); scrollToBottom(); }
  }

  async function fetchDmHistory(targetId: string) {
    if (!user) return;
    const { data } = await supabase.from('direct_messages')
      .select(`*, profiles:sender_id ( username, avatar_url )`)
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${targetId}),and(sender_id.eq.${targetId},recipient_id.eq.${user.id})`)
      .order('created_at', { ascending: true }).limit(100);
    if (data) { setMessages(data as any); scrollToBottom(); }
  }

  function subscribeToGlobal() {
    return supabase.channel('global_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        const { data } = await supabase.from('messages').select(`*, profiles:user_id ( username, avatar_url )`).eq('id', payload.new.id).single();
        if (data) { setMessages(prev => [...prev, data as any]); scrollToBottom(); }
      })
      .subscribe();
  }

  function subscribeToDm() {
    if (!user) return;
    return supabase.channel('dm_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, async (payload) => {
        const msg = payload.new;
        if ((activeSession.type === 'dm') && ((msg.sender_id === user.id && msg.recipient_id === activeSession.id) || (msg.sender_id === activeSession.id && msg.recipient_id === user.id))) {
          const { data } = await supabase.from('direct_messages').select(`*, profiles:sender_id ( username, avatar_url )`).eq('id', msg.id).single();
          if (data) { setMessages(prev => [...prev, data as any]); scrollToBottom(); }
        }
      })
      .subscribe();
  }

  async function handleSend() {
    if (!newMessage.trim()) return;
    if (!user) { setIsLoginOpen(true); return; }
    
    const content = newMessage.trim();

    if (activeSession.type === 'global') {
      setNewMessage('');
      await supabase.from('messages').insert({ content, user_id: user.id });
    } 
    else if (activeSession.type === 'dm') {
      const targetId = activeSession.id;
      // 单向限制逻辑
      const { data: isFollower } = await supabase.from('friends').select('*').match({ user_id: targetId, friend_id: user.id }).single();
      const { data: hasReplied } = await supabase.from('direct_messages').select('id').match({ sender_id: targetId, recipient_id: user.id }).limit(1);

      if (!isFollower && (!hasReplied || hasReplied.length === 0)) {
        const { count } = await supabase.from('direct_messages').select('*', { count: 'exact', head: true }).match({ sender_id: user.id, recipient_id: targetId });
        if (count && count >= 1) {
          alert("🚫 信号拦截：对方未回关，只能发送一条握手信息。");
          return;
        }
      }

      setNewMessage('');
      const optimisticMsg: any = {
        id: Date.now(), content, sender_id: user.id, created_at: new Date().toISOString(),
        profiles: { username: user.user_metadata?.username || '我', avatar_url: user.user_metadata?.avatar_url }
      };
      setMessages(prev => [...prev, optimisticMsg]); scrollToBottom();
      await supabase.from('direct_messages').insert({ content, sender_id: user.id, recipient_id: targetId });
    }
  }

  async function fetchFriends(userId: string) {
    const { data } = await supabase.from('friends').select(`friend_id, profiles:friend_id ( id, username, avatar_url, bio )`).eq('user_id', userId);
    if (data) setFriends(data.map((f: any) => f.profiles));
  }

  async function handleSearchUsers(query: string) {
    setSearchQuery(query);
    if (query.length < 1) { setSearchResults([]); return; }
    const { data } = await supabase.from('profiles').select('*').or(`username.ilike.%${query}%,email.ilike.%${query}%`).limit(10);
    if (data) setSearchResults(data);
  }

  async function addFriend(targetId: string) {
    if (!user) return setIsLoginOpen(true);
    const { error } = await supabase.from('friends').insert({ user_id: user.id, friend_id: targetId });
    if (!error) { fetchFriends(user.id); alert("信号链路已建立！"); } else { alert("连接失败或已存在。"); }
  }

  function openDm(friend: Profile) {
    if (!dmContacts.find(c => c.id === friend.id)) {
      setDmContacts(prev => [friend, ...prev]);
    }
    setActiveSession({ type: 'dm', id: friend.id, user: friend });
  }

  function scrollToBottom() {
    setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 100);
  }

  const UserAvatar = ({ url, isMe, size = 'md' }: { url: string, isMe?: boolean, size?: 'sm'|'md'|'lg' }) => {
    const sizeMap = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12' };
    return (
      <div className={`flex-shrink-0 ${sizeMap[size]} rounded-lg border ${isMe ? 'border-cyan-500/50' : 'border-purple-500/50'} overflow-hidden bg-[#0b0d14] shadow-lg relative z-10`}>
        <img src={url || '/default-avatar.png'} className="w-full h-full object-cover" />
      </div>
    );
  };

  return (
    <div className="flex min-h-screen text-slate-300 font-mono selection:bg-cyan-500/30 selection:text-cyan-200 overflow-hidden fixed inset-0 z-50" style={{ backgroundColor: '#0b0d14' }}>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <Sidebar />

      <main className="flex-1 lg:ml-72 flex h-screen relative w-full overflow-hidden">
        
        {/* === 左侧栏 === */}
        {/* ✅ 修复点：hidden md:flex (屏幕>768px 即显示) */}
        <div className="w-64 border-r border-white/5 bg-[#080a10] flex-col hidden md:flex z-20 flex-shrink-0">
          <div className="h-16 border-b border-white/5 flex items-center px-6 gap-2 bg-[#0b0d14]">
            <Activity size={16} className="text-cyan-500 animate-pulse" />
            <span className="font-bold text-slate-100 tracking-wider text-xs">SIGNAL_CONTROL</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-2">广播频段</h3>
              <div className="space-y-1">
                {CHANNELS.map(channel => (
                  <div key={channel.id} onClick={() => channel.status === 'active' && setActiveSession({ type: 'global', id: 'global', name: '公共频道' })} className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-all ${activeSession.type === 'global' && activeSession.id === channel.id ? 'bg-cyan-900/20 text-cyan-400 border-l-2 border-cyan-500' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'} ${channel.status === 'locked' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {channel.status === 'locked' ? <Lock size={14} /> : <Hash size={14} />}
                    <span className="text-xs font-bold">{channel.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ✅ 私信列表 (即使为空也渲染标题，方便确认存在) */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-2 flex justify-between">
                <span>加密通信</span>
                <span className="text-purple-500">{dmContacts.length}</span>
              </h3>
              <div className="space-y-1">
                {dmContacts.map(contact => (
                  <div key={contact.id} onClick={() => setActiveSession({ type: 'dm', id: contact.id, user: contact })} className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-all ${activeSession.type === 'dm' && activeSession.id === contact.id ? 'bg-purple-900/20 text-purple-400 border-l-2 border-purple-500' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
                    <UserAvatar url={contact.avatar_url} size="sm" isMe={false} />
                    <span className="text-xs font-bold truncate">{contact.username}</span>
                  </div>
                ))}
                {dmContacts.length === 0 && <p className="px-2 text-[10px] text-slate-700 italic">在右侧选择好友...</p>}
              </div>
            </div>
          </div>
        </div>

        {/* === 中间栏 === */}
        <div className="flex-1 flex flex-col relative bg-[#0b0d14]/80 backdrop-blur-sm min-w-0">
          {/* 背景 Logo */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a2333] via-[#0b0d14] to-[#0b0d14] opacity-60"></div>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: [0.95, 1.0, 0.95] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="flex flex-col items-center justify-center z-0">
              <h1 className="text-[10vw] leading-none font-black text-[#1a1f2e] tracking-tighter whitespace-nowrap select-none">SOYMILK</h1>
            </motion.div>
          </div>

          <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0b0d14]/90 backdrop-blur z-20 flex-shrink-0">
            <div className="flex items-center gap-3">
              {activeSession.type === 'global' ? (
                <>
                  <div className="p-2 bg-cyan-500/10 rounded text-cyan-500"><Hash size={18} /></div>
                  <div className="flex flex-col"><span className="text-sm font-bold text-white tracking-wide">公共频道</span><span className="text-[10px] text-slate-500 uppercase tracking-widest">Public Frequency</span></div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-purple-500/10 rounded text-purple-500"><Shield size={18} /></div>
                  <div className="flex flex-col"><span className="text-sm font-bold text-white tracking-wide flex items-center gap-2">{activeSession.user?.username} <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px]">加密</span></span><span className="text-[10px] text-slate-500 uppercase tracking-widest">End-to-End Link</span></div>
                </>
              )}
            </div>
            <div className="hidden sm:block text-[10px] text-cyan-500 font-mono border border-cyan-500/30 px-2 py-1 rounded bg-cyan-500/5">● 信号正常</div>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent z-10">
            {messages.length === 0 && <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-50"><Terminal size={48} className="mb-4" /><p className="text-xs tracking-widest">等待信号输入...</p></div>}
            {messages.map((msg) => {
              const msgSenderId = msg.user_id || msg.sender_id;
              const isMe = user?.id === msgSenderId;
              return (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {isMe ? (
                    <div className="flex gap-4 max-w-[85%] justify-end">
                      <div className="flex flex-col items-end min-w-0">
                        <div className="flex items-center gap-2 mb-1"><span className="text-[10px] text-slate-500 font-mono">{format(new Date(msg.created_at), 'HH:mm')}</span><span className="text-[10px] font-bold text-cyan-400">我</span></div>
                        <div className="relative px-4 py-3 rounded-2xl rounded-tr-none border text-sm leading-relaxed shadow-lg bg-cyan-900/20 border-cyan-500/30 text-cyan-50 text-left backdrop-blur-md break-all break-words whitespace-pre-wrap">{msg.content}</div>
                      </div>
                      <UserAvatar url={user?.user_metadata?.avatar_url || ''} isMe={true} />
                    </div>
                  ) : (
                    <div className="flex gap-4 max-w-[85%] justify-start">
                      <UserAvatar url={msg.profiles?.avatar_url || ''} isMe={false} />
                      <div className="flex flex-col items-start min-w-0">
                        <div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-bold text-purple-400">{msg.profiles?.username || '未知用户'}</span><span className="text-[10px] text-slate-500 font-mono">{format(new Date(msg.created_at), 'HH:mm')}</span></div>
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
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={user ? (activeSession.type === 'global' ? "发送全域广播..." : `私信 @${activeSession.user.username}...`) : "需要身份验证..."} disabled={!user} className="flex-1 bg-transparent border-none text-white text-sm px-4 py-4 focus:ring-0 placeholder:text-slate-600 font-mono"/>
              <button onClick={handleSend} disabled={!newMessage.trim() || !user} className="mr-2 p-2 text-slate-500 hover:text-cyan-400 disabled:opacity-30 transition-colors"><Send size={18} /></button>
            </div>
          </div>
        </div>

        {/* === 右侧栏 === */}
        {/* ✅ 修复点：hidden md:flex (与左侧栏一致，768px+显示) */}
        <div className="w-72 border-l border-white/5 bg-[#080a10] flex-col hidden md:flex z-20 flex-shrink-0">
          <div className="h-16 border-b border-white/5 flex items-center justify-around px-2 bg-[#0b0d14]">
            <button onClick={() => setSocialTab('friends')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider text-center transition-colors border-b-2 ${socialTab === 'friends' ? 'text-cyan-400 border-cyan-500' : 'text-slate-600 border-transparent hover:text-slate-400'}`}>已连接</button>
            <button onClick={() => setSocialTab('search')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider text-center transition-colors border-b-2 ${socialTab === 'search' ? 'text-cyan-400 border-cyan-500' : 'text-slate-600 border-transparent hover:text-slate-400'}`}>雷达搜索</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {socialTab === 'friends' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest mb-2"><span>Connected Nodes</span><span>{friends.length}</span></div>
                {friends.length === 0 && <div className="text-center py-10 text-slate-600 text-xs opacity-50">暂无连接<br/>等待信号握手...</div>}
                {friends.map(friend => (
                  // ✅ 私聊入口：点击好友 -> 触发 openDm
                  <div key={friend.id} onClick={() => openDm(friend)} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors cursor-pointer group border border-transparent hover:border-white/10">
                    <UserAvatar url={friend.avatar_url} size="sm" isMe={false} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-300 truncate group-hover:text-white">{friend.username}</div>
                      <div className="text-[10px] text-slate-600 truncate flex items-center gap-1"><span className="w-1 h-1 bg-green-500 rounded-full"></span> 信号稳定</div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-500"><MessageSquare size={14} /></div>
                  </div>
                ))}
              </div>
            )}

            {socialTab === 'search' && (
              <div className="space-y-4">
                <div className="relative">
                  <input type="text" placeholder="用户名 / 邮箱" className="w-full bg-[#15171e] border border-white/10 rounded p-2 pl-9 text-xs text-white focus:border-cyan-500 outline-none" value={searchQuery} onChange={(e) => handleSearchUsers(e.target.value)}/>
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
                <div className="space-y-2">
                  {searchResults.map(profile => (
                    <div key={profile.id} className="flex items-center gap-3 p-3 rounded border border-white/5 bg-white/[0.02] hover:border-cyan-500/30 transition-all">
                      <UserAvatar url={profile.avatar_url} size="sm" isMe={false} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-300">{profile.username}</div>
                        <div className="text-[10px] text-slate-600 truncate">{profile.id.slice(0, 8)}...</div>
                      </div>
                      <button onClick={() => addFriend(profile.id)} className="p-1.5 bg-cyan-900/30 text-cyan-400 rounded hover:bg-cyan-500 hover:text-white transition-colors" title="发起握手"><UserPlus size={16} /></button>
                    </div>
                  ))}
                  {searchQuery && searchResults.length === 0 && <div className="text-center text-[10px] text-slate-600 py-4">无信号响应</div>}
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-white/5 text-[10px] text-slate-600 font-mono text-center uppercase">Social Module V2.0</div>
        </div>

      </main>
    </div>
  );
}
