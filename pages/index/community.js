
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
    contentBar: [],
    contentBarWidth:'30%',
    contentNavBar :[],
    contentNavBarWidth:'20%',
    shopList: [],
    selectKeyWord:'',
    show_ad_item:1,
    user_id:0,
    address:'定位中',
    lat:'',
    lng:'',
    area_id:'',
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
    block_data_default:0,
    listtype:0,
    showNone:0,
    showNoMore:0,
    qqmap_key:app.initQQMapKey(),
    list_button_bg_color:'#ffffff',
    share_pic:'',
    share_title:'',
    index_mask_show:1,
    index_mask:{
      index_mask_read:'',
      index_mask_read_title:'',
      index_mask_show:0,
      index_mask_textarea:'',
      index_mask_title:'',
      index_mask_img:'',
      index_mask_url:'',
    },
    currentTab: 0, // 底部栏目
    taskList: [],
    viewActionColor:'#ffffff',
    tasktype:'community',
    taskshowtype:1,
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    
    console.log('options',options);
    if(options.area_id){
      setData(this,'area_id',options.area_id);
    }
    if(options.fuid>0){
      wx.setStorageSync('invite_fuid', options.fuid);
    }
    console.log('invite_fuid',wx.getStorageSync('invite_fuid'));
    if(options.lists == 1){
      this.setData({
        show_ad_item: 0, 
      })
    }
    let userlocat = wx.getStorageSync('userlocat');
    
    if(userlocat.city){
      setData(this,'lat',userlocat.userlat);
      setData(this,'lng',userlocat.userlng);
    }
    this.getHostInfo();
    this.getShopAreaList();
    this.getIndexNav();
    this.getBlockData();
    this.getAddress();
    this.getAd();
    this.getFootNav();
    this.changeHeaderColor();
    
  },
  // 网站配置信息
  getHostInfo() {
    wx.request({
       url: apiAddr.get_host_info,
       method: 'post',
       header: {
          'Content-type': 'application/x-www-form-urlencoded'
       },
       dataType: 'json',
       success: (result) => {

          let site = result.data.all.site;
          if(site.sitename){
            wx.setNavigationBarTitle({
              title: site.sitename,
            })
          }

          let wxapp = result.data.all.wxapp;
          if(wxapp.qqmap_key){
             this.setData({
              qqmap_key: wxapp.qqmap_key,
            })
          }

          let indexmaskread = wx.getStorageSync('indexmaskread');
          let nowtime = Date.parse(new Date()) / 1000;
          if(!indexmaskread || indexmaskread.overtime < nowtime){
            let other_config = result.data.all.other;
            if(other_config.index_mask_show != undefined && other_config.index_mask_show){
              this.setData({
                index_mask:other_config
              })
            }
          }
          let config = result.data.all.config;

          if(config.customer_url != undefined && config.customer_url){
            this.setData({
              customer_url:config.customer_url
            })
          }
          if(config.aq_url != undefined && config.aq_url){
            this.setData({
              aq_url:config.aq_url
            })
          }
          
          let operation = result.data.all.operation;
          if(operation.mini_index_list_show == undefined || operation.mini_index_list_show == 1){
            this.setData({
              showlist:1
            })
          }
       },
    })
 },
 indexMaskUrl(event){
  console.log(event);
  let url = event.currentTarget.dataset.url;
  console.log(url);
  if(url){
    if(/pages/.test(url)){
      this.goPagesLink(event);
    }else{
      this.goH5Link(event);
    }
  }
},
 //样式一的关闭规则提示
 hideRule: function () {
  var check = this.data.checked;
  if (check) {
    this.data.checked = true;
    this.setData({
      'index_mask.index_mask_show': 0
      })
  } else {
    this.setData({
      'index_mask.index_mask_show': 1
      })
  }
},
  //样式二的关闭规则提示
  hideRule2: function () {
    this.setData({
      'index_mask.index_mask_show': 0
    })
    if(this.data.index_mask.index_mask_cookie != undefined){
      console.log('setindexmaskread')
      // 记录缓存，下次进来若在缓存内则无需再展示
      let overtime = Date.parse(new Date()) / 1000 + this.data.index_mask.index_mask_cookie * 86400;
      let indexmaskread = {
         data: 1,
         overtime: overtime
      };
      wx.setStorageSync('indexmaskread', indexmaskread);
    }
  } ,
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
        var color = result.data.mobile_color ? result.data.mobile_color : '#249dee';
        var font_color = result.data.font_color ? result.data.font_color : '#ffffff';
        console.log(result);
        console.log(font_color);
        this.setData({
          button_bg_color,button_font_color
        })
        this.setData({
          viewActionColor:button_bg_color,
        })
        if(apiAddr.host != 'https://www.zhigan360.com'){
          // 不是智感项目的列表按钮颜色，统一为项目主题色
          setData(this,'list_button_bg_color',button_bg_color);
        }else{
          setData(this,'list_button_bg_color','#7bc327');
        }
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
  getListSwiperTab(){
    let that = this;
    wx.request({
      url: apiAddr.get_index_list_tab,
      method: 'get',
      header: {
         'Content-type': 'application/x-www-form-urlencoded'
      },
      dataType: 'json',
      success: (result) => {
        let { data: {taskList} } = result;
        if(taskList.length > 0){
          setData(that, 'taskList',taskList);
          setData(that, 'tasktype',taskList[0].type);
          wx.createSelectorQuery().select('.scroll-wrapper').boundingClientRect(function(rect) {
            console.log(rect);
            setData(that,'tasktop',rect.top);
          }).exec();
        }

        that.getList();
      },
   })
  },
  handleClick(e) {
    let currentTab = e.currentTarget.dataset.index
    this.setData({
      currentTab
    })
    let type = e.currentTarget.dataset.type;
    let showtype = e.currentTarget.dataset.showtype;
    setData(this, 'taskshowtype',showtype);
    if(type){
      setData(this, 'tasktype',type);
      this.setData({
        pageNo: 0, // 当前页数
        shopList: [],
      })
      this.getList();
    }
  },
  getShopAreaList() {
    let shopArea = wx.getStorageSync('shopArea');
    let nowtime = Date.parse(new Date()) / 1000;
    if (!shopArea || shopArea.overtime < nowtime) {
       wx.request({
          url: apiAddr.get_community_area_list,
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
                  // that.setData({
                  //   pageNo: 0, // 当前页数
                  //   shopList: [],
                  // })
                  // that.getList();
              }
            })
          }else{
            let sendData = {
              lat:res.latitude,
              lng:res.longitude,
            };
            // 后端地图接口
            wx.request({
              url: apiAddr.get_maps_geocoder,
              method: 'post',
              header: {
                'Content-type': 'application/x-www-form-urlencoded'
              },
              dataType:'json',
              data: sendData,
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
                  // that.setData({
                  //   pageNo: 0, // 当前页数
                  //   shopList: [],
                  // })
                  // that.getList();
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
  
    wx.request({
      url: apiAddr.get_site_ad, 
      method: 'get',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      dataType:'json',
      data:{site_id:61},
      success: (result) => {
        this.setData({
          imgUrls:result.data.images, 
        })
      },
    })
    wx.request({
      url: apiAddr.get_site_ad, 
      method: 'get',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      dataType:'json',
      data:{site_id:89},
      success: (result) => {
        this.setData({
          ad89:result.data.result, 
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
    this.setData({
      pageNo: 0, // 当前页数
      shopList: [],
    })
    if(selectKeyWord){
      this.setData({
        show_ad_item: 0, 
      })
    }else{
      this.setData({
        show_ad_item: 1, 
      })
    }
    // if (!selectKeyWord) {
    //   wx.showToast({ title: '请输入关键词', icon: 'none', duration: 2000, mask: true });
    //   return false;
    // }
    this.getList();
  },
  searchCancel(){
    setData(this, 'selectKeyWord', '');
    this.setData({
      show_ad_item: 1, 
    })
    this.getList();
  },
  choseBookingType(e){
    console.log('sdfsdf');
    let type = e.currentTarget.dataset.type;
    let url = e.currentTarget.dataset.url;
    let minipage = e.currentTarget.dataset.minipage;
    console.log(url);
    if(minipage){
      wx.navigateTo({
        url: minipage,
        })
      return false;
    }
    if(url){
      wx.navigateTo({
        url: `/pages/index/index?q=${url}`,
        })
      return false;
    }
    let area_id = this.data.area_id;
    if(type == 0){  
      area_id = 0;
    }
    this.setData({
      listtype:type,
      pageNo: 0, // 当前页数
      shopList: [],
      area_id:area_id,
    })
    this.getCommunityList(); // 当默认导航选择了社区
  },
  getList(){
    if(this.data.tasktype == 'community'){
      this.getCommunityList();
    }else if(this.data.taskshowtype == 2){
      this.getShopProduct();
    }else{
      this.getShopList();
    }
  },
  getCommunityList(){
    let {user_id} = app.getLocalUserInfo();
    if(user_id){
      setData(this,'user_id',user_id);
    }
    let sendData = {
      type: 2,
      keyword: this.data.selectKeyWord,
      lng: this.data.lng,
      lat: this.data.lat,
      area_id:this.data.area_id,
      pageNo:this.data.pageNo,
      pageSize:this.data.pageSize,
      listtype:this.data.listtype,
      user_id:user_id,
    };
    
    console.log('sendData',sendData);
    wx.showLoading({ title: '加载中...' });
    wx.request({
      url: apiAddr.get_map_community_list,
      method: 'post',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: sendData,
      dataType: 'json',
      success: (result) => {
        console.log(result);
        let { data: { map_community_list,other_community_list,total } } = result;
        
        let newList = map_community_list ? map_community_list : [];
        let oldList = this.data.shopList;
        
        this.setData({
          shopList: oldList.concat(newList), // 将新数据添加到原有数据后面
          total: total,
          pageNo: this.data.pageNo + 1, // 将页数加1
        });
        // 先不用分页，有刷新卡顿问题，后面优化
        if ( map_community_list ) {
          // setData(this, 'shopList', map_community_list);
        }
        if ( other_community_list ) {
          setData(this, 'otherShopList', other_community_list);
        }

        if(this.data.shopList.length > 0){
          setData(this, 'showNone', 0);
        }else{
          setData(this, 'showNone', 1);
        }
        console.log('shop_list',this.data.shopList);
      },
      complete: () => wx.hideLoading()
    })
  },
  getShopProduct(){
    let {user_id} = app.getLocalUserInfo();
    if(user_id){
      setData(this,'user_id',user_id);
    }
    let sendData = {
      keyword: this.data.selectKeyWord,
      lng: this.data.lng,
      lat: this.data.lat,
      area_id:this.data.area_id,
      pageNo:this.data.pageNo,
      pageSize:this.data.pageSize,
      module:this.data.tasktype,
      user_id:user_id,
    };
    
    console.log(sendData);
    wx.showLoading({ title: '加载中...' });
    wx.request({
      url: apiAddr.get_map_shop_goods_list,
      method: 'post',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: sendData,
      dataType: 'json',
      success: (result) => {
        console.log(result);
        let { data: { map_list,total } } = result;
        
        let newList = map_list ? map_list : [];
        let oldList = this.data.shopList;
        
        this.setData({
          shopList: oldList.concat(newList), // 将新数据添加到原有数据后面
          total: total,
          pageNo: this.data.pageNo + 1, // 将页数加1
        });
        // 先不用分页，有刷新卡顿问题，后面优化
        if ( map_list ) {
          // setData(this, 'shopList', map_list);
        }
        if(this.data.shopList.length > 0){
          setData(this, 'showNone', 0);
        }else{
          setData(this, 'showNone', 1);
        }
        console.log('shop_list',this.data.shopList);
      },
      complete: () => wx.hideLoading()
    })
  },
  getShopList(){
    let {user_id} = app.getLocalUserInfo();
    if(user_id){
      setData(this,'user_id',user_id);
    }
    let sendData = {
      type: 2,
      keyword: this.data.selectKeyWord,
      lng: this.data.lng,
      lat: this.data.lat,
      area_id:this.data.area_id,
      pageNo:this.data.pageNo,
      pageSize:this.data.pageSize,
      module:this.data.tasktype,
      user_id:user_id,
    };
    
    wx.showLoading({ title: '加载中...' });
    wx.request({
      url: apiAddr.get_map_shop_list,
      method: 'post',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: sendData,
      dataType: 'json',
      success: (result) => {
        console.log(result);
        let { data: { map_shop_list,other_shop_list,total } } = result;
        
        let newList = map_shop_list ? map_shop_list : [];
        let oldList = this.data.shopList;
        
        this.setData({
          shopList: oldList.concat(newList), // 将新数据添加到原有数据后面
          total: total,
          pageNo: this.data.pageNo + 1, // 将页数加1
        });
        // 先不用分页，有刷新卡顿问题，后面优化
        if ( map_shop_list ) {
          // setData(this, 'shopList', map_shop_list);
        }
        if ( other_shop_list ) {
          setData(this, 'otherShopList', other_shop_list);
        }

        if(this.data.shopList.length > 0){
          setData(this, 'showNone', 0);
        }else{
          setData(this, 'showNone', 1);
        }
        console.log('shop_list',this.data.shopList);
      },
      complete: () => wx.hideLoading()
    })
  },
  getIndexNav(){
    let _that = this;
    wx.request({
      url: apiAddr.get_index_nav,
      method: 'post',
      header: { 'Content-type': 'application/x-www-form-urlencoded' },
      data: {},
      dataType: 'json',
      success: (result) => { 
        console.log(result);
        setData(_that,'contentNavBar', result.data);
        if(result.data.length == 2){
          setData(_that,'contentNavBarWidth', '46.8%');
        }
        if(result.data.length%4 == 0){
          setData(_that,'contentNavBarWidth', '25%');
        }
        if(result.data.length%3 == 0){
          setData(_that,'contentNavBarWidth', '33.33%');
        }
      }, 
    });
    wx.request({
      url: apiAddr.get_community_index_nav,
      method: 'post',
      header: { 'Content-type': 'application/x-www-form-urlencoded' },
      data: {},
      dataType: 'json',
      success: (result) => { 
        setData(_that,'contentBar', result.data);
        if(result.data.length == 2 || result.data.length == 4){
          setData(_that,'contentBarWidth', '46.8%');
        }
      }, 
    });
  },
  getBlockData(){
    wx.request({
      url: apiAddr.get_index_block,
      method: 'post',
      header: { 'Content-type': 'application/x-www-form-urlencoded' },
      data: {},
      dataType: 'json',
      success: (result) => { 
        console.log('block_data',result);
        setData(this,'block_data1',result.data.index_block_type1_data);
        setData(this,'block_data2',result.data.index_block_type2_data);
        
        if(result.data.index_block_type1_data.length == 0){
          setData(this,'block_data_default',1);
        }
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
    let url = event.currentTarget.dataset.url;
    if(url){
      // 先判断pages，兼容部分直接传入pages/index/index?jump_url的数据
      if (/pages/.test(url)){
        wx.navigateTo({
          url: url,
        })
      }else{
        wx.navigateTo({
          url: '/pages/index/index?jump_url='+url,
        })
      }
    }else{
      wx.redirectTo({
        // url: '/pages/index/index?jump_url='+apiAddr.host+'/wap/community/detail/community_id/'+id,
        url: '/pages/community/detail?id='+id,
      })
    }
  },
  goH5Link: function(event){
    app.goH5Link(event);
  },
  goPagesLink: function(event){
    app.goPagesLink(event);
  },
  goMiniprogram: function(event){
    app.goMiniprogram(event);
  },
  makeCall:function(event){
    app.makeCall(event);
  },
  goNavLink(event){
    let url = event.currentTarget.dataset.url;
    let type = event.currentTarget.dataset.type;
    if(type == 'func'){
      this.common_func(url);
    }else if(type == 'pages'){
      app.goPagesLink(event);
    }else if(type == 'gominiprogram'){
      app.goMiniprogram(event);
    }else{
      app.goH5Link(event);
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
    console.log(sendData);
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
        console.log(result);
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
        console.log(data.data);
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
          console.log('开始操作');
          console.log(result);
          
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
        console.log(result);
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
    console.log(e);
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
    this.setData({
      pageNo: 0, // 当前页数
      shopList: [],
    })
    // this.getList();
    this.getListSwiperTab();
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
    this.getList();

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
    console.log('onReachBottom');
    const total = this.data.total;
    const pageNo = this.data.pageNo;
    const pageSize = this.data.pageSize;
    const hasMore = pageNo * pageSize < total;
    if (hasMore) {
      this.getList();
    } else {
      wx.showToast({
        title: '没有更多数据了',
        icon: 'none',
      });
    }
  },

// 监听下滑事件
onPageScroll(e) {
  let scrollTop = e.scrollTop;
  let tasktop = this.data.tasktop;
  if(scrollTop > tasktop && tasktop != 0){
    this.setData({
      fixedNavStyle: `position: fixed;top: 0;`, // 动态绑定样式
      NavValueStyle:`padding-top:110rpx`,
    });
  }else{
    this.setData({
      fixedNavStyle:'', // 动态绑定样式
      NavValueStyle:''
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
  onShareAppMessage(e) {
    console.log('分享触发2');
    let { user_id } = app.getLocalUserInfo(); 
    // let jump_url = e.webViewUrl.replace(/.html/,`/fuid/${user_id}.html`);
    // let jump_url = e.webViewUrl.replace(/.html/,'');
    // let arr = [];
    // if(/sitetype/.test(jump_url)){
    //   arr = jump_url.split('/sitetype/');
    // }else{
    //   arr = jump_url.split('/mini_user_id/');
    // }

    // jump_url = arr[0];
    // jump_url = jump_url.replace(/\/login_status\/200/,'');
    // jump_url = jump_url.replace(/login_status=200/,'');
    // jump_url = jump_url+`/fuid/${user_id}`;

    return {
      title: this.data.share_title,
      path: `/pages/index/community`,
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
    console.log('share_pic:'+this.data.share_pic);
    return {
      title: this.data.share_title, 
      query: '',
      imageUrl: '', // this.data.share_pic
      success: (res) => {
        console.log("转发成功");
      },
      fail: (res) => {
        console.log("转发失败");
      }
    }
  }
})