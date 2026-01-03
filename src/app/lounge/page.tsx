"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import LoginModal from '@/components/LoginModal';
import { Send, Zap } from 'lucide-react';
import { format } from 'date-fns';

export default function LoungePage() {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. 获取当前用户
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));

    // 2. 加载历史消息 (最近50条)
    fetchHistory();

    // 3. ✨ 开启实时监听 (Realtime Magic!)
    const channel = supabase
      .channel('lounge_chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          // 收到新消息，追加到列表
          setMessages((prev) => [...prev, payload.new]);
          // 滚动到底部
          setTimeout(() => scrollToBottom(), 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchHistory() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true }) // 按时间正序
      .limit(50); // 只加载最后50条
    
    if (data) {
      setMessages(data);
      setTimeout(() => scrollToBottom(), 100);
    }
  }

  function scrollToBottom() {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }

  async function handleSend() {
    if (!newMessage.trim() || !user) return;

    const content = newMessage;
    setNewMessage(''); // 乐观更新：先清空输入框

    await supabase.from('messages').insert([{
      content,
      user_id: user.id,
      user_email: user.email
    }]);
  }

  return (
    <div className="flex min-h-screen bg-[#1a1b26] text-white font-mono selection:bg-purple-500 selection:text-white">
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      
      {/* 侧边栏 (黑色主题适配) */}
      <Sidebar />

      <main className="flex-1 lg:ml-80 flex flex-col h-screen relative overflow-hidden">
        
        {/* 背景装饰：赛博网格 */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        {/* 顶部标题 */}
        <header className="p-6 border-b border-white/10 bg-[#1a1b26]/80 backdrop-blur z-10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg text-green-400 animate-pulse">
              <Zap size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-widest text-white">THE LOUNGE</h1>
              <p className="text-[10px] text-slate-400 uppercase">Realtime Connection // Online</p>
            </div>
          </div>
        </header>

        {/* 聊天记录区域 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 z-10 scroll-smooth">
          {messages.map((msg, index) => {
            const isMe = user?.id === msg.user_id;
            const isSystem = false; // 未来可扩展系统消息

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {/* 名字 & 时间 */}
                <div className="flex items-center gap-2 mb-1 text-[10px] text-slate-500 uppercase">
                  <span className={isMe ? 'text-purple-400 font-bold' : 'text-slate-300 font-bold'}>
                    {msg.user_email?.split('@')[0]}
                  </span>
                  <span>{format(new Date(msg.created_at), 'HH:mm')}</span>
                </div>

                {/* 气泡 */}
                <div className={`
                  max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg
                  ${isMe 
                    ? 'bg-purple-600 text-white rounded-tr-none' 
                    : 'bg-[#24283b] text-slate-200 border border-white/10 rounded-tl-none'}
                `}>
                  {msg.content}
                </div>
              </div>
            );
          })}
          
          {/* 空状态 */}
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
              <Zap size={48} className="mb-4" />
              <p>CHANNEL OPEN. WAITING FOR SIGNALS...</p>
            </div>
          )}
        </div>

        {/* 底部输入框 */}
        <div className="p-6 bg-[#1a1b26] border-t border-white/10 z-20">
          {user ? (
            <div className="flex gap-4 items-end bg-[#24283b] p-2 rounded-xl border border-white/10 focus-within:border-purple-500/50 transition-colors">
              <textarea 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-white placeholder:text-slate-600 text-sm p-2 outline-none resize-none h-12 max-h-32"
              />
              <button 
                onClick={handleSend}
                className="p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors active:scale-95"
              >
                <Send size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all uppercase text-xs font-bold tracking-widest"
            >
              Login to join the frequency
            </button>
          )}
        </div>

      </main>
    </div>
  );
}
