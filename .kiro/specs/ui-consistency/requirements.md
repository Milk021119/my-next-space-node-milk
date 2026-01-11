# Requirements Document

## Introduction

统一 SOYMILK 博客全站页面的 UI 风格，确保所有页面使用一致的布局组件、背景特效、卡片样式和设计语言。目前部分页面（如首页、文章列表页、动态页、关于页、账号页）使用了各自独立的布局实现，导致代码重复且风格不完全一致。

## Glossary

- **PageLayout**: 统一的页面布局组件，位于 `src/components/PageLayout.tsx`
- **PageCard**: 统一的卡片组件，提供一致的背景、圆角、边框样式
- **AnimatedBackground**: 动态背景特效组件
- **CSS_Variables**: 全局 CSS 变量，定义颜色、间距等设计令牌
- **Sidebar**: 侧边栏导航组件

## Requirements

### Requirement 1: 页面布局统一

**User Story:** 作为开发者，我希望所有页面使用统一的布局组件，以便减少代码重复并保持一致的用户体验。

#### Acceptance Criteria

1. WHEN 用户访问任意页面 THEN THE PageLayout SHALL 提供一致的侧边栏、背景特效和内容区域布局
2. WHEN 页面需要自定义布局参数 THEN THE PageLayout SHALL 支持 maxWidth、centered、showBackground 等配置选项
3. WHEN 页面包含返回链接 THEN THE PageLayout SHALL 统一显示返回按钮样式

### Requirement 2: 背景特效统一

**User Story:** 作为用户，我希望所有页面的背景特效风格一致，以获得连贯的视觉体验。

#### Acceptance Criteria

1. THE AnimatedBackground SHALL 在所有页面提供一致的网格背景、动态光晕和噪点纹理
2. WHEN 深色模式切换时 THEN THE AnimatedBackground SHALL 自动适配深色主题的光晕颜色
3. WHERE 页面需要简化背景 THEN THE PageLayout SHALL 支持 showBackground=false 选项

### Requirement 3: 卡片样式统一

**User Story:** 作为用户，我希望所有页面的卡片组件具有一致的视觉风格。

#### Acceptance Criteria

1. THE PageCard SHALL 在所有页面使用一致的背景色、圆角、边框和阴影样式
2. WHEN 卡片需要悬浮效果 THEN THE PageCard SHALL 支持 hover 属性启用阴影变化
3. THE SectionTitle SHALL 在所有页面使用一致的标题样式（大写、字间距、图标）

### Requirement 4: 首页布局优化

**User Story:** 作为用户，我希望首页保持独特的仪表盘风格，同时与全站设计语言协调。

#### Acceptance Criteria

1. THE HomePage SHALL 保留现有的双栏仪表盘布局
2. THE HomePage SHALL 使用 CSS 变量替换所有硬编码颜色值
3. THE HomePage SHALL 使用统一的卡片组件样式

### Requirement 5: 文章列表页布局优化

**User Story:** 作为用户，我希望文章列表页使用统一的布局组件。

#### Acceptance Criteria

1. THE PostsPage SHALL 使用 PageLayout 组件包裹内容
2. THE PostsPage SHALL 保留现有的文章卡片网格布局
3. THE PostsPage SHALL 使用 CSS 变量替换所有硬编码颜色值

### Requirement 6: 动态页布局优化

**User Story:** 作为用户，我希望动态页使用统一的布局组件。

#### Acceptance Criteria

1. THE LogsPage SHALL 使用 PageLayout 组件或保持与全站一致的布局结构
2. THE LogsPage SHALL 使用 CSS 变量替换所有硬编码颜色值
3. THE LogsPage SHALL 保留现有的 Banner 和时间线风格

### Requirement 7: 关于页布局优化

**User Story:** 作为用户，我希望关于页使用统一的布局组件。

#### Acceptance Criteria

1. THE AboutPage SHALL 使用 PageLayout 组件包裹内容
2. THE AboutPage SHALL 使用 CSS 变量替换所有硬编码颜色值
3. THE AboutPage SHALL 保留居中卡片的展示风格

### Requirement 8: 账号页布局优化

**User Story:** 作为用户，我希望账号页使用统一的布局组件。

#### Acceptance Criteria

1. THE AccountPage SHALL 使用 PageLayout 组件包裹内容
2. THE AccountPage SHALL 使用 CSS 变量替换所有硬编码颜色值
3. THE AccountPage SHALL 保留现有的安全设置表单布局

### Requirement 9: 404 页面布局优化

**User Story:** 作为用户，我希望 404 页面与全站风格一致。

#### Acceptance Criteria

1. THE NotFoundPage SHALL 使用统一的背景特效
2. THE NotFoundPage SHALL 使用 CSS 变量替换所有硬编码颜色值
