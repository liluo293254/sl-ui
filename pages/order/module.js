
const app = getApp();
import apiAddr from '../../api/base';
// import { setData } from '../../utils/index';
import { isObjEmpty, setData, wechatMiniPagesJump } from '../../utils/index';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav_list:[],
    foot_width:'20%',
    button_bg_color:'',
    button_font_color:'',
    host:apiAddr.host,
    contentBar: [],
    contentBarWidth:'25%',
    user_id:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let {user_id} = app.getLocalUserInfo();
    if (!user_id) {
      wx.showToast({
          title: '登录授权',
          icon: 'none',
          success: function () {
              var reUrl = encodeURIComponent('/pages/booking/order?shop_id=' + shop_id + '&order_id=' + order_id);
              wx.redirectTo({
                  url: '/pages/auth/wechatAuth?miniReturnPath=' + reUrl,
              })
              return false;
          }
      });
      wx.showModal({
        title: '确认',
        content: '当前状态未登录，是否前往登录授权',
        success(res) {
           if (res.confirm) {
              var reUrl = encodeURIComponent('/pages/order/module');
              wx.redirectTo({
                  url: '/pages/auth/wechatAuth?miniReturnPath=' + reUrl,
              })
              return false;
           } else if (res.cancel) {

           }
        }
     });
      return;
    } else {
        setData(this, 'user_id', user_id);
    }
    console.log('user_id',user_id);
    this.getOrderModule();
    this.getFootNav();
  },
  getOrderModule(){
    let sendData = {
      user_id : this.data.user_id, // 不用this.data，可能数据加载慢
    };
    wx.request({
      url: apiAddr.order_module,
      method: 'get',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: sendData,
      dataType: 'json',
      success: (result) => {
        console.log(result);
        this.setData({
          contentBar: result.data.contentBar, // 将新数据添加到原有数据后面
          contentBarWidth:result.data.contentbarWidth,
        });
      },
    })
  },
  goNavLink(event){
    // let check = this.checekOwner();
    // if (!check){
    //   return;
    // }
    let url = event.currentTarget.dataset.url;
    let type = event.currentTarget.dataset.type;

      console.log(url);
      console.log(type);

    if(type == 'func'){
      this.common_func(url);
    }else if(type == 'toast'){
      wx.showToast({
        title: url,
        icon:'none'
      })
    }else if(type == 'h5'){
      app.goH5Link(event);
    }else if(type == 'pages'){
      app.goPagesLink(event);
    }
  },
  getFootNav(){
    let that = this;
    wx.request({
      url: apiAddr.footer_nav_list,
      method: 'post',
      header: { 'Content-type': 'application/x-www-form-urlencoded' },
      data: {user_id:that.data.user_id},
      dataType: 'json',
      success: (result) => {  
        console.log('底部菜单',result.data);
        setData(that,'nav_list', result.data); 
        setData(that,'foot_width', (100/result.data.length).toFixed(2)+'%'); 
      }, 
    });
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