<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title><xsl:value-of select="/rss/channel/title"/> - RSS 订阅</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            padding: 2rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          }
          .rss-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: 1rem;
          }
          .rss-icon {
            width: 16px;
            height: 16px;
          }
          h1 {
            font-size: 2rem;
            color: #1a1a2e;
            margin-bottom: 0.5rem;
          }
          .description {
            color: #666;
            font-size: 1rem;
            margin-bottom: 1rem;
          }
          .subscribe-box {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 1rem;
            margin-top: 1rem;
          }
          .subscribe-box p {
            font-size: 0.875rem;
            color: #666;
            margin-bottom: 0.5rem;
          }
          .feed-url {
            display: flex;
            gap: 0.5rem;
          }
          .feed-url input {
            flex: 1;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 0.875rem;
            background: white;
          }
          .feed-url button {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: transform 0.2s;
          }
          .feed-url button:hover {
            transform: scale(1.05);
          }
          .articles {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          }
          .articles h2 {
            font-size: 1.25rem;
            color: #1a1a2e;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid #eee;
          }
          .article {
            padding: 1.25rem 0;
            border-bottom: 1px solid #eee;
          }
          .article:last-child {
            border-bottom: none;
          }
          .article-title {
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }
          .article-title a {
            color: #1a1a2e;
            text-decoration: none;
            transition: color 0.2s;
          }
          .article-title a:hover {
            color: #667eea;
          }
          .article-meta {
            font-size: 0.875rem;
            color: #888;
            margin-bottom: 0.5rem;
          }
          .article-description {
            color: #555;
            font-size: 0.9375rem;
            line-height: 1.6;
          }
          .categories {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.75rem;
            flex-wrap: wrap;
          }
          .category {
            background: #f0f0f0;
            color: #666;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
          }
          .footer {
            text-align: center;
            margin-top: 2rem;
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.875rem;
          }
          .footer a {
            color: white;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="rss-badge">
              <svg class="rss-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z"/>
              </svg>
              RSS 订阅源
            </div>
            <h1><xsl:value-of select="/rss/channel/title"/></h1>
            <p class="description"><xsl:value-of select="/rss/channel/description"/></p>
            <div class="subscribe-box">
              <p>📖 将此链接添加到你的 RSS 阅读器即可订阅：</p>
              <div class="feed-url">
                <input type="text" readonly="" id="feedUrl">
                  <xsl:attribute name="value">
                    <xsl:value-of select="/rss/channel/atom:link/@href"/>
                  </xsl:attribute>
                </input>
                <button onclick="navigator.clipboard.writeText(document.getElementById('feedUrl').value);this.textContent='已复制!';setTimeout(()=>this.textContent='复制',2000)">复制</button>
              </div>
            </div>
          </div>
          <div class="articles">
            <h2>📝 最新文章</h2>
            <xsl:for-each select="/rss/channel/item">
              <div class="article">
                <div class="article-title">
                  <a>
                    <xsl:attribute name="href">
                      <xsl:value-of select="link"/>
                    </xsl:attribute>
                    <xsl:value-of select="title"/>
                  </a>
                </div>
                <div class="article-meta">
                  <xsl:value-of select="pubDate"/>
                </div>
                <div class="article-description">
                  <xsl:value-of select="description"/>
                </div>
                <xsl:if test="category">
                  <div class="categories">
                    <xsl:for-each select="category">
                      <span class="category"><xsl:value-of select="."/></span>
                    </xsl:for-each>
                  </div>
                </xsl:if>
              </div>
            </xsl:for-each>
          </div>
          <div class="footer">
            <p>由 <a><xsl:attribute name="href"><xsl:value-of select="/rss/channel/link"/></xsl:attribute><xsl:value-of select="/rss/channel/title"/></a> 提供</p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
