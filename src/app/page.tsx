"use client";
import React, { useState, useEffect } from 'react';
import LoginModal from '@/components/LoginModal';
import { supabase } from '@/lib/supabase';

export default function Page() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]); // 1. 创建存放文章的仓库

  // 2. 监听登录状态
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // 3. 初始加载时抓取一次文章
    fetchPosts();

    return () => subscription.unsubscribe();
  }, []);

  // 4. 专门负责从云端抓取文章的函数
  async function fetchPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false }); // 按时间倒序，最新的在上面

    if (error) {
      console.error("抓取失败:", error.message);
    } else {
      setPosts(data || []);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen bg-[#fcfcfc]">
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* --- 左侧侧边栏 (保持不变) --- */}
      <aside className="fixed left-0 top-0 w-80 h-full p-12 flex flex-col justify-between border-r border-gray-100">
        <div>
          <div className="w-20 h-20 bg-gray-200 rounded-full mb-8 grayscale"></div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">豆浆</h1>
          {user && <p className="text-blue-500 text-[10px] font-mono mb-4">{user.email}</p>}
          <nav className="space-y-4 mt-10">
            <a href="/" className="block text-sm font-medium hover:text-blue-500 transition-colors">首页</a>
            <a href="#" className="block text-sm font-medium text-gray-400">关于</a>
          </nav>
        </div>
        <div className="flex flex-col space-y-4">
           {!user ? (
             <button onClick={() => setIsLoginOpen(true)} className="text-xs text-left text-gray-400 hover:text-black uppercase tracking-widest">Login</button>
           ) : (
             <button onClick={handleLogout} className="text-xs text-left text-red-400 hover:text-red-600 uppercase tracking-widest">Sign Out</button>
           )}
           <p className="text-[10px] text-gray-300 uppercase">© 2026 SOYMILK SPACE.</p>
        </div>
      </aside>

      {/* --- 右侧内容区 --- */}
      <main className="ml-80 flex-1 py-20 px-16 lg:px-32">
        <div className="max-w-2xl mx-auto">
          
          {/* 发布框 */}
          {user && (
            <div className="mb-24 p-10 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                <input id="post-title" type="text" placeholder="标题..." className="w-full text-2xl font-bold mb-4 outline-none" />
                <textarea id="post-content" placeholder="此刻在想什么？" className="w-full text-gray-500 outline-none h-24 resize-none"></textarea>
                <button 
                    onClick={async () => {
                        const title = (document.getElementById('post-title') as HTMLInputElement).value;
                        const content = (document.getElementById('post-content') as HTMLTextAreaElement).value;
                        const { error } = await supabase.from('posts').insert([{ title, content, author_email: user.email }]);
                        if(error) alert(error.message);
                        else { 
                            (document.getElementById('post-title') as HTMLInputElement).value = "";
                            (document.getElementById('post-content') as HTMLTextAreaElement).value = "";
                            fetchPosts(); // 发布成功后刷新列表，不用刷整个网页
                        }
                    }}
                    className="mt-6 px-8 py-3 bg-black text-white rounded-2xl text-xs font-bold hover:bg-gray-800 transition-all"
                >
                    确认发布
                </button>
            </div>
          )}

          {/* 文章列表展示区 */}
          <div className="space-y-24">
            {posts.length > 0 ? (
              posts.map((post) => (
                <article key={post.id} className="group">
                  <div className="flex items-center space-x-4 mb-6">
                    <span className="text-[10px] text-gray-300 font-mono tracking-widest uppercase">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    <div className="h-[1px] w-8 bg-gray-100"></div>
                  </div>
                  <h2 className="text-3xl font-medium mb-4 group-hover:text-blue-600 transition-colors cursor-pointer">
                    {post.title}
                  </h2>
                  <p className="text-gray-500 leading-relaxed">
                    {post.content}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-gray-300 italic text-center">还没有任何动态...</p>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}