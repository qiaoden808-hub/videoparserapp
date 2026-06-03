import { NextRequest, NextResponse } from 'next/server';

/**
 * 视频/图片代理下载 — 让文件通过自己的域名中转
 * 解决微信小程序 downloadFile 白名单限制
 */
export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: '缺少 url 参数' },
        { status: 400 }
      );
    }

    // 仅允许 HTTPS
    if (!url.startsWith('https://')) {
      return NextResponse.json(
        { error: '仅支持 HTTPS 链接' },
        { status: 400 }
      );
    }

    console.log('[download proxy] fetching:', url.substring(0, 120));

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
        'Referer': 'https://www.douyin.com/',
      },
      signal: AbortSignal.timeout(25000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `获取失败: ${response.status}` },
        { status: 502 }
      );
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');

    // 流式转发，不占用内存
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': contentLength || '',
        'Content-Disposition': 'attachment',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('[download proxy] error:', error);
    return NextResponse.json(
      { error: error?.message || '下载失败' },
      { status: 500 }
    );
  }
}
