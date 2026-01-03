import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// 定义一个简单的 User 类型，你可以根据实际 Supabase 返回类型增强它
export interface UserProfile {
  id: string;
  email?: string;
  user_metadata: {
    avatar_url?: string;
    full_name?: string;
    [key: string]: any;
  };
}

export function useCurrentUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initUser() {
      // 1. ⚡️ 优先读取本地缓存 (秒开)
      const cachedUser = localStorage.getItem('soymilk_user_cache');
      if (cachedUser) {
        try {
            setUser(JSON.parse(cachedUser));
        } catch (e) {
            console.error("Cache parse error", e);
        }
      }
      
      // 标记组件已挂载，解决 Hydration 错误
      setIsMounted(true);

      // 2. 📡 异步校验 Supabase Session
      const { data: { session } } = await supabase.auth.getSession();
      let currentUser = session?.user ?? null;

      if (currentUser) {
        // 查 profile 表获取最新头像 (确保数据一致性)
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', currentUser.id)
          .single();
        
        // 如果数据库有头像，更新 session 中的 metadata
        if (profile?.avatar_url) {
          currentUser = {
              ...currentUser,
              user_metadata: {
                  ...currentUser.user_metadata,
                  avatar_url: profile.avatar_url
              }
          };
        }

        // ✨ 智能更新：只有数据变了才写缓存
        const newUserStr = JSON.stringify(currentUser);
        if (cachedUser !== newUserStr) {
          localStorage.setItem('soymilk_user_cache', newUserStr);
          setUser(currentUser as UserProfile);
        }
      } else {
        // 如果 Session 不存在但缓存还在，说明过期了，清理掉
        if (cachedUser) {
          localStorage.removeItem('soymilk_user_cache');
          setUser(null);
        }
      }
      setLoading(false);
    }

    initUser();

    // 3. 监听 Auth 状态变化 (例如在其他标签页登出)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // 简单的重新执行 initUser 逻辑不太高效，这里直接更新状态
      if (session?.user) {
         setUser(session.user as UserProfile);
         localStorage.setItem('soymilk_user_cache', JSON.stringify(session.user));
      } else {
         setUser(null);
         localStorage.removeItem('soymilk_user_cache');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 登出辅助函数
  const logout = async () => {
      localStorage.removeItem('soymilk_user_cache');
      await supabase.auth.signOut();
      window.location.reload(); // 刷新以重置所有状态
  };

  return { user, isMounted, loading, logout };
}
