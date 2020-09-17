/*
 * @Author: your name
 * @Date: 2020-07-08 10:04:21
 * @LastEditTime: 2020-07-09 14:38:40
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \cesium-vue-test\src\main.js
 */ 
import Vue from 'vue'
import App from './App'
import router from './router'
// cesium配置
import 'cesium/Source/Widgets/widgets.css'
// element配置
import 'element-ui/lib/theme-chalk/index.css'
import './uitl/elementComponent'
// get, post配置
import { sendGET, sendPOST, getThirdUrl } from './axios/http'
import Global from './uitl/global'
import Common from './uitl/common'

Vue.config.productionTip = false
Vue.prototype.$post = sendPOST
Vue.prototype.$get = sendGET
Vue.prototype.$thirdUrl = getThirdUrl
Vue.prototype.GLOBAL = Global
Vue.prototype.COMMON = Common

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
