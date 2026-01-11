'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { ToastType } from '@/types';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={20} />,
  error: <AlertCircle size={20} />,
  info: <Info size={20} />,
  warning: <AlertTriangle size={20} />,
};

const styles: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/40',
    icon: 'text-green-500',
    border: 'border-green-200 dark:border-green-700',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/40',
    icon: 'text-red-500',
    border: 'border-red-200 dark:border-red-700',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/40',
    icon: 'text-blue-500',
    border: 'border-blue-200 dark:border-blue-700',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/40',
    icon: 'text-amber-500',
    border: 'border-amber-200 dark:border-amber-700',
  },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 max-w-sm">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => {
          const style = styles[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-xl backdrop-blur-xl ${style.bg} ${style.border}`}
            >
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className={`flex-shrink-0 ${style.icon}`}
              >
                {icons[toast.type]}
              </motion.span>
              <p className="flex-1 text-sm font-semibold text-[var(--text-primary)]">
                {toast.message}
              </p>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-[var(--text-muted)]"
              >
                <X size={14} />
              </motion.button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
