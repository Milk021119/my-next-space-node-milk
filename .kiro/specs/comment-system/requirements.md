# Requirements Document

## Introduction

评论系统允许用户在文章下方发表评论，支持回复其他用户的评论，形成讨论。

## Glossary

- **Comment_System**: 评论系统，管理用户评论的核心模块
- **Comment**: 评论，用户对文章的留言
- **Reply**: 回复，对其他评论的回应
- **User**: 已登录的用户
- **Post**: 文章/动态

## Requirements

### Requirement 1: 发表评论

**User Story:** As a user, I want to comment on posts, so that I can share my thoughts and engage with content.

#### Acceptance Criteria

1. WHEN a logged-in user submits a comment, THE Comment_System SHALL create a comment record
2. WHEN a user submits a comment, THE Comment_System SHALL display it immediately in the comment list
3. WHEN a non-logged-in user tries to comment, THE Comment_System SHALL prompt them to log in
4. THE Comment_System SHALL persist comments to the database

### Requirement 2: 回复评论

**User Story:** As a user, I want to reply to comments, so that I can engage in discussions.

#### Acceptance Criteria

1. WHEN a user replies to a comment, THE Comment_System SHALL create a reply linked to the parent comment
2. WHEN displaying replies, THE Comment_System SHALL show them nested under the parent comment
3. THE Comment_System SHALL limit nesting to 2 levels (comment → reply)

### Requirement 3: 查看评论

**User Story:** As a user, I want to view all comments on a post, so that I can read discussions.

#### Acceptance Criteria

1. WHEN viewing a post, THE Comment_System SHALL display all comments
2. THE Comment_System SHALL display comments in chronological order (oldest first)
3. THE Comment_System SHALL show comment author, content, and timestamp
4. THE Comment_System SHALL show the total comment count

### Requirement 4: 删除评论

**User Story:** As a user, I want to delete my own comments, so that I can manage my contributions.

#### Acceptance Criteria

1. WHEN a user deletes their own comment, THE Comment_System SHALL remove it from display
2. THE Comment_System SHALL only allow users to delete their own comments
3. WHEN a parent comment is deleted, THE Comment_System SHALL also remove its replies
