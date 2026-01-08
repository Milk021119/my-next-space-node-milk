/**
 * 计算文章阅读时间
 * 中文按 300 字/分钟，英文按 200 词/分钟
 */
export function calculateReadingTime(content: string): {
  minutes: number;
  words: number;
  text: string;
} {
  // 移除 Markdown 语法
  const cleanContent = content
    .replace(/```[\s\S]*?```/g, '') // 代码块
    .replace(/`[^`]+`/g, '') // 行内代码
    .replace(/!\[.*?\]\(.*?\)/g, '') // 图片
    .replace(/\[.*?\]\(.*?\)/g, '') // 链接
    .replace(/[#*_~>`-]/g, '') // Markdown 符号
    .trim();

  // 统计中文字符
  const chineseChars = (cleanContent.match(/[\u4e00-\u9fa5]/g) || []).length;
  
  // 统计英文单词
  const englishWords = cleanContent
    .replace(/[\u4e00-\u9fa5]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0).length;

  // 计算阅读时间（中文 300 字/分钟，英文 200 词/分钟）
  const chineseMinutes = chineseChars / 300;
  const englishMinutes = englishWords / 200;
  const totalMinutes = Math.ceil(chineseMinutes + englishMinutes);

  const totalWords = chineseChars + englishWords;

  return {
    minutes: Math.max(1, totalMinutes),
    words: totalWords,
    text: totalMinutes < 1 ? '不到 1 分钟' : `${totalMinutes} 分钟`,
  };
}

/**
 * 格式化字数显示
 */
export function formatWordCount(count: number): string {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)} 万字`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)} 千字`;
  }
  return `${count} 字`;
}
