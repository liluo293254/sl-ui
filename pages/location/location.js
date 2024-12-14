import { isObjEmpty, setData } from '../../utils/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    obj:{},
    safeArea: {},
    mapMarker: []
  },
  /**
   * @description 获取屏幕宽高比
   * @method getSafeArea
   */
  getSafeArea(){
    let { safeArea } = wx.getSystemInfoSync();
    setData(this, 'safeArea', safeArea);
  },
  setMarker(item){
    let marker = [{
      id: 0,
      width: '80rpx',
      height: '80rpx',
      latitude: item.latitude,
      longitude: item.longitude,
      iconPath: '/img/location.png'
    }];
    return marker;
  },
  getLocation(parmas) {
    try {
      let data = JSON.parse(decodeURIComponent(parmas));
      if (!isObjEmpty(data)) {
        Object.assign(data, this.bMapTransQQMap(data.longitude,data.latitude));
        setData(this, 'mapMarker', this.setMarker(data));
        setData(this, 'obj', data);
      }
    } catch (e){
      console.log(e);
    }
  },
  open(){
    let { obj } = this.data;
    wx.openLocation(obj);
  },
  bMapTransQQMap: function(lng, lat) {
    var pi = 3.14159265358979324 * 3000.0 / 180.0;
    var x = lng - 0.0065;
    var y = lat - 0.006;
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * pi);
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * pi);
    var lng = z * Math.cos(theta);
    var lat = z * Math.sin(theta);
    return {
      longitude:lng,
      latitude:lat
    };
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getSafeArea();
    let { openParmas } = options;
    if (openParmas) this.getLocation(openParmas);
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