'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Link2, Twitter, Check, X } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  url?: string;
  className?: string;
}

export default function ShareButton({ title, url, className = '' }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(`${title} - SOYMILK`);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      setIsOpen(true);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={nativeShare}
        className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300 transition-all"
        whileTap={{ scale: 0.9 }}
        title="分享"
      >
        <Share2 size={18} />
      </motion.button>

      {/* 分享菜单 */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-2">
                <button
                  onClick={copyLink}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Link2 size={16} />}
                  {copied ? '已复制!' : '复制链接'}
                </button>
                <button
                  onClick={shareToTwitter}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <Twitter size={16} />
                  分享到 Twitter
                </button>
              </div>
              <div className="border-t border-[var(--border-color)] p-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <X size={14} /> 关闭
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
