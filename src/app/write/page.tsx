'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import PageLayout, { PageCard } from '@/components/PageLayout';
import { useToast } from '@/context/ToastContext';
import ReactMarkdown from 'react-markdown';
import { 
  FileText, Send, Eye, Edit3, Tag, Image, Link2, Upload, X, 
  Loader2, Bold, Italic, List, Quote, Code, Heading2, 
  ImagePlus, Trash2, CheckCircle, AlertCircle, Sparkles
} from 'lucide-react';

// Markdown 工具栏按钮
const toolbarButtons = [
  { icon: Bold, label: '粗体', prefix: '**', suffix: '**', placeholder: '粗体文字' },
  { icon: Italic, label: '斜体', prefix: '*', suffix: '*', placeholder: '斜体文字' },
  { icon: Heading2, label: '标题', prefix: '## ', suffix: '', placeholder: '标题' },
  { icon: List, label: '列表', prefix: '- ', suffix: '', placeholder: '列表项' },
  { icon: Quote, label: '引用', prefix: '> ', suffix: '', placeholder: '引用内容' },
  { icon: Code, label: '代码', prefix: '`', suffix: '`', placeholder: '代码' },
  { icon: Link2, label: '链接', prefix: '[', suffix: '](url)', placeholder: '链接文字' },
  { icon: ImagePlus, label: '图片', prefix: '![', suffix: '](url)', placeholder: '图片描述' },
];

