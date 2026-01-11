-- 添加浏览量字段到 posts 表
ALTER TABLE posts ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_posts_views ON posts(views DESC);

-- 创建原子递增函数
CREATE OR REPLACE FUNCTION increment_view_count(post_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE posts 
  SET views = COALESCE(views, 0) + 1 
  WHERE id = post_id
  RETURNING views INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;
