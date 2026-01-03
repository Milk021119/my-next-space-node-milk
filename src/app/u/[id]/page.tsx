"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Camera, Edit3, Save, Calendar, User as UserIcon, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [isMe, setIsMe] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // 表单状态
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchProfile();
  }, [id]);

  async function fetchProfile() {
    // 1. 获取当前登录用户
    const { data: { user } } = await supabase.auth.getUser();
    setIsMe(user?.id === id);

    // 2. 获取目标用户资料
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (data) {
      setProfile(data);
      setFormData(data);
    }
    setLoading(false);
  }

  async function handleSave() {
    const { error } = await supabase.from('profiles').update({
      username: formData.username,
      bio: formData.bio,
      gender: formData.gender,
      zodiac: formData.zodiac,
      birthday: formData.birthday,
      bg_url: formData.bg_url,
      avatar_url: formData.avatar_url
    }).eq('id', id);

    if (!error) {
      setIsEditing(false);
      fetchProfile(); // 刷新数据
      alert('个人资料已更新！✨');
    }
  }

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">加载中...</div>;
  if (!profile) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">用户不存在</div>;

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans flex">
      <Sidebar />
      <main className="flex-1 lg:ml-80">
        {/* --- 顶部背景 --- */}
        <div className="h-64 w-full bg-slate-300 relative overflow-hidden group">
          <img src={profile.bg_url || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200"} className="w-full h-full object-cover" />
          {isEditing && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <button onClick={() => { const url = prompt("请输入新背景图链接:"); if(url) setFormData({...formData, bg_url: url}) }} className="text-white flex items-center gap-2 font-bold"><Camera size={20}/> 更换背景</button>
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto px-8 relative -mt-16">
          {/* --- 头像与基础信息 --- */}
          <div className="flex justify-between items-end mb-8">
            <div className="flex items-end gap-6">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden relative group">
                <img src={profile.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.id}`} className="w-full h-full object-cover" />
                {isEditing && (
                  <div onClick={() => { const url = prompt("请输入新头像链接:"); if(url) setFormData({...formData, avatar_url: url}) }} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer text-white text-xs font-bold">更换</div>
                )}
              </div>
              <div className="mb-2">
                {isEditing ? (
                  <input value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} className="text-3xl font-black bg-transparent border-b border-slate-300 outline-none w-full" placeholder="昵称" />
                ) : (
                  <h1 className="text-3xl font-black text-slate-800">{profile.username || '神秘访客'}</h1>
                )}
                <p className="text-slate-500 text-sm mt-1">{profile.id}</p>
              </div>
            </div>
            
            {/* 操作按钮 */}
            {isMe && (
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all ${isEditing ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-white text-slate-700 hover:text-purple-600'}`}
              >
                {isEditing ? <><Save size={16}/> 保存资料</> : <><Edit3 size={16}/> 编辑资料</>}
              </button>
            )}
          </div>

          {/* --- 详细资料卡片 --- */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* 📝 个性签名 */}
            <div className="col-span-full">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">个性签名</h3>
              {isEditing ? (
                <textarea value={formData.bio || ''} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full bg-slate-50 rounded-xl p-4 text-sm text-slate-700 outline-none resize-none h-24 focus:ring-2 focus:ring-purple-100" placeholder="写点什么..." />
              ) : (
                <p className="text-slate-600 leading-relaxed">{profile.bio || "这个人很懒，什么都没写。"}</p>
              )}
            </div>

            {/* 🎂 生日 */}
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Calendar size={14}/> 出生日期</h3>
              {isEditing ? (
                <input type="date" value={formData.birthday || ''} onChange={e => setFormData({...formData, birthday: e.target.value})} className="bg-slate-50 rounded-lg px-3 py-2 text-sm outline-none w-full" />
              ) : (
                <p className="text-slate-700 font-bold">{profile.birthday || '未设置'}</p>
              )}
            </div>

            {/* 🚻 性别 */}
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><UserIcon size={14}/> 性别</h3>
              {isEditing ? (
                <select value={formData.gender || 'secret'} onChange={e => setFormData({...formData, gender: e.target.value})} className="bg-slate-50 rounded-lg px-3 py-2 text-sm outline-none w-full">
                  <option value="male">男</option>
                  <option value="female">女</option>
                  <option value="secret">保密</option>
                </select>
              ) : (
                <p className="text-slate-700 font-bold">
                  {profile.gender === 'male' ? '男' : profile.gender === 'female' ? '女' : '保密'}
                </p>
              )}
            </div>

            {/* 🌟 星座 */}
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Star size={14}/> 星座</h3>
              {isEditing ? (
                <input value={formData.zodiac || ''} onChange={e => setFormData({...formData, zodiac: e.target.value})} className="bg-slate-50 rounded-lg px-3 py-2 text-sm outline-none w-full" placeholder="例如: 天蝎座" />
              ) : (
                <p className="text-slate-700 font-bold">{profile.zodiac || '未设置'}</p>
              )}
            </div>

          </motion.div>
        </div>
      </main>
    </div>
  );
}
