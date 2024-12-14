const app = getApp();
import apiAddr from '../../api/base';
import { setData } from '../../utils/index';

// index.js
Page({
  data: {
    listWifi:[],
    isShow:false,
    shop_name:'',
    username:'',
    pwd:'',
    isClick:false,
    is_init:false,
    nav_list:[],
    foot_width:'20%',
    header_color:'',
    button_font_color:'',
    button_bg_color:'',
    error_bg:apiAddr.host+'/Public/img/no_data.png',
  },
  onLoad(option) {
    var {shop_id}= option;
    this.getInfo(shop_id);
    this.getfootermenu();
  },
  Connected: function() {
    var that=this
    wx.connectWifi({
        SSID: that.data.username,
        //BSSID: that.data.username,
        password: that.data.pwd,
        success: function(res) {
            wx.hideLoading();
            that.setData({
              isShow: false,
              username:'',
              pwd:'' ,
              isClick:false
            });
            wx.showToast({
              title: 'wifi连接成功',
              icon:'success', 
              duration:1000, 
            });
        },
        fail: function(res) {
          console.log(res);
          that.setData({
            isClick:false
          });
          wx.showToast({
            title: 'wifi连接失败',
            icon:'error', 
            duration:1000, 
          })  
        }
    })
  },
  connectWifi:function() {
    var that = this;
    //检测手机型号
    wx.getSystemInfo({
        success: function(res) {
            var system = '';
            if (res.platform == 'android') system = parseInt(res.system.substr(8));
            if (res.platform == 'ios') system = parseInt(res.system.substr(4));
            if (res.platform == 'android' && system < 6) {
                wx.showToast({
                  icon:'error', 
                  duration:1000, 
                  title: '手机版本不支持',
                })
                return
            }
            if (res.platform == 'ios' && system < 11.2) {
                wx.showToast({
                  icon:'error', 
                  duration:1000, 
                  title: '手机版本不支持',
                })
                return
            }
            //2.初始化 Wi-Fi 模块
            that.startWifi();
        }
    })
  },
  //初始化 Wi-Fi 模块
  startWifi: function() {
    console.log("startWifi");
    this.setData({
      isClick:true
    })
    var that=this;
    wx.startWifi({
        success: function(res) {
            //请求成功连接Wifi
            wx.showLoading({
              title: '连接中',
              mask:true,
            })
            that.Connected(); 
          
        },
        fail: function(res) {
          console.log("error=",res);
          console.log(res)
          wx.showToast({
            icon:'error', 
            duration:1000, 
            title: '接口调用失败',
          })
          that.setData({
            isClick:false
          })
        },
    })
  },
  hide(e){
    let ref=e.currentTarget.dataset.ref;
    if(ref=='self'){
      this.setData({
        isShow: false,
        username:'',
        pwd:''
      })
    }
  },
  hideCover(e){
    this.setData({
      isShow: false,
      username:'',
      pwd:''
    })
  },
  showCover(e){
    wx.showLoading({
      mask:true,
    })
    this.setData({
      isShow:true,
      username:e.currentTarget.dataset.username,
      pwd:e.currentTarget.dataset.pwd
    })
    wx.hideLoading();

  },
  copyPwd: function (e) {
    var that = this;
    wx.setClipboardData({
      //准备复制的数据内容
      data: e.currentTarget.dataset.pwd,
      success: function (res) {
        that.setData({
          isShow: false,
          username:'',
          pwd:'' 
        });
        wx.showToast({
          title: '复制成功',
          icon:'success', 
          duration:1000, 
        });
      }
    });
  },
  getInfo: function(s){
    var that = this;
    wx.request({
      url: apiAddr.get_shop_details, //接口地址
      header: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'post',
      data:{shop_id:s},
      success: function(res) {
        console.log(res);
        if(res.statusCode==200){
          var detail = res.data;
            that.setData({
              listWifi:detail.common_setting.wifi_list,
              is_init:true,
              shop_name:detail.shop_name,
            })
        }
      }
    })
  },
  getfootermenu: function(){
    wx.request({
      url: apiAddr.footer_nav_list,
      method: 'post',
      header: { 'Content-type': 'application/x-www-form-urlencoded' },
      data: {},
      dataType: 'json',
      success: (result) => {  
        setData(this,'nav_list', result.data); 
        setData(this,'foot_width', (100/result.data.length).toFixed(2)+'%'); 
        console.log((100/result.data.length).toFixed(2)+'%')
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
    var color = result.data.mobile_color && result.data.mobile_color !='#ffffff' ? result.data.mobile_color : '#249dee';
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


  }

  

})