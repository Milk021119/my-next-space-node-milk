// lib/data/music.ts

export interface Song {
  id: string;
  title: string;
  artist: string;
  url: string;   // 歌曲 MP3 链接
  cover: string; // 封面图片链接
}

// 模拟数据：这里使用了一些免版权的示例音乐链接，你可以替换成自己的
export const PLAYLIST: Song[] = [
  {
    id: '1',
    title: 'Cyber City',
    artist: 'Neon Rider',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover: 'https://images.unsplash.com/photo-1614726365206-3f18cb6c6d04?w=400&q=80',
  },
  {
    id: '2',
    title: 'Night Runner',
    artist: 'Glitch Boy',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    cover: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=400&q=80',
  },
  {
    id: '3',
    title: 'Digital Dreams',
    artist: 'Synthwave Labs',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    cover: 'https://images.unsplash.com/photo-1592547097938-79532e8d353b?w=400&q=80',
  }
];
