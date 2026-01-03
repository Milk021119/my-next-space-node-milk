"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Song, PLAYLIST } from "@/lib/data/music";

interface PlayerContextType {
  isPlaying: boolean;
  currentSong: Song;
  togglePlay: () => void;
  playSong: (song: Song) => void;
  nextSong: () => void;
  prevSong: () => void;
  volume: number;
  setVolume: (val: number) => void;
  progress: number;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song>(PLAYLIST[0]);
  const [volume, setVolumeState] = useState(0.3); // 默认初始值
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ✨ 1. 初始化 Audio 和 读取音量缓存
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    const audio = audioRef.current;
    
    // 读取本地缓存的音量
    const savedVolume = localStorage.getItem('soymilk_volume');
    if (savedVolume) {
        const vol = parseFloat(savedVolume);
        setVolumeState(vol);
        audio.volume = vol;
    } else {
        audio.volume = 0.3; // 无缓存时的默认值
    }
    
    const handleEnded = () => nextSong();
    const handleTimeUpdate = () => {
        if (audio.duration) {
            setProgress((audio.currentTime / audio.duration) * 100);
        }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  // 监听歌曲切换
  useEffect(() => {
    if (audioRef.current) {
        if (!audioRef.current.src.includes(currentSong.url)) {
             audioRef.current.src = currentSong.url;
             if(isPlaying) audioRef.current.play().catch(e => console.log("等待交互:", e));
        } else {
            if (isPlaying) audioRef.current.play();
            else audioRef.current.pause();
        }
    }
  }, [currentSong, isPlaying]);

  // ✨ 2. 封装设置音量的函数，同步写入 localStorage
  const setVolume = (val: number) => {
      setVolumeState(val);
      if (audioRef.current) {
          audioRef.current.volume = val;
      }
      localStorage.setItem('soymilk_volume', val.toString());
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const playSong = (song: Song) => {
    if (currentSong.id === song.id) {
      togglePlay();
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const nextSong = () => {
    const currentIndex = PLAYLIST.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % PLAYLIST.length;
    setCurrentSong(PLAYLIST[nextIndex]);
    setIsPlaying(true);
  };

  const prevSong = () => {
    const currentIndex = PLAYLIST.findIndex(s => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    setCurrentSong(PLAYLIST[prevIndex]);
    setIsPlaying(true);
  };

  return (
    <PlayerContext.Provider value={{ isPlaying, currentSong, togglePlay, playSong, nextSong, prevSong, volume, setVolume, progress }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within a PlayerProvider");
  return context;
};
