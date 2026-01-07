# Implementation Plan: Comment System

## Overview

实现文章评论功能，支持发表评论、回复和删除。

## Tasks

- [x] 1. 创建数据库表
  - [x] 1.1 创建 comments 表迁移文件
    - 创建表结构：id, post_id, user_id, parent_id, content, created_at
    - 添加外键约束和索引
    - 添加 RLS 策略
    - _Requirements: 1.4_

- [x] 2. 创建评论服务函数
  - [x] 2.1 创建 `src/lib/comments.ts`
    - 实现 `getComments(postId)` 函数
    - 实现 `addComment(postId, userId, content, parentId?)` 函数
    - 实现 `deleteComment(commentId, userId)` 函数
    - 实现 `getCommentCount(postId)` 函数
    - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [x] 3. 创建评论组件
  - [x] 3.1 创建 `src/components/comments/CommentSection.tsx`
    - 评论列表展示
    - 评论表单
    - 回复功能
    - 删除功能
    - 深色模式适配
    - _Requirements: 1.2, 1.3, 2.2, 3.2, 3.3, 4.2_

- [x] 4. 集成到文章详情页
  - [x] 4.1 在 `src/app/post/[id]/page.tsx` 添加评论区
    - 在文章底部添加 CommentSection
    - 显示评论数量
    - _Requirements: 3.1, 3.4_

- [x] 5. Checkpoint - 验证功能
  - 测试评论发表、回复、删除
  - 测试深色模式

## Notes

- 评论嵌套最多2层
- 使用 CASCADE 删除处理级联
- 适配深色模式
