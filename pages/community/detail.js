
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
    community_id:0,
    shopList: [],
    detail:[],
    init_datas:[], // 初始小区数据
    selectKeyWord:'',
    user_id:0,
    address:'定位中',
    lat:'',
    lng:'',
    area_id:'',
    shopArea:[],
    otherShopList:[],
    mapObj:{},
    imgUrls: [],
    imgUrlsc: [],
    imgUrlsb: [],
    imgUrlblock1:[],
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 500,
    jiameng:[],
    pageNo: 0, // 当前页数
    total:0, // 订单总数
    pageSize:8,
    bookingtype:0,
    showNone:0,
    tuanList:[],
    convenBar: [],
    contentBar: [],
    contentBarWidth:'25%',
    contentBigBar:[],
    news:{},  //这里需要改成数组
    is_owner:0,  //是否为业主
    blockBar: [],
    currentTab: 0, // 底部栏目
    taskList: [],
    taskheight:'min-height: calc(600px)',
    viewActionColor:'#ffffff',
    change_comm_show:1,
  },
  handleClick(e) {
    let currentTab = e.currentTarget.dataset.index
    this.setData({
      currentTab
    })
  },
  handleSwiper(e) {
    console.log(e);
    let {
      current,
      source
    } = e.detail
    if (source === 'autoplay' || source === 'touch') {
      const currentTab = current
      this.setData({
        currentTab
      })
    }
    let num = this.data.taskList[current].num;

    if(num != undefined){
      let height = num*120;
      console.log(height)
      this.setData({
        taskheight:'min-height: calc('+height+'px)',
      })
    }

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('options',options);
    let id = options.id;
    if(!id){
      wx.showToast({
        title: '数据错误',
        icon:'none'
      })
      wx.navigateBack();
    }else{
      setData(this,'community_id',id);
    }
    if(options.area_id){
      setData(this,'area_id',options.area_id);
    }
    let {user_id} = app.getLocalUserInfo();
    this.setData({
      user_id: user_id
    })
    this.getDetail();
    // this.getAd();
    this.getIndexNav();
    this.getFootNav();
    this.changeHeaderColor();
  },
  wechatAuth(){
    wx.redirectTo({
      url: '/pages/auth/wechatAuth?miniReturnPath=/pages/community/detail?id='+this.data.community_id,
    })
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
        this.setData({
          viewActionColor:button_bg_color,
        })
      },
    })
  },
  checekOwner(){
    if(!this.data.is_owner){
      wx.showToast({
        title: '请先申请入住',
        icon:'none'
      })
      let url = apiAddr.host + '/wap/community/owner/community_id/' + this.data.community_id
      setTimeout(() => {
        wx.navigateTo({
          url: `/pages/index/index?q=${url}`,
        })
      }, 1500);

      return false;
    }else{
      return true;
    }
  },
  getDetail(){
    let {user_id} = app.getLocalUserInfo();
    let sendData = {
      community_id: this.data.community_id,
      user_id : user_id, // 不用this.data，可能数据加载慢
    };
    wx.showLoading({ title: '加载中...' });
    wx.request({
      url: apiAddr.get_community_details,
      method: 'post',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: sendData,
      dataType: 'json',
      success: (result) => {
        console.log('详情',result);
        let { data: { detail, ads,adc,adb,adblock_1,isjoin ,news,owner,phones,products_pay,user_owner,tuan,activity,appoint,jifen,taskList} } = result;
        if (!ads){
          ads = [{"url":apiAddr.host+detail.pic}]
        }
        if (!news){
          news = [{"title":"暂无通知","news_id":0}]
        }

        console.log('新闻',news);
        let is_owner = 0;
        if (owner){
          is_owner = 1;
        }
        this.setData({
          detail:detail,
          imgUrls:ads,
          imgUrlsc:adc,
          imgUrlsb:adb,
          imgUrlblock1:adblock_1,
          init_datas:result.data,
          news:news[0],
          is_owner: is_owner,
          share_title:detail.name,
          change_comm_show:detail.change_comm,
        });
        console.log('imgUrlblock1',this.data.imgUrlblock1);
        wx.setNavigationBarTitle({
          title: detail.name,
        })

        if(taskList){
          setData(this, 'taskList',taskList);

          // 设置首列高度
          let num = this.data.taskList[this.data.currentTab].num;
          if(num != undefined){
            let height = num*120;
            console.log(height)
            this.setData({
              taskheight:'min-height: calc('+height+'px)',
            })
          }
        }

        if(tuan){
          setData(this, 'tuanList',tuan);
          setData(this, 'showNone', 0);
        }else{
          setData(this, 'showNone', 1);
        }

      },
      complete: () => wx.hideLoading()
    })
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
  // 头部广告
  getAd(){
    let sendData = {
      site_id:61,
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
        console.log('头部广告',result);
        this.setData({
          imgUrls:result.data.images, 
        })
      },
    })
  },
  searchInput(event){
    let { detail: { value } } = event;
    setData(this, 'selectKeyWord', value);
  },
  searchConfirm(){
    let { selectKeyWord } = this.data;
  },
  // 获取门店信息，备用，目前暂时为用到
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
    };
    
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
        let { data: { map_community_list,other_community_list,total } } = result;
        
        let newList = map_community_list ? map_community_list : [];
        let oldList = this.data.shopList;
        
        this.setData({
          // shopList: oldList.concat(newList), // 将新数据添加到原有数据后面
          total: total,
          pageNo: this.data.pageNo + 1, // 将页数加1
        });
        // 先不用分页，有刷新卡顿问题，后面优化
        if ( map_community_list ) {
          setData(this, 'shopList', map_community_list);
        }
        if ( other_community_list ) {
          setData(this, 'otherShopList', other_community_list);
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
    let that = this;
    wx.request({
      url: apiAddr.get_community_tools_nav,
      method: 'post',
      header: { 'Content-type': 'application/x-www-form-urlencoded' },
      data: {
        community_id:that.data.community_id,
        user_id:that.data.user_id,
        version:2
      },
      dataType: 'json',
      success: (result) => { 
        console.log('功能图标',result);
        setData(that,'convenBar', result.data.convenBar);
        setData(that,'contentBar', result.data.contentBar);
        setData(that,'contentBarWidth', result.data.contentBarWidth);
        setData(that,'contentBigBar', result.data.contentBigBar);
        setData(that,'blockBar', result.data.blockBar);
      }, 
    });
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
  goH5Link: function(event){
    let auth=event.currentTarget.dataset.auth;
    if(auth != 1){
      let check = this.checekOwner();
      if (!check){
        return;
      }
    }
    app.goH5Link(event);
  },
  goPagesLink: function(event){
    app.goPagesLink(event);
  },
  makeCall:function(event){
    app.makeCall(event);
  },
  showToast:function(event){
    let auth=event.currentTarget.dataset.auth;
    if(auth != 1){
      let check = this.checekOwner();
      if (!check){
        return;
      }
    }
    let text = event.currentTarget.dataset.text;
    wx.showToast({
      title: text,
      icon : 'none'
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
  goPagesLink(event){
    let url = event.currentTarget.dataset.url;
    if(url!=''){
      app.goPagesLink(event);
    }
  },
  common_func(f){
    let that = this;
    let {user_id} = that.data.user_id;
    if(!user_id){
      wx.showToast({
          title: '授权状态已过期，需重新授权',
          icon: 'none', 
          success:function (){
          var reUrl =  encodeURIComponent('/pages/community/detail?id='+that.data.community_id);
          wx.redirectTo({
              url: '/pages/auth/wechatAuth?miniReturnPath='+reUrl,
          })
          return false;
          }
      });
      return;
    }

    let url;
    let sendData = [];
    switch(f){
      case 'exit_neighbor':
        
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
    // this.getDetail();
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
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: this.data.share_title,
      path: `/pages/community/detail?id=`+this.data.community_id,
      success: (res) => {
      },
      fail: (res) => {
      }
    }
  },
  onShareTimeline: function (e) {

    let { user_id } = app.getLocalUserInfo(); 
    console.log('share',apiAddr.host+this.data.detail.pic);
    return {
      title: this.data.share_title, 
      query: 'id='+this.data.community_id,
      imageUrl: apiAddr.host+this.data.detail.pic, // this.data.share_pic
      success: (res) => {
        console.log("转发成功");
      },
      fail: (res) => {
        console.log("转发失败");
      }
    }
  }
})