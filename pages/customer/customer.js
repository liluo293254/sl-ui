// pages/customer/customer.js
const app = getApp();
import apiAddr from '../../api/base';
import { setData } from '../../utils/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    host: apiAddr.host,
    ad:'',
    link_url:'',
    wxkf_url:'',
    wxkf_id:'',
    img:'',
    nav_list:[],
    foot_width:'20%',
    header_color:'',
    button_font_color:'',
    button_bg_color:'',
    wx_numb:'',
    mobile:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.request({
      url: apiAddr.customer_page_info,
      method: 'post',
      header: { 'Content-type': 'application/x-www-form-urlencoded' },
      data: {},
      dataType: 'json',
      success: (result) => { 
       console.log(result);
        let { data: { ad, link_url,wxkf_url,wxkf_id,wxkf_qrcode,wxkf_numb,kf_mobile,img } } = result;
        let that = this;
        setData(that,'ad', ad);
        setData(that,'link_url', link_url);
        setData(that,'wxkf_url', wxkf_url);
        setData(that,'wxkf_id', wxkf_id);
        setData(that,'wx_numb', wxkf_numb);
        setData(that,'mobile', kf_mobile);
        setData(that,'wxkf_qrcode', wxkf_qrcode);        
        setData(that,'img', img);  
      }, 
    });

    
    wx.request({
      url: apiAddr.footer_nav_list,
      method: 'get',
      header: { 'Content-type': 'application/x-www-form-urlencoded' },
      data: {shop_nav:1},
      dataType: 'json',
      success: (result) => {  
        setData(this,'nav_list', result.data); 
        setData(this,'foot_width', (100/result.data.length).toFixed(2)+'%'); 
        console.log((100/result.data.length).toFixed(2)+'%')
      }, 
    });
   
 //修改顶部导航颜色
 wx.request({
  url: apiAddr.get_site_color, 
  method: 'post',
  header: {
    'Content-type': 'application/x-www-form-urlencoded'
  },
  dataType:'json',
  success: (result) => {
    console.log(result);
    var color = result.data.mobile_color ? result.data.mobile_color : '#249dee';
    var font_color = result.data.font_color ? result.data.font_color : '#ffffff';

    setData(this,'header_color',color);
    setData(this,'button_font_color',result.data.button_font_color);
    setData(this,'button_bg_color',result.data.button_bg_color);
    wx.setNavigationBarColor({
      frontColor: font_color,
      backgroundColor: color,
      animation: {
        duration: 0,
        timingFunc: 'linear'
      }
    })
  },
})

  },
  makeCall(e){
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.tel
    })
  },
  tapName:function(){
    let that = this;
    wx.openCustomerServiceChat({
      extInfo: {url: that.data.wxkf_url},
      corpId: that.data.wxkf_id,
      success(res) {
        console.log(2222222222);
        console.log(res);
      },fail(e){

        console.log(333);
        console.log(e);
      }
    })
  },
  copyText: function (e) {
    wx.setClipboardData({
      //准备复制的数据内容
      data: e.currentTarget.dataset.text,
      success: function (res) {
        wx.showToast({
          title: '复制成功',
          icon:'success', 
          duration:1000, 
        });
      }
    });
  },
  onLongPress: function(e) {
    var imgUrl = e.currentTarget.dataset.url;
console.log(imgUrl);
    wx.showActionSheet({
      itemList: ['保存图片'],
      success: function(res) {
        if (res.tapIndex === 0) {
          wx.downloadFile({
            url: imgUrl,
            success: function(res) {
              console.log('img',imgUrl);
              console.log('res',res);
              if (res.statusCode === 200) {
                wx.saveImageToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success: function() {
                    wx.showToast({
                      title: '保存成功',
                      icon: 'success',
                      duration: 1000
                    });
                  },
                  fail: function() {
                    wx.showToast({
                      title: '保存失败',
                      icon: 'none',
                      duration: 1000
                    });
                  }
                });
              } else {
                wx.showToast({
                  title: '下载图片失败',
                  icon: 'none',
                  duration: 1000
                });
              }
            },
            fail: function(e) {
              console.log(e);
              wx.showToast({
                title: '下载图片失败',
                icon: 'none',
                duration: 1000
              });
            }
          });
        }
      }
    });
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