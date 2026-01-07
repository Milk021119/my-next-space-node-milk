# Implementation Plan: Bookmark System

## Overview

实现收藏/书签功能，允许用户保存和管理感兴趣的文章。

## Tasks

- [x] 1. 创建数据库表和服务函数
  - [x] 1.1 在 Supabase 创建 bookmarks 表
    - 创建表结构：id, user_id, post_id, created_at
    - 添加外键约束和唯一索引
    - _Requirements: 1.4_

  - [x] 1.2 创建 `src/lib/bookmarks.ts` 服务文件
    - 实现 `isBookmarked(userId, postId)` 函数
    - 实现 `addBookmark(userId, postId)` 函数
    - 实现 `removeBookmark(userId, postId)` 函数
    - 实现 `toggleBookmark(userId, postId)` 函数
    - 实现 `getUserBookmarks(userId)` 函数
    - 实现 `getBookmarkCount(userId)` 函数
    - 实现 `getBookmarkStatuses(userId, postIds)` 函数
    - _Requirements: 1.1, 2.1, 3.1, 3.4_

  - [x] 1.3 编写收藏服务属性测试
    - **Property 1: Bookmark Round Trip**
    - **Property 2: Unbookmark Removes Record**
    - **Validates: Requirements 1.1, 1.4, 2.1**

- [x] 2. 创建收藏按钮组件
  - [x] 2.1 创建 `src/components/BookmarkButton.tsx`
    - 实现收藏/取消收藏切换
    - 显示填充/空心图标状态
    - 处理未登录用户（弹出登录框）
    - 添加加载状态和动画效果
    - _Requirements: 1.2, 1.3, 2.2, 4.1, 4.2_

- [x] 3. 集成收藏按钮到现有页面
  - [x] 3.1 在文章列表页 `src/app/posts/page.tsx` 添加收藏按钮
    - 在每个文章卡片添加 BookmarkButton
    - 批量加载收藏状态
    - _Requirements: 4.1, 4.2_

  - [x] 3.2 在文章详情页 `src/app/post/[id]/page.tsx` 添加收藏按钮
    - 在文章头部添加 BookmarkButton
    - _Requirements: 4.1, 4.2_

  - [x] 3.3 在动态列表页 `src/app/logs/page.tsx` 添加收藏按钮
    - 在每个动态卡片添加 BookmarkButton
    - _Requirements: 4.1, 4.2_

- [x] 4. 创建收藏列表页面
  - [x] 4.1 创建 `src/app/u/[id]/bookmarks/page.tsx`
    - 显示用户所有收藏的文章
    - 按收藏时间倒序排列
    - 支持取消收藏
    - 空状态提示
    - _Requirements: 3.1, 3.2_

  - [x] 4.2 在用户资料页添加收藏入口
    - 在 `src/app/u/[id]/page.tsx` 添加收藏数量显示
    - 添加"查看收藏"链接
    - _Requirements: 3.4_

- [x] 5. Checkpoint - 确保所有功能正常
  - 确保所有测试通过，如有问题请询问用户

## Notes

- 任务标记 `*` 为可选测试任务
- 每个任务都引用了具体的需求
- 使用 Supabase 的 CASCADE 删除处理文章删除时的收藏清理
