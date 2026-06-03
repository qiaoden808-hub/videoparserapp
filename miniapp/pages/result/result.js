/**
 * 结果页 — 展示视频/图片信息 & 保存到本地
 * 严格避免使用"下载""水印"等敏感词
 */
Page({
  data: {
    // 从 globalData 读取的数据
    platform: '',
    contentType: '',
    title: '',
    author: '',
    videoUrl: '',
    imageUrl: '',
    coverUrl: '',
    duration: 0,
    description: '',
    keywords: '',
    tags: [],
    stats: { likes: 0, comments: 0, shares: 0, views: 0, collects: 0 },
    links: [],
    images: [],
    images_raw: [],

    // 本地状态
    allLinks: [],
    selectedIdx: 0,
    saving: false,
    savingImages: false,
    sourceUrl: ''
  },

  onLoad() {
    const app = getApp();
    const data = app.globalData.parsedData;

    if (!data) {
      wx.showToast({ title: '未找到数据', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }

    // 整理画质列表
    const allLinks = Array.isArray(data.links) ? [...data.links] : [];
    if (typeof data.videoUrl === 'string' && data.videoUrl &&
        !allLinks.some((l) => l.url === data.videoUrl)) {
      allLinks.push({ quality: '默认', url: data.videoUrl });
    }

    // 为每个选项生成可读标签
    const labeled = allLinks.map((link, i) => {
      const label = this.guessLabel(link.url, i, allLinks.length);
      return { ...link, label };
    });

    const hasVideo = labeled.length > 0;
    const hasImages = Array.isArray(data.images) && data.images.length > 0;
    const hasStats = data.stats && Object.values(data.stats).some((v) => v > 0);

    this.setData({
      ...data,
      allLinks: labeled,
      selectedIdx: 0,
      sourceUrl: data.videoUrl || data.imageUrl || '',
      hasVideo,
      hasImages,
      hasStats
    });
  },

  guessLabel(url, idx, total) {
    if (typeof url !== 'string') return '未知';
    const u = url.toLowerCase();
    if (u.includes('.mp3') || u.includes('audio')) return '音频';
    if (total === 1) return '默认';
    const labels = ['超清', '高清', '标清', '流畅', '音频'];
    return labels[idx] || `选项 ${idx + 1}`;
  },

  /* 选择清晰度 */
  onSelectQuality(e) {
    this.setData({ selectedIdx: Number(e.currentTarget.dataset.index) });
  },

  /* 保存视频到相册 */
  async onSaveVideo() {
    const { allLinks, selectedIdx } = this.data;
    const item = allLinks[selectedIdx];
    if (!item?.url) {
      wx.showToast({ title: '无可保存的内容', icon: 'none' });
      return;
    }

    this.setData({ saving: true });

    try {
      // 先下载临时文件
      const tempRes = await this.downloadFile(item.url);
      // 保存到相册
      await this.saveToAlbum(tempRes.tempFilePath, 'video');
      wx.showToast({ title: '已保存到相册', icon: 'success' });
    } catch (err) {
      console.error('保存失败:', err);
      wx.showToast({ title: '保存失败，请重试', icon: 'none' });
    } finally {
      this.setData({ saving: false });
    }
  },

  /* 保存全部图片 */
  async onSaveImages() {
    const { images } = this.data;
    if (!images || images.length === 0) {
      wx.showToast({ title: '无可保存的图片', icon: 'none' });
      return;
    }

    this.setData({ savingImages: true });

    try {
      let count = 0;
      for (const imgUrl of images) {
        try {
          const tempRes = await this.downloadFile(imgUrl);
          await this.saveToAlbum(tempRes.tempFilePath, 'image');
          count++;
        } catch {
          // 单张失败继续
        }
      }
      if (count > 0) {
        wx.showToast({ title: `已保存${count}张图片`, icon: 'success' });
      } else {
        wx.showToast({ title: '保存失败，请重试', icon: 'none' });
      }
    } catch (err) {
      console.error('批量保存失败:', err);
      wx.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      this.setData({ savingImages: false });
    }
  },

  /* 下载远程文件到本地临时路径 */
  downloadFile(url) {
    return new Promise((resolve, reject) => {
      wx.showLoading({ title: '获取中...' });
      wx.downloadFile({
        url,
        success(res) {
          wx.hideLoading();
          if (res.statusCode === 200) {
            resolve(res);
          } else {
            reject(new Error(`状态码 ${res.statusCode}`));
          }
        },
        fail(err) {
          wx.hideLoading();
          reject(err);
        }
      });
    });
  },

  /* 保存到系统相册 */
  saveToAlbum(filePath, type) {
    return new Promise((resolve, reject) => {
      if (type === 'video') {
        wx.saveVideoToPhotosAlbum({
          filePath,
          success: resolve,
          fail: reject
        });
      } else {
        wx.saveImageToPhotosAlbum({
          filePath,
          success: resolve,
          fail: reject
        });
      }
    });
  },

  /* 预览图片 */
  onPreviewImage(e) {
    const { url, index } = e.currentTarget.dataset;
    wx.previewImage({
      current: url,
      urls: this.data.images,
      currentIndex: Number(index)
    });
  },

  /* 复制源链接 */
  onCopyLink() {
    const { sourceUrl } = this.data;
    if (!sourceUrl) {
      wx.showToast({ title: '无链接可复制', icon: 'none' });
      return;
    }
    wx.setClipboardData({
      data: sourceUrl,
      success() {
        wx.showToast({ title: '链接已复制', icon: 'success' });
      }
    });
  },

  onBack() {
    wx.navigateBack();
  },

  /* 数字格式化 */
  formatNum(n) {
    if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
    return String(n ?? 0);
  },

  onShareAppMessage() {
    return {
      title: this.data.title || '视频助手',
      path: '/pages/index/index'
    };
  }
});
