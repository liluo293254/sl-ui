const app = getApp();
import apiAddr from '../../api/base';
import { isObjEmpty, setData, wechatLogin, wechatMiniPagesJump, wechatMiniCheckLogin } from '../../utils/index';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    uid: '',
    isBind: false, 
    siteInfo:[],
    userInfo:[], 
    now_url:'',
    header_color:'',
    button_font_color:'',
    button_bg_color:'',
    miniReturnPath:'',// 登录后直接在小程序返回的页面
  },
  getUserProfile(e) { 
    let code = '';
    let that = this;
    let { appid } = app.globalData;

    wx.login({
      success (res) {
        code = res.code
        that.loginSend(code, appid);
        wx.removeStorageSync('userInfo');
        // console.log('code = ' +code);
      }
    })
    /*
    wx.getUserProfile({
      desc: '用于完善会员资料',  
      success: (res) => { 
        console.log(22222222);  console.log(res); 
        let  { errMsg, encryptedData, iv ,userInfo} = res; console.log(errMsg);
        let { appid } = app.globalData;
        let session_key = wx.getStorageSync('session_key');  
        // console.log('appid='+appid);  console.log('session_key='+session_key);
        setData(this, 'userInfo', userInfo);
        if(errMsg != 'getUserProfile:ok'){
          setTimeout(() => wx.showToast({ title: `授权失败,重新请求1···`, icon:'none', mask: true }),500);
        }  
        try { 
          // console.log(333333);
          // session_key ? this.setUserInfo(session_key,encryptedData, iv, appid) : 
          this.loginSend(code, appid);
          wx.removeStorageSync('userInfo');
        } catch(e) {
          // console.log(444444);
          let { code } = wechatLogin();
          this.loginSend(code, appid);
          wx.clearStorageSync();
        }        
      }
    })
    */
  },

  loginSend(code, appid){
   
    let { uid, userInfo,now_url,miniReturnPath } = this.data;
    userInfo = {
      "nickName":"微信用户",
      "gender":0,
      "language":"",
      "city":"",
      "province":"",
      "country":"",
      "avatarUrl":"https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
      "is_demote":true
    }; 
    let sendData = {
      js_code: code,
      appid: appid,
      uid: uid || '',   
      nickName:userInfo.nickName,
      gender:userInfo.gender,
      city:userInfo.city,
      province:userInfo.province,
      country:userInfo.country,
      avatarurl:userInfo.avatarUrl,
    };
    wx.showLoading({ title: '请求数据中...', mask: true });
    wx.request({
      url: apiAddr.add_create_mini_user,
      method: 'post',
      header: { 'Content-type': 'application/x-www-form-urlencoded' },
      data: sendData,
      dataType: 'json',
      success: (result) => {
      //  console.log('请求add_create_mini_user');
      //  console.log(result);
        let { data: { code, msg, data } } = result;
        if (code === 200) {
          wx.setStorageSync('session_key', data.session_key);  
          Object.assign(data,{ login_status: 200 });
          data['nickName'] = userInfo.nickName;  
          data['avatarurl'] = userInfo.avatarUrl;    
          wx.setStorageSync('userInfo', JSON.stringify(data));         
          let url = apiAddr.host+'/'+now_url+'/login_status/200/user_id/'+data.user_id+'/mini_user_id/'+data.mini_user_id;   
          
          // 有手机号直接返回，无手机号跳转授权
          if(data.mobile){
            if(miniReturnPath){
              miniReturnPath = decodeURIComponent(miniReturnPath);
              console.log(miniReturnPath);
              wechatMiniPagesJump(3, miniReturnPath);      
            }else{
              console.log('h5');
              wechatMiniPagesJump(3, now_url?`/pages/index/index?q=${url}`:'/pages/index/index');      
            }
          }else{
            wechatMiniPagesJump(3, '/pages/mobile/bindMobile?user_id='+data.user_id+'&mini_user_id='+data.mini_user_id+'&miniReturnPath='+miniReturnPath+'&now_url='+now_url);  
          }
                      
          return false; 
        }
        setTimeout(() => wx.showToast({ title: `${msg},重新请求····`, icon:'none', mask: true }),500);
        //报错完一直在这个页面，所以需要刷新页面重新进入下
        wechatMiniPagesJump(3, '/pages/auth/wechatAuth');
      },
      complete: () => wx.hideLoading()
    });
  },




  /**
   * @description 获取用户详细信息
   * @method getUserInfo
   * @param {Object} event // 用户数据对象
   */
  // async getUserInfo(event){
  //   // console.log(111111111111);
  //   // console.log(event);
  //   // console.log(22222222222);
  //   // let aaa = await wechatLogin();
  //   // console.log(aaa);
  //   let { detail: { errMsg, encryptedData, iv ,userInfo} } = event;
  //   let { appid } = app.globalData;
  //   let session_key = app.getSessionKey();
  //   setData(this, 'userInfo', userInfo);

  //   if (!app.hasUserAuth(errMsg)) return false;
  //   try {
  //     await wechatMiniCheckLogin();
  //     session_key ? this.setUserInfo(session_key,encryptedData, iv, appid) : this.loginSend(code, encryptedData, iv, appid);
  //     wx.removeStorageSync('userInfo');
  //   } catch(e) {
  //     let { code } = await wechatLogin();
  //     this.loginSend(code, encryptedData, iv, appid);
  //     wx.clearStorageSync();
  //   }
  // },
  
  /**a
   * @description 请求后端授权登录
   * @method loginSend
   * @param {String} code // js_code 密文
   * @param {String} encryptedData // 加密敏感数据
   * @param {String} iv // 加密向量
   */
  // loginSend(code, encryptedData, iv, appid){
   
  //   let sendData = {
  //     js_code: code,
  //     appid: appid
  //   };
  //   wx.showLoading({ title: '请求数据中...', mask: true });
  //   wx.request({
  //     url: apiAddr.get_session_key,
  //     method: 'post',
  //     header: {
  //       'Content-type': 'application/x-www-form-urlencoded'
  //     },
  //     data: sendData,
  //     dataType: 'json',
  //     success: (result) => {
  //      console.log('请求session_key');
  //      console.log(result);
  //       let { data: { code, msg, data } } = result;
  //       if (code === 200 && data.session_key) {
  //         wx.setStorageSync('session_key', data.session_key);
  //         this.setUserInfo(data.session_key, encryptedData, iv, appid);
  //         return false;
  //       }
  //       setTimeout(() => wx.showToast({ title: `${msg},重新请求····`, icon:'none', mask: true }),500);
  //       //报错完一直在这个页面，所以需要刷新页面重新进入下
  //       wechatMiniPagesJump(3, '/pages/auth/wechatAuth');
  //     },
  //     complete: () => wx.hideLoading()
  //   });
  // },
  
  // setUserInfo(session_key, encryptedData, iv, appid){
  //   let { uid, isBind, userInfo,now_url } = this.data;
  //   // console.log(userInfo.nickName);
  //   // console.log(userInfo.city);
  //   let sendData = {
  //     session_key: session_key,
  //     encrypted_data: encryptedData,
  //     iv: iv,
  //     appid: appid,
  //     uid: uid || '',   
  //     nickName:userInfo.nickName,
  //     gender:userInfo.gender,
  //     city:userInfo.city,
  //     province:userInfo.province,
  //     country:userInfo.country,
  //     avatarurl:userInfo.avatarurl,
  //   };
  //   wx.request({
  //     url: apiAddr.decrypt_mini_user,
  //     method: 'post',
  //     header: {
  //       'Content-type': 'application/x-www-form-urlencoded'
  //     },
  //     data: sendData,
  //     dataType: 'json',
  //     success: (result) =>{       
  //       console.log('请求授权结果：');  
  //       console.log(result);
  //       let { data: { code, data ,msg } } = result;
  //       if (code === 200) {
  //         // console.log('授权成功');
  //         Object.assign(data,{ login_status: 200 });
  //         // console.log(data);
  //         wx.setStorageSync('userInfo', JSON.stringify(data));         
  //         let url = apiAddr.host+'/'+now_url+'/login_status/200/user_id/'+data.user_id+'/mini_user_id/'+data.mini_user_id;         
  //         wechatMiniPagesJump(3, now_url?`/pages/index/index?q=${url}`:'/pages/index/index');                  
  //         return false;
  //       }
  //       // console.log('授权失败');
  //       setTimeout(() => wx.showToast({ title: `${msg},重新请求···`, icon:'none', mask: true }),500);
  //       //报错完一直在这个页面，所以需要刷新页面重新进入下
  //       wechatMiniPagesJump(3, '/pages/auth/wechatAuth'); 
  //     }
  //   })
  // },

  /**
   * @description 跳转H5登录
   * @method linkLogin
   */ 
  linkLogin(){
    if (isObjEmpty(app.getLocalUserInfo())) wx.removeStorageSync('userInfo');
    wx.setStorageSync('userInfo', JSON.stringify({ login_status: 202 }));
    wechatMiniPagesJump(3, '/pages/index/index');
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
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
    // console.log(111111111);
    console.log(options);
    let { uid, logout, is_bind, now_url ,miniReturnPath } = options;
    if ( uid ) setData(this, 'uid', uid);
    if ( logout ) wx.removeStorageSync('userInfo');
    if ( is_bind ) setData(this, 'isBind', is_bind === '1' ? true : false);
    if ( now_url ) setData(this, 'now_url',now_url);
    if ( miniReturnPath ) setData(this, 'miniReturnPath',miniReturnPath);

    wx.request({
      url: apiAddr.get_host_info,
      method: 'post',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: {},
      dataType: 'json',
      success: (result) => {
        console.log(result.data);
         setData(this, 'siteInfo', result.data);
      },
      complete: () => wx.hideLoading()
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
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

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