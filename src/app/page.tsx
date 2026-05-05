'use client';

import { useState } from 'react';
import PlatformSelector from '@/components/PlatformSelector';
import ResultCard from '@/components/ResultCard';

export default function Home() {
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleParse = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), platform }),
      });
      const json = await res.json();

      if (json.success) {
        setResult(json.data);
      } else {
        setError(json.error || '解析失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-4 pb-12 pt-safe">
      {/* 顶栏 */}
      <header className="flex items-center justify-between py-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Video Parser</h1>
          <p className="text-xs text-slate-500">粘贴链接，一键解析</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white shadow-lg">
          VP
        </div>
      </header>

      {/* 输入区 */}
      <section className="space-y-3">
        <div className="relative">
          <input
            type="url"
            placeholder="粘贴视频链接..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleParse()}
            className="w-full rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-3.5 pr-16 text-sm text-slate-200 placeholder-slate-500 backdrop-blur transition-colors focus:border-blue-500 focus:outline-none"
          />
          {url && (
            <button
              onClick={() => {
                setUrl('');
                setResult(null);
                setError('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          )}
        </div>

        <PlatformSelector value={platform} onChange={setPlatform} />

        <button
          onClick={handleParse}
          disabled={loading || !url.trim()}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:from-blue-500 hover:to-purple-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              解析中...
            </span>
          ) : (
            '解析'
          )}
        </button>
      </section>

      {/* 错误提示 */}
      {error && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* 结果 */}
      {result && (
        <section className="mt-6">
          <ResultCard data={result} />
        </section>
      )}

      {/* 空状态 */}
      {!result && !loading && !error && (
        <div className="mt-16 text-center text-sm text-slate-600">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/50 text-2xl">
            ▶
          </div>
          <p>支持平台</p>
          <p className="mt-1 text-xs text-slate-700">
            抖音 · TikTok · 快手 · 小红书
            <br />
            Instagram · Facebook · Twitter · YouTube
          </p>
        </div>
      )}

      {/* 底部安全区 */}
      <div className="mt-6 flex flex-col items-center gap-2 pt-4 text-center text-[10px] text-slate-700">
        <a
          href="/api/install"
          className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-300"
        >
          iOS 安装描述文件
        </a>
        Video Parser v1.0
      </div>
    </main>
  );
}
