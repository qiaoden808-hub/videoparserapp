const { fetchVideoInfo } = require('../../utils/api');

Page({
  data: {
    url: '',
    platforms: [
      { value: 'auto', label: '自动识别' },
      { value: 'douyin', label: '抖音' },
      { value: 'tiktok', label: 'TikTok' },
      { value: 'kuaishou', label: '快手' },
      { value: 'xiaohongshu', label: '小红书' },
      { value: 'instagram', label: 'Instagram' },
      { value: 'facebook', label: 'Facebook' },
      { value: 'twitter', label: 'Twitter / X' },
      { value: 'youtube', label: 'YouTube' },
    ],
    platformIdx: 0,
    loading: false,
    error: '',
    result: null
  },

  onUrlInput(e) {
    this.setData({ url: e.detail.value, error: '' });
  },

  onPlatformChange(e) {
    this.setData({ platformIdx: Number(e.detail.value) });
  },

  onClear() {
    this.setData({ url: '', error: '', result: null });
  },

  async onSubmit() {
    const { url, platforms, platformIdx, loading } = this.data;
    if (!url.trim() || loading) return;

    this.setData({ loading: true, error: '', result: null });

    try {
      const platform = platforms[platformIdx].value;
      const data = await fetchVideoInfo(url, platform);

      // 将结果存入全局，跳转到结果页
      const app = getApp();
      app.globalData.parsedData = data;

      wx.navigateTo({ url: '/pages/result/result' });
    } catch (err) {
      this.setData({
        error: err.message || '识别失败，请检查链接',
        loading: false
      });
    }
  },

  onShareAppMessage() {
    return {
      title: '视频助手 — 快速识别视频信息',
      path: '/pages/index/index'
    };
  }
});
