import { NextRequest, NextResponse } from 'next/server';

/**
 * 302 重定向代理 — 请求走自己的域名（白名单），文件直接从 CDN 下载
 * 比流式代理快得多，不消耗 Vercel 带宽
 */
export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: '缺少 url 参数' }, { status: 400 });
    }

    if (!url.startsWith('https://')) {
      return NextResponse.json({ error: '仅支持 HTTPS 链接' }, { status: 400 });
    }

    console.log('[download redirect] →', url.substring(0, 120));

    return NextResponse.redirect(url, {
      status: 302,
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('[download redirect] error:', error);
    return NextResponse.json(
      { error: error?.message || '下载失败' },
      { status: 500 }
    );
  }
}
