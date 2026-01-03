import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 引入组件
import LoadingScreen from "@/components/LoadingScreen";
import CommandPalette from "@/components/CommandPalette";
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
      </body>
    </html>
  );
}
