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
    console.log('>>> [API] 开始请求:', { url: url.trim(), platform });
    const startTime = Date.now();

    wx.request({
      url: `${app.globalData.apiBase}/parse`,
      method: 'POST',
      timeout: 90000,
      header: { 'Content-Type': 'application/json' },
      data: { url: url.trim(), platform },
      success(res) {
        const elapsed = Date.now() - startTime;
        console.log(`>>> [API] 响应 ${res.statusCode} | 耗时: ${elapsed}ms`);
        if (res.statusCode === 200 && res.data && res.data.success) {
          resolve(res.data.data);
        } else {
          console.warn('>>> [API] 业务失败:', res.data);
          reject(new Error(res.data?.error || '未能识别该链接'));
        }
      },
      fail(err) {
        const elapsed = Date.now() - startTime;
        console.error(`>>> [API] 请求失败 | 耗时: ${elapsed}ms | 错误:`, JSON.stringify(err));
        reject(new Error('网络异常，请稍后重试'));
      }
    });
  });
}

/**
 * 快速连通性测试
 */
function pingServer() {
  return new Promise((resolve) => {
    const start = Date.now();
    wx.request({
      url: `${app.globalData.apiBase}/install`,
      method: 'GET',
      timeout: 10000,
      success(res) {
        console.log(`>>> [Ping] 状态: ${res.statusCode} | 延迟: ${Date.now() - start}ms`);
        resolve(true);
      },
      fail(err) {
        console.error('>>> [Ping] 失败:', JSON.stringify(err));
        resolve(false);
      }
    });
  });
}

module.exports = { fetchVideoInfo, pingServer };
