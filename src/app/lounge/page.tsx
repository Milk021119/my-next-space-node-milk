"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import LoginModal from '@/components/LoginModal';
import { Send, Zap, Users, Hash, Lock } from 'lucide-react';
import { format } from 'date-fns';

// --- 类型定义 ---
type ChatMode = 'global' | 'private';
interface ChatUser { id: string; email: string; }

export default function LoungePage() {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  // ✨ 新增状态：聊天模式 & 私聊对象
  const [activeMode, setActiveMode] = useState<ChatMode>('global');
  const [targetUser, setTargetUser] = useState<ChatUser | null>(null); // 当前正在私聊的人
  const [recentContacts, setRecentContacts] = useState<ChatUser[]>([]); // 最近联系人列表

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchContacts(session.user.id);
    });
  }, []);

  // 监听模式切换，加载对应消息
  useEffect(() => {
    if (!user) return;
    setMessages([]); // 切换时先清空，避免闪烁
    if (activeMode === 'global') {
      fetchGlobalHistory();
      subscribeGlobal();
    } else if (activeMode === 'private' && targetUser) {
      fetchPrivateHistory(targetUser.id);
      subscribePrivate();
    }
  }, [activeMode, targetUser, user]);

  // --- 1. 获取联系人 (从公共聊天记录里抓取“活跃用户”作为演示) ---
  // 在正式项目中，你可能需要一个真正的 friends 表
  async function fetchContacts(myId: string) {
    // 这里简单粗暴：从公共消息里找最近发言的10个人作为“联系人”
    const { data } = await supabase.from('messages').select('user_id, user_email').limit(50).order('created_at', { ascending: false });
    if (data) {
      const uniqueUsers = new Map();
      data.forEach(msg => {
        if (msg.user_id !== myId && !uniqueUsers.has(msg.user_id)) {
          uniqueUsers.set(msg.user_id, { id: msg.user_id, email: msg.user_email });
        }
      });
      setRecentContacts(Array.from(uniqueUsers.values()));
    }
  }

  // --- 2. 消息获取 ---
  async function fetchGlobalHistory() {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true }).limit(50);
    if (data) { setMessages(data); scrollToBottom(); }
  }

  async function fetchPrivateHistory(targetId: string) {
    // 获取 我发给TA 或 TA发给我 的消息
    const { data } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${targetId}),and(sender_id.eq.${targetId},recipient_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
      .limit(50);
    if (data) { setMessages(data); scrollToBottom(); }
  }

  // --- 3. 实时订阅 ---
  let realtimeChannel: any = null;

  function subscribeGlobal() {
    if (realtimeChannel) supabase.removeChannel(realtimeChannel);
    realtimeChannel = supabase.channel('global_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
        scrollToBottom();
      })
      .subscribe();
  }

  function subscribePrivate() {
    if (realtimeChannel) supabase.removeChannel(realtimeChannel);
    // 监听 direct_messages 表
    realtimeChannel = supabase.channel('private_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, (payload) => {
        const msg = payload.new;
        // 只有当消息属于当前对话 (我发的 或者 对方发给我的) 时才显示
        if (
          (msg.sender_id === user.id && msg.recipient_id === targetUser?.id) || 
          (msg.sender_id === targetUser?.id && msg.recipient_id === user.id)
        ) {
          setMessages(prev => [...prev, msg]);
          scrollToBottom();
        }
      })
      .subscribe();
  }

  // --- 4. 发送消息 ---
  async function handleSend() {
    if (!newMessage.trim() || !user) return;
    const content = newMessage;
    setNewMessage('');

    if (activeMode === 'global') {
      await supabase.from('messages').insert([{ content, user_id: user.id, user_email: user.email }]);
    } else if (activeMode === 'private' && targetUser) {
      // 乐观更新：私聊为了体验，可以先手动推入数组(Realtime有时候有延迟)
      const optimisticMsg = {
        id: Date.now(), sender_id: user.id, recipient_id: targetUser.id, 
        sender_email: user.email, content, created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, optimisticMsg]);
      scrollToBottom();

      await supabase.from('direct_messages').insert([{ 
        content, sender_id: user.id, recipient_id: targetUser.id, sender_email: user.email 
      }]);
    }
  }

  function scrollToBottom() {
    setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 100);
  }

  // ✨ 点击用户头像开启私聊
  function startPrivateChat(contact: ChatUser) {
    setTargetUser(contact);
    setActiveMode('private');
  }

  return (
    <div className="flex min-h-screen bg-[#1a1b26] text-white font-mono selection:bg-purple-500 selection:text-white">
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <Sidebar />

      {/* 左右分栏布局 */}
      <main className="flex-1 lg:ml-80 flex h-screen relative overflow-hidden">
        
        {/* 左侧：频道列表 (在移动端可能需要隐藏，这里暂做桌面端适配) */}
        <div className="w-64 bg-[#16161e] border-r border-white/5 flex-col hidden md:flex">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Channels</h2>
            
            {/* 公共频道 */}
            <button 
              onClick={() => { setActiveMode('global'); setTargetUser(null); }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all ${activeMode === 'global' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-slate-400 hover:bg-white/5'}`}
            >
              <Hash size={16} /> <span>Global Lounge</span>
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Direct Messages</h2>
            <div className="space-y-2">
              {recentContacts.map(contact => (
                <button 
                  key={contact.id}
                  onClick={() => startPrivateChat(contact)}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl text-sm transition-all ${targetUser?.id === contact.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <div className="relative">
                    <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${contact.email}`} className="w-8 h-8 rounded-lg bg-slate-700" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#16161e]"></div>
                  </div>
                  <span className="truncate">{contact.email.split('@')[0]}</span>
                </button>
              ))}
              {recentContacts.length === 0 && <p className="text-[10px] text-slate-600 italic">No recent contacts.</p>}
            </div>
          </div>
        </div>

        {/* 右侧：聊天窗口 */}
        <div className="flex-1 flex flex-col bg-[#1a1b26] relative">
          {/* 背景网格 */}
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

          {/* 顶部标题 */}
          <header className="p-6 border-b border-white/5 bg-[#1a1b26]/90 backdrop-blur z-10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {activeMode === 'global' ? (
                <div className="p-2 bg-green-500/20 rounded-lg text-green-400 animate-pulse"><Zap size={20} /></div>
              ) : (
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Lock size={20} /></div>
              )}
              <div>
                <h1 className="text-xl font-black tracking-widest text-white">
                  {activeMode === 'global' ? 'THE LOUNGE' : `DM: ${targetUser?.email.split('@')[0]}`}
                </h1>
                <p className="text-[10px] text-slate-400 uppercase">
                  {activeMode === 'global' ? 'Public Frequency' : 'Encrypted Signal'}
                </p>
              </div>
            </div>
          </header>

          {/* 消息列表 */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 z-10 scroll-smooth">
            {messages.map((msg) => {
              // 判断发送者 (兼容 global 和 private 表结构)
              const senderId = msg.sender_id || msg.user_id; 
              const senderEmail = msg.sender_email || msg.user_email;
              const isMe = user?.id === senderId;

              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1 text-[10px] text-slate-500 uppercase">
                    <span 
                      onClick={() => !isMe && startPrivateChat({ id: senderId, email: senderEmail })}
                      className={`font-bold cursor-pointer hover:underline ${isMe ? 'text-purple-400' : 'text-slate-300'}`}
                    >
                      {senderEmail?.split('@')[0]}
                    </span>
                    <span>{format(new Date(msg.created_at), 'HH:mm')}</span>
                  </div>
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg ${isMe ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-[#24283b] text-slate-200 border border-white/10 rounded-tl-none'}`}>
                    {msg.content}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 输入框 */}
          <div className="p-6 bg-[#1a1b26] border-t border-white/5 z-20">
            {user ? (
              <div className="flex gap-4 items-end bg-[#24283b] p-2 rounded-xl border border-white/10 focus-within:border-purple-500/50 transition-colors">
                <textarea 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={activeMode === 'global' ? "Broadcast to everyone..." : `Message ${targetUser?.email.split('@')[0]}...`}
                  className="flex-1 bg-transparent text-white placeholder:text-slate-600 text-sm p-2 outline-none resize-none h-12 max-h-32"
                />
                <button onClick={handleSend} className="p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors active:scale-95"><Send size={18} /></button>
              </div>
            ) : (
              <button onClick={() => setIsLoginOpen(true)} className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white uppercase text-xs font-bold tracking-widest">Login to join</button>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
