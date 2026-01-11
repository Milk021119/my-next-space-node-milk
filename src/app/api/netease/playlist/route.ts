import { NextResponse } from 'next/server';

// 网易云音乐用户 ID
const NETEASE_USER_ID = process.env.NETEASE_USER_ID || '1592026425';

// 缓存数据
let cachedPlaylist: any = null;
let cacheTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30分钟缓存（歌单信息不常变）

export async function GET() {
  try {
    // 检查缓存
    if (cachedPlaylist && Date.now() - cacheTime < CACHE_DURATION) {
      return NextResponse.json(cachedPlaylist);
    }

    // 获取用户歌单列表
    const playlistRes = await fetch(
      `https://music.163.com/api/user/playlist?uid=${NETEASE_USER_ID}&limit=1&offset=0`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://music.163.com/',
        },
      }
    );

    if (playlistRes.ok) {
      const playlistData = await playlistRes.json();
      
      if (playlistData.code === 200 && playlistData.playlist && playlistData.playlist.length > 0) {
        // 第一个歌单通常是"喜欢的音乐"
        const likedPlaylist = playlistData.playlist[0];
        
        const result = {
          success: true,
          playlist: {
            id: likedPlaylist.id,
            name: likedPlaylist.name,
            trackCount: likedPlaylist.trackCount,
            coverUrl: likedPlaylist.coverImgUrl,
          },
        };

        // 更新缓存
        cachedPlaylist = result;
        cacheTime = Date.now();

        return NextResponse.json(result);
      }
    }

    // 返回默认值
    return NextResponse.json({
      success: false,
      error: '无法获取歌单信息',
    });

  } catch (error) {
    console.error('Netease Playlist API error:', error);
    return NextResponse.json({
      success: false,
      error: '获取歌单数据失败',
    });
  }
}
