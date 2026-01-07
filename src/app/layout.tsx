import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 引入组件
import LoadingScreen from "@/components/LoadingScreen";
import CommandPalette from "@/components/CommandPalette";
import { PlayerProvider } from "@/context/PlayerContext";
import { ThemeProvider } from "@/context/ThemeContext";

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[var(--bg-primary)]`}>
        <ThemeProvider>
          <PlayerProvider>
            
            {/* 1. 开机动画 (通常 z-index: 50~100) */}
            <LoadingScreen />
            
            {/* 2. 全局搜索 (通常 z-index: 50, 需确保比聊天室高) */}
            <div className="relative z-[100]"> 
               <CommandPalette />
            </div>
            
            {/* 3. 页面主体 */}
            {children}

          </PlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
