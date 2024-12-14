
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
    focus:false,  //控制是否显示带取消按钮的搜索框
    inputValue:"",
    contentBar: [
      // {'name':'开大门','image':'../../image/开大门.png'},
      // {'name':'开房门','image':'../../image/开房门.png'},
      // {'name':'订单','image':'../../image/订单.png'},
      // {'name':'验券','image':'../../image/验券.png'},
      // {'name':'充值','image':'../../image/充值.png'}
    ],
    shopList: [
      // {'name':'观澜山庄店','image':'../../image/茶室9.jpg'},
    ],
    selectKeyWord:'',
    user_id:0,
    address:'定位中',
    lat:'',
    lng:'',
    area_id:'',
    old_area_id:'',
    shopArea:[],
    otherShopList:[],
    mapObj:{},
    imgUrls: [],   
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 500,
    jiameng:[],
    pageNo: 0, // 当前页数
    total:0, // 订单总数
    pageSize:8,
    ad90:[],
    ad91:[],
    bookingtype:0,
    showNone:0,
    conven_show:0,
    community_id:0,
    qqmap_key:app.initQQMapKey(),
    share_pic:'',
    share_title:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('options',options);
    if(options.area_id){
      setData(this,'area_id',options.area_id);
      setData(this,'old_area_id',options.area_id); // 判断是否从城市定位返回作用
    }
    let {user_id} = app.getLocalUserInfo();
    setData(this,'user_id',user_id);
    setData(this,'bookingtype',options.bookingtype);
    setData(this,'community_id',options.community_id);
    wx.showLoading({ title: '加载中...' });
    this.getShopAreaList();
    this.getHostInfo();
    this.getIndexNav();
    this.getAddress();
    this.getAd();
    this.getShopList();
    this.getFootNav();
    this.changeHeaderColor();
    this.getSharePic();
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
        var button_bg_color = result.data.button_bg_color ? result.data.button_bg_color : '#ffffff';
        var button_font_color = result.data.button_font_color ? result.data.button_font_color : '#000000';
        this.setData({
          button_bg_color,button_font_color
        })
      },
    })
  },
  // 网站配置信息
  getHostInfo(){
    wx.request({
      url: apiAddr.get_host_info, 
      method: 'post',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      dataType:'json',
      success: (result) => {
        if(result.data['mini_conven_show'] == 1){
          this.setData({
            conven_show : 1,
          })
        }
        let wxapp = result.data.all.wxapp;
        if(wxapp.qqmap_key){
            this.setData({
            qqmap_key: wxapp.qqmap_key,
          })
        }
      },
    })
  },
  getShopAreaList() {
    let shopArea = wx.getStorageSync('shopArea');
    let nowtime = Date.parse(new Date()) / 1000;
    if (!shopArea || shopArea.overtime < nowtime) {
       wx.request({
          url: apiAddr.get_shop_area_list,
          method: 'get',
          header: {
             'Content-type': 'application/x-www-form-urlencoded'
          },
          dataType: 'json',
          success: (result) => {
             let {
                data: {
                   list
                }
             } = result;
             if (list) {
                setData(this, 'shopArea', list);
                let overtime = Date.parse(new Date()) / 1000 + 7200;
                shopArea = {
                   list: list,
                   overtime: overtime
                };
                wx.setStorageSync('shopArea', shopArea);
             }
          },
       })
    }else{
       setData(this, 'shopArea', shopArea.list);
    }

 },
  getAddress(){
    let that = this;
    let userlocat = wx.getStorageSync('userlocat');
    let nowtime = Date.parse(new Date()) / 1000;
    if(!userlocat || userlocat.overtime < nowtime || !userlocat.city){
      wx.showLoading({ title: '定位中...' });
      wx.getLocation({
        // altitude: false,
        // isHighAccuracy: true,
        // highAccuracyExpireTime: 5000,
        success: (res) => {
          console.log(res);
          let overtime = Date.parse(new Date()) / 1000 + 7200;
          
          this.setData({
            lat:res.latitude,
            lng:res.longitude,
          })
          
          if(this.data.qqmap_key){
            // 微信逆地址解析
            wx.request({
              url: 'https://apis.map.qq.com/ws/geocoder/v1/?location='+res.latitude+','+res.longitude+'&key=' + this.data.qqmap_key + '&get_poi=0',
              success: function(res) {
                console.log('cityres',res);
                  var city = res.data.result.address_component.city;
                  console.log(city);
                  if(city){
                    that.setData({
                      address:city
                    })
                    let area = that.data.shopArea;
                    console.log(area);
                    if(typeof area[city] !== 'undefined'){
                      // setData(that,'area_id',area[city]['area_id']);
                    }
                  }
                  userlocat = {
                    userlat: that.data.lat,
                    userlng: that.data.lng, 
                    overtime: overtime,
                    city:city,
                  };
                  wx.setStorageSync('userlocat', userlocat);

                  wx.hideLoading();
                  that.getShopList();
              }
            })
          }else{
            // 后端地图接口
            wx.request({
              url: apiAddr.get_maps_geocoder,
              success: function(res) {
                console.log('cityres2',res);
                  var city = res.data.city;
                  console.log(city);
                  if(city){
                    that.setData({
                      address:city
                    })
                    let area = that.data.shopArea;
                    if(typeof area[city] !== 'undefined'){
                      // setData(that,'area_id',area[city]['area_id']);
                    }
                  }

                  userlocat = {
                    userlat: that.data.lat,
                    userlng: that.data.lng, 
                    overtime: overtime,
                    city:city,
                  };
                  wx.setStorageSync('userlocat', userlocat);
                  wx.hideLoading();
                  that.getShopList();
              }
            })
          }
          
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
        },
        // fail: () => wx.showToast({ title: '请点击右上角三个点并开启位置权限', icon: 'none', mask: true })
      })

    }else{
      console.log('userlocat',userlocat);
      that.setData({
        address:userlocat.city
      })
    }
  },
  // 头部广告
  getAd(){
    let sendData = {
      site_id:75,
    };
    wx.request({
      url: apiAddr.get_site_ad, 
      method: 'get',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      dataType:'json',
      data:sendData,
      success: (result) => {
        this.setData({
          imgUrls:result.data.images, 
        })
      },
    })
    // let sendData2 = {
    //   site_id:108,
    // };
    // wx.request({
    //   url: apiAddr.get_site_ad, 
    //   method: 'get',
    //   header: {
    //     'Content-type': 'application/x-www-form-urlencoded'
    //   },
    //   dataType:'json',
    //   data:sendData2,
    //   success: (result) => {
    //     console.log('ad',result);
    //     this.setData({
    //       jiameng:result.data.result[0], 
    //     })
    //   },
    // })
    // let sendData3 = {
    //   site_id:90,
    // };
    // wx.request({
    //   url: apiAddr.get_site_ad, 
    //   method: 'get',
    //   header: {
    //     'Content-type': 'application/x-www-form-urlencoded'
    //   },
    //   dataType:'json',
    //   data:sendData3,
    //   success: (result) => {
    //     console.log('ad',result);
    //     this.setData({
    //       ad90:result.data.result[0], 
    //     })
    //   },
    // })
    // let sendData4 = {
    //   site_id:91,
    // };
    // wx.request({
    //   url: apiAddr.get_site_ad, 
    //   method: 'get',
    //   header: {
    //     'Content-type': 'application/x-www-form-urlencoded'
    //   },
    //   dataType:'json',
    //   data:sendData4,
    //   success: (result) => {
    //     console.log('ad',result);
    //     this.setData({
    //       ad91:result.data.result[0], 
    //     })
    //   },
    // })
  },
  searchInput(event){
    let { detail: { value } } = event;
    setData(this, 'selectKeyWord', value);
  },
  searchConfirm(){
    let { selectKeyWord } = this.data;
    // if (!selectKeyWord) {
    //   wx.showToast({ title: '请输入关键词', icon: 'none', duration: 2000, mask: true });
    //   return false;
    // }
    this.getShopList();
  },
  choseBookingType(e){
    let type = e.currentTarget.dataset.type;
    let area_id = this.data.area_id;
    if(type == 0){
      area_id = 0;
    }
    this.setData({
      bookingtype:type,
      pageNo: 0, // 当前页数
      shopList: [],
      area_id:area_id,
    })
    this.getShopList();
  },
  getShopList(){
    
    let sendData = {
      type: 2,
      keyword: this.data.selectKeyWord,
      lng: this.data.lng,
      lat: this.data.lat,
      area_id:this.data.area_id,
      pageNo:this.data.pageNo,
      // pageSize:this.data.pageSize,
      bookingtype:this.data.bookingtype,
      community_id:this.data.community_id,
      user_id:this.data.user_id,
    };
    
    // wx.showLoading({ title: '加载中...' });
    wx.request({
      url: apiAddr.get_map_shop_list,
      method: 'post',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: sendData,
      dataType: 'json',
      success: (result) => {
        // wx.hideLoading()
        let { data: { map_shop_list,other_shop_list,total } } = result;
        
        let newList = map_shop_list ? map_shop_list : [];
        let oldList = this.data.shopList;
        
        this.setData({
          // shopList: oldList.concat(newList), // 将新数据添加到原有数据后面
          total: total,
          pageNo: this.data.pageNo + 1, // 将页数加1
        });
        // 先不用分页，有刷新卡顿问题，后面优化
        if ( map_shop_list ) {
          setData(this, 'shopList', map_shop_list);
        }
        if ( other_shop_list ) {
          setData(this, 'otherShopList', other_shop_list);
        }

        if(this.data.shopList){
          setData(this, 'showNone', 0);
        }else{
          setData(this, 'showNone', 1);
        }

      },
      complete: () => wx.hideLoading()
    })
  },
  getIndexNav(){
    let _that = this;
    wx.request({
      url: apiAddr.get_shop_index_nav,
      method: 'post',
      header: { 'Content-type': 'application/x-www-form-urlencoded' },
      data: {},
      dataType: 'json',
      success: (result) => { 
        setData(_that,'contentBar', result.data);
      }, 
    });
  },
  getFootNav(){
    let _that = this;
    wx.request({
      url: apiAddr.footer_nav_list,
      method: 'post',
      header: { 'Content-type': 'application/x-www-form-urlencoded' },
      data: {},
      dataType: 'json',
      success: (result) => {  
        setData(_that,'nav_list', result.data); 
        setData(_that,'foot_width', (100/result.data.length).toFixed(2)+'%'); 
      }, 
    });
  },
  goRoomList: function(event){
    let id = event.currentTarget.dataset.id;
    wx.redirectTo({
      url: '/pages/index/index?jump_url='+apiAddr.host+'/wap/shop/detail/shop_id/'+id,
    })
    // wx.navigateTo({
    //   url: '/pages/index/index?jump_url='+apiAddr.host+'/wap/shop/detail/shop_id/'+id,
    // })
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
  goNavLink(event){
    let url = event.currentTarget.dataset.url;
    let type = event.currentTarget.dataset.type;
    if(type == 'func'){
      this.common_func(url);
    }else{
      app.goPagesLink(event);
    }
  },
  common_func(f){
    let {user_id} = app.getLocalUserInfo();
    if(!user_id){
      wx.showToast({
          title: '授权状态已过期，需重新授权',
          icon: 'none', 
          success:function (){
          var reUrl =  encodeURIComponent('/pages/index/shoplist');
          wx.redirectTo({
              url: '/pages/auth/wechatAuth?miniReturnPath='+reUrl,
          })
          return false;
          }
      });
      return;

    }else{
      setData(this,'user_id',user_id);
    }
    let url;
    let sendData = [];
    switch(f){
      case 'open_door':
        
      case 'open_gate':
        url = apiAddr.get_start_order;
     
        sendData = {
          type: 'open',
          user_id: user_id,
          open_type:f,
        };
        
        break;
      case 'check_booking_order':
        url = apiAddr.get_start_order;
     
        sendData = {
          type: 'get',
          user_id: user_id,
          open_type:'check_order',
        };

        break;
    }
    wx.showLoading({ title: '加载中...' });
    wx.request({
      url: url,
      method: 'get',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: sendData,
      dataType: 'json',
      success: (result) => {
        wx.hideLoading()
        let { data } = result;
        if(data.msg){
          wx.showToast({
            title: data.msg,
            icon:'none'
          })
        }
        if(data.url){
          wx.navigateTo({
            url: data.url,
          })
          return false;
        }
        // if(data.data){
        //   this.getOrderPort(data.data);
        // }
      },
    })
  },
  getOrderPort(e){
    let that = this;
    let sendData = {
      order_id: e.order_id,
      shop_id:e.shop_id,
    };
    wx.showLoading({ title: '获取订单信息' });
    // 设备信息
    wx.request({
      url: apiAddr.hw_booking_order_port,
      method: 'post',
      header: { 'Content-type': 'application/x-www-form-urlencoded' },
      data: sendData,
      dataType: 'json',
      success: (result) => {  
        var re = result.data;
        wx.hideLoading()
        if(re.code != 200){
          wx.showToast({
            title: re.msg,
            icon : 'none',
          })
          // setData(that,'operate_text',re.msg);
          return;
        }else{
          
          if(re.list.length > 0){
            wx.showLoading({ title: '开启中...' });
            for(var j=0;j<re.list.length;j++){
              let sendData = {
                order_id: e.order_id,
                shop_id:e.shop_id,
                port_id:re.list[j].port_id,
              };
              that.openPort(sendData);
            }
          }else{
            wx.showToast({
              title: '查无订单设备',
              icon : 'none',
            })
          }
          
        }
      }, 
    });
  },
  openPort(e){
    let _sendData = {
      shop_id: e.shop_id,
      port_id:e.port_id,
      type: 'open',
    };        
    wx.request({
      url: apiAddr.hw_cp_operate,
      method: 'post',
      header: { 'Content-type': 'application/x-www-form-urlencoded' },
      data: _sendData,
      dataType: 'json',
      success: (result) => {  
        wx.hideLoading()
        var re = result.data;
        
        if(re.code==200){
          re = re.data;
          wx.showToast({
            title: '操作成功',
          })
          setData(that,'open_sucs['+port_id_dec+']',1);

          // 点动开
          if(re.postData.time_long > 0 && re.postData.type == 'timing'){
            var _delay = re.postData.time_long*1000;
            setTimeout(() => {
              setData(that,'open_sucs['+port_id_dec+']',0);

              wx.request({
                url: apiAddr.hw_cp_change_port_state,
                method: 'post',
                header: { 'Content-type': 'application/x-www-form-urlencoded' },
                data: {
                  port_id:port_id,
                  state: 'false',
                },
                dataType: 'json',
                success: (result) => {  
                }, 
              });

            }, _delay);
          }

        }else{
          var _msg = '操作失败';
          if(re.msg){
            var _msg = re.msg;
          }
          wx.showToast({
            title: _msg,
            icon:'none',
          })
          setData(that,'operate_text_arr['+port_id_dec+']','点击重试');
          setData(that,'open_sucs['+port_id_dec+']',0);
          return;
        }
      }, 
    });
  },
  goMap(e){
    var openParmas = {
       latitude: e.currentTarget.dataset.lat,
       longitude: e.currentTarget.dataset.lng,
       name: e.currentTarget.dataset.name,
       address: e.currentTarget.dataset.addr, 
      }

      // wx.navigateTo({
      //   url: '/pages/location/location?openParmas=' + encodeURIComponent(JSON.stringify(openParmas)),
      // })
      this.getLocation(openParmas);
      
  },
  getLocation(parmas) {
    try {
      let data = parmas;
      if (!isObjEmpty(data)) {
        Object.assign(data, this.bMapTransQQMap(data.longitude,data.latitude));
        // setData(this, 'mapMarker', this.setMarker(data));
        setData(this, 'mapObj', data);
        this.open();
      }
    } catch (e){
      console.log(e);
    }
  },
  open(){
    let { mapObj } = this.data;
    wx.openLocation(mapObj);
  },
  bMapTransQQMap: function(lng, lat) {
    // var pi = 3.14159265358979324 * 3000.0 / 180.0;
    // var x = lng - 0.0065;
    // var y = lat - 0.006;
    // var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * pi);
    // var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * pi);
    // var lng = z * Math.cos(theta);
    // var lat = z * Math.sin(theta);
    return {
      longitude:lng,
      latitude:lat
    };
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
  wechatScan(){
    wx.scanCode({
      success: (res) => {
        let { result } = res;
        if (/https/.test(result)) {
          wechatMiniPagesJump(3, `/pages/index/index?q=${encodeURIComponent(result)}`);
        }else if (/pages/.test(result)){
          wechatMiniPagesJump(3, result);
        }else{
          result = apiAddr.host+'/wap/controlpanel/hardware_add/sn/'+result;
          console.log('scan',result);
          wechatMiniPagesJump(3, `/pages/index/index?q=${encodeURIComponent(result)}`);
        }
      },
      // fail: () => wx.navigateBack()
    })
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
    if(this.data.old_area_id != this.data.area_id){
      this.getShopList();
      this.setData({
        old_area_id : this.data.area_id,
      })
    }
    this.getSharePic();
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
    this.setData({
      pageNo: 0, // 当前页数
      shopList: [],
    })
  // 显示加载状态
    // wx.showNavigationBarLoading();
    this.getShopList();

  // 模拟异步请求数据
    setTimeout(() => {
      // 更新完页面内容后，隐藏加载状态
      // wx.hideNavigationBarLoading();

      // 调用停止下拉刷新的方法，表示刷新完成
      wx.stopPullDownRefresh();
    }, 1500);

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    const total = this.data.total;
    const pageNo = this.data.pageNo;
    const pageSize = this.data.pageSize;
    const hasMore = pageNo * pageSize < total;
    if (hasMore) {
      this.getShopList(); // 加载更多数据
    } else {
      wx.showToast({
        title: '没有更多数据了',
        icon: 'none',
      });
    }
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
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    // console.log('分享触发2');
    let { user_id } = app.getLocalUserInfo(); 
    // let jump_url = e.webViewUrl.replace(/.html/,`/fuid/${user_id}.html`);
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
  }
})