export default function WritePage() {
  const router = useRouter();
  const toast = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 用户状态
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 表单状态
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [coverType, setCoverType] = useState<'url' | 'upload'>('url');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');

  // UI 状态
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  // 检查登录状态
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        toast.warning('请先登录后再发布文章');
        router.push('/posts');
        return;
      }
      setUser(session.user);
      setLoading(false);
    });
  }, [router, toast]);

  // 处理本地图片选择
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    // 验证文件大小 (最大 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过 5MB');
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }, [toast]);

  // 清除封面
  const clearCover = useCallback(() => {
    setCoverUrl('');
    setCoverFile(null);
    setCoverPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);


  // 上传图片到 Supabase Storage
  const uploadCover = async (): Promise<string | null> => {
    if (!coverFile) return coverUrl || null;

    setIsUploading(true);
    try {
      const fileExt = coverFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(filePath, coverFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      toast.error('封面上传失败: ' + error.message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // 插入 Markdown 格式
  const insertMarkdown = useCallback((prefix: string, suffix: string, placeholder: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || placeholder;
    
    const newText = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
    setContent(newText);

    // 设置光标位置
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [content]);

  // 发布文章
  const handlePublish = async () => {
    if (!title.trim()) {
      toast.warning('请输入文章标题');
      return;
    }
    if (!content.trim()) {
      toast.warning('请输入文章内容');
      return;
    }

    setIsPublishing(true);

    try {
      // 上传封面图
      const finalCoverUrl = await uploadCover();

      // 处理标签
      const tagList = tags
        .split(/[,，]/)
        .map(t => t.trim())
        .filter(Boolean);

      // 插入文章
      const { data, error } = await supabase.from('posts').insert([{
        title: title.trim(),
        content: content.trim(),
        author_email: user.email,
        user_id: user.id,
        likes: 0,
        views: 0,
        tags: tagList,
        cover_url: finalCoverUrl,
        type: 'article',
        is_public: true,
      }]).select().single();

      if (error) throw error;

      toast.success('文章发布成功！');
      router.push(`/post/${data.id}`);
    } catch (error: any) {
      toast.error('发布失败: ' + error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  // 保存草稿
  const handleSaveDraft = useCallback(() => {
    const draft = { title, content, tags, coverUrl };
    localStorage.setItem('article-draft', JSON.stringify(draft));
    setIsDraft(true);
    toast.success('草稿已保存');
    setTimeout(() => setIsDraft(false), 2000);
  }, [title, content, tags, coverUrl, toast]);

  // 加载草稿
  useEffect(() => {
    const saved = localStorage.getItem('article-draft');
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        if (draft.title || draft.content) {
          setTitle(draft.title || '');
          setContent(draft.content || '');
          setTags(draft.tags || '');
          setCoverUrl(draft.coverUrl || '');
        }
      } catch {}
    }
  }, []);

  // 快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSaveDraft();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handlePublish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveDraft]);

  if (loading) {
    return (
      <PageLayout maxWidth="4xl" centered>
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </PageLayout>
    );
  }


  return (
    <PageLayout 
      maxWidth="5xl" 
      backLink="/posts" 
      backText="返回文章列表"
      className="py-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 主编辑区 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 标题输入 */}
          <PageCard className="p-0 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
              <div className="p-2 rounded-xl bg-purple-500/10">
                <FileText size={18} className="text-purple-500" />
              </div>
              <span className="font-bold text-[var(--text-primary)]">撰写新文章</span>
            </div>
            <div className="p-6">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入文章标题..."
                className="w-full bg-transparent text-2xl lg:text-3xl font-black outline-none placeholder:text-[var(--text-muted)]/40 text-[var(--text-primary)]"
              />
            </div>
          </PageCard>

          {/* 编辑器 */}
          <PageCard className="p-0 overflow-hidden">
            {/* Tab 切换 */}
            <div className="flex items-center border-b border-[var(--border-color)]">
              <button
                onClick={() => setActiveTab('edit')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors relative ${
                  activeTab === 'edit' 
                    ? 'text-purple-600' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Edit3 size={16} />
                编辑
                {activeTab === 'edit' && (
                  <motion.div 
                    layoutId="editor-tab" 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" 
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors relative ${
                  activeTab === 'preview' 
                    ? 'text-purple-600' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Eye size={16} />
                预览
                {activeTab === 'preview' && (
                  <motion.div 
                    layoutId="editor-tab" 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" 
                  />
                )}
              </button>
            </div>

            {/* 工具栏 */}
            {activeTab === 'edit' && (
              <div className="flex items-center gap-1 px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/30 overflow-x-auto">
                {toolbarButtons.map((btn) => (
                  <motion.button
                    key={btn.label}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => insertMarkdown(btn.prefix, btn.suffix, btn.placeholder)}
                    title={btn.label}
                    className="p-2.5 rounded-xl text-[var(--text-muted)] hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors flex-shrink-0"
                  >
                    <btn.icon size={18} />
                  </motion.button>
                ))}
              </div>
            )}

            {/* 内容区 */}
            <div className="min-h-[400px]">
              {activeTab === 'edit' ? (
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="在此输入正文，支持 Markdown 语法...

## 二级标题
**粗体** *斜体* ~~删除线~~

- 无序列表
1. 有序列表

> 引用文字

`行内代码`

```
代码块
```

[链接文字](url)
![图片描述](url)"
                  className="w-full h-full min-h-[400px] p-6 bg-transparent text-[var(--text-secondary)] outline-none resize-none font-mono text-sm leading-relaxed placeholder:text-[var(--text-muted)]/30"
                />
              ) : (
                <div className="p-6 min-h-[400px]">
                  {content ? (
                    <article className="prose prose-slate dark:prose-invert prose-sm lg:prose-base max-w-none prose-headings:font-black prose-a:text-purple-600">
                      <ReactMarkdown>{content}</ReactMarkdown>
                    </article>
                  ) : (
                    <p className="text-[var(--text-muted)]/50 text-sm italic text-center py-20">
                      预览区域 - 开始输入内容后这里会显示渲染效果
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* 底部状态栏 */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
              <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                <span>字数: {content.length}</span>
                <span>行数: {content.split('\n').length}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span>Ctrl+S 保存草稿</span>
                <span>·</span>
                <span>Ctrl+Enter 发布</span>
              </div>
            </div>
          </PageCard>
        </div>


        {/* 侧边栏设置 */}
        <div className="space-y-6">
          {/* 封面图设置 */}
          <PageCard>
            <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Image size={14} />
              封面图片
            </h3>

            {/* 封面类型切换 */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setCoverType('url')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  coverType === 'url'
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Link2 size={14} className="inline mr-1.5" />
                URL 链接
              </button>
              <button
                onClick={() => setCoverType('upload')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  coverType === 'upload'
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Upload size={14} className="inline mr-1.5" />
                本地上传
              </button>
            </div>

            {/* URL 输入 */}
            {coverType === 'url' && (
              <div className="relative">
                <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => {
                    setCoverUrl(e.target.value);
                    setCoverPreview(e.target.value);
                  }}
                  placeholder="输入图片 URL..."
                  className="w-full bg-[var(--bg-secondary)] rounded-xl pl-10 pr-4 py-3 text-sm text-[var(--text-secondary)] outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 placeholder:text-[var(--text-muted)]/50"
                />
              </div>
            )}

            {/* 文件上传 */}
            {coverType === 'upload' && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-[var(--border-color)] rounded-xl text-[var(--text-muted)] hover:border-purple-300 hover:text-purple-600 transition-colors flex flex-col items-center gap-2"
                >
                  <Upload size={24} />
                  <span className="text-xs font-bold">点击选择图片</span>
                  <span className="text-[10px]">支持 JPG、PNG、GIF，最大 5MB</span>
                </button>
              </div>
            )}

            {/* 封面预览 */}
            <AnimatePresence>
              {coverPreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 relative group"
                >
                  <img
                    src={coverPreview}
                    alt="封面预览"
                    className="w-full aspect-video object-cover rounded-xl"
                    onError={() => {
                      toast.error('图片加载失败，请检查链接');
                      setCoverPreview('');
                    }}
                  />
                  <button
                    onClick={clearCover}
                    className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </PageCard>

          {/* 标签设置 */}
          <PageCard>
            <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Tag size={14} />
              文章标签
            </h3>
            <div className="relative">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="用逗号分隔多个标签..."
                className="w-full bg-[var(--bg-secondary)] rounded-xl pl-10 pr-4 py-3 text-sm text-[var(--text-secondary)] outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 placeholder:text-[var(--text-muted)]/50"
              />
            </div>
            {tags && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.split(/[,，]/).filter(Boolean).map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-2.5 py-1 rounded-full"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </PageCard>

          {/* 发布操作 */}
          <PageCard className="space-y-3">
            <button
              onClick={handlePublish}
              disabled={isPublishing || isUploading || !title.trim() || !content.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-purple-400 disabled:to-pink-400 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isPublishing || isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {isUploading ? '上传封面中...' : '发布中...'}
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  发布文章
                </>
              )}
            </button>

            <button
              onClick={handleSaveDraft}
              className="w-full py-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              {isDraft ? (
                <>
                  <CheckCircle size={16} className="text-green-500" />
                  已保存
                </>
              ) : (
                '保存草稿'
              )}
            </button>

            <p className="text-[10px] text-[var(--text-muted)] text-center">
              草稿会保存在本地浏览器中
            </p>
          </PageCard>

          {/* 提示信息 */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <div className="flex gap-3">
              <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                <p className="font-bold">写作提示</p>
                <ul className="list-disc list-inside space-y-0.5 text-amber-600 dark:text-amber-500">
                  <li>支持完整的 Markdown 语法</li>
                  <li>可以使用工具栏快速插入格式</li>
                  <li>建议添加封面图提升阅读体验</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
