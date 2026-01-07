# Implementation Plan: Dark Mode

## Overview

为 SOYMILK 博客实现深色模式，采用 CSS 变量 + React Context 方案。

## Tasks

- [x] 1. 创建主题系统基础设施
  - [x] 1.1 创建 ThemeContext 和 ThemeProvider
    - 在 `src/context/ThemeContext.tsx` 创建主题上下文
    - 实现 theme 状态、toggleTheme、setTheme 方法
    - 初始化时读取 localStorage 或系统偏好
    - 主题变化时更新 document.documentElement.classList
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.2 编写 ThemeContext 属性测试
    - **Property 1: Theme Persistence Round Trip**
    - **Validates: Requirements 1.2, 1.3**

  - [x] 1.3 编写 ThemeContext 属性测试
    - **Property 2: Theme Toggle Alternation**
    - **Validates: Requirements 1.1**

- [x] 2. 定义 CSS 变量和深色样式
  - [x] 2.1 在 globals.css 中定义 CSS 变量
    - 定义浅色主题变量（:root）
    - 定义深色主题变量（:root.dark）
    - 添加过渡动画样式
    - _Requirements: 3.1, 3.2, 4.1_

- [x] 3. 创建主题切换组件
  - [x] 3.1 创建 ThemeToggle 组件
    - 在 `src/components/ThemeToggle.tsx` 创建组件
    - 使用 lucide-react 的 Sun/Moon 图标
    - 实现点击切换和动画效果
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.2 将 ThemeToggle 集成到 Sidebar
    - 在侧边栏底部添加主题切换按钮
    - _Requirements: 2.1_

- [x] 4. 集成 ThemeProvider 到应用
  - [x] 4.1 在 layout.tsx 中包裹 ThemeProvider
    - 确保所有页面都能访问主题上下文
    - _Requirements: 1.1_

- [x] 5. 适配各页面深色样式
  - [x] 5.1 适配首页 (page.tsx) 深色样式
    - 使用 CSS 变量替换硬编码颜色
    - _Requirements: 3.1, 3.2, 3.4_

  - [x] 5.2 适配文章列表页 (posts/page.tsx) 深色样式
    - 使用 CSS 变量替换硬编码颜色
    - _Requirements: 3.1, 3.2, 3.4_

  - [x] 5.3 适配动态页 (logs/page.tsx) 深色样式
    - 使用 CSS 变量替换硬编码颜色
    - _Requirements: 3.1, 3.2, 3.4_

  - [x] 5.4 适配聊天页 (chat/page.tsx) 深色样式
    - 聊天页已经是深色，确保一致性
    - _Requirements: 3.4_

  - [x] 5.5 适配 Sidebar 组件深色样式
    - 使用 CSS 变量替换硬编码颜色
    - _Requirements: 3.1, 3.2, 3.4_

  - [x] 5.6 适配 LoginModal 组件深色样式
    - 使用 CSS 变量替换硬编码颜色
    - _Requirements: 3.1, 3.2, 3.4_

- [x] 6. Checkpoint - 验证功能
  - 确保所有测试通过，手动测试主题切换效果
  - 如有问题请提出

## Notes

- 聊天页 (chat) 本身已经是深色风格，需要确保与全局深色模式协调
- 使用 CSS 变量可以最小化代码改动
