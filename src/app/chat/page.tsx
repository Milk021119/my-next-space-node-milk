'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import LoginModal from '@/components/LoginModal';
import { Send, Zap, Users, Terminal, Activity, Lock, Hash } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// --- 类型定义 ---
type Message = {
  id: number;
  content: string;
  user_id: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  } | null;
};

// 模拟在线用户 (Realtime Presence 比较复杂，这里先用假数据模拟氛围，后续可升级)
const ONLINE_USERS = [
  { id: '1', name: 'System', status: 'bot' },
  { id: '2', name: 'Ghost_In_Shell', status: 'online' },
  { id: '3', name: 'Neo', status: 'idle' },
];

export default function SignalTowerPage() {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [onlineCount, setOnlineCount] = useState(3);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 初始化
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    fetchHistory();
    const channel = subscribeToMessages();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // 1. 获取历史消息
  async function fetchHistory() {
    const { data } = await supabase
      .from('messages')
      .select(`
        *,
        profiles:user_id ( username, avatar_url )
      `)
      .order('created_at', { ascending: true })
      .limit(100);
    
    if (data) {
      setMessages(data as any);
      scrollToBottom();
    }
  }

  // 2. 订阅实时消息
  function subscribeToMessages() {
    return supabase.channel('signal_tower_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        // 当收到新消息ID时，我们需要重新获取它的完整信息（包括关联的 profiles）
        // 因为 payload.new 只有 content 和 user_id，没有 username
        const { data } = await supabase
          .from('messages')
          .select(`*, profiles:user_id ( username, avatar_url )`)
          .eq('id', payload.new.id)
          .single();
        
        if (data) {
          setMessages(prev => [...prev, data as any]);
          scrollToBottom();
        }
      })
      .subscribe();
  }

  // 3. 发送消息
  async function handleSend() {
    if (!newMessage.trim()) return;
    if (!user) {
      setIsLoginOpen(true);
      return;
    }

    const content = newMessage.trim();
    setNewMessage(''); // 立即清空，体验更好

    // 乐观更新 UI (先假装发送成功)
    const tempId = Date.now();
    const optimisticMsg: any = {
      id: tempId,
      content: content,
      user_id: user.id,
      created_at: new Date().toISOString(),
      profiles: {
        username: user.user_metadata?.username || user.email?.split('@')[0] || '我',
        avatar_url: user.user_metadata?.avatar_url || '/default-avatar.png'
      }
    };
    // 注意：这里其实可以不加 setMessages，因为 Realtime 很快就会推过来，
    // 但为了极致的跟手感，我们可以加，然后在 Realtime 收到真实数据时去重。
    // 这里为了简单，我们等待 Realtime 推送。
    
    await supabase.from('messages').insert({
      content,
      user_id: user.id
    });
  }

  function scrollToBottom() {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  }

  return (
    <div className="flex min-h-screen bg-[#0f1014] text-slate-300 font-mono selection:bg-green-500/30 selection:text-green-200 overflow-hidden">
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <Sidebar />

      {/* 主界面布局 */}
      <main className="flex-1 lg:ml-72 flex h-screen relative">
        
        {/* 背景装饰：扫描线 */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

        {/* --- 左侧 (移动端隐藏)：频道与在线列表 --- */}
        <div className="w-64 border-r border-white/5 bg-[#0f1014] flex-col hidden lg:flex z-10">
          {/* 顶部标题 */}
          <div className="h-16 border-b border-white/5 flex items-center px-6 gap-2">
            <Activity size={16} className="text-green-500 animate-pulse" />
            <span className="font-bold text-slate-100 tracking-wider text-xs">SIGNAL_TOWER</span>
          </div>

          {/* 频道列表 */}
          <div className="p-4 space-y-1">
            <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-2">频率</h3>
            <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded text-white text-xs font-bold cursor-pointer border-l-2 border-green-500">
              <Hash size={14} className="text-slate-500" />
              <span>公共频道</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-slate-500 text-xs font-bold cursor-not-allowed opacity-50">
              <Lock size={14} />
              <span>加密频道 (Lv.2)</span>
            </div>
          </div>

          {/* 在线用户 (模拟) */}
          <div className="mt-auto p-4 border-t border-white/5">
            <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 flex justify-between">
              <span>Online Nodes</span>
              <span className="text-green-500">{onlineCount}</span>
            </h3>
            <div className="space-y-3">
              {ONLINE_USERS.map(u => (
                <div key={u.id} className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                  <div className={`w-2 h-2 rounded-full ${u.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-600'}`} />
                  <span className="text-xs">{u.name}</span>
                </div>
              ))}
              {user && (
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                   <span className="text-xs text-green-400">{user.user_metadata?.username || 'Me'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- 中间：聊天主窗口 --- */}
        <div className="flex-1 flex flex-col relative z-10 bg-[#0f1014]/50 backdrop-blur-sm">
          
          {/* 顶部栏 */}
          <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0f1014]/80 backdrop-blur">
            <div className="flex items-center gap-3">
              <Hash size={20} className="text-slate-500" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white tracking-wide">公共频道</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Global Frequency // Open</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                LIVE
              </span>
            </div>
          </header>

          {/* 消息流 */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                <Terminal size={48} className="mb-4" />
                <p className="text-xs tracking-widest">NO SIGNAL RECEIVED</p>
                <p className="text-[10px] mt-2">Be the first to transmit.</p>
              </div>
            )}
            
            {messages.map((msg, i) => {
              const isMe = user?.id === msg.user_id;
              // 检查上一条消息是否是同一个人发的 (用于合并头像)
              const isSequence = i > 0 && messages[i-1].user_id === msg.user_id;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className={`flex gap-4 ${isSequence ? 'mt-1' : 'mt-4'} hover:bg-white/[0.02] p-2 rounded-lg transition-colors group`}
                >
                  {/* 头像列 */}
                  <div className="w-10 flex-shrink-0 flex flex-col items-center">
                    {!isSequence ? (
                      <div className="w-10 h-10 rounded bg-slate-800 border border-white/10 overflow-hidden">
                        <img src={msg.profiles?.avatar_url || '/default-avatar.png'} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ) : (
                      <div className="w-full text-[10px] text-slate-700 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {format(new Date(msg.created_at), 'mm:ss')}
                      </div>
                    )}
                  </div>

                  {/* 内容列 */}
                  <div className="flex-1 min-w-0">
                    {!isSequence && (
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className={`text-xs font-bold ${isMe ? 'text-green-400' : 'text-purple-400'} hover:underline cursor-pointer`}>
                          {msg.profiles?.username || 'Unknown_Unit'}
                        </span>
                        <span className="text-[10px] text-slate-600">
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </span>
                      </div>
                    )}
                    <p className={`text-sm leading-relaxed ${isMe ? 'text-slate-200' : 'text-slate-300'}`}>
                      {msg.content}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* 输入区域 */}
          <div className="p-4 lg:p-6 pb-6 bg-[#0f1014] z-20">
            <div className="relative flex items-center bg-[#1a1b21] border border-white/10 rounded-lg focus-within:border-green-500/50 focus-within:ring-1 focus-within:ring-green-500/20 transition-all">
              <div className="pl-4 text-slate-500">
                <Terminal size={16} />
              </div>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={user ? "Input command or message..." : "Login required to transmit..."}
                className="flex-1 bg-transparent border-none text-slate-200 text-sm px-4 py-3 focus:ring-0 placeholder:text-slate-600 font-mono"
              />
              <button 
                onClick={handleSend}
                disabled={!newMessage.trim()}
                className="mr-2 p-2 text-slate-500 hover:text-green-400 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="mt-2 text-[10px] text-slate-600 flex justify-between px-1">
              <span>Secure Connection: TLS_V1.3</span>
              <span>LAT: {Math.random().toFixed(4)} / LON: {Math.random().toFixed(4)}</span>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
