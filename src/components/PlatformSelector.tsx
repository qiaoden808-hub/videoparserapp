'use client';

const platforms = [
  { value: 'auto', label: '自动检测' },
  { value: 'douyin', label: '抖音 (Douyin)' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'kuaishou', label: '快手 (Kuaishou)' },
  { value: 'xiaohongshu', label: '小红书' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'youtube', label: 'YouTube' },
];

export default function PlatformSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-3 text-sm text-slate-200 backdrop-blur transition-colors focus:border-blue-500 focus:outline-none"
    >
      {platforms.map((p) => (
        <option key={p.value} value={p.value}>
          {p.label}
        </option>
      ))}
    </select>
  );
}
