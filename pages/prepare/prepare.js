// pages/prepare/prepare.js
const app = getApp();
import apiAddr from '../../api/base';
import { setData, isObjEmpty, wechatMiniPagesJump } from '../../utils/index';
Page({

  /**
   * 页面的初始数据
   */ 
  data: {    
    // shop_list:[],
    shop_name:[],  
    douyin_shop_name:[],
    index: 0, 
    douyin_index: 0, 
    code:'',
    user_id:0, 
    mini_user_id:0,
    foot_width:'20%',
    meituan_pic:apiAddr.host+'/Public/img/meituan.png',
    dazhong_pic:apiAddr.host+'/Public/img/dianping.png',
    meituan_verity_guide:apiAddr.host+'/Public/img/card_verify_guide.png',
    meituan_use_guide:apiAddr.host+'/Public/img/card_guide.png',
    douyin_pic:apiAddr.host+'/Public/img/douyin.png',
    mask_show:'',
    get_shop_name:'',
    header_color:'',
    button_font_color:'',
    button_bg_color:'',
    app_type:1,
    object_id:'',
    shop_id:'',
    shop_ids:[]
  },
  radioChange:function(e) {
    this.setData({
      app_type: e.detail.value, 
    })
    console.log(this.data.app_type);
  },
  bindPickerChange: function(e) { 
    console.log('picker发送选择改变，携带值为'+e.detail.value ) 
    this.setData({
      index: e.detail.value, 
    })
  },
  bindPickerChangeDouyin: function(e) { 
    //console.log('picker发送选择改变，携带值为'+e.detail.value ) 
    this.setData({
      douyin_index: e.detail.value, 
    })
  },
    /**
   * @description 核销
   * @method bindsubmit
   * @param {Object} event // 表单对象
   */
  bindsubmit(event){
    let user_id = this.data.user_id;
    let mini_user_id = this.data.mini_user_id;
    if(this.data.app_type==1){
      let { detail: { value: { code, shop_name } } } = event;
      if (!code) {
        wx.showToast({ title: '请输入券码', icon: 'none', mask: true });
        return false;
      } 
      if (!shop_name) {
        wx.showToast({ title: '请选择商户', icon: 'none', mask: true });
        return false;
      } 
      let sendData = {
        code: code,
        shop_name: shop_name,
        user_id: user_id,
        mini_user_id:mini_user_id,
        login_status:200,
      };
      wx.showLoading({ title: '请求数据中...', mask: true });
      wx.request({
        url: apiAddr.meituan_verify_code,
        method: 'post',
        header: {
          'Content-type': 'application/x-www-form-urlencoded'
        },
        data: sendData,
        dataType:'json',
        success: (result) => {
          wx.hideLoading();
          let { data: { code, msg ,url} } = result;
          // let url = apiAddr.host+'/'+now_url+'/login_status/200/user_id/'+user_id+'/mini_user_id/'+miniUserId;  
        console.log('回调：');
        console.log(msg); 
        console.log(result); 
          if (code === 200) {           
            wx.showToast({
              title: msg,
              icon: 'none', 
              success: () => setTimeout(() => wechatMiniPagesJump(3, `/pages/index/index?q=${url}`),2000)
            });

          }else if(code === 201){        
            wx.showToast({ title: msg , icon: 'none', mask: true });
            return false;

          }else if(code === 202){    
            wx.showToast({
              title: msg,
              icon: 'none', 
              success: () => setTimeout(() => wechatMiniPagesJump(2, '/pages/auth/wechatAuth?miniReturnPath=/pages/prepare/prepare'),3000)
            });
          };
        },
      })
    }else{

      let { detail: { value: { object_id, douyin_shop_name } } } = event;
      if (!object_id) {
        wx.showToast({ title: '请输入券码', icon: 'none', mask: true });
        return false;
      } 
      if (this.data.shop_ids[this.data.douyin_index]==0) {
        wx.showToast({ title: '请选择门店', icon: 'none', mask: true });
        return false;
      } 
      //console.log(this.data.douyin_index)
      //console.log(this.data.shop_ids[this.data.douyin_index])
      let sendData = {
        object_id: object_id,
        shop_name: douyin_shop_name,
        user_id: user_id,
        mini_user_id:mini_user_id,
        login_status:200,
        shop_id:this.data.shop_ids[this.data.douyin_index],
      };
      wx.showLoading({ title: '请求数据中...', mask: true });
      wx.request({
        url: apiAddr.douyin_verify_code,
        method: 'post',
        header: {
          'Content-type': 'application/x-www-form-urlencoded'
        },
        data: sendData,
        dataType:'json',
        success: (result) => {
          wx.hideLoading();
          let { data: { code, msg ,url} } = result;
          if (code === 200) {           
            wx.showToast({
              title: msg,
              icon: 'none', 
              success: () => setTimeout(() => wechatMiniPagesJump(3, `/pages/index/index?q=${url}`),2000)
            });

          }else if(code === 201){        
            wx.showToast({ title: msg , icon: 'none', mask: true });
            return false;

          }else if(code === 202){    
            wx.showToast({
              title: msg,
              icon: 'none', 
              success: () => setTimeout(() => wechatMiniPagesJump(2, '/pages/auth/wechatAuth?miniReturnPath=/pages/prepare/prepare'),3000)
            });
          };
        },
      })
    }
  },

  /**
   * @description 调起小程序扫描二维码
   * @method handleScanCode
   */
  handleScanCode(options){
    if(this.data.app_type==1){
      wx.scanCode({
        success: (res) => {
          console.log('扫码');
          let { result } = res;
          console.log(result);
          if (result) { 
            this.setData({
              code: result, 
            })
          }
          // if ( result ) wechatMiniPagesJump(2, `/pages/index/index?q=${encodeURIComponent(result)}`);
        },
        fail: () => wx.navigateBack()
      })
    }else{
      wx.scanCode({
        success: (res) => {
          wx.request({
            url: apiAddr.douyinver,
            method: 'post',
            header: { 'Content-type': 'application/x-www-form-urlencoded' },
            data: {url:res.result,shop_id:36},
            dataType: 'json',
            success: (result) => { 
              let { data: { code, msg ,data} } = result;
              if(code==0){
                this.setData({
                  object_id: data, 
                })
              }
            }, 
          });
        },
        fail: () => wx.navigateBack()
      })
    }
  },
  QA_link: function(obj){
    console.log(obj);
    var _img = obj.currentTarget.dataset.show;
    this.setData({
      mask_show: _img, 
    })
  },
  mask_close() {
  //点击x号关闭
    this.setData({
      mask_show: ''
    })
  },
  wechatAuth(){
    wx.redirectTo({
      url: '/pages/auth/wechatAuth?miniReturnPath=/pages/prepare/prepare',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 设置标题
    wx.setNavigationBarTitle({
      title: '团购券自助核验',
    })
    // 获取商家列表
    console.log(options);
    let {get_shop_name,shop_id} = options;
    // let {user_id} = options;
    let {user_id,mini_user_id} = app.getLocalUserInfo();
    
    // if(!user_id){
    //   wx.showToast({
    //     title: '授权状态已过期，需重新授权',
    //     icon: 'none', 
    //     success:function (){
    //       setTimeout( wx.redirectTo({
    //         url: '/pages/auth/wechatAuth?miniReturnPath=/pages/prepare/prepare',
    //       }),3000)
    //     }
    //   });
    // } 
    this.setData({
      user_id: user_id, 
      mini_user_id:mini_user_id,
      get_shop_name:get_shop_name,
    })
    wx.showLoading({ title: '请求数据中...', mask: true });
    wx.request({
      url: apiAddr.meituan_shop,
      method: 'post',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: {},
      dataType: 'json',
      success: (result) => { 
          console.log('shopname=',result);
        let { data:{shop_list,shop_name} } = result;  
          // setData(this, 'shop_list', shop_list);
          setData(this, 'shop_name', shop_name);    
          //setData(this, 'shop_name', get_shop_name);  
      },
      complete: () => wx.hideLoading()
    })
    wx.request({
      url: apiAddr.douyin_shop,
      method: 'post',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: {},
      dataType: 'json',
      success: (result) => { 
          console.log('result2=',result);
        let { data:{shop_name,shop_ids} } = result; 
        
          setData(this, 'douyin_shop_name', shop_name); 
          setData(this, 'shop_ids', shop_ids); 
      },
      complete: () => wx.hideLoading()
    })
    // 底部导航
    wx.request({
      url: apiAddr.footer_nav_list,
      method: 'post',
      header: { 'Content-type': 'application/x-www-form-urlencoded' },
      data: {},
      dataType: 'json',
      success: (result) => { 
       console.log(result); 
        setData(this,'nav_list', result.data); 
        setData(this,'foot_width', (100/result.data.length).toFixed(2)+'%'); 
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
    let {user_id,mini_user_id} = app.getLocalUserInfo();
    let {get_shop_name} = options;
    this.setData({
      user_id: user_id, 
      mini_user_id:mini_user_id,
      get_shop_name:get_shop_name,
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