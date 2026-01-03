import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 引入现有组件
import LoadingScreen from "@/components/LoadingScreen";
import CommandPalette from "@/components/CommandPalette";

// ✨ 引入新创建的播放器上下文
import { PlayerProvider } from "@/context/PlayerContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SOYMILK | Digital Frontier",
  description: "Personal digital space for thoughts, code, and moments.",
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
    <html lang="en">
      <body className={`${inter.className} bg-[#f0f2f5]`}>
        {/* ✨ 使用 PlayerProvider 包裹内部内容 */}
        {/* 这样无论是在开机动画、搜索、还是页面跳转时，播放器状态都会保持 */}
        <PlayerProvider>
          
          {/* 1. 开机动画 */}
          <LoadingScreen />
          
          {/* 2. 全局搜索 (自带悬浮按钮) */}
          <CommandPalette />
          
          {/* 3. 页面主体 */}
          {children}

        </PlayerProvider>
      </body>
    </html>
  );
}
