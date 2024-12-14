/**
 * @description 小程序常用公共函数二次封装
 * @author // web3399 小严 盗版必究
 */

/**
 * @description 设置各自页面Data
 * @method setData
 * @param {Object} that // this指向
 * @param {String} key // 任意键名
 * @param {*} value // 任意键值
 */
export const setData = function (that, key, value) {
  that.setData({ [key]: value })
}

/**
 * @description 小程序登录方法二次封装
 * @method wechatLogin
 * @returns {Promise} // 返回 异步Promise
 */
export const wechatLogin = function () {
  return new Promise(function (resolve,reject) {
    const loginOptions = {
      success: res => resolve(res),
      fail: err => reject(err)
    };
    wx.login(loginOptions);
  });
}

/**
 * @description 小程序模态对话框二次封装
 * @method wechatMiniModal
 * @param {String} message // 提示信息
 * @returns {Promise} // 返回 异步Promise
 */
export const wechatMiniModal = function (message) {
  return new Promise(function (resolve,reject) {
    const modalOptions = {
      title: '温馨提示',
      content: message,
      success: res => resolve(res),
      fail: err => reject(err)
    };
    wx.showModal(modalOptions);
  });
}

/**
 * @description 判断是否为空对象
 * @method isObjEmpty
 * @param {Object} data // 传入的数据
 * @returns {Boolean} // 返回布尔值
 */
export const isObjEmpty = function (data){
  if (Object.prototype.toString.call(data === '[object Object]')) {
    return Object.getOwnPropertyNames(data).length === 0;
  }
}
/**
 * @description 小程序跳转方法二次封装 1 => switchTab, 2 => reLaunch, 3 => redirectTo, 4 => navigateTo
 * @method wechatMiniPagesJump
 * @param {String | Number} key // 对象键值
 * @param {String} pagesUrl // 跳转的小程序完整路径
 */
export const wechatMiniPagesJump = async function (key, pagesUrl) {
  const options = {
    url: pagesUrl
  };
  const jumpType = {
    '1': 'switchTab',  // 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
    '2': 'reLaunch',   // 关闭所有页面，打开到应用内的某个页面
    '3': 'redirectTo', // 关闭当前页面，跳转到应用内的某个页面。但是不允许跳转到 tabbar 页面
    '4': 'navigateTo'  // 保留当前页面，跳转到应用内的某个页面。但是不能跳到 tabbar 页面
  };
  await wx[jumpType[key]](options);
}
/**
 * @description 验证小程序登录是否过期
 * @method wechatMiniCheckLogin
 * @returns {Promise} // 返回 异步Promise
 */
export const wechatMiniCheckLogin = async function () {
  return new Promise(function(resolve, reject) {
    const checkLoginOptions = {
      success: res => resolve(res),
      fail: err => reject(err)
    };
    wx.checkSession(checkLoginOptions);
  });
}
