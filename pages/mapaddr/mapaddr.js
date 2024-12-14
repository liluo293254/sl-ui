import apiAddr from '../../api/base';
import { setData ,wechatMiniPagesJump} from '../../utils/index';
const app = getApp();
const chooseLocation = requirePlugin('chooseLocation');
// const key = ''; //使用在腾讯位置服务申请的key
// const referer = '容物智能'; //调用插件的app的名称
// var location = JSON.stringify({
//   latitude: 39.89631551,
//   longitude: 116.323459711
// });
// const category = '生活服务,娱乐休闲';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addr:'',
   lng:'',
   lat:'',
   lat_lng:'',
   region: [],
   customItem: '',
   user_id:0,
   site_mobile:'',
  },
/**
 * 地区
 */
  bindRegionChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      region: e.detail.value
    })
  },
 /**
  * 调取地图
  */
  getaddr:function(){

    wx.request({
      url:apiAddr.get_location, 
      method: 'post',
      header: {'Content-type': 'application/x-www-form-urlencoded'},
      data: {},
      dataType:'json',
      success: (result) => { 
       
        let userlocat = wx.getStorageSync('userlocat');
        if(userlocat){ 
            let da = JSON.stringify({
              latitude: userlocat.userlat,
              longitude: userlocat.userlng
            }); 
            wx.navigateTo({
              url: 'plugin://chooseLocation/index?key=' + result.data.qqmap_key + '&referer=' + result.data.sitename + '&location=' + da  
            });
        }else{ 
            let da = JSON.stringify({
                latitude: result.data.lat,
                longitude: result.data.lng
            }); 
            wx.navigateTo({
              url: 'plugin://chooseLocation/index?key=' + result.data.qqmap_key + '&referer=' + result.data.sitename + '&location=' + da  
            });
        }
        
      }, 
    })
 
    
  },
  wechatAuth(){
    wx.redirectTo({
      url: '/pages/auth/wechatAuth?miniReturnPath=/pages/mapaddr/mapaddr',
    })
  },
  /**
   * 
   * 提交表单
   */
  addshop:function(event){
    // console.log(event);
    let { detail: { value: { shop_name, mobile,contact,city,area,business,addr,lat,lng } } } = event;

    let { user_id } = app.getLocalUserInfo();
 
    if(!user_id){
        wx.showToast({
        title: '请先登录',
        icon: 'none', 
        success: () => setTimeout(() => wechatMiniPagesJump(2, '/pages/auth/wechatAuth'),2000)
      }); 
      return;
    }
    
    if (!shop_name) {
      wx.showToast({ title: '请输入商户名称', icon: 'none', mask: true });
      return false;
    }
    if (!mobile) {
      wx.showToast({ title: '请输入手机号码', icon: 'none', mask: true });
      return false;
    }
    if (!contact) {
      wx.showToast({ title: '请输入联系人姓名', icon: 'none', mask: true });
      return false;
    }
    if (!city || !area || !business) {
      wx.showToast({ title: '请选择地区', icon: 'none', mask: true });
      return false;
    }
    if (!addr) {
      wx.showToast({ title: '请输入详细地址', icon: 'none', mask: true });
      return false;
    }
    // if (!lat || !lng) {
    //   wx.showToast({ title: '请获取具体坐标', icon: 'none', mask: true });
    //   return false;
    // }
      
    let sendData = {
      user_id:user_id,
      shop_name: shop_name,
      mobile: mobile,
      contact: contact,
      city:city,
      area:area,
      business:business,
      addr:addr,
      lng:lng,
      lat:lat 
    };
    console.log(sendData);
    wx.showLoading({ title: '请求数据中...', mask: true });
    wx.request({
      url: apiAddr.mini_shop_apply, 
      method: 'post',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: sendData,
      dataType:'json',
      success: (result) => {
        console.log(result);
        wx.hideLoading();//先执行hide，否则后面的wx.showToast会一闪没
        let { data: { code, msg, url } } = result; 
        //成功 站外跳转
        if (code === 200 ) { 
          wx.showToast({
            title: msg,
            icon: 'success  ', 
            success: () => setTimeout(() => wx.navigateBack(),1500)
          });

          // if(url){
          //   wx.showToast({
          //     title: msg,
          //     icon: 'success  ', 
          //     success: () => setTimeout(() => wechatMiniPagesJump(2, `/pages/index/index?q=${url}`),2000)
          //   });
          // }else{
            
          // }
          
        //失败 提示
        }else if(code === 201){
          wx.showToast({
            title: msg,
            icon: 'none',  
            duration: 2000
          });
        //失败 站内跳转
        }else if(code === 202){
          wx.showToast({
            title: msg,
            icon: 'none',  
            success: () => setTimeout(() => wechatMiniPagesJump(2, url),2000)
          });
        //失败 站外跳转
        }else if(code === 203){
          // wx.showToast({
          //   title: msg,
          //   icon: 'none',        
          //   success: () => setTimeout(() => wechatMiniPagesJump(2, `/pages/index/index?q=${url}`),2000)
          // });
          wx.showToast({
            title: msg,
            icon: 'none', 
            success: () => setTimeout(() => wx.navigateBack(),1500)
          });
        }
  
      }
    })
  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  let { user_id } = app.getLocalUserInfo();
  if(user_id){
    this.setData({user_id});
  }
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

      var button_bg_color = result.data.button_bg_color ? result.data.button_bg_color : '#ffffff';
      var button_font_color = result.data.button_font_color ? result.data.button_font_color : '#000000';
      
      this.setData({
        button_bg_color,button_font_color
      })

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
  wx.request({
    url: apiAddr.get_site_config, 
    method: 'post',
    header: {
      'Content-type': 'application/x-www-form-urlencoded'
    },
    dataType:'json',
    success: (result) => {
      this.setData({
        site_mobile:result.data.site.tel,
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
    const location = chooseLocation.getLocation(); 
    if(location){
          let{longitude,latitude,address,province,city,district} = location; 
    // console.log(location);
    // 如果点击确认选点按钮，则返回选点结果对象，否则返回null
    setData(this,'lng', longitude);
    setData(this,'lat', latitude);
    setData(this,'lat_lng', latitude+'_'+longitude);
    setData(this,'addr', address);
    setData(this,'region', [province,city,district]);
    }

  },
  makeCall:function(event){
    app.makeCall(event);
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
 // 页面卸载时设置插件选点数据为null，防止再次进入页面，geLocation返回的是上次选点结果
 chooseLocation.setLocation(null);
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