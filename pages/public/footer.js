// pages/public/footer.js
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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getFootnav();
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

  },
  getFootnav(){
    let _that = this;
    wx.request({
      url: apiAddr.footer_nav_list,
      method: 'post',
      header: { 'Content-type': 'application/x-www-form-urlencoded' },
      data: {},
      dataType: 'json',
      success: (result) => {  
        setData(_that,'nav_list', result.data); 
        setData(_that,'foot_width', (100/result.data.length).toFixed(2)+'%'); 
        console.log((100/result.data.length).toFixed(2)+'%')
      }, 
    });
  }
})