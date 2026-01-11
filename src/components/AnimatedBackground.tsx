'use client';

import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  variant?: 'default' | 'subtle' | 'minimal';
  showGrid?: boolean;
  showGlow?: boolean;
  showNoise?: boolean;
}

export default function AnimatedBackground({ 
  variant = 'default',
  showGrid = true,
  showGlow = true,
  showNoise = true,
}: AnimatedBackgroundProps) {
  const colors = {
    default: {
      blob1: 'bg-purple-200/40 dark:bg-purple-500/20',
      blob2: 'bg-cyan-200/40 dark:bg-cyan-500/20',
    },
    subtle: {
      blob1: 'bg-purple-100/30 dark:bg-purple-500/10',
      blob2: 'bg-cyan-100/30 dark:bg-cyan-500/10',
    },
    minimal: {
      blob1: 'bg-purple-50/20 dark:bg-purple-500/5',
      blob2: 'bg-cyan-50/20 dark:bg-cyan-500/5',
    },
  };

  const { blob1, blob2 } = colors[variant];

  return (
    <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
      {/* 网格背景 */}
      {showGrid && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      )}
      
      {/* 噪点纹理 */}
      {showNoise && (
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      )}
      
      {/* 动态光晕 */}
      {showGlow && (
        <>
          <motion.div
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className={`absolute -top-[10%] -left-[10%] w-[60%] h-[60%] ${blob1} rounded-full blur-[120px]`}
          />
          <motion.div
            animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className={`absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] ${blob2} rounded-full blur-[120px]`}
          />
        </>
      )}
    </div>
  );
}
