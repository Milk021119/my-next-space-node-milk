"use client";
import { useEffect, useRef } from 'react';

export default function Snow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const flakes: any[] = [];
    for (let i = 0; i < 150; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 3 + 1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: Math.random() * 0.6 + 0.2,
        o: Math.random() * 0.5 + 0.2
      });
    }

    function animate() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.fillStyle = 'white';
      flakes.forEach(f => {
        ctx!.beginPath();
        ctx!.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 255, 255, ${f.o})`;
        ctx!.fill();
        f.x += f.vx;
        f.y += f.vy;
        if (f.y > height) f.y = -10;
        if (f.x > width) f.x = 0;
        if (f.x < 0) f.x = width;
      });
      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[1]"
    />
  );
}