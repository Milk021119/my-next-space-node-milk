import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 引入组件
import LoadingScreen from "@/components/LoadingScreen";
import CommandPalette from "@/components/CommandPalette";
import ToastContainer from "@/components/Toast";
import BackToTop from "@/components/BackToTop";
import ReadingProgress from "@/components/ReadingProgress";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import SkipToContent from "@/components/SkipToContent";
import { WebsiteJsonLd } from "@/components/JsonLd";
import { PlayerProvider } from "@/context/PlayerContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://soymilk.vercel.app';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "SOYMILK | 个人数字空间",
    template: "%s | SOYMILK"
  },
  description: "记录代码、想法与生活的个人博客空间",
  keywords: ["博客", "技术", "编程", "生活", "SOYMILK"],
  authors: [{ name: "SOYMILK" }],
  creator: "SOYMILK",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "SOYMILK",
    title: "SOYMILK | 个人数字空间",
    description: "记录代码、想法与生活的个人博客空间",
  },
  twitter: {
    card: "summary_large_image",
    title: "SOYMILK | 个人数字空间",
    description: "记录代码、想法与生活的个人博客空间",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="alternate" type="application/rss+xml" title="SOYMILK RSS" href="/feed.xml" />
        <WebsiteJsonLd 
          siteUrl={siteUrl}
          siteName="SOYMILK"
          description="记录代码、想法与生活的个人博客空间"
        />
      </head>
      <body className={`${inter.className} bg-[var(--bg-primary)]`}>
        <ThemeProvider>
          <ToastProvider>
            <PlayerProvider>
              {/* 0. 可访问性：跳过导航 */}
              <SkipToContent />
              
              {/* 1. 阅读进度条 */}
              <ReadingProgress />
              
              {/* 2. 开机动画 (通常 z-index: 50~100) */}
              <LoadingScreen />
              
              {/* 3. 全局搜索 (通常 z-index: 50, 需确保比聊天室高) */}
              <div className="relative z-[100]"> 
                <CommandPalette />
              </div>
              
              {/* 4. 页面主体 */}
              <main id="main-content">
                {children}
              </main>

              {/* 5. Toast 通知 */}
              <ToastContainer />
              
              {/* 6. 返回顶部按钮 */}
              <BackToTop />
              
              {/* 7. 键盘快捷键提示 */}
              <KeyboardShortcuts />

            </PlayerProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
