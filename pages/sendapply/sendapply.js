// pages/sendapply/sendapply.js
import apiAddr from '../../api/base';
import {wechatMiniPagesJump} from '../../utils/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  jumporderdetail(type,order_id){
    if(type == 1){ 
      wechatMiniPagesJump(2, '/pages/index/index?jump_url='+apiAddr.host+'/user/booking/detail/order_id/'+order_id);
    }else if(type == 2){ 
      wechatMiniPagesJump(2, '/pages/index/index?jump_url='+apiAddr.host+'/user/goods/detail/order_id/'+order_id);
    }else if(type == 3){ 
      wechatMiniPagesJump(2, '/pages/index/index?jump_url='+apiAddr.host+'/user/appoint/detail/order_id/'+order_id);
    }else{ 
      wechatMiniPagesJump(2, '/pages/index/index');
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { 
    
    // options.type = 1;
    // console.log('dingyue');
    // console.log(options);
    // console.log(options.type);
    // console.log(222222);
    let that = this ;
   wx.showModal({
          title: '支付成功',
          content: '是否接收订单状态通知',
          confirmText:"同意",
          cancelText:"拒绝",
          success: function (res) {
              if (res.confirm) { 
                //获取模板
                  wx.request({
                      url: apiAddr.get_mini_tmpl, 
                      method: 'post',
                      header: {'Content-type': 'application/x-www-form-urlencoded'},
                      data: {type:options.type},
                      dataType:'json',
                      success: (result) => {
                        console.log(55555);
                        console.log(result); 

                        //订阅['TexEgvZS3GtIp1_QT-eA0NQ5kZ200yXfmb8cA7WPRFE']
                        wx.requestSubscribeMessage({
                          tmplIds: result.data,
                          success (res) { 
                            console.log(2222);
                            console.log(res);  
                            res.type = options.type;
                            res.order_id = options.order_id;
                            res.user_id = options.user_id;
                            //同意
                            // if(res['TexEgvZS3GtIp1_QT-eA0NQ5kZ200yXfmb8cA7WPRFE'] == 'accept'){
                              //记录会员请求状态
                                wx.request({
                                  url: apiAddr.user_send_apply, 
                                  method: 'post',
                                  header: {'Content-type': 'application/x-www-form-urlencoded'},
                                  data: res,
                                  dataType:'json',
                                  success: (result) => {
                                    
                                    //跳转订单详情
                                    if(result.data.url){
                                      wechatMiniPagesJump(2, result.data.url);
                                    }else{
                                      // this.jumporderdetail(options.type,options.order_id);                                      
                                        wechatMiniPagesJump(2, '/pages/index/index');                                      
                                    }
                                    
                                  }, 
                                })
                            // }
                       
                          },fail (e){
                            
                            if(options.type == 1){ 
                              wechatMiniPagesJump(2, '/pages/index/index?jump_url='+apiAddr.host+'/user/booking/detail/order_id/'+options.order_id);
                            }else if(options.type == 2){ 
                              wechatMiniPagesJump(2, '/pages/index/index?jump_url='+apiAddr.host+'/user/goods/detail/order_id/'+options.order_id);
                            }else if(options.type == 3){ 
                              wechatMiniPagesJump(2, '/pages/index/index?jump_url='+apiAddr.host+'/user/appoint/detail/order_id/'+options.order_id);
                            }else{ 
                              wechatMiniPagesJump(2, '/pages/index/index');
                            }
                          }
                        })
                        
                      }, 
                    })
              
               
              //调用订阅 
              } else if (res.cancel) {                
                  // wechatMiniPagesJump(2, '/pages/gzh/gzh?scene=1047');
                // console.log('用户点击取消');                   
                  ///显示第二个弹说明一下 ？？
                  if(options.type == 1){ 
                    wechatMiniPagesJump(2, '/pages/index/index?jump_url='+apiAddr.host+'/user/booking/detail/order_id/'+options.order_id);
                  }else if(options.type == 2){ 
                    wechatMiniPagesJump(2, '/pages/index/index?jump_url='+apiAddr.host+'/user/goods/detail/order_id/'+options.order_id);
                  }else if(options.type == 3){ 
                    wechatMiniPagesJump(2, '/pages/index/index?jump_url='+apiAddr.host+'/user/appoint/detail/order_id/'+options.order_id);
                  }else{ 
                    wechatMiniPagesJump(2, '/pages/index/index');
                  }
              }
          }
      }); 
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