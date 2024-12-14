const app = getApp();
import apiAddr from '../../api/base';
import { setData } from '../../utils/index';
// 如果是单商户，shop_id 先创建 获取后 改这
Page({
  data: {
    url: apiAddr.host+'/wap/index/index/shop_id/0/sitetype/1', 
    share_pic:'',
    share_title:'',
  },
  getuserlocat(){
    let userlocat = wx.getStorageSync('userlocat');
    let nowtime = Date.parse(new Date()) / 1000;
    if(!userlocat || userlocat.overtime < nowtime){
      wx.getLocation({
        // altitude: false,
        // isHighAccuracy: true,
        // highAccuracyExpireTime: 5000,
        success: (res) => {
          let overtime = Date.parse(new Date()) / 1000 + 7200;
          userlocat = {
            userlat: res.latitude,
            userlng: res.longitude, 
            overtime: overtime
          };
          wx.setStorageSync('userlocat', userlocat); 
          console.log(userlocat);
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
          // let url = this.data.url+'/userlng/'+userlocat.userlng+'/userlat/'+userlocat.userlat;
          // setData(this,'url', url);
        },
        fail: () => wx.showToast({ title: '请点击右上角三个点并开启位置权限', icon: 'none', mask: true })
      })

    } 
    
    return userlocat;

  },
  changeHeaderColor(){
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
        var color = result.data.mobile_color ? result.data.mobile_color : '#ffffff';
        var font_color = result.data.font_color ? result.data.font_color : '#000000';
        console.log(color)
        console.log(font_color);
        // wx.setNavigationBarColor({
        //   frontColor: font_color,
        //   backgroundColor: color,
        //   animation: {
        //     duration: 0,
        //     timingFunc: 'linear'
        //   }
        // })
      },
    })
  },
   // 获取分享背景图
  getSharePic(){
    console.log('进入获取分享图片');
    wx.request({
      url: apiAddr.get_share_pic, 
      method: 'post',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      dataType:'json',
      success: (result) => {
        console.log('获取分享图片');
        console.log(result);
        if(result.data.share_pic){
          setData(this,'share_pic',apiAddr.host+result.data.share_pic);
        }
        if(result.data.share_title){
          setData(this,'share_title',result.data.share_title);
        }
      },
    })
  },
  onLoad(options){    
    console.log('onLoad');
    let userlocat = [];//this.getuserlocat();
    let local_parm = '';
    if(userlocat.userlat){
      local_parm = '/userlng/'+userlocat.userlng+'/userlat/'+userlocat.userlat;
      let url = this.data.url+local_parm;     
      setData(this,'url', url);
    }

    if(options.jump_url){
      setData(this,'url', options.jump_url+local_parm);
      return false;
    }
   
    let { q } = options;
    let { login_status, user_id, mini_user_id } = app.getLocalUserInfo();
   
    console.log('login_status:'+login_status);
    if (q) {
        let [ str1, str2 ] = decodeURIComponent(q).split('jump_url=');
        let url = str2 || str1;
        setData(this,'url', url+`/login_status/${login_status}/user_id/${user_id}/mini_user_id/${mini_user_id}${local_parm}.html`);
        return false;
    }
    if (login_status === 200 && user_id && mini_user_id) {
      let resUrl = `${this.data.url}/login_status/${login_status}/user_id/${user_id}/mini_user_id/${mini_user_id}${local_parm}`;
      setData(this,'url', resUrl);
      return false;
    }
    if (login_status === 201) {
      let resUrl = `${this.data.url}/login_status/${login_status}${local_parm}`;
      setData(this,'url', resUrl);
      return false;
    }
  // 如果是202 则是指明跳转到登录页
  if (login_status === 202) {
    console.log(888);
    let resUrl = `${this.data.url}?login_status=${login_status}`;
    wx.setStorageSync('userInfo', JSON.stringify({ login_status: 0 }));
    console.log(resUrl);
    setData(this,'url', resUrl);
    return false;
  }

  console.log('final_url:'+this.data.url);
  this.changeHeaderColor();
  this.getSharePic();
  },
  onShow(){ 
    console.log('onShow');
    this.changeHeaderColor();
    this.getSharePic();
    // console.log(123123);
    // console.log(this.data.url); 
    // console.log(this.data.user_id); 
   }, 

  /**
   * 当用户点击这个h5页面的分享时获取到
   */
  h5PostMessage: function (e) {
    // console.log('分享触发');
    // console.log(e); 
    this.h5Data=  e.detail.data;  
},

/**
 * 用户点击右上角分享
 * 
 apiAddr.host+'?jump_url='+apiAddr.host+'/wap/shop/detail/shop_id/2'
 */
onShareAppMessage: function (e) {

  // console.log('分享触发2');
  let { user_id } = app.getLocalUserInfo(); 
  let jump_url = e.webViewUrl.replace(/.html/,'');
  let arr = [];
  if(/sitetype/.test(jump_url)){
    arr = jump_url.split('/sitetype/');
  }else{
    arr = jump_url.split('/mini_user_id/');
  }

  jump_url = arr[0];
  jump_url = jump_url.replace(/\/login_status\/200/,'');
  jump_url = jump_url.replace(/login_status=200/,'');
  jump_url = jump_url+`/fuid/${user_id}`;
  
  return {
    title: this.data.share_title,
    path: `/pages/index/index?jump_url=${jump_url}`,
    imageUrl: this.data.share_pic,
    success: (res) => {
      // console.log("转发成功");
    },
    fail: (res) => {
      // console.log("转发失败");
    }
  }
 
  
  
},

onShareTimeline: function (e) {

  let { user_id } = app.getLocalUserInfo(); 
  let jump_url = e.webViewUrl.replace(/.html/,`/fuid/${user_id}.html`);
  console.log('share_pic:'+this.data.share_pic);
  return {
    title: '', 
    query: `jump_url=${jump_url}`,
    imageUrl: this.data.share_pic,
    success: (res) => {
      // console.log("转发成功");
    },
    fail: (res) => {
      // console.log("转发失败");
    }
  }
 
}

})
