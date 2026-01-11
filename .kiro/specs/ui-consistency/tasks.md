# Implementation Plan: UI Consistency

## Overview

分阶段统一 SOYMILK 博客全站页面的 UI 风格，从扩展 PageLayout 组件开始，逐步迁移各页面。

## Tasks

- [x] 1. 扩展 PageLayout 组件
  - [x] 1.1 增加 fullWidth 和 headerSlot 属性
    - 在 `src/components/PageLayout.tsx` 添加 fullWidth 属性支持全宽布局
    - 添加 headerSlot 属性支持自定义头部（如动态页 Banner）
    - _Requirements: 1.1, 1.2_

  - [x] 1.2 优化 AnimatedBackground 组件
    - 确保 `src/components/AnimatedBackground.tsx` 支持 variant 属性
    - 统一网格、光晕、噪点效果
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 2. 迁移关于页
  - [x] 2.1 重构 `src/app/about/page.tsx`
    - 使用 PageLayout 组件包裹内容
    - 设置 centered=true 保持居中卡片风格
    - 移除重复的 Sidebar 和背景代码
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 3. 迁移账号页
  - [x] 3.1 重构 `src/app/account/page.tsx`
    - 使用 PageLayout 组件包裹内容
    - 保留安全设置表单布局
    - 移除重复的 Sidebar 和背景代码
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 4. 优化 404 页面
  - [x] 4.1 重构 `src/app/not-found.tsx`
    - 使用统一的背景特效组件
    - 确保使用 CSS 变量
    - _Requirements: 9.1, 9.2_

- [x] 5. Checkpoint - 验证简单页面迁移
  - 确保关于页、账号页、404页显示正常
  - 测试浅色/深色模式切换
  - 如有问题请提出

- [x] 6. 迁移文章列表页
  - [x] 6.1 重构 `src/app/posts/page.tsx`
    - 使用 PageLayout 组件包裹内容
    - 保留文章卡片网格布局
    - 移除重复的背景代码
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 7. 迁移动态页
  - [x] 7.1 重构 `src/app/logs/page.tsx`
    - 使用 PageLayout 组件，利用 headerSlot 保留 Banner
    - 保留时间线风格
    - 移除重复的背景代码
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 8. 优化首页
  - [x] 8.1 优化 `src/app/page.tsx`
    - 保留双栏仪表盘布局
    - 确保所有颜色使用 CSS 变量
    - 统一卡片样式与全站协调
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 9. Final Checkpoint - 全站验证
  - 验证所有页面在浅色/深色模式下显示正常
  - 验证响应式布局在移动端正常
  - 如有问题请提出

## Notes

- 迁移时保持现有功能不变
- 优先使用 CSS 变量替换硬编码颜色
- 复用现有组件，避免重复代码
