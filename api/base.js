const host = 'https://zhsq.hshuishang.com';
const centerHost = 'https://cloud.rongwu360.com';

const httpUserUrl = host + '/Miniapi/User';
const httpIndexUrl = host + '/Miniapi/Index';
const httpShopUrl = host + '/Miniapi/Shop';
const httpSendUrl = host + '/Miniapi/Sendmsg'; 
const httpHomeUrl = host + '/Miniapi/Home'; 
const httpMeituanUrl = host + '/Miniapi/Meituan'; 
const httpHardwareUrl = host + '/Miniapi/Hardware';
const httpDouyinUrl = host + '/Miniapi/Douyin';  
const httpStatisticsUrl = host + '/Miniapi/Statistics';
const httpCommunityUrl = host + '/Miniapi/Community';
const httpMapsUrl = host + '/Miniapi/Maps';

const apiAddr = {
  host:host,
  center_host:centerHost,
  get_session_key: httpUserUrl + '/get_session_key',
  decrypt_mini_user: httpUserUrl + '/decrypt_mini_user',
  decrypt_mini_phone: httpUserUrl + '/decrypt_mini_phone',
  mini_user_bind: httpUserUrl + '/mini_user_bind',
  add_create_mini_user: httpUserUrl + '/add_create_mini_user',
  avatar_upload: httpUserUrl + '/avatar_upload',
  get_user_info: httpUserUrl + '/get_user_info',
  get_user_menu: httpUserUrl + '/get_user_menu',
  order_list:httpUserUrl + '/get_order_list',
  order_module:httpUserUrl + '/get_order_module_list',
  poster_info:httpUserUrl + '/poster_info',

  get_map_shop_list: httpShopUrl + '/get_map_shop_list',
  get_booking_type: httpShopUrl + '/get_booking_type',
  mini_shop_apply: httpShopUrl + '/mini_shop_apply',
  get_shop_details: httpShopUrl + '/get_shop_details',
  get_shop_area_list: httpShopUrl + '/get_shop_area_list',
  get_access_history_shop_list: httpShopUrl + '/get_access_history_shop_list',
  access_history_shop_del: httpShopUrl + '/access_history_shop_del',
  get_shop_index_nav: httpShopUrl + '/get_index_nav',
  get_map_shop_goods_list:httpShopUrl + '/get_map_shop_goods_list',

  get_map_community_list: httpCommunityUrl + '/get_map_community_list',
  get_community_details: httpCommunityUrl + '/get_community_details',
  get_community_area_list: httpCommunityUrl + '/get_community_area_list',
  get_community_tools_nav: httpCommunityUrl + '/get_tools_nav',
  get_community_index_nav:httpCommunityUrl + '/get_index_nav',
  
  get_share_pic:httpIndexUrl + '/get_share_pic',
  get_site_color: httpIndexUrl + '/get_site_color',
  get_location: httpIndexUrl + '/get_location',
  get_host_info: httpIndexUrl + '/get_host_info',
  customer_page_info:httpIndexUrl + '/customer_page_info',
  footer_nav_list:httpIndexUrl + '/footer_nav_list', 
  setcookie_location:httpIndexUrl + '/setcookie_location', 
  get_site_config:httpIndexUrl + '/get_site_config',
  get_site_ad:httpIndexUrl + '/get_site_ad', // 获取图片广告
  get_index_nav:httpIndexUrl + '/get_index_nav', // 获取图片广告
  get_site_nav:httpIndexUrl + '/get_site_nav', // 获取菜单
  get_index_block: httpIndexUrl + '/get_index_block', // 组合模块
  get_index_list_tab:httpIndexUrl + '/get_index_list_tab', // 组合模块

  get_mini_tmpl: httpSendUrl + '/get_mini_tmpl',
  user_send_apply: httpSendUrl + '/user_send_apply',
  
  add_port_share:httpHomeUrl + '/add_port_share', 

  meituan_shop: httpMeituanUrl + '/meituan_shop',  
  meituan_verify_code: httpMeituanUrl + '/verify_code',  


  hw_cp_operate: httpHardwareUrl+'/operate', 
  hw_cp_operate_common: httpHardwareUrl+'/operate_common', 
  hw_cp_change_port_state: httpHardwareUrl+'/change_port_mode_state',

  douyinver: httpDouyinUrl+'/getPreVerify',
  douyin_shop: httpDouyinUrl + '/douyin_shop', 
  douyin_verify_code: httpDouyinUrl + '/verify_code', 
  
  statistics_api:httpStatisticsUrl,

  get_maps_geocoder: httpMapsUrl + '/geocoder',

  third_recharge_order:httpUserUrl + '/get_third_recharge_logs',

};

module.exports = apiAddr; 
