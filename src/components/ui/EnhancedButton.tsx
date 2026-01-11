'use client';

import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// 按钮变体样式
const variants = {
  primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:from-purple-500 hover:to-pink-500',
  secondary: 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] shadow-sm hover:shadow-md',
  ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]',
  danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:from-red-400 hover:to-rose-500',
};

// 按钮尺寸
const sizes = {
  sm: 'px-3 py-1.5 text-xs min-h-[32px] rounded-lg',
  md: 'px-5 py-2.5 text-sm min-h-[40px] rounded-xl',
  lg: 'px-7 py-3.5 text-base min-h-[48px] rounded-2xl',
};

// 发光效果
const glowStyles = {
  primary: 'hover:ring-4 hover:ring-purple-500/20',
  secondary: 'hover:ring-4 hover:ring-[var(--accent-color)]/10',
  ghost: '',
  danger: 'hover:ring-4 hover:ring-red-500/20',
};

interface EnhancedButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  glow?: boolean;
  children: ReactNode;
}

const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      glow = true,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        whileHover={isDisabled ? {} : { scale: 1.02, y: -2 }}
        whileTap={isDisabled ? {} : { scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        disabled={isDisabled}
        className={cn(
          // 基础样式
          'inline-flex items-center justify-center gap-2 font-bold transition-all duration-300 cursor-pointer',
          // 变体样式
          variants[variant],
          // 尺寸样式
          sizes[size],
          // 发光效果
          glow && glowStyles[variant],
          // 全宽
          fullWidth && 'w-full',
          // 禁用状态
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          // 自定义类名
          className
        )}
        {...(props as any)}
      >
        {/* 加载状态 */}
        {loading && (
          <Loader2 
            size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} 
            className="animate-spin" 
          />
        )}
        
        {/* 左侧图标 */}
        {!loading && icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        
        {/* 按钮文字 */}
        <span>{children}</span>
        
        {/* 右侧图标 */}
        {!loading && icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </motion.button>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';

export default EnhancedButton;

// 图标按钮变体
interface IconButtonProps extends Omit<EnhancedButtonProps, 'children' | 'icon' | 'iconPosition'> {
  icon: ReactNode;
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', className, ...props }, ref) => {
    const iconSizes = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
    };

    return (
      <EnhancedButton
        ref={ref}
        size={size}
        className={cn(
          iconSizes[size],
          'p-0 rounded-full',
          className
        )}
        {...props}
      >
        {icon}
      </EnhancedButton>
    );
  }
);

IconButton.displayName = 'IconButton';
