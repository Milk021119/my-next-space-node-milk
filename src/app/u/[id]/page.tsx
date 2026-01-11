"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Camera, Edit3, Save, Calendar, User as UserIcon, Star, Loader2, Upload, ArrowLeft, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { getBookmarkCount } from '@/lib/bookmarks';
import { useToast } from '@/context/ToastContext';

interface Profile {
  id: string;
  username: string | null;
  bio: string | null;
  gender: string | null;
  zodiac: string | null;
  birthday: string | null;
  bg_url: string | null;
  avatar_url: string | null;
}

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isMe, setIsMe] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState<'avatar' | 'bg' | null>(null);
  
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [bookmarkCount, setBookmarkCount] = useState<number>(0);

  useEffect(() => {
    if (id) fetchProfile();
  }, [id]);

  async function fetchProfile() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
         console.error("Profile fetch error:", error);
         setProfile(null);
      } else {
         setProfile(data);
         setFormData(data);
         setIsMe(currentUserId === data.id);
         
         // 获取收藏数量
         const count = await getBookmarkCount(data.id);
         setBookmarkCount(count);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!profile) return;
    
    try {
      const { error } = await supabase.from('profiles').update({
        username: formData.username,
        bio: formData.bio,
        gender: formData.gender,
        zodiac: formData.zodiac,
        birthday: formData.birthday,
        bg_url: formData.bg_url,
        avatar_url: formData.avatar_url,
        updated_at: new Date().toISOString()
      }).eq('id', profile.id);

      if (error) throw error;

      if (formData.avatar_url) {
         await supabase.auth.updateUser({ data: { avatar_url: formData.avatar_url } });
      }

      setIsEditing(false);
      setProfile({ ...profile, ...formData } as Profile);
      toast.success('个人资料已更新！');
      
    } catch (error: any) {
      toast.error('保存失败: ' + error.message);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'bg') {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (file.size > 5 * 1024 * 1024) { 
        toast.error('图片太大了 (限制 5MB)'); 
        return; 
    }

    setUploadingType(type);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${type}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
         .from(type === 'avatar' ? 'avatars' : 'backgrounds')
         .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
         .from(type === 'avatar' ? 'avatars' : 'backgrounds')
         .getPublicUrl(fileName);

      if (type === 'avatar') {
          setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      } else {
          setFormData(prev => ({ ...prev, bg_url: publicUrl }));
      }
      
    } catch (error: any) { 
        toast.error('上传失败: ' + error.message); 
    } finally { 
        setUploadingType(null); 
    }
  }

  if (loading) {
      return (
          <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
              <Loader2 className="animate-spin text-purple-600" size={32} />
          </div>
      );
  }

  if (!profile) {
      return (
          <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center text-[var(--text-muted)] gap-4">
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">用户不存在</h1>
              <p>该用户可能已被注销或 ID 错误。</p>
              <button onClick={() => router.push('/')} className="px-6 py-2 bg-[var(--bg-secondary)] rounded-full text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-[var(--text-primary)]">
                 <ArrowLeft size={16}/> 返回首页
              </button>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-sans flex">
      <Sidebar />
      
      <main className="flex-1 lg:ml-72 2xl:ml-80 transition-all duration-300 min-h-screen pb-20">
        
        <div className="h-64 w-full bg-[var(--bg-tertiary)] relative overflow-hidden group">
          <Image 
             src={formData.bg_url || profile.bg_url || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200"} 
             alt="background" 
             fill 
             className="object-cover transition-transform duration-700 group-hover:scale-105"
             priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 pointer-events-none"></div>
          
          {isEditing && (
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-bold flex items-center gap-2 hover:bg-white/30 transition-colors border border-white/30">
                 {uploadingType === 'bg' ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18}/>}
                 <span>更换背景图</span>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'bg')} disabled={!!uploadingType} />
            </label>
          )}
        </div>

        <div className="max-w-5xl mx-auto px-6 lg:px-10 relative -mt-20 z-10">
          
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
            <div className="relative group mx-auto md:mx-0">
              <div className="w-36 h-36 rounded-3xl border-4 border-white bg-white shadow-2xl overflow-hidden relative">
                <Image 
                   src={formData.avatar_url || profile.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.id}`} 
                   alt="avatar" 
                   fill 
                   className="object-cover" 
                />
                
                {isEditing && (
                    <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white z-20">
                        {uploadingType === 'avatar' ? <Loader2 className="animate-spin mb-1" size={24}/> : <Upload className="mb-1" size={24}/>}
                        <span className="text-[10px] font-bold uppercase tracking-wider">更换头像</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'avatar')} disabled={!!uploadingType} />
                    </label>
                )}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left mb-2">
              {isEditing ? (
                  <input 
                    value={formData.username || ''} 
                    onChange={e => setFormData({...formData, username: e.target.value})} 
                    className="text-3xl font-black bg-transparent border-b-2 border-[var(--border-color)] outline-none w-full md:w-auto focus:border-purple-500 transition-colors pb-1 placeholder:text-[var(--text-muted)] text-[var(--text-primary)]" 
                    placeholder="设置昵称" 
                    autoFocus
                  />
              ) : (
                  <h1 className="text-3xl font-black text-[var(--text-primary)] drop-shadow-sm mb-1">
                      {profile.username || '未命名访客'}
                  </h1>
              )}
              <p className="text-[var(--text-muted)] text-xs font-mono bg-[var(--bg-card)] inline-block px-2 py-1 rounded backdrop-blur-sm border border-[var(--border-color)] mt-2">
                  UID: {profile.id.split('-')[0]}
              </p>
            </div>

            {isMe && (
                <div className="mb-2 flex justify-center">
                    <button 
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)} 
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 
                            ${isEditing 
                                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-black shadow-slate-200 ring-2 ring-offset-2 ring-slate-900 dark:ring-slate-100' 
                                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:text-purple-600 shadow-slate-200 hover:shadow-xl'
                            }`}
                    >
                        {isEditing ? <><Save size={16}/> 保存资料</> : <><Edit3 size={16}/> 编辑资料</>}
                    </button>
                </div>
            )}
          </div>

          <motion.div 
             initial={{ opacity: 0, y: 20 }} 
             animate={{ opacity: 1, y: 0 }} 
             className="bg-[var(--bg-secondary)] rounded-[2rem] p-8 shadow-sm border border-[var(--border-color)] grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="col-span-full">
                <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Edit3 size={12}/> 个性签名
                </h3>
                {isEditing ? (
                    <textarea 
                        value={formData.bio || ''} 
                        onChange={e => setFormData({...formData, bio: e.target.value})} 
                        className="w-full bg-[var(--bg-tertiary)] rounded-xl p-4 text-sm text-[var(--text-secondary)] outline-none resize-none h-28 focus:ring-2 focus:ring-purple-100 transition-all border border-transparent focus:border-purple-200" 
                        placeholder="写一句很酷的签名吧..." 
                    />
                ) : (
                    <div className="bg-slate-50 rounded-xl p-6 relative overflow-hidden">
                        <span className="text-6xl text-slate-200 absolute -top-4 -left-2 font-serif opacity-50">“</span>
                        <p className="text-slate-600 leading-relaxed text-sm relative z-10 italic pl-6">
                            {profile.bio || "这个人很懒，什么都没留下。"}
                        </p>
                    </div>
                )}
            </div>

            <div className="bg-[var(--bg-tertiary)] p-6 rounded-2xl border border-[var(--border-color)] hover:border-purple-400/50 transition-colors group">
                <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 flex items-center gap-2 group-hover:text-purple-500 transition-colors">
                    <Calendar size={14}/> 出生日期
                </h3>
                {isEditing ? (
                    <input type="date" value={formData.birthday || ''} onChange={e => setFormData({...formData, birthday: e.target.value})} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm outline-none w-full focus:border-purple-400 text-[var(--text-primary)]" />
                ) : (
                    <p className="text-[var(--text-primary)] font-bold text-lg font-mono">{profile.birthday || '未设置'}</p>
                )}
            </div>

            <div className="bg-[var(--bg-tertiary)] p-6 rounded-2xl border border-[var(--border-color)] hover:border-purple-400/50 transition-colors group">
                <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 flex items-center gap-2 group-hover:text-purple-500 transition-colors">
                    <UserIcon size={14}/> 性别
                </h3>
                {isEditing ? (
                    <select value={formData.gender || 'secret'} onChange={e => setFormData({...formData, gender: e.target.value})} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm outline-none w-full focus:border-purple-400 text-[var(--text-primary)]">
                        <option value="male">男</option>
                        <option value="female">女</option>
                        <option value="secret">保密</option>
                    </select>
                ) : (
                    <p className="text-[var(--text-primary)] font-bold text-lg">
                        {profile.gender === 'male' ? '♂ 男' : profile.gender === 'female' ? '♀ 女' : '🔒 保密'}
                    </p>
                )}
            </div>

            <div className="bg-[var(--bg-tertiary)] p-6 rounded-2xl border border-[var(--border-color)] hover:border-purple-400/50 transition-colors group">
                <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 flex items-center gap-2 group-hover:text-purple-500 transition-colors">
                    <Star size={14}/> 星座
                </h3>
                {isEditing ? (
                    <input value={formData.zodiac || ''} onChange={e => setFormData({...formData, zodiac: e.target.value})} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm outline-none w-full focus:border-purple-400 text-[var(--text-primary)]" placeholder="例如: 天蝎座" />
                ) : (
                    <p className="text-[var(--text-primary)] font-bold text-lg">{profile.zodiac || '未设置'}</p>
                )}
            </div>

            {/* 收藏入口 */}
            <Link 
              href={`/u/${profile.id}/bookmarks`}
              className="bg-[var(--bg-tertiary)] p-6 rounded-2xl border border-[var(--border-color)] hover:border-amber-400/50 transition-colors group cursor-pointer block"
            >
                <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 flex items-center gap-2 group-hover:text-amber-500 transition-colors">
                    <Bookmark size={14}/> 收藏
                </h3>
                <div className="flex items-center justify-between">
                    <p className="text-[var(--text-primary)] font-bold text-lg">{bookmarkCount} 篇文章</p>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 group-hover:text-amber-600 transition-colors">
                        查看全部 →
                    </span>
                </div>
            </Link>

          </motion.div>

        </div>
      </main>
    </div>
  );
}
