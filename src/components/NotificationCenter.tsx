"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import Link from 'next/link';

export default function NotificationCenter({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    fetchNotifications();

    // ✨ 开启实时监听：有新通知立刻叮咚！
    const channel = supabase
      .channel('realtime_notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${userId}` },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  async function fetchNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(10); // 只看最近10条
    
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.is_read).length);
    }
  }

  async function markAsRead() {
    if (unreadCount === 0) return;
    // 乐观更新
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    // 数据库更新
    await supabase.from('notifications').update({ is_read: true }).eq('recipient_id', userId);
  }

  return (
    <div className="relative">
      {/* 🔔 铃铛按钮 */}
      <button 
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) markAsRead(); }}
        className="relative p-2 text-slate-400 hover:text-purple-600 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white" />
        )}
      </button>

      {/* 📜 通知下拉列表 */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} /> {/* 点击外部关闭 */}
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute left-0 bottom-12 w-72 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-96 flex flex-col"
            >
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Notifications</span>
                <button onClick={markAsRead} className="text-[10px] text-purple-600 hover:underline">Mark Read</button>
              </div>
              
              <div className="overflow-y-auto p-2">
                {notifications.length === 0 && <div className="text-center py-8 text-xs text-slate-300">No new signals.</div>}
                
                {notifications.map(n => (
                  <Link href={`/post/${n.post_id}`} key={n.id} onClick={() => setIsOpen(false)}>
                    <div className={`p-3 mb-1 rounded-xl text-sm hover:bg-purple-50 transition-colors cursor-pointer ${n.is_read ? 'opacity-60' : 'bg-white border border-purple-100'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-700 text-xs">{n.sender_email?.split('@')[0]}</span>
                        <span className="text-[10px] text-slate-300">{format(new Date(n.created_at), 'MM/dd')}</span>
                      </div>
                      <p className="text-slate-500 line-clamp-2 text-xs">replied: "{n.content}"</p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
