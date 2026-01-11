# Design Document: UI Consistency

## Overview

本设计文档描述如何统一 SOYMILK 博客全站页面的 UI 风格。核心策略是扩展现有的 `PageLayout` 组件，使其能够适配更多页面场景，然后逐步将各页面迁移到统一的布局系统。

## Architecture

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                      App Layout                          │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────────────────────────────────┐   │
│  │         │  │           PageLayout                 │   │
│  │ Sidebar │  │  ┌─────────────────────────────┐    │   │
│  │         │  │  │    AnimatedBackground       │    │   │
│  │         │  │  ├─────────────────────────────┤    │   │
│  │         │  │  │    Page Header (optional)   │    │   │
│  │         │  │  ├─────────────────────────────┤    │   │
│  │         │  │  │    Page Content              │    │   │
│  │         │  │  │    ┌─────────────────────┐  │    │   │
│  │         │  │  │    │     PageCard        │  │    │   │
│  │         │  │  │    └─────────────────────┘  │    │   │
│  │         │  │  ├─────────────────────────────┤    │   │
│  │         │  │  │    PageFooter (optional)    │    │   │
│  └─────────┘  │  └─────────────────────────────┘    │   │
│               └─────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 组件层次

1. **PageLayout** - 顶层布局组件，提供侧边栏集成和背景特效
2. **AnimatedBackground** - 统一的动态背景组件
3. **PageCard** - 统一的卡片容器组件
4. **SectionTitle** - 统一的区块标题组件
5. **PageFooter** - 统一的页脚组件

## Components and Interfaces

### PageLayout 组件扩展

```typescript
interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  backLink?: string;
  backText?: string;
  showBackground?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  centered?: boolean;
  className?: string;
  // 新增属性
  showSidebar?: boolean;      // 是否显示侧边栏，默认 true
  fullWidth?: boolean;        // 是否全宽布局（用于首页等特殊页面）
  headerSlot?: ReactNode;     // 自定义头部插槽（用于动态页 Banner）
}
```

### AnimatedBackground 组件

```typescript
interface AnimatedBackgroundProps {
  variant?: 'default' | 'subtle' | 'minimal';
  showGrid?: boolean;
  showGlow?: boolean;
  showNoise?: boolean;
}
```

### PageCard 组件（已存在）

```typescript
interface PageCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}
```

### CSS 变量系统（已存在）

```css
:root {
  --bg-primary: #f0f2f5;
  --bg-secondary: #ffffff;
  --bg-tertiary: #f8fafc;
  --bg-card: rgba(255, 255, 255, 0.8);
  --bg-card-hover: rgba(255, 255, 255, 0.9);
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --border-color: #e2e8f0;
  --accent-color: #9333ea;
  --accent-hover: #7c3aed;
  --shadow-color: rgba(0, 0, 0, 0.1);
}
```

## Data Models

本功能不涉及数据模型变更，仅涉及 UI 组件重构。

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do.*

本功能主要是 UI 重构工作，涉及视觉一致性和代码组织优化。这类需求主要依赖人工视觉检查和代码审查，而非自动化属性测试。

经过分析，本功能没有适合属性测试的正确性属性，原因如下：
- 大多数需求是关于 UI 视觉一致性的，需要人工视觉验证
- 组件 API 相关的需求更适合单元测试而非属性测试
- CSS 变量使用情况更适合 lint 规则检查

## Error Handling

### 组件降级策略

1. **背景特效加载失败**: 如果动态背景组件加载失败，页面应正常显示纯色背景
2. **侧边栏加载失败**: 如果侧边栏组件加载失败，主内容区应自动扩展到全宽

### 兼容性处理

1. **CSS 变量不支持**: 为不支持 CSS 变量的浏览器提供回退值
2. **动画性能**: 在低性能设备上可通过 `prefers-reduced-motion` 媒体查询禁用动画

## Testing Strategy

### 测试方法

由于本功能主要是 UI 重构，测试策略以人工视觉测试和代码审查为主：

1. **视觉回归测试**: 手动检查各页面在浅色/深色模式下的显示效果
2. **代码审查**: 确保所有页面使用 CSS 变量而非硬编码颜色值
3. **响应式测试**: 检查各页面在不同屏幕尺寸下的布局表现
4. **组件单元测试**: 验证 PageLayout 组件的各配置选项正常工作

### 测试清单

- [ ] 首页在浅色/深色模式下显示正常
- [ ] 文章列表页使用 PageLayout 后布局正确
- [ ] 动态页保留 Banner 风格且与全站协调
- [ ] 关于页居中卡片显示正常
- [ ] 账号页表单布局正确
- [ ] 404 页面背景特效与全站一致
- [ ] 所有页面在移动端响应式布局正常

## Migration Plan

### 迁移顺序

1. **Phase 1**: 扩展 PageLayout 组件，增加新的配置选项
2. **Phase 2**: 迁移简单页面（关于页、账号页、404页）
3. **Phase 3**: 迁移复杂页面（文章列表页、动态页）
4. **Phase 4**: 优化首页，保持独特风格的同时统一设计语言

### 迁移原则

- 保持现有功能不变
- 逐步替换硬编码颜色为 CSS 变量
- 复用现有组件，避免重复代码
- 保留各页面的独特特性
