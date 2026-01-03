"use client";

import { usePlayer } from "@/context/PlayerContext";
import { Play, Pause, SkipForward, SkipBack, Disc } from "lucide-react";
import { motion } from "framer-motion";

export default function MiniPlayer() {
  const { isPlaying, currentSong, togglePlay, nextSong, prevSong, progress } = usePlayer();

  if (!currentSong) return null;

  return (
    <div className="w-full mt-auto pt-4 border-t border-slate-100/50">
      {/* 播放器容器：极简白/灰风格，配合半透明模糊 */}
      <div className="relative bg-slate-50/50 backdrop-blur-md rounded-2xl p-3 border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
        
        {/* 动态背景光晕 (仅在播放时出现) */}
        <motion.div 
          animate={{ opacity: isPlaying ? 0.4 : 0 }}
          className="absolute -top-10 -right-10 w-20 h-20 bg-purple-200/50 rounded-full blur-2xl pointer-events-none"
        />

        <div className="relative z-10">
            {/* 上半部分：封面与信息 */}
            <div className="flex items-center gap-3 mb-3">
                {/* 旋转唱片封面 */}
                <motion.div 
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear", repeatType: "loop" }}
                    className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-slate-200"
                >
                    {currentSong.cover ? (
                       <img src={currentSong.cover} alt={currentSong.title} className="w-full h-full object-cover" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                          <Disc size={20} />
                       </div>
                    )}
                    {/* 唱片中心孔 */}
                    <div className="absolute inset-0 m-auto w-2 h-2 bg-slate-50 rounded-full border border-slate-200" />
                </motion.div>
                
                <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="relative h-5">
                        {/* 歌名 */}
                        <h4 className="text-xs font-black text-slate-800 truncate leading-tight">
                            {currentSong.title}
                        </h4>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium truncate">{currentSong.artist}</p>
                </div>

                {/* 音频波形动画 (紫色) */}
                <div className="flex gap-[2px] items-end h-3">
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            className="w-1 bg-purple-400 rounded-t-sm"
                            animate={{ height: isPlaying ? [4, 12, 6, 10] : 3 }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", delay: i * 0.15 }}
                        />
                    ))}
                </div>
            </div>

            {/* 控制栏 */}
            <div className="flex items-center justify-between px-1">
                <button 
                  onClick={prevSong} 
                  className="text-slate-400 hover:text-purple-600 transition-colors active:scale-90"
                >
                    <SkipBack size={16} />
                </button>
                
                <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={togglePlay} 
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-900 text-white hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-200 transition-all"
                >
                    {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                </motion.button>

                <button 
                  onClick={nextSong} 
                  className="text-slate-400 hover:text-purple-600 transition-colors active:scale-90"
                >
                    <SkipForward size={16} />
                </button>
            </div>
        </div>

        {/* 底部进度条 */}
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-slate-100">
            <motion.div 
                className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
                style={{ width: `${progress}%` }}
                layoutId="progress-bar"
            />
        </div>
      </div>
    </div>
  );
}
