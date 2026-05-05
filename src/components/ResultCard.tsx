'use client';

import { useState } from 'react';

interface ParsedData {
  platform: string;
  contentType: string;
  title: string;
  author: string;
  videoUrl: string;
  imageUrl: string;
  coverUrl: string;
  duration: number;
  description: string;
  keywords: string;
  tags: string[];
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    collects: number;
  };
  links: { quality?: string; url: string }[];
  images: string[];
}

const qualityLabels = ['超清 4K', '高清 1080P', '高清 720P', '标清 480P', '流畅 360P'];

function guessQualityLabel(url: unknown, idx: number, total: number): string {
  if (typeof url !== 'string') return '未知画质';
  const u = url.toLowerCase();
  if (u.includes('.mp3') || u.includes('audio')) return '音频';
  if (u.includes('_hd') || u.includes('hd.')) return '高清';
  if (total === 1) return '默认画质';
  return ['超清', '高清', '标清', '流畅', '音频'][idx] || `画质 ${idx + 1}`;
}

function guessFilename(url: unknown, idx: number): string {
  const ext = typeof url === 'string' && url.includes('.mp3') ? 'mp3' : 'mp4';
  const ts = Date.now();
  return `video_${ts}_${idx + 1}.${ext}`;
}

export default function ResultCard({ data }: { data: ParsedData }) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const allLinks = Array.isArray(data.links) ? data.links : [];
  if (typeof data.videoUrl === 'string' && data.videoUrl && !allLinks.some((l) => l.url === data.videoUrl)) {
    allLinks.push({ quality: '默认', url: data.videoUrl });
  }

  const formatNum = (n: number) =>
    n >= 10000 ? `${(n / 10000).toFixed(1)}万` : String(n);

  const handleDownload = async (url: string, filename: string) => {
    // 尝试 fetch 下载，失败则直接打开
    try {
      const resp = await fetch(url, { mode: 'cors' });
      if (!resp.ok) throw new Error('CORS');
      const blob = await resp.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, '_blank');
    }
  };

  const hasVideo = allLinks.length > 0;
  const hasImages = Array.isArray(data.images) && data.images.length > 0;
  const selected = allLinks[selectedIdx];

  return (
    <div className="animate-fade-in space-y-4 rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur">
      {/* 封面图 */}
      {data.coverUrl && (
        <div className="overflow-hidden rounded-xl">
          <img
            src={data.coverUrl}
            alt={data.title || ''}
            className="w-full object-cover"
            style={{ maxHeight: 280 }}
          />
        </div>
      )}

      {/* 标题 */}
      <h2 className="text-lg font-semibold leading-snug text-slate-100">
        {data.title || '无标题'}
      </h2>

      {/* 作者 & 平台 */}
      <div className="flex items-center gap-3 text-sm text-slate-400">
        {data.author && (
          <span className="flex items-center gap-1">✎ {data.author}</span>
        )}
        <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs text-blue-400">
          {data.platform || 'unknown'}
        </span>
      </div>

      {/* 统计 */}
      {data.stats && (
        <div className="grid grid-cols-5 gap-2 rounded-xl bg-slate-900/50 p-3 text-center text-xs">
          {[
            { label: '点赞', value: data.stats.likes },
            { label: '评论', value: data.stats.comments },
            { label: '转发', value: data.stats.shares },
            { label: '播放', value: data.stats.views },
            { label: '收藏', value: data.stats.collects },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-semibold text-slate-200">
                {formatNum(s.value ?? 0)}
              </div>
              <div className="mt-0.5 text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* 清晰度选择 + 下载 */}
      {hasVideo && selected?.url && (
        <div className="rounded-xl bg-slate-900/50 p-3">
          <p className="mb-3 text-xs font-medium text-slate-400">选择画质</p>
          <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {allLinks.map((link, i) => {
              const label = guessQualityLabel(link.url, i, allLinks.length);
              const isActive = i === selectedIdx;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedIdx(i)}
                  className={`rounded-lg border px-3 py-2 text-center text-xs transition-colors ${
                    isActive
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                      : 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <button
            onClick={() =>
              handleDownload(selected.url, guessFilename(selected.url, selectedIdx))
            }
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-blue-500 hover:to-purple-500 active:scale-[0.98]"
          >
            下载
          </button>
        </div>
      )}

      {/* 图文 - 小红书多图 */}
      {hasImages && (
        <div>
          <p className="mb-2 text-xs font-medium text-slate-400">
            图片 ({data.images.length})
          </p>
          <div className="grid grid-cols-3 gap-2">
            {data.images.map((img, i) => (
              <a
                key={i}
                href={img}
                target="_blank"
                rel="noopener noreferrer"
                className="overflow-hidden rounded-lg"
              >
                <img
                  src={img}
                  alt={`image-${i}`}
                  className="h-24 w-full object-cover transition-transform hover:scale-105"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 描述 */}
      {data.description && (
        <p className="text-xs leading-relaxed text-slate-400">
          {data.description}
        </p>
      )}
    </div>
  );
}
