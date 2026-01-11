// 简单的内存速率限制（生产环境建议使用 Redis）
const rateLimit = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1分钟
const RATE_LIMIT_MAX = 100; // 每分钟最多100次请求

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimit.get(ip);
  
  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimit.set(ip, { count: 1, timestamp: now });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}

export function getClientIP(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}

// 清理过期记录（每分钟执行一次）
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimit.entries()) {
      if (now - record.timestamp > RATE_LIMIT_WINDOW) {
        rateLimit.delete(key);
      }
    }
  }, RATE_LIMIT_WINDOW);
}
