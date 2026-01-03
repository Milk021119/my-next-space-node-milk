import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LoadingScreen from "@/components/LoadingScreen";
import CommandPalette from "@/components/CommandPalette"; // ✨ 引入搜索组件

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
        {/* 1. 开机动画 */}
        <LoadingScreen />
        
        {/* 2. 全局搜索 (自带悬浮按钮) */}
        <CommandPalette />
        
        {/* 3. 页面主体 */}
        {children}
      </body>
    </html>
  );
}
