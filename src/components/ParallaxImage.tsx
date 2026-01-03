"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image"; // ✨ 引入 Next.js 图片组件

interface Props {
  src: string;
}

export default function ParallaxImage({ src }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  
  // ✨ 新增：检测是否为移动端
  const [isMobile, setIsMobile] = useState(true); // 默认先当移动端处理（SSR安全）

  useEffect(() => {
    // 只有在客户端才检测，宽屏且支持鼠标才算桌面端
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // 物理参数：刚度低一点，更柔和
  const mouseX = useSpring(x, { stiffness: 100, damping: 30, mass: 0.1 });
  const mouseY = useSpring(y, { stiffness: 100, damping: 30, mass: 0.1 });

  const xRange = useTransform(mouseX, [-0.5, 0.5], ["-2%", "2%"]);
  const yRange = useTransform(mouseY, [-0.5, 0.5], ["-2%", "2%"]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    // 移动端不计算视差，省电省资源
    if (isMobile || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    let relativeX = (event.clientX - rect.left) / width - 0.5;
    let relativeY = (event.clientY - rect.top) / height - 0.5;

    // 数值钳制
    if (relativeX < -0.5) relativeX = -0.5; if (relativeX > 0.5) relativeX = 0.5;
    if (relativeY < -0.5) relativeY = -0.5; if (relativeY > 0.5) relativeY = 0.5;

    x.set(relativeX);
    y.set(relativeY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div 
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full h-full overflow-hidden relative"
    >
      {/* 使用 motion.div 包裹 Next.js 的 Image */}
      <motion.div
        className="w-full h-full relative"
        style={{ 
          // 移动端不仅禁用计算，还把 x,y 强制设为 0
          x: isMobile ? 0 : xRange, 
          y: isMobile ? 0 : yRange, 
          scale: 1.05 
        }}
        // 呼吸效果：保留，但可以考虑在低电量模式下关闭（这里暂且保留，因为效果好）
        animate={{ scale: [1.05, 1.08] }} 
        transition={{ 
          scale: { duration: 8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
        }}
      >
        {/* ✨ Next.js Image 自动优化 */}
        <Image 
          src={src} 
          alt="cover"
          fill // 自动填满父容器
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // 告诉浏览器加载多大的图
          priority={false} // 懒加载
        />
      </motion.div>
      
      <div className="absolute inset-0 bg-black/10 pointer-events-none transition-opacity duration-500 group-hover:opacity-0" />
    </div>
  );
}
