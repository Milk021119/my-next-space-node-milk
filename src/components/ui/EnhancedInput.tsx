'use client';

import { InputHTMLAttributes, forwardRef, ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  icon?: ReactNode;
  error?: string;
  success?: boolean;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  (
    {
      label,
      icon,
      error,
      success,
      helperText,
      size = 'md',
      fullWidth = true,
      type = 'text',
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    // 尺寸样式
    const sizeStyles = {
      sm: 'py-2 text-xs',
      md: 'py-3 text-sm',
      lg: 'py-4 text-base',
    };

    // 状态样式
    const getStateStyles = () => {
      if (error) {
        return 'border-red-500 focus:border-red-500 focus:ring-red-500/20';
      }
      if (success) {
        return 'border-green-500 focus:border-green-500 focus:ring-green-500/20';
      }
      return 'border-[var(--border-color)] focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]/20';
    };

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {/* 标签 */}
        {label && (
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            {label}
          </label>
        )}

        {/* 输入框容器 */}
        <div className="relative">
          {/* 左侧图标 */}
          {icon && (
            <div className={cn(
              'absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors pointer-events-none',
              isFocused && 'text-[var(--accent-color)]',
              error && 'text-red-500',
              success && 'text-green-500'
            )}>
              {icon}
            </div>
          )}

          {/* 输入框 */}
          <input
            ref={ref}
            type={inputType}
            disabled={disabled}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={cn(
              // 基础样式
              'w-full bg-[var(--bg-secondary)] rounded-xl border-2 outline-none transition-all duration-300',
              // 焦点环
              'focus:ring-4',
              // 尺寸
              sizeStyles[size],
              // 左侧内边距（有图标时）
              icon ? 'pl-12 pr-4' : 'px-4',
              // 右侧内边距（密码框或有状态图标时）
              (isPassword || error || success) && 'pr-12',
              // 状态样式
              getStateStyles(),
              // 禁用状态
              disabled && 'opacity-50 cursor-not-allowed bg-[var(--bg-tertiary)]',
              // 自定义类名
              className
            )}
            {...props}
          />

          {/* 右侧图标区域 */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* 密码显示切换 */}
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}

            {/* 状态图标 */}
            {error && !isPassword && (
              <AlertCircle size={18} className="text-red-500" />
            )}
            {success && !isPassword && !error && (
              <CheckCircle2 size={18} className="text-green-500" />
            )}
          </div>
        </div>

        {/* 错误/帮助文本 */}
        <AnimatePresence mode="wait">
          {(error || helperText) && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'mt-2 text-xs',
                error ? 'text-red-500' : 'text-[var(--text-muted)]'
              )}
            >
              {error || helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';

export default EnhancedInput;

// 文本域组件
interface EnhancedTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  autoResize?: boolean;
}

export const EnhancedTextarea = forwardRef<HTMLTextAreaElement, EnhancedTextareaProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      fullWidth = true,
      autoResize = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const sizeStyles = {
      sm: 'py-2 px-3 text-xs min-h-[80px]',
      md: 'py-3 px-4 text-sm min-h-[120px]',
      lg: 'py-4 px-5 text-base min-h-[160px]',
    };

    const getStateStyles = () => {
      if (error) {
        return 'border-red-500 focus:border-red-500 focus:ring-red-500/20';
      }
      return 'border-[var(--border-color)] focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]/20';
    };

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {label && (
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          disabled={disabled}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={cn(
            'w-full bg-[var(--bg-secondary)] rounded-xl border-2 outline-none transition-all duration-300 resize-none',
            'focus:ring-4',
            sizeStyles[size],
            getStateStyles(),
            disabled && 'opacity-50 cursor-not-allowed bg-[var(--bg-tertiary)]',
            autoResize && 'overflow-hidden',
            className
          )}
          {...props}
        />

        <AnimatePresence mode="wait">
          {(error || helperText) && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'mt-2 text-xs',
                error ? 'text-red-500' : 'text-[var(--text-muted)]'
              )}
            >
              {error || helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

EnhancedTextarea.displayName = 'EnhancedTextarea';
