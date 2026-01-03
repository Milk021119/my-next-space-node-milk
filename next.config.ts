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
      // 如果你还有其他图床 (比如 sm.ms, imgur)，也要加在这里
      // { protocol: 'https', hostname: 'i.imgur.com' },
    ],
    // 允许 SVG 格式 (如果用矢量图)
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
