# Requirements Document

## Introduction

为 SOYMILK 博客添加深色模式支持，让用户可以在明亮和暗黑主题之间切换，提升夜间使用体验。

## Glossary

- **Theme_System**: 主题管理系统，负责存储和切换主题状态
- **Theme_Toggle**: 主题切换按钮组件
- **Dark_Mode**: 深色主题样式
- **Light_Mode**: 浅色主题样式（当前默认）

## Requirements

### Requirement 1: 主题切换功能

**User Story:** As a user, I want to switch between light and dark themes, so that I can use the website comfortably in different lighting conditions.

#### Acceptance Criteria

1. WHEN a user clicks the theme toggle button, THE Theme_System SHALL switch between light and dark modes
2. WHEN the theme changes, THE Theme_System SHALL persist the preference to localStorage
3. WHEN a user revisits the website, THE Theme_System SHALL restore their previously selected theme
4. WHEN no preference is stored, THE Theme_System SHALL default to the system preference (prefers-color-scheme)

### Requirement 2: 主题切换按钮

**User Story:** As a user, I want to see a theme toggle button in the sidebar, so that I can easily switch themes.

#### Acceptance Criteria

1. THE Theme_Toggle SHALL be visible in the sidebar for all users
2. WHEN in light mode, THE Theme_Toggle SHALL display a moon icon
3. WHEN in dark mode, THE Theme_Toggle SHALL display a sun icon
4. WHEN clicked, THE Theme_Toggle SHALL trigger a smooth transition animation

### Requirement 3: 深色模式样式

**User Story:** As a user, I want all pages to have proper dark mode styling, so that the entire website is comfortable to use at night.

#### Acceptance Criteria

1. WHEN dark mode is active, THE Dark_Mode SHALL apply dark backgrounds to all pages
2. WHEN dark mode is active, THE Dark_Mode SHALL adjust text colors for readability
3. WHEN dark mode is active, THE Dark_Mode SHALL maintain sufficient contrast ratios (WCAG AA)
4. WHEN dark mode is active, THE Dark_Mode SHALL style all components consistently (buttons, cards, inputs, modals)

### Requirement 4: 过渡动画

**User Story:** As a user, I want smooth transitions when switching themes, so that the change is not jarring.

#### Acceptance Criteria

1. WHEN the theme changes, THE Theme_System SHALL apply a smooth color transition (300ms)
2. THE Theme_System SHALL NOT cause layout shifts during theme transitions
