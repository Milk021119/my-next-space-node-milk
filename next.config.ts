/** @type {import('next').NextConfig} */
const nextConfig = {
  // 图片优化配置
  images: {
    // 允许加载图片的远程域名白名单
    remotePatterns: [
      // Unsplash 图库
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // DiceBear 头像 API
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      // 👇 你的 Supabase Storage 域名 (如果不加这个，上传的图片会报错！)
      // 请把 'your-project-id' 换成你真实的 ID，或者干脆允许所有 supabase.co
      {
        protocol: 'https',
        hostname: '*.supabase.co', // 允许所有 supabase 子域名 (懒人写法，推荐)
      },
      // 网易云音乐封面
      {
        protocol: 'http',
        hostname: 'p1.music.126.net',
      },
      {
        protocol: 'http',
        hostname: 'p2.music.126.net',
      },
      // 如果你还有其他图床 (比如 sm.ms, imgur)，也要加在这里
      // { protocol: 'https', hostname: 'i.imgur.com' },
    ],
    // 允许 SVG 格式 (如果用矢量图)
    dangerouslyAllowSVG: true,
  },

  // 安全响应头配置（替代已弃用的 middleware）
  async headers() {
    return [
      {
        // 应用于所有路由
        source: '/:path*',
        headers: [
          // 防止点击劫持
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // 防止 MIME 类型嗅探
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // XSS 保护
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // 引用策略
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // 权限策略
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
