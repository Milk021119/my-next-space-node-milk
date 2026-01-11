import { NextResponse } from 'next/server';

// 网易云音乐用户 ID
const NETEASE_USER_ID = process.env.NETEASE_USER_ID || '1592026425';

// 缓存数据
let cachedData: any = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

export async function GET() {
  try {
    // 检查缓存
    if (cachedData && Date.now() - cacheTime < CACHE_DURATION) {
      return NextResponse.json(cachedData);
    }

    // 方法1: 获取用户听歌排行 (type=0 总榜, type=1 周榜)
    const recordRes = await fetch(
      `https://music.163.com/api/v1/user/record?uid=${NETEASE_USER_ID}&type=0`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://music.163.com/',
          'Cookie': 'MUSIC_U=;', // 空 cookie
        },
      }
    );

    if (recordRes.ok) {
      const data = await recordRes.json();
      console.log('Record API response:', JSON.stringify(data).slice(0, 500));
      
      // 尝试周榜
      if (data.code === 200 && data.weekData && data.weekData.length > 0) {
        const song = data.weekData[0].song;
        return returnSong(song);
      }
      // 尝试总榜
      if (data.code === 200 && data.allData && data.allData.length > 0) {
        const song = data.allData[0].song;
        return returnSong(song);
      }
    }

    // 方法2: 获取用户歌单列表，找到"喜欢的音乐"
    const playlistRes = await fetch(
      `https://music.163.com/api/user/playlist?uid=${NETEASE_USER_ID}&limit=1&offset=0`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://music.163.com/',
        },
      }
    );

    if (playlistRes.ok) {
      const playlistData = await playlistRes.json();
      console.log('Playlist API response:', JSON.stringify(playlistData).slice(0, 500));
      
      if (playlistData.code === 200 && playlistData.playlist && playlistData.playlist.length > 0) {
        // 第一个歌单通常是"喜欢的音乐"
        const likedPlaylist = playlistData.playlist[0];
        
        // 获取歌单详情
        const detailRes = await fetch(
          `https://music.163.com/api/v6/playlist/detail?id=${likedPlaylist.id}&n=1`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Referer': 'https://music.163.com/',
            },
          }
        );

        if (detailRes.ok) {
          const detailData = await detailRes.json();
          console.log('Detail API response:', JSON.stringify(detailData).slice(0, 500));
          
          if (detailData.code === 200) {
            // 尝试不同的数据结构
            const tracks = detailData.playlist?.tracks || detailData.result?.tracks;
            if (tracks && tracks.length > 0) {
              // 取第一首（最近添加的）
              return returnSong(tracks[0]);
            }
          }
        }
      }
    }

    // 方法3: 使用第三方 API (NeteaseCloudMusicApi)
    // 如果上面都失败了，返回一个默认的推荐
    return NextResponse.json({
      success: true,
      data: {
        name: '暂无最近播放',
        artist: '去网易云听听歌吧~',
        album: '',
        albumCover: '',
      },
    });

  } catch (error) {
    console.error('Netease API error:', error);
    return NextResponse.json({
      success: false,
      error: '获取音乐数据失败',
    });
  }
}

function returnSong(song: any) {
  const result = {
    success: true,
    data: {
      name: song.name || song.n || '未知歌曲',
      artist: song.ar?.map((a: any) => a.name).join(', ') || 
              song.artists?.map((a: any) => a.name).join(', ') || 
              '未知艺术家',
      album: song.al?.name || song.album?.name || '未知专辑',
      albumCover: song.al?.picUrl || song.album?.picUrl || song.album?.blurPicUrl || '',
    },
  };

  // 更新缓存
  cachedData = result;
  cacheTime = Date.now();

  return NextResponse.json(result);
}
