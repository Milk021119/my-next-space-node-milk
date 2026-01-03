"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Camera, Edit3, Save, Calendar, User as UserIcon, Star, Loader2, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [isMe, setIsMe] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => { fetchProfile(); }, [id]);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    setIsMe(user?.id === id);
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (data) { setProfile(data); setFormData(data); }
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
      // ✨ 关键：同步更新 auth.users 元数据
      await supabase.auth.updateUser({ data: { avatar_url: formData.avatar_url } });
      
      setIsEditing(false);
      fetchProfile();
      alert('✅ 个人资料已更新！');
      // ✨ 强制刷新，让 Sidebar 立刻变
      window.location.reload(); 
    } else {
      alert('❌ 保存失败: ' + error.message);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'bg') {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("⚠️ 图片太大了"); return; }
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}/${type}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      if (type === 'avatar') setFormData((prev: any) => ({ ...prev, avatar_url: publicUrl }));
      else setFormData((prev: any) => ({ ...prev, bg_url: publicUrl }));
    } catch (error: any) { alert('上传失败: ' + error.message); } finally { setUploading(false); }
  }

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">加载中...</div>;
  if (!profile) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">用户不存在</div>;

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans flex">
      <Sidebar />
      <main className="flex-1 lg:ml-80">
        <div className="h-64 w-full bg-slate-300 relative overflow-hidden group">
          <img src={formData.bg_url || profile.bg_url || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
          {isEditing && (
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-white text-sm font-bold flex items-center gap-2 hover:bg-white/30">{uploading ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18}/>}<span>更换背景</span></div>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'bg')} />
            </label>
          )}
        </div>
        <div className="max-w-4xl mx-auto px-8 relative -mt-20 z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
            <div className="relative group mx-auto md:mx-0">
              <div className="w-36 h-36 rounded-full border-4 border-white bg-white shadow-2xl overflow-hidden relative">
                <img src={formData.avatar_url || profile.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.id}`} className="w-full h-full object-cover" />
                {isEditing && (<label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">{uploading ? <Loader2 className="animate-spin mb-1" size={24}/> : <Upload className="mb-1" size={24}/>}<span className="text-xs font-bold">更换头像</span><input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'avatar')} /></label>)}
              </div>
            </div>
            <div className="flex-1 text-center md:text-left mb-2">
              {isEditing ? (<input value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} className="text-3xl font-black bg-transparent border-b-2 border-slate-300 outline-none w-full md:w-auto focus:border-purple-500 transition-colors pb-1" placeholder="设置昵称" />) : (<h1 className="text-3xl font-black text-slate-800 drop-shadow-sm mb-1">{profile.username || '神秘访客'}</h1>)}
              <p className="text-slate-500 text-xs font-mono bg-white/50 inline-block px-2 py-1 rounded backdrop-blur-sm border border-white/50">UID: {profile.id.split('-')[0]}...</p>
            </div>
            {isMe && (<div className="mb-2 flex justify-center"><button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 ${isEditing ? 'bg-green-500 text-white hover:bg-green-600 shadow-green-200' : 'bg-white text-slate-700 hover:text-purple-600 shadow-slate-200'}`}>{isEditing ? <><Save size={16}/> 保存资料</> : <><Edit3 size={16}/> 编辑资料</>}</button></div>)}
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <div className="col-span-full"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Edit3 size={12}/> 个性签名</h3>{isEditing ? (<textarea value={formData.bio || ''} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full bg-slate-50 rounded-xl p-4 text-sm text-slate-700 outline-none resize-none h-28 focus:ring-2 focus:ring-purple-100 transition-all border border-transparent focus:border-purple-200" placeholder="写一句很酷的签名吧..." />) : (<div className="bg-slate-50 rounded-xl p-6 relative"><span className="text-4xl text-slate-200 absolute -top-2 -left-2 font-serif">“</span><p className="text-slate-600 leading-relaxed text-sm relative z-10 italic pl-4">{profile.bio || "这个人很神秘，什么都没留下。"}</p></div>)}</div>
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:border-purple-100 transition-colors"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Calendar size={14}/> 出生日期</h3>{isEditing ? (<input type="date" value={formData.birthday || ''} onChange={e => setFormData({...formData, birthday: e.target.value})} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none w-full focus:border-purple-400" />) : (<p className="text-slate-700 font-bold text-lg">{profile.birthday || '未设置'}</p>)}</div>
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:border-purple-100 transition-colors"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><UserIcon size={14}/> 性别</h3>{isEditing ? (<select value={formData.gender || 'secret'} onChange={e => setFormData({...formData, gender: e.target.value})} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none w-full focus:border-purple-400"><option value="male">男</option><option value="female">女</option><option value="secret">保密</option></select>) : (<p className="text-slate-700 font-bold text-lg">{profile.gender === 'male' ? '♂ 男' : profile.gender === 'female' ? '♀ 女' : '🔒 保密'}</p>)}</div>
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:border-purple-100 transition-colors"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Star size={14}/> 星座</h3>{isEditing ? (<input value={formData.zodiac || ''} onChange={e => setFormData({...formData, zodiac: e.target.value})} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none w-full focus:border-purple-400" placeholder="例如: 天蝎座" />) : (<p className="text-slate-700 font-bold text-lg">{profile.zodiac || '未设置'}</p>)}</div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
