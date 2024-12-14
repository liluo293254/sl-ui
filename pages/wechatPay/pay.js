import { isObjEmpty, wechatMiniPagesJump } from '../../utils/index'; 
Page({

  /**
   * 页面的初始数据
   */
  data: { },
  /**
   * @description 调起微信收银台进行支付
   * @method wehcaPayment
   * @param {Object} payParams // 生成的支付数据对象
   */
  wehcaPayment(payParams){
    // console.log(111111111);
    try{
      let params = JSON.parse(decodeURIComponent(payParams));
      if (!isObjEmpty(params)) {
        // 对象深拷贝 使其不改变原本对象 开辟新的内存空间
        // console.log(2222222);
        // console.log(params);
        // console.log(params.jumpUrl);
        // console.log(encodeURIComponent(params.jumpUrl));
       
        let result = Object.assign({}, params, {
          success: () =>{ 
            
            if(params.jumpType > 0){
              // url = '/pages/sendapply/sendapply?';
              // wechatMiniPagesJump(2, url + encodeURIComponent(params.jumpUrl))
              wechatMiniPagesJump(2, `/pages/sendapply/sendapply?type=${params.jumpType}&user_id=${params.userId}&order_id=${params.orderId}`)
           }else{
              // url = '/pages/index/index?q=';
              wechatMiniPagesJump(2, `/pages/index/index?q=${encodeURIComponent(params.jumpUrl)}`)
           }
            
          },
          fail: () => wx.navigateBack()
        });
        wx.requestPayment(result);
      }
    } catch (error) {
      throw new Error(error);
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { payParam } = options;
    if (payParam) this.wehcaPayment(payParam);
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