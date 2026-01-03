"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React, { useRef } from "react";

interface Props {
  src: string;
}

export default function ParallaxImage({ src }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // 🔧 关键修改 1: 物理参数调教
  // stiffness (刚度): 400 -> 100 (越小越软，不再猛冲)
  // damping (阻尼): 30 (保持平滑)
  // mass (质量): 0.5 -> 0.1 (越小越轻盈，跟手度更好)
  const springConfig = { stiffness: 100, damping: 30, mass: 0.1 };
  
  const mouseX = useSpring(x, springConfig);
  const mouseY = useSpring(y, springConfig);

  // 移动范围：保持在 ±2% (微动)
  const xRange = useTransform(mouseX, [-0.5, 0.5], ["-2%", "2%"]);
  const yRange = useTransform(mouseY, [-0.5, 0.5], ["-2%", "2%"]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // 计算鼠标相对位置
    let relativeX = (event.clientX - rect.left) / width - 0.5;
    let relativeY = (event.clientY - rect.top) / height - 0.5;

    // 🔧 关键修改 2: 加上数值钳制 (Clamp)
    // 防止鼠标移出边界瞬间产生 >0.5 的异常值，导致瞬移
    if (relativeX < -0.5) relativeX = -0.5;
    if (relativeX > 0.5) relativeX = 0.5;
    if (relativeY < -0.5) relativeY = -0.5;
    if (relativeY > 0.5) relativeY = 0.5;

    x.set(relativeX);
    y.set(relativeY);
  }

  function handleMouseLeave() {
    // 鼠标离开时，缓慢回正
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
      <motion.img
        src={src}
        alt="cover"
        // 基础样式
        style={{ 
          x: xRange, 
          y: yRange, 
          scale: 1.05 // 默认稍微放大一点点，防止移动露出白边
        }} 
        className="w-full h-full object-cover"
        
        // 🔧 关键修改 3: 呼吸效果独立优化
        // 极慢速呼吸，像睡眠一样，几乎察觉不到但有生命力
        animate={{ scale: [1.05, 1.08] }} 
        transition={{ 
          scale: {
            duration: 8, 
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }
        }}
      />
      
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none transition-opacity duration-500 group-hover:opacity-0" />
    </div>
  );
}
