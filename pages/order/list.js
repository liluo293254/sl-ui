const app = getApp();
const now = new Date();
import apiAddr from '../../api/base';
import { setData } from '../../utils/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
      //  tab导航栏
      currentId: '1',
      host:apiAddr.host,
      nav_list:[],
      foot_width:'20%',
      section: [{
        name: '全部订单',
        typeId: '1'
      }, {
        name: '默认排序',
        typeId: '2'
      } ],
      section1:'全部订单',
      section2:'默认排序',
      pageNo: 0, // 当前页数
      total:0, // 订单总数
      pageSize:8,
      orderList: [],
      st:999, // 订单状态
      doing:0,
      orderby:'',
      share_pic:'',
      selectArray1: [{
        "id": "999",
        "text": "全部订单"
      }, {
        "id": "0",
        "text": "待支付"
       },{
        "id": "1",
        "text": "待使用/待使用"
       },{
        "id": "2",
       "text": "已完成"
       },{
       "id": "-1",
        "text": "已取消"
      }],
      selectArray2: [{
        "id": "",
         "text": "默认排序"
      }, {
        "id": "pay_time asc",
         "text": "下单时间"
      }, {
        "id": "start_time asc",
         "text": "开始时间"
      }],
      showSelect:[],
      showPopup: false,
      order_none:0,
  },
  //点击每个导航的点击事件
  handleTap: function(e) {
    console.log('handleTap');
    let id = e.currentTarget.id;
    if(id){
      this.setData({
        currentId:id
      })
    }
    let showSelect = [];
    if(id == 1){
      // 订单状态选择
      showSelect = this.data.selectArray1;
    }else{
      // 排序
      showSelect = this.data.selectArray2;
    }
    this.setData({
      showSelect,
      showPopup:true,
    })

  },
  settingOpen(e){
    let popup = false;
    if(this.data.showPopup == false){
      popup = true;
    }
    setData(this,'showPopup',popup);
  },
  selectChange(e){
    console.log('selectChange');
    let current = this.data.currentId;
    let data = e.currentTarget.dataset;
    let doing = 0;
    let name = data.name;
    let section = this.data.section;
    if(current == 1){
      // 订单状态
      if(data.other == 1){
        doing = 1;
      }else{
        doing = 0;
      }
      section[0]['name'] = name;
      this.setData({
        st:data.id,
        doing:doing,
        section:section
      })
      
    }else{
      section[1]['name'] = name;
      this.setData({
        orderby:data.id,
        section:section
      })
    }
    
    this.setData({
      pageNo: 0, // 当前页数
      orderList: [],
    })
    this.settingOpen();
    this.getOrderList();
  },
  getOrderList(){
    setData(this,'order_none',0); // 初始
    let sendData = {
      user_id: this.data.user_id,
      pageNo:this.data.pageNo,
      doing:this.data.doing,
      st:this.data.st,
      orderby:this.data.orderby,
    };
    wx.showLoading({ title: '加载中...' });
    wx.request({
      url: apiAddr.order_list,
      method: 'get',
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: sendData,
      dataType: 'json',
      success: (result) => {
        let { data } = result.data;
        console.log(data);
        if(data.msg){
          wx.showToast({
            title: data.msg,
            icon:'none',
          })
          setData(this,'order_none',1);
          return;
        }else{
          wx.hideLoading();
        }
        let newList = data.list ? data.list : [];
        let oldList = this.data.orderList;
        let total = data.total;
        if(this.data.pageNo == 0 && newList.length === 0){
          setData(this,'order_none',1);
        }
        this.setData({
          orderList: oldList.concat(newList), // 将新数据添加到原有数据后面
          total: total,
          pageNo: this.data.pageNo + 1, // 将页数加1
        });
      },
    })
  },
  gotoDetail(e){
    let status = e.currentTarget.dataset.order_status;
    let order_id = e.currentTarget.dataset.order_id;
    let url;
    let is_postpaid = e.currentTarget.dataset.is_postpaid;
    let card_rec_id = e.currentTarget.dataset.card_rec_id;
 
    if(is_postpaid==1){
      //  if(parseInt(card_rec_id)>0){
 
      //    wx.navigateTo({
      //       url: "/pages/hffbookingorder/detail_use_card?order_id="+order_id
      //    })
      //  }else{
    
            wx.navigateTo({
               url: "/pages/hffbookingorder/detail?order_id="+order_id
            })
        //  }
    }else{


      if(status == 0){
         url = '/pages/booking/orderpay?order_id='+order_id;
      }else{
         url = '/pages/index/index?jump_url='+apiAddr.host+'/user/booking/detail/order_id/'+order_id;
      }
      wx.navigateTo({
         url: url,
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let {st,doing} = options;
    console.log(st);
    console.log(doing);
    let {user_id} = app.getLocalUserInfo();
    // if(!user_id){
    //   wx.showToast({
    //       title: '授权状态已过期，需重新授权',
    //       icon: 'none', 
    //       success:function (){
    //       var reUrl =  encodeURIComponent('/pages/booking/orderlist');
    //       wx.redirectTo({
    //           url: '/pages/auth/wechatAuth?miniReturnPath='+reUrl,
    //       })
    //       return false;
    //       }
    //   });
    //   return;

    // }else{
    //   setData(this,'user_id',user_id);
    // }
    if(user_id){
      setData(this,'user_id',user_id);
    }
    if(st){
      this.setData({
        st:st,
        doing:doing,
      });
    }
    
    this.getOrderList();
    this.getFootNav();
    this.getSharePic();
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
  goH5Link: function(e){
    let url=e.currentTarget.dataset.url;
    wx.navigateTo({
    url: `/pages/index/index?q=${url}`,
    })
  },
  goPagesLink: function(e){
    let url=e.currentTarget.dataset.url;
    wx.navigateTo({
    url: url,
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
      orderList: [],
    })
    this.getOrderList();
    // 模拟异步请求数据
    setTimeout(() => {
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
      this.getOrderList(); // 加载更多数据
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
      if(result.data.share_pic){
        setData(this,'share_pic',apiAddr.host+result.data.share_pic);
      }
    },
  })
},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(e) {
    console.log("分享触发",e);
    let { user_id } = app.getLocalUserInfo(); 
    // let jump_url = e.webViewUrl.replace(/.html/,`/fuid/${user_id}.html`);
    let url = '/pages/booking/orderlist';
    let order_id = e.target.dataset.order_id;
    if(order_id > 0){
      url = '/pages/index/index?jump_url='+apiAddr.host+'/user/booking/detail/order_id/'+order_id;
    }
    console.log(url);
    return {
      title: '', 
      path: url,
      imageUrl: this.data.share_pic,
      success: (res) => {
        console.log("转发成功");
      },
      fail: (res) => {
        console.log("转发失败");
      }
    }
  }
})