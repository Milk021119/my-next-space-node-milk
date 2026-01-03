import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LoadingScreen from "@/components/LoadingScreen"; // ✨ 引入全局加载动画

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SOYMILK | Digital Frontier",
  description: "Personal digital space for thoughts, code, and moments.",
  icons: {
    icon: "/favicon.ico", // 确保你 public 文件夹里有 favicon
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
        {/* ✨ 全局加载层：放在最上面，确保覆盖所有内容 */}
        <LoadingScreen />
        
        {/* 页面主体内容 */}
        {children}
      </body>
    </html>
  );
}
