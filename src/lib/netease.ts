// 网易云音乐 API 工具
// 使用公开的网易云 API 获取用户正在播放的歌曲

export interface NowPlayingSong {
  name: string;
  artist: string;
  album: string;
  albumCover: string;
  isPlaying: boolean;
}

// 获取用户最近播放的歌曲（需要用户 ID）
export async function getRecentPlayed(userId: string): Promise<NowPlayingSong | null> {
  try {
    // 使用公开的网易云 API
    const res = await fetch(`https://netease-cloud-music-api-five-roan-88.vercel.app/user/record?uid=${userId}&type=1`, {
      next: { revalidate: 60 } // 缓存 60 秒
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    
    if (data.code === 200 && data.weekData && data.weekData.length > 0) {
      const song = data.weekData[0].song;
      return {
        name: song.name,
        artist: song.ar?.map((a: any) => a.name).join(', ') || '未知艺术家',
        album: song.al?.name || '未知专辑',
        albumCover: song.al?.picUrl || '',
        isPlaying: false // 这是最近播放，不是正在播放
      };
    }
    
    return null;
  } catch (error) {
    console.error('获取网易云音乐失败:', error);
    return null;
  }
}

// 获取歌曲详情
export async function getSongDetail(songId: string): Promise<NowPlayingSong | null> {
  try {
    const res = await fetch(`https://netease-cloud-music-api-five-roan-88.vercel.app/song/detail?ids=${songId}`);
    
    if (!res.ok) return null;
    
    const data = await res.json();
    
    if (data.code === 200 && data.songs && data.songs.length > 0) {
      const song = data.songs[0];
      return {
        name: song.name,
        artist: song.ar?.map((a: any) => a.name).join(', ') || '未知艺术家',
        album: song.al?.name || '未知专辑',
        albumCover: song.al?.picUrl || '',
        isPlaying: true
      };
    }
    
    return null;
  } catch (error) {
    console.error('获取歌曲详情失败:', error);
    return null;
  }
}
