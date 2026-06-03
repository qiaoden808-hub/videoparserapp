/**
 * API 工具 — 调用后端识别接口
 */

const app = getApp();

/**
 * 提交链接进行识别
 * @param {string} url 视频链接
 * @param {string} platform 平台标识 / 'auto'
 */
function fetchVideoInfo(url, platform = 'auto') {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.apiBase}/parse`,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: { url: url.trim(), platform },
      success(res) {
        if (res.statusCode === 200 && res.data && res.data.success) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data?.error || '未能识别该链接'));
        }
      },
      fail(err) {
        console.error('API 请求失败:', err);
        reject(new Error('网络异常，请稍后重试'));
      }
    });
  });
}

/**
 * 检测平台类型（本地预判，减少服务端压力）
 */
function guessPlatform(url) {
  const map = [
    ['douyin', ['douyin.com', 'iesdouyin.com']],
    ['tiktok', ['tiktok.com']],
    ['instagram', ['instagram.com']],
    ['facebook', ['facebook.com', 'fb.watch']],
    ['twitter', ['twitter.com', 'x.com']],
    ['youtube', ['youtube.com', 'youtu.be']],
    ['kuaishou', ['kuaishou.com']],
    ['xiaohongshu', ['xiaohongshu.com', 'xhslink.com']],
  ];
  for (const [key, domains] of map) {
    if (domains.some((d) => url.includes(d))) return key;
  }
  return 'unknown';
}

module.exports = { fetchVideoInfo, guessPlatform };
