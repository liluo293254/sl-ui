import { wechatMiniPagesJump } from '../../utils/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  /**
   * @description 调起小程序扫描二维码
   * @method handleScanCode
   */
  handleScanCode(options){
    wx.scanCode({
      success: (res) => {
        console.log('扫码结果',res);
        let { result } = res;
        
        if (options.url) {
          result = options.url + result;
          console.log('跳转地址',result);
        }
        if ( result ) wechatMiniPagesJump(2, `/pages/index/index?q=${encodeURIComponent(result)}`);
      },
      fail: () => wx.navigateBack()
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('扫码传入数据',options);
    this.handleScanCode(options);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})