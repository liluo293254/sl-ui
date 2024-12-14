const app = getApp();
import apiAddr from '../../api/base';
import { setData } from '../../utils/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav_list:[],
    foot_width:'20%',
    apply_bgimg:apiAddr.host+"/static/default/wap/image/01/applyImg.jpg",
    host: apiAddr.host,
    imgUrls: [],   
      indicatorDots: true,
      autoplay: true,
      interval: 3000,
      duration: 500,
      centerNav:[],
      applyList: [
        {'image':'https://cloud.web3399.com/attachs/2023/02/21/63f447b3c898b.png','name':'房产管理','text':'这是一个便利于管理您房产优秀应用'},
        {'image':'https://cloud.web3399.com/attachs/2023/02/21/63f446d795cec.png','name':'房产管理','text':'这是一个便利于管理您房产优秀应用'},
        {'image':'https://cloud.web3399.com/attachs/2023/02/21/63f447b3c898b.png','name':'房产管理','text':'这是一个便利于管理您房产优秀应用'},
        {'image':'https://cloud.web3399.com/attachs/2023/02/21/63f447b3c898b.png','name':'房产管理','text':'这是一个便利于管理您房产优秀应用'},
        {'image':'https://cloud.web3399.com/attachs/2023/02/21/63f447b3c898b.png','name':'房产管理','text':'这是一个便利于管理您房产优秀应用'}
      ]
  },
  changeHeaderColor(){
    app.changeHeaderColor();
  },
  gotoroom: function () {
      wx.navigateTo({
        url: '../room/room',
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getAd();
    this.getCenterNav();
    this.getFootNav();
    this.changeHeaderColor();
  },
  // 头部广告
  getAd(){
    let sendData = {
      site_id:57,
    };
    wx.request({
      url: apiAddr.get_site_ad, 
      method: 'get',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      dataType:'json',
      data:sendData,
      success: (result) => {
        console.log(result);
        this.setData({
          imgUrls:result.data, 
        })
      },
    })
  },
  // 中间导航
  getCenterNav(){
    let sendData = {
      navType:7,
    };
    wx.request({
      url: apiAddr.get_site_nav, 
      method: 'get',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      dataType:'json',
      data:sendData,
      success: (result) => {
        this.setData({
          centerNav:result.data, 
        })
      },
    })
  },
  // 底部菜单
  getFootNav(){
    let _that = this;
    wx.request({
      url: apiAddr.footer_nav_list,
      method: 'get',
      header: { 'Content-type': 'application/x-www-form-urlencoded' },
      data: {shop_nav:1},
      dataType: 'json',
      success: (result) => {  
        setData(_that,'nav_list', result.data); 
        setData(_that,'foot_width', (100/result.data.length).toFixed(2)+'%'); 
      }, 
    });
  },
  goH5Link: function(event){
    let url=event.currentTarget.dataset.url;
    console.log(url);
     wx.navigateTo({
      url: `/pages/index/index?q=${url}`,
    })
  },
  goPagesLink: function(event){
    let url=event.currentTarget.dataset.url;
     wx.navigateTo({
      url: url,
    })
  },
  hardwareScan(){
    let options = {
      url:apiAddr.host+'/wap/controlpanel/hardware_add/sn/'
    };
    this.handleScanCode(options);
  },
   /**
   * @description 调起小程序扫描二维码
   * @method handleScanCode
   */
  handleScanCode(options){
    wx.scanCode({
      success: (res) => {
        let { result } = res;
        if (options.url) {
          result = options.url + result;
          console.log(result);
        }
        if ( result ) wechatMiniPagesJump(2, `/pages/index/index?q=${encodeURIComponent(result)}`);
      },
      fail: () => wx.navigateBack()
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