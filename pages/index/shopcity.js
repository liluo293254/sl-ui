
const app = getApp();
import apiAddr from '../../api/base';
import { setData } from '../../utils/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopArea: [],
    address:'定位中',
    lat:'',
    lng:'',
    qqmap_key:app.initQQMapKey(),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getHostInfo();
    this.getAddress();
    this.getShopAreaList();
  },
  // 网站配置信息
  getHostInfo() {
    wx.request({
       url: apiAddr.get_host_info,
       method: 'post',
       header: {
          'Content-type': 'application/x-www-form-urlencoded'
       },
       dataType: 'json',
       success: (result) => {
          let wxapp = result.data.all.wxapp;
          if(wxapp.qqmap_key){
             this.setData({
             qqmap_key: wxapp.qqmap_key,
          })
          }
       },
    })
 },
  getAddress(){
    let that = this;
    let userlocat = wx.getStorageSync('userlocat');
    let nowtime = Date.parse(new Date()) / 1000;
    if(!userlocat || userlocat.overtime < nowtime || !userlocat.city){
      wx.showLoading({ title: '定位中...' });
      wx.getLocation({
        // altitude: false,
        // isHighAccuracy: true,
        // highAccuracyExpireTime: 5000,
        success: (res) => {
          console.log(res);
          let overtime = Date.parse(new Date()) / 1000 + 7200;
          
          this.setData({
            lat:res.latitude,
            lng:res.longitude,
          })
          
          if(this.data.qqmap_key){
            // 微信逆地址解析
            wx.request({
              url: 'https://apis.map.qq.com/ws/geocoder/v1/?location='+res.latitude+','+res.longitude+'&key=' + this.data.qqmap_key + '&get_poi=0',
              success: function(res) {
                console.log('cityres',res);
                  var city = res.data.result.address_component.city;
                  console.log(city);
                  if(city){
                    that.setData({
                      address:city
                    })
                    let area = that.data.shopArea;
                    console.log(area);
                    if(typeof area[city] !== 'undefined'){
                      // setData(that,'area_id',area[city]['area_id']);
                    }
                  }
                  userlocat = {
                    userlat: that.data.lat,
                    userlng: that.data.lng, 
                    overtime: overtime,
                    city:city,
                  };
                  wx.setStorageSync('userlocat', userlocat);

                  wx.hideLoading();
                  that.getShopList();
              }
            })
          }else{
            // 后端地图接口
            wx.request({
              url: apiAddr.get_maps_geocoder,
              success: function(res) {
                console.log('cityres2',res);
                  var city = res.data.city;
                  console.log(city);
                  if(city){
                    that.setData({
                      address:city
                    })
                    let area = that.data.shopArea;
                    if(typeof area[city] !== 'undefined'){
                      // setData(that,'area_id',area[city]['area_id']);
                    }
                  }

                  userlocat = {
                    userlat: that.data.lat,
                    userlng: that.data.lng, 
                    overtime: overtime,
                    city:city,
                  };
                  wx.setStorageSync('userlocat', userlocat);
                  wx.hideLoading();
                  that.getShopList();
              }
            })
          }
          
          // 缓存
          wx.request({
            url: apiAddr.setcookie_location, 
            method: 'post',
            header: {
              'Content-type': 'application/x-www-form-urlencoded'
            },
            dataType:'json',
            data:userlocat,
            success: (result) => {
              console.log(result);
            },
          })
        },
        // fail: () => wx.showToast({ title: '请点击右上角三个点并开启位置权限', icon: 'none', mask: true })
      })

    }else{
      console.log('userlocat',userlocat);
      that.setData({
        address:userlocat.city
      })
    }
  },
  getShopAreaList(){
    
    wx.showLoading({ title: '加载中...' });
    wx.request({
      url: apiAddr.get_community_area_list,
      method: 'get',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      dataType: 'json',
      success: (result) => {
        let { data: { list } } = result;
        if ( list ) {
          setData(this, 'shopArea', list);
        }
      },
      complete: () => wx.hideLoading()
    })
  },
  goShopList:function(event){
    let area_id = event.currentTarget.dataset.id;
    let name = event.currentTarget.dataset.name;
    if(name=='定位中'){
      this.getAddress(); // 点击重新定位
      return;
    }
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    area_id = (typeof area_id === 'undefined') ? '' : area_id;

    prevPage.setData({
      area_id: area_id,
      address: name,
    });
    wx.navigateBack({
      delta: 1,
      success: res => {
        console.log('返回成功', res);
      },
      fail: err => {
        console.error('返回失败', err);
      }
    });
  },
  goH5Link: function(event){
    app.goH5Link(event);
  },
  goPagesLink: function(event){
    app.goPagesLink(event);
  },
  makeCall:function(event){
    app.makeCall(event);
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