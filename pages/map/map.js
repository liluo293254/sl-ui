const app = getApp();
import apiAddr from '../../api/base';
import { setData, isObjEmpty, wechatMiniPagesJump } from '../../utils/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    host:apiAddr.host,
    navBarDetail: app.initCustomNavbar(),
    safeArea: {},
    isSelect: true,
    mapList: [],
    mapMarker: [],
    mapMarkerId: -1, 
    header_color:'',
    button_font_color:'',
    button_bg_color:'',
    userlng:'',
    userlat:'',
    selectId: '',
    selectLeftIndex: 0,
    selectLeftKeyWord: '',
    selectLeft: [
      {
        type: '',
        name: '类型选择'
      },
      {
        type: '2',
        name: '共享空间'
      },
      {
        type: '3',
        name: '服务预约'
      },
      {
        type: '4',
        name: '在线商城'
      }
    ],
    selectRight: [
      {
        type: '',
        name: '附近商家'
      },
      {
        type: '2',
        name: '共享空间'
      },
      {
        type: '3',
        name: '服务预约'
      },
      {
        type: '4',
        name: '在线商城'
      }
    ],
    hidden:true,
  },
  initMapMarker(){ 
    setData(this, 'hidden', true);
    // setData(this, 'mapMarkerId', -1);
  },
  selectToggle(event){
    let { dataset: { id } } = event.currentTarget;
    let { isSelect } = this.data;
    setData(this, 'isSelect', !isSelect);
    setData(this, 'selectId', id);
  },
  selectItem(event){
    let { dataset: { type, index } } = event.currentTarget;
    let { selectId, selectLeftIndex, selectLeftKeyWord } = this.data;
    let handleFun = {
      '1': () => setData(this, 'selectLeftIndex', index),
      '2': () => {
        this.getShopList(type);
        this.initMapMarker();
        if (selectLeftIndex > 0) setData(this, 'selectLeftIndex', 0);
        if (selectLeftKeyWord) setData(this, 'selectLeftKeyWord', '');
      }
    }
    handleFun[selectId]();
  },
  searchInput(event){
    let { detail: { value } } = event;
    setData(this, 'selectLeftKeyWord', value);
  },
  searchConfirm(){
    let { selectLeft, selectLeftIndex, selectLeftKeyWord } = this.data;
    let { type } = selectLeft[selectLeftIndex];
    if (type && !selectLeftKeyWord) {
      wx.showToast({ title: '请输入关键词', icon: 'none', duration: 2000, mask: true });
      return false;
    }
    this.getShopList(type, selectLeftKeyWord);
    this.initMapMarker();
  },
  /**
   * @description 获取屏幕宽高比
   * @method getSafeArea
   */
  getSafeArea(){
    let { safeArea } = wx.getSystemInfoSync();
    setData(this, 'safeArea', safeArea);
  },
  /**
   * @description 获取当前用户所在位置附近的商家
   * @method getShopList
   */
  getShopList(selectType, searchKeyWord){
    // console.log('获取当前用户所在位置附近的商家');
    selectType = selectType || '';
    searchKeyWord = searchKeyWord || '';
    let { selectId, userlng,userlat } = this.data; 
    let sendData = {
      type: selectType,
      keyword: searchKeyWord,
      lng: userlng,
      lat: userlat
    };
    if (selectId && selectId === '2' && selectType === '2') {
      this.getReserveList();
      return false;
    };
    wx.showLoading({ title: '请求数据中...', mask: true });
    wx.request({
      url: apiAddr.get_map_shop_list,
      method: 'post',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: sendData,
      dataType: 'json',
      success: (result) => {
        // console.log('获取商家列表');
        wx.hideLoading()
        console.log(result);
        let { data: { map_shop_list } } = result;
        if ( map_shop_list ) {
          setData(this, 'mapList', map_shop_list);
          setData(this, 'mapMarker', this.setMarker(map_shop_list));
        }
      },
      complete: () => wx.hideLoading()
    })
  },
  getReserveList(){
    let { userlng, userlat } = this.data;
    let sendData = {
      lng: userlng,
      lat: userlat
    };
    wx.showLoading({ title: '请求数据中...', mask: true });
    wx.request({
      url: apiAddr.get_booking_type,
      method: 'post',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: sendData,
      dataType: 'json',
      success: (result) => {
        wx.hideLoading()
        let { data: { booking_type } } = result;
        if (booking_type) {
          setData(this, 'mapList', booking_type);
          setData(this, 'mapMarker', this.setMarker(booking_type));
        }
      },
      complete: () => wx.hideLoading()
    })
  },
  /**
   * @description 设置地图坐标点信息
   * @method setMarker
   * @param {Array} list // 传入获取的坐标数据数组
   * @returns {Array} // 返回地图坐标点列表
   */
  setMarker(list){
    let marker = list.map((item, index) => {
      if (!isObjEmpty(item)) {
        let markerItem = {
          id: index,
          width: '80rpx',
          height: '80rpx',
          latitude: item.lat,
          longitude: item.lng,
          iconPath: '/img/location.png',
          callout: {
            content: item.shop_name,
            color: '#fff',
            fontSize: 14,
            borderRadius: 5,
            borderWidth: 0,
            borderColor: '#fff',
            bgColor: '#249dee',
            padding: 5,
            display: 'ALWAYS',
            textAlign: 'center',
            anchorY: 0,
            anchorX: 0
          }
        };
        return markerItem;
      }
    });
    return marker;
  },
  /**
   * @description 点击坐标的气泡显示所对应的商家
   * @method handleMapCallout
   * @param {Object} event // 传入的商家列表下标值
   */
  handleMapCallout(event){
    // console.log('点击坐标的气泡显示所对应的商家');
    // console.log(event);
    let { markerId } = event.detail;
    setData(this, 'hidden', false);
    setData(this, 'mapMarkerId', markerId);
  },
  linkBack(){
    wx.navigateBack();
  },
  linkWebView(event){
    let { dataset: { link } } = event.currentTarget;
    let { mapList, mapMarkerId } = this.data;
    let baseUrl = apiAddr.host;
    let navList = ['shopList'];
    if (mapMarkerId > -1 && navList.indexOf(link) < 0) {
      let id = mapList[mapMarkerId].shop_id || mapList[mapMarkerId].room_id;
      let paramsUrl = {
        shopDetail:  `${baseUrl}/wap/shop/detail/shop_id/${id}`,
        shopMall:    `${baseUrl}/wap/mall/index/shop_id/${id}`,
        shopWorker:  `${baseUrl}/wap/appoint/worker_list/shop_id/${id}`,
        shopBooking: `${baseUrl}/wap/booking/room_list/shop_id/${id}`,
        typeDetail:  `${baseUrl}/wap/booking/room_detail/room_id/${id}`
      };
      
      wechatMiniPagesJump(2, `/pages/index/index?q=${encodeURIComponent(paramsUrl[link])}`);
      return false;
    }
    let navUrl = {
      shopList: `${baseUrl}/wap/shop/index`
    };
    wechatMiniPagesJump(2, `/pages/index/index?q=${encodeURIComponent(navUrl[link])}`);
  },
  /**
   * @description 打开地图导航
   * @method openNavigation
   */
  openNavigation(){
    let { mapList, mapMarkerId } = this.data;
    if ( mapMarkerId > -1 ) {
      let openOptions = {
        latitude: mapList[mapMarkerId].lat, 
        longitude: mapList[mapMarkerId].lng, 
        name: mapList[mapMarkerId].shop_name,
        address: mapList[mapMarkerId].addr
      };
      wx.openLocation(openOptions);
    }
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // console.log('onShow'); 
    this.getSafeArea();

    wx.getLocation({
      // altitude: false,
      // isHighAccuracy: true,
      // highAccuracyExpireTime: 5000,
      success: (res) => {
        // console.log(res);
        setData(this, 'userlat', res.latitude);
        setData(this, 'userlng', res.longitude);
        // console.log(this.data.userlat);
        // console.log(this.data.userlng);
        this.getShopList();
        // this.initMapMarker();
      },
      fail: () => wx.showToast({ title: '请点击右上角三个点并开启位置权限', icon: 'none', mask: true })
    })
    
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