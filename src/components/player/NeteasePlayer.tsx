"use client";

import { useState } from "react";
import { Music, ExternalLink, ChevronUp, ChevronDown, X } from "lucide-react";

// 网易云用户 ID
const NETEASE_USER_ID = "1592026425";
// 公开歌单 ID
const PLAYLIST_ID = 17649358985;

export default function NeteasePlayer() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full mt-auto pt-4 border-t border-[var(--border-color)]">
      <div className="bg-[var(--bg-card)] backdrop-blur-md rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm">
        {/* 头部信息 */}
        <div 
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-[var(--bg-tertiary)]/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm">
              <Music size={18} className="text-white" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[var(--text-primary)]">
                我喜欢的音乐
              </h4>
              <p className="text-[10px] text-[var(--text-muted)]">
                网易云音乐
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`https://music.163.com/#/playlist?id=${PLAYLIST_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-colors"
              onClick={(e) => e.stopPropagation()}
              title="在网易云中打开"
            >
              <ExternalLink size={14} />
            </a>
            {isExpanded ? (
              <ChevronUp size={16} className="text-[var(--text-muted)]" />
            ) : (
              <ChevronDown size={16} className="text-[var(--text-muted)]" />
            )}
          </div>
        </div>

        {/* 嵌入网易云外链播放器 */}
        {isExpanded && (
          <div className="border-t border-[var(--border-color)] relative">
            {/* 关闭按钮 */}
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-2 right-2 z-10 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <X size={14} />
            </button>
            {/* 网易云官方外链播放器 */}
            <iframe
              src={`//music.163.com/outchain/player?type=0&id=${PLAYLIST_ID}&auto=0&height=430`}
              width="100%"
              height="450"
              style={{ border: 0 }}
              allow="autoplay; encrypted-media"
            />
          </div>
        )}

        {/* 收起状态的迷你提示 */}
        {!isExpanded && (
          <div className="px-3 pb-3">
            <p className="text-[10px] text-[var(--text-muted)] text-center">
              点击展开播放器
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
