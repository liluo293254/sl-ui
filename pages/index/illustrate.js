
const app = getApp();
import apiAddr from '../../api/base';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nodes:"",
    title:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getData(options);
  },
  getData(e) {
    let that = this;
    wx.request({
      url: apiAddr.get_host_info,
      method: 'get',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: {},
      dataType: 'json',
      success: (result) => {
        console.log(result);
        let title , nodes;
        let config = result.data['config'];
        switch(e.type){
          case 'booking_use_illustrate':
            title = '系统使用说明';
            nodes = config['booking_use_illustrate'];
            break;
          case 'miniprogram_user_agreement':
            title = '用户协议';
            nodes = config['miniprogram_user_agreement'];
            break; 
        }


        this.setData({
          nodes, title
        });
        // htmlWxParse.wxParse('content', 'html', result.data.nodes, that, 5);
        
      },
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})