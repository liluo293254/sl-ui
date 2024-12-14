const app = getApp();
import apiAddr from '../../api/base';
import {
  setData
} from '../../utils/index';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav_list: [],
    foot_width: '20%',
    button_bg_color: '#3d70ef',
    button_font_color: '#fff',
    focus: false, //控制是否显示带取消按钮的搜索框
    inputValue: "",
    contentBar: [],
    shopList: [{
        'photo': '../image/小区海报（正）.png',
        'name': '观澜山庄店',
        'property': '13859209223',
        'distance': '1KM',
        'addr': '福建省漳州市'
      },
      {
        'photo': '../image/小区海报（正）.png',
        'name': '观澜山庄店',
        'property': '13859209223',
        'distance': '1KM',
        'addr': '福建省漳州市'
      },
      {
        'photo': '../image/小区海报（正）.png',
        'name': '观澜山庄店',
        'property': '13859209223',
        'distance': '1KM',
        'addr': '福建省漳州市'
      },
      {
        'photo': '../image/小区海报（正）.png',
        'name': '观澜山庄店',
        'property': '13859209223',
        'distance': '1KM',
        'addr': '福建省漳州市'
      },
      {
        'photo': '../image/小区海报（正）.png',
        'name': '观澜山庄店',
        'property': '13859209223',
        'distance': '1KM',
        'addr': '福建省漳州市'
      },
      {
        'photo': '../image/小区海报（正）.png',
        'name': '观澜山庄店',
        'property': '13859209223',
        'distance': '1KM',
        'addr': '福建省漳州市'
      },
    ],
    selectKeyWord: '',
    user_id: 0,
    address: '定位中',
    lat: '',
    lng: '',
    area_id: '',
    shopArea: [],
    otherShopList: [],
    mapObj: {},
    imgUrls: ['../image/Design006_f3FbKxjZXc.png', '../image/小区海报（正）.png'],
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 500,
    jiameng: [],
    pageNo: 0, // 当前页数
    total: 0, // 订单总数
    pageSize: 8,
    ad90: [],
    ad91: [],
    bookingtype: 0,

    showIndex: 1, //打开弹窗的对应下标
    height: '', //屏幕高度
    selectList: [{
        name: 'cdd',
        value: '0',
        checked: true
      },
      {
        name: 'ass',
        value: '1',
        checked: true
      },
      {
        name: 'ass',
        value: '2',
        checked: true
      },
      {
        name: 'cdd',
        value: '3',
        checked: true
      },
      {
        name: 'cdd',
        value: '4',
        checked: true
      },
      {
        name: 'ass',
        value: '5',
        checked: true
      },
      {
        name: 'ass',
        value: '6',
        checked: true
      },



    ],
    select: false,


  },
  // 选择
  serviceValChange: function (e) {
    var selectList = this.data.selectList;
    var checkArr = e.detail.value;
    for (var i = 0; i < selectList.length; i++) {
      if (checkArr.indexOf(i + "") != -1) {
        selectList[i].checked = true;
      } else {
        selectList[i].checked = false;
      }
    }
    this.setData({
      selectList: selectList
    })
  },
  // 打开弹窗
  openPopup(e) {
    // var index = e.currentTarget.dataset.index;
    var index = this.data.showIndex;
    if (index == 1) {
      this.setData({
        showIndex: 0,


      })
    } else {
      this.setData({
        showIndex: 1,
      })

    }
  },
  //关闭弹窗
  closePopup() {
    this.setData({
      showIndex: 1
    })

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    var that = this;
    // 动态获取屏幕高度
    wx.getSystemInfo({
      success: (result) => {
        that.setData({
          height: result.windowHeight
        });
      },
    })
  },




  /**
   * 生命周期函数--监听页面加载
   */


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})