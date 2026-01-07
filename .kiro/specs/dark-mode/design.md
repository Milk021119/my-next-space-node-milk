# Design Document: Dark Mode

## Overview

为 SOYMILK 博客实现深色模式功能。采用 CSS 变量 + React Context 的方案，支持主题持久化和系统偏好检测。

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      App Layout                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │              ThemeProvider (Context)             │   │
│  │  ┌─────────────┐  ┌─────────────────────────┐  │   │
│  │  │ ThemeToggle │  │     Page Components      │  │   │
│  │  │  (Sidebar)  │  │  (use CSS variables)     │  │   │
│  │  └─────────────┘  └─────────────────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
│                           │                              │
│                    localStorage                          │
│                   (theme preference)                     │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### ThemeProvider

```typescript
// src/context/ThemeContext.tsx
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

// 功能：
// 1. 初始化时读取 localStorage 或系统偏好
// 2. 提供 theme 状态和切换方法
// 3. 主题变化时更新 document.documentElement 的 class
// 4. 持久化到 localStorage
```

### ThemeToggle

```typescript
// src/components/ThemeToggle.tsx
interface ThemeToggleProps {
  className?: string;
}

// 功能：
// 1. 显示太阳/月亮图标
// 2. 点击时调用 toggleTheme
// 3. 带有过渡动画
```

## Data Models

### localStorage Schema

```typescript
// Key: 'soymilk_theme'
// Value: 'light' | 'dark'
```

### CSS Variables

```css
/* 浅色主题 (默认) */
:root {
  --bg-primary: #f0f2f5;
  --bg-secondary: #ffffff;
  --bg-tertiary: #f8fafc;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --border-color: #e2e8f0;
  --accent-color: #9333ea;
}

/* 深色主题 */
:root.dark {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #64748b;
  --border-color: #334155;
  --accent-color: #a855f7;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do.*

### Property 1: Theme Persistence Round Trip

*For any* theme preference ('light' or 'dark'), setting the theme should persist to localStorage, and initializing the ThemeProvider should restore that same theme.

**Validates: Requirements 1.2, 1.3**

### Property 2: Theme Toggle Alternation

*For any* current theme state, calling toggleTheme should switch to the opposite theme (light → dark, dark → light).

**Validates: Requirements 1.1**

## Error Handling

| Scenario | Handling |
|----------|----------|
| localStorage 不可用 | 回退到系统偏好，不持久化 |
| 无效的存储值 | 忽略并使用系统偏好 |
| 系统偏好不支持 | 默认使用浅色主题 |

## Testing Strategy

### Unit Tests

- ThemeProvider 初始化逻辑
- toggleTheme 切换逻辑
- localStorage 读写

### Property-Based Tests

- 使用 fast-check 库
- 每个属性测试运行 100 次迭代
- 测试主题持久化的 round-trip 属性

### Integration Tests

- ThemeToggle 组件渲染
- 主题切换后 CSS 变量应用
