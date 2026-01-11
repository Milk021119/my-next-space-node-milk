# Design Document: UI/UX Pro Max

## Overview

本设计文档定义了 SOYMILK 博客项目的 UI/UX Pro Max 全面美化升级方案。基于现有的 Next.js 16 + Tailwind CSS + Framer Motion 技术栈，通过增强动画系统、统一设计语言、优化视觉层次来提升整体用户体验。

### 设计原则

1. **一致性** - 所有页面和组件遵循统一的设计语言
2. **流畅性** - 动画和过渡效果自然流畅，不突兀
3. **层次感** - 通过阴影、模糊、渐变建立清晰的视觉层次
4. **响应式** - 在所有设备上提供优秀的体验
5. **可访问性** - 确保足够的对比度和可读性

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    UI/UX Pro Max 架构                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Theme     │  │  Animation  │  │  Component  │         │
│  │   System    │  │   Engine    │  │   Library   │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         └────────────────┼────────────────┘                 │
│                          │                                  │
│                          ▼                                  │
│              ┌───────────────────────┐                      │
│              │    Global Styles      │                      │
│              │   (globals.css)       │                      │
│              └───────────┬───────────┘                      │
│                          │                                  │
│         ┌────────────────┼────────────────┐                 │
│         │                │                │                 │
│         ▼                ▼                ▼                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Pages     │  │  Layouts    │  │  Components │         │
│  │  (app/*)    │  │             │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. 增强型动画组件

```typescript
// 动画变体配置
interface AnimationVariants {
  fadeIn: MotionProps;
  slideUp: MotionProps;
  scaleIn: MotionProps;
  staggerChildren: MotionProps;
}

// 浮动卡片组件 Props
interface FloatingCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  hoverEffect?: 'lift' | 'glow' | 'scale';
}

// 页面过渡组件 Props
interface PageTransitionProps {
  children: React.ReactNode;
  variant?: 'fade' | 'slide' | 'scale';
}
```

### 2. 增强型按钮组件

```typescript
interface EnhancedButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  glow?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

### 3. 页面 Banner 组件

```typescript
interface PageBannerProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  gradient: 'purple' | 'blue' | 'pink' | 'cyan' | 'green';
  decorations?: boolean;
  stats?: { label: string; value: number | string }[];
}
```

### 4. 增强型输入组件

```typescript
interface EnhancedInputProps {
  type?: 'text' | 'email' | 'password' | 'url';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  error?: string;
  success?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}
```

### 5. 骨架屏组件

```typescript
interface SkeletonProps {
  variant: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}
```

## Data Models

### CSS 变量系统扩展

```css
:root {
  /* 现有变量保持不变 */
  
  /* 新增动画变量 */
  --animation-fast: 150ms;
  --animation-normal: 300ms;
  --animation-slow: 500ms;
  --animation-easing: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  /* 新增阴影变量 */
  --shadow-glow-purple: 0 0 20px rgba(147, 51, 234, 0.3);
  --shadow-glow-pink: 0 0 20px rgba(236, 72, 153, 0.3);
  --shadow-glow-cyan: 0 0 20px rgba(6, 182, 212, 0.3);
  
  /* 新增渐变变量 */
  --gradient-purple-pink: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
  --gradient-blue-cyan: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  --gradient-pink-orange: linear-gradient(135deg, #ec4899 0%, #f97316 100%);
}
```

### 动画配置

```typescript
// 全局动画配置
const animationConfig = {
  // 入场动画
  entrance: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  
  // 悬停效果
  hover: {
    lift: { y: -8, transition: { duration: 0.3 } },
    glow: { boxShadow: 'var(--shadow-glow-purple)' },
    scale: { scale: 1.02 }
  },
  
  // 点击效果
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  },
  
  // 滚动触发
  viewport: {
    once: true,
    margin: '-100px'
  }
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

由于本项目主要涉及 UI/UX 视觉设计，大部分需求无法通过自动化测试验证。以下是可测试的核心属性：

### Property 1: 主题切换持久化

*For any* 用户主题选择操作，切换主题后刷新页面，应该保持用户选择的主题状态不变。

**Validates: Requirements 10.2**

### Property 2: 返回顶部按钮显示逻辑

*For any* 滚动位置大于 300px 时，返回顶部按钮应该显示；滚动位置小于等于 300px 时，按钮应该隐藏。

**Validates: Requirements 9.2**

### Property 3: 响应式布局断点

*For any* 视口宽度，文章列表应该在移动端显示单列、平板端显示两列、桌面端显示三列布局。

**Validates: Requirements 8.2, 8.3**

### Property 4: 禁用按钮状态

*For any* 设置了 disabled 属性的按钮，应该显示降低透明度的样式且不响应点击事件。

**Validates: Requirements 3.3**

### Property 5: 输入验证错误状态

*For any* 输入框在验证失败时，应该显示红色边框和错误提示信息。

**Validates: Requirements 5.4**

## Error Handling

### 动画降级策略

```typescript
// 检测用户是否偏好减少动画
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 动画降级配置
const getAnimationConfig = () => {
  if (prefersReducedMotion) {
    return {
      initial: {},
      animate: {},
      transition: { duration: 0 }
    };
  }
  return animationConfig.entrance;
};
```

### 图片加载失败处理

```typescript
// 图片加载失败时显示占位符
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.src = '/placeholder-image.svg';
  e.currentTarget.classList.add('image-error');
};
```

### 主题切换错误处理

```typescript
// 主题切换失败时回退到系统主题
const handleThemeError = () => {
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.classList.toggle('dark', systemTheme === 'dark');
};
```

## Testing Strategy

### 单元测试

由于本项目主要涉及视觉设计，单元测试将聚焦于：

1. **主题切换逻辑** - 测试主题状态管理和持久化
2. **响应式断点** - 测试布局在不同视口下的表现
3. **组件渲染** - 测试组件是否正确渲染必要元素

### 视觉回归测试

建议使用 Playwright 或 Cypress 进行视觉回归测试：

1. 截图对比各页面在不同主题下的外观
2. 截图对比各页面在不同视口下的布局
3. 截图对比组件在不同状态下的样式

### 手动测试清单

由于大部分需求涉及视觉效果和动画，需要人工验证：

- [ ] 页面入场动画流畅自然
- [ ] 卡片悬停效果正确触发
- [ ] 按钮点击反馈明显
- [ ] 主题切换过渡平滑
- [ ] 骨架屏动画正确显示
- [ ] 滚动视差效果正常
- [ ] 微交互动画精致

### 可访问性测试

1. 使用 axe-core 检查颜色对比度
2. 验证键盘导航功能
3. 测试屏幕阅读器兼容性
