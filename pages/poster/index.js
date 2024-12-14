
const app = getApp();
import apiAddr from '../../api/base';
// import { setData } from '../../utils/index';
import { isObjEmpty, setData, wechatMiniPagesJump } from '../../utils/index';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: apiAddr.host,//线上图片
    isSaveCanvas: false,
    canvasHeight:'600px',
    qrcode_w:0.1,
    qrcode_t:0.6,
    qrcode_l:0.25,
    bgimg:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let {user_id,mini_user_id} = app.getLocalUserInfo();
    console.log(user_id);
    let _this = this;
    if(!user_id){
      wx.showToast({
        title: '授权状态已过期，需重新授权',
        icon: 'none', 
        success:function (){
          _this.wechatAuth();
        }
      });
      return;
    } 
    this.setData({
      user_id: user_id, 
      mini_user_id:mini_user_id,
    })

    // 获取海报信息
    this.getPosterInfo();
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

        setData(_this,'header_color',color);
        setData(_this,'button_font_color',result.data.button_font_color);
        setData(_this,'button_bg_color',result.data.button_bg_color);
      },
    })
  },
  wechatAuth(){
    wx.redirectTo({
      url: '/pages/auth/wechatAuth?miniReturnPath=/pages/poster/index',
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
  },
  
  // 保存网络图片，https链接
  downloadimg(e){
    let imgUrl = e.target.dataset.url;
 
    wx.downloadFile({
      url: imgUrl,
      success: function(res) {
        console.log('img',imgUrl);
        console.log('res',res);
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: function() {
              wx.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 1000
              });
            },
            fail: function() {
              wx.showToast({
                title: '取消保存',
                icon: 'none',
                duration: 1000
              });
            }
          });
        } else {
          wx.showToast({
            title: '下载图片失败',
            icon: 'none',
            duration: 1000
          });
        }
      },
      fail: function(e) {
        console.log(e);
        wx.showToast({
          title: '下载图片失败',
          icon: 'none',
          duration: 1000
        });
      }
    });
  },
  // 通过canvas生成的海报
  canvasImg() {
    console.log('canvasImg');
    wx.showLoading({
      title: '海报生成中...',
    })
    let _this = this;
    
    //选取画板
    const query = wx.createSelectorQuery()
    query.select('#posterCanvas')
      .fields({
        node: true,
        size: true
      })
      .exec(async (res) => {
        console.log('canvascreate',res);
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio //手机分辨率 为了使保存到相册的图片清晰
        console.log('dpr',dpr);
        console.log('canvaswidth',canvas.width);
        console.log('canvasHeight',canvas.height);

        canvas.width = res[0].width*dpr;
        canvas.height = res[0].height*dpr;

        console.log('canvaswidth',canvas.width);
        console.log('canvasHeight',canvas.height);

        ctx.clearRect(0, 0, 320, 410); //清空画板
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, 320, 410);
        // 1.背景图
        const image = canvas.createImage();
        image.src = _this.data.bgimg;
        let bgImg = await new Promise((resolve, reject) => {
          image.onload = () => {
            resolve(image)
          }
          image.onerror = (e) => {
            reject(e)
          }
        });
        let canvasHeight = image.height/image.width*canvas.width/dpr; // 计算海报高度
        canvas.height = canvasHeight*dpr;
        console.log('width',image.width);
        console.log('height',image.height);
        console.log('canvaswidth',canvas.width);
        console.log('canvasHeight',canvasHeight);
        _this.setData({
          canvasHeight: canvasHeight+'px',
        })
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        /*
        // 2.头部文字 在背景图上作画
        // 设置文字样式
        ctx.font = "700 36px sans-serif";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center" //居中是以文字设定的x轴（ canvas.width/2）为中心点
        // 添加文字
        ctx.fillText("我在ESGPRO上测了企业碳排放总量", canvas.width / 2, 200);
        */
        // 3.二维码
        const image1 = canvas.createImage();
        image1.src = this.data.qrcode;
        console.log('canvaswidth',canvas.width);
        console.log('canvasHeight',canvas.height);
        console.log('qrcode_w',_this.data.qrcode_w);
        let qrcode_width = _this.data.qrcode_w*canvas.width;
       
        let bgImgPo = await new Promise((resolve, reject) => {
          image1.onload = () => {
            resolve(image1)
          }
          image1.onerror = (e) => {
            reject(e)
          }
        });
        
        ctx.drawImage(bgImgPo, _this.data.qrcode_l * (canvas.width), _this.data.qrcode_t * (canvas.height),qrcode_width,qrcode_width);
        wx.hideLoading();
      })

  },
  saveImg(e) {

    let imgUrl = e.target.dataset.url;
    let _this = this;
    wx.getSetting({
      success(res) {
        console.log(res);
        if (res.authSetting['scope.writePhotosAlbum'] === undefined || res.authSetting['scope.writePhotosAlbum']) {
          if(imgUrl != undefined && imgUrl != ''){
            _this.downloadimg(e)
          }else{
            _this.canvasSave();
          }
        }else{
          // 用户拒绝授权后，打开设置页可以看到授权提示开关
          wx.openSetting({
            success(res) { // 用户授权
              if (res.authSetting['scope.writePhotosAlbum']) {
                if(imgUrl != undefined && imgUrl != ''){
                  _this.downloadimg(e)
                }else{
                  _this.canvasSave();
                }
              }
              else { // 用户拒绝授权
                that.setData({displayLoading: "none"})
                wx.showToast({
                  title: '权限不足',
                })
              }
            },
            fail(res) {
              that.setData({displayLoading: "none"})
              wx.showToast({
                title: '设置失败',
              })
            }
          })
        }
      }
    });
  },
  async canvasSave() {
    const query = wx.createSelectorQuery();
    const canvasObj = await new Promise((resolve, reject) => {
      query.select('#posterCanvas')
        .fields({
          node: true,
          size: true
        })
        .exec(async (res) => {
          resolve(res[0].node);
        })
    });
    wx.canvasToTempFilePath({
      canvas: canvasObj, //现在的写法
      success: (res) => {
        console.log('Path',res);
        
          // 用户已经同意小程序使用相册
          //保存图片
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(res) {
              console.log('save',res);
              wx.hideToast();
              wx.showToast({
                title: '保存成功',
              })
            },
            fail(err) {
              console.log('err',err);
              wx.hideToast()
              if (err.errMsg === "saveImageToPhotosAlbum:fail cancel") {
                wx.showToast({
                  title: '取消保存',
                  icon : 'none'
                })
              } else {
                wx.showModal({
                  title: '提示',
                  content: err.errMsg,
                  showCancel: false,
                })
              }
            }
          })
         
      },
      fail(err) {
        wx.showToast({
          title: '保存失败，稍后再试',
          duration: 2000,
          icon: 'none'
        });
      }
    }, this)

  },
  // 网站配置信息
  getPosterInfo() {
    wx.showLoading({
      title: '正在获取海报信息',
    })
    var _this = this;
    wx.request({
       url: apiAddr.poster_info,
       method: 'get',
       data:{user_id:_this.data.user_id},
       header: {
          'Content-type': 'application/x-www-form-urlencoded'
       },
       dataType: 'json',
       success: (result) => {
          let data = result.data.data;
          console.log(data);
          if(result.data.code == 200){
            _this.setData({
              qrcode_w:data.qrcode_w/100,
              qrcode_t:data.qrcode_t/100,
              qrcode_l:data.qrcode_l/100,
              bgimg:apiAddr.host+data.photo,
              qrcode:apiAddr.host+data.qrcode,
              poster:apiAddr.host+data.poster,
            })
            wx.hideLoading();
            _this.canvasImg();
          }else{
            wx.showToast({
              title: poster.msg,
            })
          }
       },
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

})