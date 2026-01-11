'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Loader2 } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { isBookmarked, toggleBookmark } from '@/lib/bookmarks';
import LoginModal from './LoginModal';

interface BookmarkButtonProps {
  postId: number;
  initialBookmarked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onToggle?: (newState: boolean) => void;
}

const sizeConfig = {
  sm: { icon: 14, padding: 'p-1.5' },
  md: { icon: 18, padding: 'p-2' },
  lg: { icon: 22, padding: 'p-3' },
};

export default function BookmarkButton({
  postId,
  initialBookmarked = false,
  size = 'md',
  className = '',
  onToggle,
}: BookmarkButtonProps) {
  const { user, isMounted } = useCurrentUser();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { icon: iconSize, padding } = sizeConfig[size];

  // 初始化时检查收藏状态
  useEffect(() => {
    async function checkBookmarkStatus() {
      if (!user?.id || isInitialized) return;
      
      try {
        const status = await isBookmarked(user.id, postId);
        setBookmarked(status);
      } catch (error) {
        console.error('Failed to check bookmark status:', error);
      } finally {
        setIsInitialized(true);
      }
    }

    if (isMounted && user?.id) {
      checkBookmarkStatus();
    } else if (isMounted && !user) {
      setIsInitialized(true);
    }
  }, [user?.id, postId, isMounted, isInitialized]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 未登录用户弹出登录框
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (loading) return;

    // 乐观更新 UI
    const previousState = bookmarked;
    setBookmarked(!bookmarked);
    setLoading(true);

    try {
      const newState = await toggleBookmark(user.id, postId);
      setBookmarked(newState);
      onToggle?.(newState);
    } catch (error) {
      // 回滚到之前的状态
      setBookmarked(previousState);
      console.error('Failed to toggle bookmark:', error);
    } finally {
      setLoading(false);
    }
  };

  // 服务端渲染时不显示
  if (!isMounted) {
    return (
      <div className={`${padding} ${className}`}>
        <Bookmark size={iconSize} className="text-slate-300" />
      </div>
    );
  }

  return (
    <>
      <motion.button
        onClick={handleClick}
        className={`relative ${padding} rounded-xl transition-all duration-200 ${
          bookmarked
            ? 'bg-amber-50 text-amber-500 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50'
            : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300'
        } ${className}`}
        whileTap={{ scale: 0.9 }}
        title={bookmarked ? '取消收藏' : '收藏'}
        disabled={loading}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <Loader2 size={iconSize} className="animate-spin" />
            </motion.div>
          ) : (
            <motion.div
              key={bookmarked ? 'filled' : 'outline'}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <Bookmark
                size={iconSize}
                fill={bookmarked ? 'currentColor' : 'none'}
                strokeWidth={bookmarked ? 0 : 2}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 收藏成功动画效果 - 星星闪烁 */}
        <AnimatePresence>
          {bookmarked && !loading && (
            <>
              {/* 扩散光环 */}
              <motion.div
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 2.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="w-full h-full rounded-full bg-amber-400/30" />
              </motion.div>
              
              {/* 闪烁星星 */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                  animate={{ 
                    scale: [0, 1, 0],
                    opacity: [1, 1, 0],
                    x: [0, (i % 2 === 0 ? 1 : -1) * (10 + i * 5)],
                    y: [0, (i < 2 ? -1 : 1) * (10 + i * 3)]
                  }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className="absolute pointer-events-none"
                  style={{ 
                    left: '50%', 
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.button>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}
