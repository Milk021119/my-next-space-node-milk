'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import LoginModal from '@/components/LoginModal';
import { Send, Hash, Shield, Search, UserPlus, MessageSquare, Check, CheckCheck, Loader2, Users, Radio } from 'lucide-react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/context/ToastContext';
import PageLayout from '@/components/PageLayout';
import type { Message } from '@/types';

// --- 类型定义 ---
type Profile = {
  id: string;
  username: string;
  avatar_url: string;
  bio?: string;
};

type Session = 
  | { type: 'global', id: 'global', name: '公共频道' }
  | { type: 'dm', id: string, user: Profile };

type MessageStatus = 'sending' | 'sent' | 'delivered';

interface ExtendedMessage extends Message {
  status?: MessageStatus;
  isOptimistic?: boolean;
}

// 格式化日期分隔符
function formatDateSeparator(date: Date): string {
  if (isToday(date)) return '今天';
  if (isYesterday(date)) return '昨天';
  return format(date, 'M月d日', { locale: zhCN });
}

export default function ChatPage() {
  const [user, setUser] = useState<any>(null);
  const toast = useToast();
  
  // 聊天状态
  const [activeSession, setActiveSession] = useState<Session>({ type: 'global', id: 'global', name: '公共频道' });
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [dmContacts, setDmContacts] = useState<Profile[]>([]); 
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  
  // 社交状态
  const [socialTab, setSocialTab] = useState<'friends' | 'search'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<Profile[]>([]);
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  // 在线状态
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  
  // 打字指示器
  const [typingUser, setTypingUser] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchFriends(currentUser.id);
        updatePresence(currentUser.id);
      }
    });
  }, []);

  // 在线状态追踪
  const updatePresence = useCallback(async (userId: string) => {
    const channel = supabase.channel('online-users');
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const online = new Set<string>();
        Object.values(state).forEach((presences: any) => {
          presences.forEach((p: any) => online.add(p.user_id));
        });
        setOnlineUsers(online);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: userId, online_at: new Date().toISOString() });
        }
      });

    return () => { supabase.removeChannel(channel); };
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
    const tempId = Date.now();

    if (activeSession.type === 'global') {
      const optimisticMsg: ExtendedMessage = {
        id: tempId, content, user_id: user.id, created_at: new Date().toISOString(),
        profiles: { username: user.user_metadata?.username || '我', avatar_url: user.user_metadata?.avatar_url },
        status: 'sending', isOptimistic: true
      };
      setMessages(prev => [...prev, optimisticMsg]);
      setNewMessage('');
      scrollToBottom();
      
      const { error } = await supabase.from('messages').insert({ content, user_id: user.id });
      if (error) {
        setMessages(prev => prev.filter(m => m.id !== tempId));
        toast.error('发送失败，请重试');
      }
    } 
    else if (activeSession.type === 'dm') {
      const targetId = activeSession.id;
      const { data: isFollower } = await supabase.from('friends').select('*').match({ user_id: targetId, friend_id: user.id }).single();
      const { data: hasReplied } = await supabase.from('direct_messages').select('id').match({ sender_id: targetId, recipient_id: user.id }).limit(1);

      if (!isFollower && (!hasReplied || hasReplied.length === 0)) {
        const { count } = await supabase.from('direct_messages').select('*', { count: 'exact', head: true }).match({ sender_id: user.id, recipient_id: targetId });
        if (count && count >= 1) {
          toast.warning("对方未回关，只能发送一条消息");
          return;
        }
      }

      const optimisticMsg: ExtendedMessage = {
        id: tempId, content, sender_id: user.id, created_at: new Date().toISOString(),
        profiles: { username: user.user_metadata?.username || '我', avatar_url: user.user_metadata?.avatar_url },
        status: 'sending', isOptimistic: true
      };
      setMessages(prev => [...prev, optimisticMsg]);
      setNewMessage('');
      scrollToBottom();
      
      const { error } = await supabase.from('direct_messages').insert({ content, sender_id: user.id, recipient_id: targetId });
      if (error) {
        setMessages(prev => prev.filter(m => m.id !== tempId));
        toast.error('发送失败，请重试');
      }
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
    if (!error) { fetchFriends(user.id); toast.success("已添加好友"); } else { toast.error("添加失败或已存在"); }
  }

  function openDm(friend: Profile) {
    if (!dmContacts.find(c => c.id === friend.id)) {
      setDmContacts(prev => [friend, ...prev]);
    }
    setActiveSession({ type: 'dm', id: friend.id, user: friend });
    setUnreadCounts(prev => ({ ...prev, [friend.id]: 0 }));
  }

  function scrollToBottom() {
    setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 100);
  }

  // 头像组件
  const UserAvatar = ({ url, isOnline, size = 'md' }: { url: string, isOnline?: boolean, size?: 'sm'|'md' }) => {
    const sizeMap = { sm: 'w-8 h-8', md: 'w-10 h-10' };
    return (
      <div className={`relative flex-shrink-0 ${sizeMap[size]} rounded-full overflow-hidden bg-[var(--bg-tertiary)] border-2 border-[var(--border-color)]`}>
        <img src={url || '/default-avatar.png'} className="w-full h-full object-cover" alt="" />
        {isOnline !== undefined && (
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--bg-card)] ${isOnline ? 'bg-green-500' : 'bg-slate-400'}`} />
        )}
      </div>
    );
  };

  // 消息状态图标
  const MessageStatusIcon = ({ status }: { status?: MessageStatus }) => {
    if (!status) return null;
    switch (status) {
      case 'sending': return <Loader2 size={12} className="animate-spin text-[var(--text-muted)]" />;
      case 'sent': return <Check size={12} className="text-[var(--text-muted)]" />;
      case 'delivered': return <CheckCheck size={12} className="text-[var(--accent-color)]" />;
      default: return null;
    }
  };

  // 渲染消息列表
  const renderMessages = () => {
    const elements: React.ReactNode[] = [];
    let lastDate: Date | null = null;

    messages.forEach((msg) => {
      const msgDate = new Date(msg.created_at);
      
      if (!lastDate || !isSameDay(lastDate, msgDate)) {
        elements.push(
          <div key={`date-${msg.id}`} className="flex items-center justify-center my-6">
            <div className="px-4 py-1.5 bg-[var(--bg-secondary)] rounded-full text-[11px] text-[var(--text-muted)] font-medium border border-[var(--border-color)]">
              {formatDateSeparator(msgDate)}
            </div>
          </div>
        );
        lastDate = msgDate;
      }

      const msgSenderId = msg.user_id || msg.sender_id;
      const isMe = user?.id === msgSenderId;
      
      elements.push(
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: msg.isOptimistic && msg.status === 'sending' ? 0.7 : 1, y: 0 }} 
          key={msg.id} 
          className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
        >
          {isMe ? (
            <div className="flex gap-3 max-w-[80%]">
              <div className="flex flex-col items-end min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <MessageStatusIcon status={msg.status} />
                  <span className="text-[10px] text-[var(--text-muted)]">{format(msgDate, 'HH:mm')}</span>
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-[var(--accent-color)] text-white text-sm leading-relaxed shadow-sm break-all whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
              <UserAvatar url={user?.user_metadata?.avatar_url || ''} />
            </div>
          ) : (
            <div className="flex gap-3 max-w-[80%]">
              <UserAvatar url={msg.profiles?.avatar_url || ''} />
              <div className="flex flex-col items-start min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-semibold text-[var(--text-primary)]">{msg.profiles?.username || '未知用户'}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{format(msgDate, 'HH:mm')}</span>
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm leading-relaxed shadow-sm break-all whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      );
    });

    return elements;
  };


  return (
    <PageLayout maxWidth="full" className="py-8 lg:py-12">
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Radio size={20} className="text-[var(--accent-color)]" />
          <h1 className="text-3xl lg:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            聊天室
          </h1>
          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            在线
          </span>
        </div>
        <p className="text-[var(--text-secondary)]">与社区成员实时交流</p>
      </motion.div>

      {/* 主体布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-280px)] min-h-[500px]">
        
        {/* 左侧：频道和私信列表 */}
        <div className="lg:col-span-1 bg-[var(--bg-card)] backdrop-blur-xl rounded-2xl border border-[var(--border-color)] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[var(--border-color)]">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">频道</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {/* 公共频道 */}
            <button
              onClick={() => setActiveSession({ type: 'global', id: 'global', name: '公共频道' })}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeSession.type === 'global' 
                  ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)] border border-[var(--accent-color)]/30' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              <Hash size={16} />
              <span className="text-sm font-medium">公共频道</span>
            </button>

            {/* 私信分隔 */}
            {dmContacts.length > 0 && (
              <>
                <div className="pt-4 pb-2">
                  <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider px-3 flex items-center justify-between">
                    <span>私信</span>
                    <span className="text-[var(--accent-color)]">{dmContacts.length}</span>
                  </h3>
                </div>
                {dmContacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => openDm(contact)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      activeSession.type === 'dm' && activeSession.id === contact.id
                        ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)] border border-[var(--accent-color)]/30'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    <UserAvatar url={contact.avatar_url} size="sm" isOnline={onlineUsers.has(contact.id)} />
                    <span className="text-sm font-medium truncate flex-1 text-left">{contact.username}</span>
                    {unreadCounts[contact.id] > 0 && (
                      <span className="px-1.5 py-0.5 bg-[var(--accent-color)] text-white text-[10px] rounded-full min-w-[18px] text-center font-bold">
                        {unreadCounts[contact.id]}
                      </span>
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* 中间：聊天区域 */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] backdrop-blur-xl rounded-2xl border border-[var(--border-color)] overflow-hidden flex flex-col">
          {/* 聊天头部 */}
          <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeSession.type === 'global' ? (
                <>
                  <div className="p-2 bg-[var(--accent-color)]/10 rounded-lg">
                    <Hash size={18} className="text-[var(--accent-color)]" />
                  </div>
                  <div>
                    <h2 className="font-bold text-[var(--text-primary)]">公共频道</h2>
                    <p className="text-[10px] text-[var(--text-muted)]">所有人可见</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Shield size={18} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                      {activeSession.user?.username}
                      {onlineUsers.has(activeSession.id) && (
                        <span className="text-[10px] text-green-500 font-normal">在线</span>
                      )}
                    </h2>
                    <p className="text-[10px] text-[var(--text-muted)]">私密对话</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 消息列表 */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)]">
                <MessageSquare size={48} className="mb-4 opacity-30" />
                <p className="text-sm">暂无消息，发送第一条吧~</p>
              </div>
            ) : (
              renderMessages()
            )}
            
            {/* 打字指示器 */}
            {typingUser && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-[var(--text-muted)] text-xs"
              >
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>{typingUser} 正在输入...</span>
              </motion.div>
            )}
          </div>

          {/* 输入框 */}
          <div className="p-4 border-t border-[var(--border-color)]">
            <div className="flex items-center gap-3 bg-[var(--bg-secondary)] rounded-xl px-4 py-2 border border-[var(--border-color)] focus-within:border-[var(--accent-color)] transition-colors">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={user ? (activeSession.type === 'global' ? "发送消息..." : `私信 ${activeSession.user?.username}...`) : "请先登录..."}
                disabled={!user}
                className="flex-1 bg-transparent outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim() || !user}
                className="p-2 bg-[var(--accent-color)] text-white rounded-lg hover:opacity-90 disabled:opacity-30 transition-all"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* 右侧：好友列表 */}
        <div className="lg:col-span-1 bg-[var(--bg-card)] backdrop-blur-xl rounded-2xl border border-[var(--border-color)] overflow-hidden flex flex-col">
          {/* Tab 切换 */}
          <div className="flex border-b border-[var(--border-color)]">
            <button
              onClick={() => setSocialTab('friends')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                socialTab === 'friends' 
                  ? 'text-[var(--accent-color)] border-b-2 border-[var(--accent-color)]' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              <Users size={14} className="inline mr-1" /> 好友
            </button>
            <button
              onClick={() => setSocialTab('search')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                socialTab === 'search' 
                  ? 'text-[var(--accent-color)] border-b-2 border-[var(--accent-color)]' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              <Search size={14} className="inline mr-1" /> 搜索
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {socialTab === 'friends' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] uppercase tracking-wider px-2 mb-3">
                  <span>好友列表</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    {Array.from(onlineUsers).filter(id => friends.some(f => f.id === id)).length} 在线
                  </span>
                </div>
                
                {friends.length === 0 ? (
                  <div className="text-center py-10 text-[var(--text-muted)] text-xs">
                    <Users size={32} className="mx-auto mb-3 opacity-30" />
                    <p>暂无好友</p>
                    <p className="mt-1 text-[10px]">去搜索添加吧~</p>
                  </div>
                ) : (
                  friends.map(friend => (
                    <button
                      key={friend.id}
                      onClick={() => openDm(friend)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors group"
                    >
                      <UserAvatar url={friend.avatar_url} size="sm" isOnline={onlineUsers.has(friend.id)} />
                      <div className="flex-1 min-w-0 text-left">
                        <div className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--accent-color)] transition-colors">
                          {friend.username}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)]">
                          {onlineUsers.has(friend.id) ? '在线' : '离线'}
                        </div>
                      </div>
                      <MessageSquare size={14} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))
                )}
              </div>
            )}

            {socialTab === 'search' && (
              <div className="space-y-4">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    placeholder="搜索用户..."
                    value={searchQuery}
                    onChange={(e) => handleSearchUsers(e.target.value)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl py-2.5 pl-9 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent-color)] transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  {searchResults.map(profile => (
                    <div key={profile.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                      <UserAvatar url={profile.avatar_url} size="sm" isOnline={onlineUsers.has(profile.id)} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[var(--text-primary)] truncate">{profile.username}</div>
                        <div className="text-[10px] text-[var(--text-muted)] truncate">{profile.id.slice(0, 8)}...</div>
                      </div>
                      <button
                        onClick={() => addFriend(profile.id)}
                        className="p-2 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-lg hover:bg-[var(--accent-color)] hover:text-white transition-colors"
                        title="添加好友"
                      >
                        <UserPlus size={14} />
                      </button>
                    </div>
                  ))}
                  {searchQuery && searchResults.length === 0 && (
                    <div className="text-center text-[var(--text-muted)] text-xs py-8">
                      未找到用户
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
