
// 专属域名
module.exports = {
  request: (url, method = 'POST', data = {}) => {
    // console.log(baseUrl)
      let _url = url
      return new Promise((resolve, reject) => {
          wx.showLoading({
          title:"正在加载"
          })
  
          wx.request({
              url: _url, //请求路径
              data: data,    //请求参数
              method: method,   //请求方法get和post
              header: {
                  'content-type': 'application/x-www-form-urlencoded'  //请求头
              },
              success: (res) => {
                  // console.log(res)
                  // console.log(res.data.code)
                  if(res.data.code == 200){
                      wx.hideLoading()
                      resolve(res.data) 
                  }else{
                      wx.showToast({
                          title: '数据请求失败',
                      })
                  }
              },
              fail: (res) => {
                  wx.showToast({
                      title: '数据请求失败',
                  })
                  reject(res)
              }
          })
      })
  }

}
