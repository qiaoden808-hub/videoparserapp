import { NextRequest, NextResponse } from 'next/server';

const btchDownloader = require('btch-downloader');

const platformMap: Record<string, (url: string) => Promise<any>> = {
  douyin: btchDownloader.douyin,
  tiktok: btchDownloader.ttdl,
  instagram: btchDownloader.igdl,
  facebook: btchDownloader.fbdown,
  twitter: btchDownloader.twitter,
  youtube: btchDownloader.youtube,
  kuaishou: btchDownloader.kuaishou,
  xiaohongshu: btchDownloader.xiaohongshu,
};

function detectPlatform(url: string): ((url: string) => Promise<any>) | null {
  if (url.includes('douyin.com') || url.includes('iesdouyin.com')) return btchDownloader.douyin;
  if (url.includes('tiktok.com')) return btchDownloader.ttdl;
  if (url.includes('instagram.com')) return btchDownloader.igdl;
  if (url.includes('facebook.com') || url.includes('fb.watch')) return btchDownloader.fbdown;
  if (url.includes('twitter.com') || url.includes('x.com')) return btchDownloader.twitter;
  if (url.includes('youtube.com') || url.includes('youtu.be')) return btchDownloader.youtube;
  if (url.includes('bilibili.com')) return null;
  if (url.includes('kuaishou.com')) return btchDownloader.kuaishou;
  if (url.includes('xiaohongshu.com') || url.includes('xhslink.com')) return btchDownloader.xiaohongshu;
  return null;
}

function normalizeData(videoInfo: any) {
  // btch-downloader returns data at the top level or nested
  const d = videoInfo?.result?.data || videoInfo?.result || videoInfo?.data || videoInfo || {};

  // Detect structure: some platforms return { links: [{url, quality}] }
  // others return { mp4: 'url', mp3: 'url', images: [...] }
  const links = d.links || [];
  const downloads = d.downloads || [];
  const images = d.images || [];

  let videoUrl = d.mp4 || d.videoUrl || d.video || '';
  // btch-downloader 某些平台返回数组格式
  if (Array.isArray(videoUrl)) videoUrl = videoUrl[0] || '';
  if (!videoUrl && links.length > 0) videoUrl = links[0].url || '';
  if (!videoUrl && downloads.length > 0) videoUrl = downloads[0] || '';

  let imageUrl = d.imageUrl || '';
  if (Array.isArray(imageUrl)) imageUrl = imageUrl[0] || '';
  if (!imageUrl && images.length > 0) imageUrl = images[0] || '';

  return {
    platform: d.platform || '',
    contentType: images.length > 0 ? 'image' : 'video',
    title: d.title || '',
    author: d.author || d.nickname || d.username || '',
    videoUrl,
    imageUrl,
    coverUrl: d.coverUrl || d.cover || d.thumbnail || '',
    duration: d.duration || 0,
    description: d.description || '',
    keywords: d.keywords || '',
    tags: d.tags || [],
    stats: {
      likes: d.likes ?? d.like_count ?? d.digg_count ?? 0,
      comments: d.comments ?? d.comment_count ?? 0,
      shares: d.shares ?? d.share_count ?? 0,
      views: d.views ?? d.view_count ?? d.play_count ?? 0,
      collects: d.collects ?? d.collect_count ?? 0,
    },
    links,
    downloads,
    images,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, platform } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: '请输入视频链接' },
        { status: 400 }
      );
    }

    let parseFn: ((url: string) => Promise<any>) | null;

    if (platform && platform !== 'auto' && platformMap[platform]) {
      parseFn = platformMap[platform];
    } else {
      parseFn = detectPlatform(url);
    }

    if (!parseFn) {
      return NextResponse.json(
        { success: false, error: '无法识别视频平台，请手动选择平台' },
        { status: 400 }
      );
    }

    const videoInfo = await parseFn(url);
    const data = normalizeData(videoInfo);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Parse error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || '解析失败，请检查链接是否正确' },
      { status: 500 }
    );
  }
}
