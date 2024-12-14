const app = getApp();
import apiAddr from '../../api/base';
import { setData, isObjEmpty, wechatMiniModal, wechatMiniPagesJump, wechatMiniCheckLogin } from '../../utils/index';
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';
 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userMobile: '',
    miniUserId: '',
    userId: '',
    fuid: 0,
    userStatus: '',
    isNewUser: false,
    siteInfo:[],
    now_url:'',
    miniReturnPath:'',
    header_color:'',
    button_font_color:'',
    button_bg_color:'',
    avatarUrl: defaultAvatarUrl,
    avatarUpload:'',
    nickName:'',
    user_agreement:0,
    show_agreement:0,
    nodes:'',
  },
  toastMsg(e){
    let msg = e.currentTarget.dataset.msg;
    wx.showToast({
      title: msg,
      icon:'none',
    })
  },
  onChooseAvatar(e) {
    let that = this;
    const { avatarUrl } = e.detail 
    that.setData({
      avatarUrl,
    })
    
    wx.uploadFile({
      url: apiAddr.avatar_upload,
      filePath: avatarUrl,
      name: 'file',
      success (res){
        setData(that, 'avatarUpload', res.data);
      }
    })
  },
  getInput:function(e){
    setData(this,'nickName',e.detail.value);
  },

  checkboxChange(e) {
    const checkedValues = e.detail.value[0] ?? 0;
    this.setData({
      user_agreement:checkedValues
    })
  },
  
  /**
   * @description 授权获取手机号
   * @method getUserPhoneDetail
   * @param {Object} event
   */
  async getUserPhoneDetail(event){
    
    let user_agreement = this.data.user_agreement;
    console.log(user_agreement);
    if(user_agreement != 1){
      wx.showToast({
        title: '请阅读并同意用户隐私协议',
        icon: 'none',
      });
      return false;
    }

    let {detail : { errMsg, encryptedData, iv } } = event;
    let session_key = wx.getStorageSync('session_key');
    if (!app.hasUserAuth(errMsg)) return false;
    if (!session_key) {
      wx.showToast({
        title: '授权状态已过期，需重新授权',
        icon: 'none', 
        success: () => setTimeout(() => wechatMiniPagesJump(2, '/pages/auth/wechatAuth'),3000)
      });
      return false;
    }
    // console.log(session_key);
    // return false;
    try {
      // console.log(33333333);
      await wechatMiniCheckLogin();
      this.getUserMobile(encryptedData, iv, session_key)
    } catch(e) {
      // console.log(4444444); 
      wx.showToast({
        title: '授权状态已过期，需重新授权',
        icon: 'none', 
        success: () => setTimeout(() => wechatMiniPagesJump(2, '/pages/auth/wechatAuth'),3000)
      });
    }
  },
  /**
   * @description 授权用户并请求接口解密手机号
   * @method getUserMobile
   * @param {String} encryptedData // 加密敏感数据
   * @param {String} iv // 加密向量
   * @param {String} sessionKey // 登录有效期内sessionkey
   */
  getUserMobile(encryptedData,iv,sessionKey){
    // console.log('授权用户并请求接口解密手机号');
    let { appid } = app.globalData;
    
    let {miniUserId,userId,fuid,now_url,nickName,avatarUpload ,miniReturnPath} = this.data;

    //缺少miniuserid  重新授权获取
      if (!miniUserId) { 
        wx.showToast({
          title: '缺少参数，需重新授权',
          icon: 'none', 
          success: () => setTimeout(() => wechatMiniPagesJump(2, '/pages/auth/wechatAuth'),3000)
        });

    }
    let sendData = {
      encrypted_data: encryptedData,
      iv: iv,
      session_key: sessionKey,
      appid: appid,
      mini_user_id:miniUserId,
      user_id:userId,
      fuid:fuid,
      nickname:nickName,
      avatar:avatarUpload,
    };
    console.log(sendData);
    wx.showLoading({ title: '请求数据中...', mask: true });
    wx.request({
      url: apiAddr.decrypt_mini_phone,
      method: 'post',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: sendData,
      dataType: 'json',
      success: (result) => {
        console.log('结果');
        console.log(result);
        let { data: { code, msg, data:{ phone_number, user_status }  } } = result;
        if (code === 200 && msg && phone_number && user_status) {
          setData(this, 'userMobile', phone_number);
          setData(this, 'userStatus', user_status);
          if (user_status === -1){
              setData(this,'isNewUser', !this.data.isNewUser);  
          } else if(user_status > 0){   
            
              let oldUserInfo = app.getLocalUserInfo();
              if (!isObjEmpty(oldUserInfo)) {
              
                let newUserInfo = Object.assign({}, oldUserInfo, { user_id : userId });
                wx.setStorageSync('userInfo', JSON.stringify(newUserInfo));
                          
              };                
                let url = apiAddr.host+'/'+now_url+'/login_status/200/user_id/'+userId+'/mini_user_id/'+miniUserId;  

                if(miniReturnPath){
                  miniReturnPath = decodeURIComponent(miniReturnPath);
                  console.log(miniReturnPath);
                  wechatMiniPagesJump(3, miniReturnPath);   
                }else{
                  wechatMiniPagesJump(3, now_url?`/pages/index/index?q=${url}`:'/pages/index/index');
                }
                
          }
        }else{
          wx.showToast({ title: '获取失败', icon: 'none', mask: true });
          return false;
        } 
      },
      complete: () => wx.hideLoading()
    })
  },
  /**
   * @description 请求提交绑定手机号数据
   * @method handleBindMobile
   * @param {Object} event // 表单对象
   */
  handleBindMobile(event){
    let { detail: { value: { mobile, password } } } = event;
    let { miniUserId, userStatus, isNewUser,fuid,now_url,nickName,avatarUpload } = this.data;
    
    password = password || '';
    if (!mobile) {
      wx.showToast({ title: '请输入手机号码', icon: 'none', mask: true });
      return false;
    }
    if (!password && isNewUser) {
      wx.showToast({ title: '请输入密码', icon: 'none', mask: true});
      return false;
    }
    if (!miniUserId) {
      wx.showToast({ title: '参数缺失：mini_user_id', icon: 'none', mask: true });
      return false;
    }
    let sendData = {
      user_mobile: mobile,
      user_password: password,
      user_status: userStatus,
      user_mini_id: miniUserId,
      fuid: fuid,
      nickname:nickName,
      avatar:avatarUpload,
    };
    wx.showLoading({ title: '请求数据中...', mask: true });
    wx.request({
      url: apiAddr.mini_user_bind,
      method: 'post',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: sendData,
      dataType:'json',
      success: (result) => {
      
        let { data: { code, msg, data: { user_id, message } } } = result;
        let url = apiAddr.host+'/'+now_url+'/login_status/200/user_id/'+user_id+'/mini_user_id/'+miniUserId;  
      //  console.log('回调：');
      //  console.log(url);
        let oldUserInfo = app.getLocalUserInfo();
        if (code === 200 && msg && !isObjEmpty(oldUserInfo)) {
         
          let newUserInfo = Object.assign({}, oldUserInfo, { user_id : user_id });
          wx.setStorageSync('userInfo', JSON.stringify(newUserInfo));
           
          wx.showToast({
            title: message,
            icon: 'none', 
            success: () => setTimeout(() => wechatMiniPagesJump(3, now_url?`/pages/index/index?q=${url}`:'/pages/index/index'),2000)
          });
         
        };
      },
      complete: () => wx.hideLoading()
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
   let that = this;
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
    setData(that,'header_color',color);
    setData(that,'button_font_color',result.data.button_font_color);
    setData(that,'button_bg_color',result.data.button_bg_color);
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
    let { mini_user_id,user_id,fuid,now_url,miniReturnPath } = options;
    
    if ( user_id > 0 ) {
      setData(that,'userId', user_id);
      wx.request({
        url: apiAddr.get_user_info,
        method: 'post',
        header: {
          'Content-type': 'application/x-www-form-urlencoded'
        },
        data: {user_id:user_id},
        dataType: 'json',
        success: (result) => {
          console.log(result);
          if(result.data.code){
            if(result.data.data.face){
              setData(that, 'avatarUrl', result.data.data.face );
            }
            setData(that, 'nickName', result.data.data.nickname);
          }
        },
        complete: () => wx.hideLoading()
      });
      // return false;
    }
    if ( mini_user_id > 0 ) {
      setData(this,'miniUserId', mini_user_id);
      // return false;
    }else{
      let { mini_user_id } = app.getLocalUserInfo();
       if(mini_user_id > 0){
          setData(this,'miniUserId', mini_user_id);
       }       
    }
    if ( now_url ) setData(this, 'now_url',now_url);
    if ( miniReturnPath ) setData(this, 'miniReturnPath',miniReturnPath);
    
    fuid = wx.getStorageSync('invite_fuid');
    if ( fuid > 0 ) {
      setData(this,'fuid', fuid); 
    }
    console.log('fuid:',fuid);
    wx.request({
      url: apiAddr.get_host_info,
      method: 'post',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: {},
      dataType: 'json',
      success: (result) => {      
        setData(this, 'siteInfo', result.data);
        setData(this, 'nodes', result.data.config['miniprogram_user_agreement']);
      },
      complete: () => wx.hideLoading()
    });
  },
  navigateBack(){
    wx.redirectTo({
      url: '/pages/index/index',
    })
  },
  openAgreement(e){
    let type=e.currentTarget.dataset.type;
    console.log(type);
    setData(this,'show_agreement',type);
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

    if(!wx.getStorageSync('session_key')){  
      wx.showToast({
        title: '授权状态已过期，需重新授权',
        icon: 'none', 
        success: () => setTimeout(() => wechatMiniPagesJump(2, '/pages/auth/wechatAuth'),3000)
      });
    //   wx.showToast({ title: `授权状态已过期，需重新授权`, icon:'none', mask: true });
    //   setTimeout(() => wechatMiniPagesJump(3, '/pages/auth/wechatAuth'),2000);
    }
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