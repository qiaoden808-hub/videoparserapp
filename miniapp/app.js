App({
  globalData: {
    // 远程接口地址 — 部署后替换为你的域名
    apiBase: 'https://www.work-feedback.cn/api',
    // 当前识别结果
    parsedData: null
  },

  onLaunch() {
    // 检查网络状态
    wx.getNetworkType({
      success: (res) => {
        if (res.networkType === 'none') {
          wx.showToast({ title: '当前无网络', icon: 'none' });
        }
      }
    });
  }
});
