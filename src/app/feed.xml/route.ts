import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, content, created_at, author_email, tags')
    .eq('type', 'article')
    .order('created_at', { ascending: false })
    .limit(20);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://soymilk.vercel.app';
  
  const rssItems = (posts || []).map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/post/${post.id}</link>
      <guid isPermaLink="true">${siteUrl}/post/${post.id}</guid>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      <description><![CDATA[${post.content?.slice(0, 300)}...]]></description>
      <author>${post.author_email}</author>
      ${post.tags?.map((tag: string) => `<category>${tag}</category>`).join('\n      ') || ''}
    </item>`).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SOYMILK</title>
    <link>${siteUrl}</link>
    <description>记录代码、想法与生活的个人博客空间</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
