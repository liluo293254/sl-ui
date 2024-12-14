import apiAddr from '/api/base';
App({
  onLaunch() {},
  onShow() {
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      if (res.hasUpdate) {
        // updateManager.onUpdateReady(function () {
        //   wx.showModal({
        //     title: '温馨提示',
        //     content: '系统检测到有新版本并已准备好更新，是否重启应用？',
        //     success: () => {
        //       if (res.confirm) updateManager.applyUpdate();
        //     }
        //   })
        // })
        // updateManager.onUpdateFailed(function () {
        //   wx.showModal({
        //     title: '温馨提示',
        //     content: '系统检测到有新版本，请删除当前小程序，重新搜索打开'
        //   })
        // })
      }
    });
  },
  /** 5d444af49568c61c47aa7b84dfe7c575
   * @description 获取本地用户数据
   * @method getLocalUserInfo
   * @returns {Object} // 返回用户数据
   */
  getLocalUserInfo(){
    let userInfo = wx.getStorageSync('userInfo');
    return !userInfo ? {} : JSON.parse(userInfo);
  },
  getSessionKey() {
    let userSessionKey = wx.getStorageSync('session_key');
    return userSessionKey || '';
  },
  /**
   * @description 验证用户是否点击授权
   * @method hasUserAuth
   * @param {String} errMsg // 提示信息
   * @returns {Boolean} // 返回 Boolean
   */
  hasUserAuth(errMsg){
    let [ msg_1, msg_2 ] = errMsg.split(':');
    return msg_2 === 'ok';
  },
  initCustomNavbar(){
    let { top, height, left } = wx.getMenuButtonBoundingClientRect();
    let { statusBarHeight, screenWidth } = wx.getSystemInfoSync();
    let navBarHeight = (top - statusBarHeight) * 2 + height + statusBarHeight;
    let navBarDetail = {
      top: statusBarHeight,
      right: screenWidth - left,
      height: navBarHeight,
    };
    return navBarDetail;
  },
  changeHeaderColor(){
    wx.request({
      url: apiAddr.get_site_color, 
      method: 'post',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      dataType:'json',
      success: (result) => {
        var color = result.data.mobile_color ? result.data.mobile_color : '#ffffff';
        var font_color = result.data.font_color ? result.data.font_color : '#000000';
        wx.setStorageSync('mobile_color',color);
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
  goH5Link(event){
    let url=event.currentTarget.dataset.url;
    console.log(url);
    wx.navigateTo({
    url: `/pages/index/index?q=${url}`,
    })
}, 
goPagesLink(event){
    let url=event.currentTarget.dataset.url;
    let tab1 = 'pages/index/community';
    let tab2 = 'pages/booking/orderlist';
    let tab3 = '/user/index';
    if(url.indexOf(tab1) !== -1 || url.indexOf(tab2) !== -1 || url.indexOf(tab3) !== -1){
      wx.redirectTo({
        url: url,
      });
    }else{
      wx.navigateTo({
        url: url,
        })
    }
  },
  goMiniprogram(event){
    wx.navigateToMiniProgram({ 
      appId: event.currentTarget.dataset.appid
   })
  }, 
  makeCall(event){
    wx.makePhoneCall({
      phoneNumber: event.currentTarget.dataset.tel
    })
  },
  return:function(){
    //返回到上一个页面
    console.log('返回');
    wx.navigateBack()
    /*
    var pages = getCurrentPages();//获取页面数据
    var prevPage = pages[pages.length - 2]; //上一个页面
    prevPage.onLoad();//对上一个页面进行刷新（执行上一个页面的onLoad方法）
    prevPage.setData({ //调用上一个页面的setData方法
        iconStatu: false //给A页面设置一个变量iconStatu，值为false
    });
    */
    
  },
  globalData: {
    appid: 'wx1addb25675dd8e70'
  },
  pluginHxj(){
    // var createPlugin = requirePlugin("hxjlock");
    // var Plugin = createPlugin()
    return null;
  },
  pluginTts(){
    return requirePlugin("ttslock");
  },
  initQQMapKey(){
    return '';
  },
})