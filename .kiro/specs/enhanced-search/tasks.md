# Implementation Plan: Enhanced Search

## Overview

增强现有搜索功能，支持全文搜索和深色模式。

## Tasks

- [x] 1. 增强搜索查询逻辑
  - [x] 1.1 修改 CommandPalette 搜索逻辑
    - 添加内容搜索 (content.ilike)
    - 添加标签搜索 (tags 数组包含)
    - 返回内容预览和匹配标签
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. 优化搜索结果展示
  - [x] 2.1 更新结果列表 UI
    - 显示内容预览（前100字符）
    - 显示匹配的标签
    - 区分匹配类型（标题/内容/标签）
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. 适配深色模式
  - [x] 3.1 使用 CSS 变量替换硬编码颜色
    - 背景色、文字色、边框色
    - 悬浮按钮颜色
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 4. Checkpoint - 验证功能
  - 测试搜索功能
  - 测试深色模式切换

## Notes

- 保持现有的快捷键和键盘导航功能
- 搜索结果限制为 10 条
