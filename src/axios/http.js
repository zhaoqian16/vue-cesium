import axios from "axios";
import QS from "qs";
import Vue from "vue";
import common from "../uitl/common";
import { Notification } from "element-ui";
import Global from "../uitl/global";

// loading框设置局部刷新，且所有请求完成后关闭loading框
let loading;
let needLoadingRequestCount = 0; // 声明一个对象用于存储请求个数
// bgColor  遮罩层颜色
function startLoading(bgColor) {
  loading = Vue.prototype.$loading({
    lock: true,
    text: "loading...",
    spinner: "el-icon-loading",
    background: bgColor || "rgba(255,255,255,0.4)"
    // target: document.querySelector('.loading-area') // 设置加载动画区域
  });
}
function endLoading() {
  loading.close();
}
function showFullScreenLoading(bgColor) {
  if (needLoadingRequestCount === 0) {
    startLoading(bgColor);
  }
  needLoadingRequestCount++;
}
function hideFullScreenLoading() {
  if (needLoadingRequestCount <= 0) return;
  needLoadingRequestCount--;
  if (needLoadingRequestCount === 0) {
    endLoading();
  }
}

// post请求
export function sendPOST(url, param, callbackFun, _config, errorCallBack) {
  if (!param || param == null) {
    param = {};
  }
  initRequest(_config);
  if (!_config) {
    _config = {};
  }
  return new Promise((resolve, reject) => {
    instance
      .post(url, param)
      .then(function (response) {
        resolve(response.data);
        if (callbackFun) {
          callbackFun(response.data);
        }
      })
      .catch(function (error) {
        console.log(error);
        if (errorCallBack) {
          errorCallBack(error);
        }
        reject(error);
      });
  });
}

// get请求
export function sendGET(url, param, callbackFun, _config, errorCallBack) {
  if (!param || param == null) {
    param = {};
  }
  initRequest(_config);
  return new Promise((resolve, reject) => {
    instance
      .get(url, {
        params: param
      })
      .then(function (response) {
        resolve(response.data);
        if (callbackFun) {
          callbackFun(response.data);
        }
      })
      .catch(function (error) {
        console.log(error);
        if (errorCallBack) {
          errorCallBack(error);
        }
        reject(error);
      });
  });
}

var instance = undefined;

function initRequest(_config) {
  var baseURL = JSON.parse(JSON.stringify(Global.baseURL));
  if (_config && _config.baseURL) {
    baseURL = _config.baseURL;
  }
  var timeout = 30000;
  if (_config && _config.timeout) {
    timeout = _config.timeout;
  }
  var axiosConfig = {
    //		params: param, // 参数
    isLoading: _config && _config.isLoading === false ? false : true,
    bgColor: (_config && _config.bgColor) || null, // loading 遮罩层背景色配置
    baseURL: baseURL, // 请求路径
    timeout: timeout, // 超时时间
    headers: {
      post: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      }
    }
  };
  instance = axios.create(axiosConfig);
  // 响应拦截（配置请求回来的信息）
  instance.interceptors.response.use(
    function (response) {
      hideFullScreenLoading();
      // 处理响应数据
      if (response.data.message) {
        response.data["msg"] = response.data.message;
      }
      if (response.data.result) {
        if (response.data.result == "login") {
          common.setStorage("user", null);
          top.location.href = Global.basePath + "/#/login"; //newAdmin跳转路径//newAdmin修改
          // top.location.href = Global.oldBasePath + "/index.html"; //admin跳转路径
          return response;
        } else if (
          response.data.result == "true" ||
          response.data.result == "1"
        ) {
          response.data["success"] = true;
        } else {
          response.data["success"] = false;
          if (!_config || (_config && !_config.closeErrorMsg)) {
            if (response.data) {
              if (response.data.message) {
                if ("No files.".indexOf(response.data.message) == -1) {
                  // TODO 临时写法，排除附件查询时返回文件为空时弹出No files.
                  Notification.error({
                    title: "错误",
                    message: response.data.message
                  });
                }
              }
            }
          }
        }
      }
      return response;
    },
    function (error) {
      hideFullScreenLoading();
      // 处理响应失败
      if (error.toString().indexOf("timeout") != -1) {
        Notification.error({
          title: "错误",
          message: "请求超时！"
        });
        return Promise.reject(error);
      }
      if (error.response) {
        switch (error.response.status) {
          case "404":
            Notification.error({
              title: "错误",
              message: "请求连接不存在！<br/>" + error.request.responseURL
            });
            break;
          case "504":
            Notification.error({
              title: "错误",
              message: "网关超时，请检查网络连接！"
            });
            break;
          default:
            if (!_config || (_config && !_config.closeErrorMsg)) {
              if (error.response.data) {
                error.response.data["success"] = false;
                if (error.response.data.message) {
                  Notification.error({
                    title: "错误",
                    message: error.response.data.message
                  });
                }
              }
            }
        }
      }
      return Promise.reject(error);
    }
  );

  instance.interceptors.request.use(
    function (config) {
      if (config.isLoading !== false) {
        // 如果配置了isLoading: false，则不显示loading
        showFullScreenLoading(config.bgColor);
      }
      var user = common.getStorage("user");
      //判断手机端是否提供了__sid
      var __sid = common.getUrlParam('__sid');
      if (__sid && __sid != '') {
        if (!user || user.__sid != __sid) {
          axios.get(Global.baseURL + 'sysUser/sysUserInfo', {
            params: {
              __sid: __sid
            }
          })
            .then(res => {
              console.log(res)
              var _data = res.data.data
              if (!user || user == null) {
                user = {};
              }
              for (const key in _data) {
                if (_data.hasOwnProperty(key)) {
                  const element = _data[key];
                  user[key] = element
                }
              }
              common.setStorage("user", user);
            })
            .catch(function (error) {
              console.log(error);
            });
        }
        if (config.url.indexOf("login") == -1) {
          if (config.method === "post") {
            var data = QS.parse(config.data);
            data.isReception = 1;
            data.__sid = common.transUndefined(__sid);
            config.data = QS.stringify(data, {
              arrayFormat: "indices",
              allowDots: true
            });
          } else if (config.method === "get") {
            config.params.isReception = 1;
            config.params.__sid = common.transUndefined(__sid);
          }
        }
      } else {
        if (user && user != null) {
          if (config.url.indexOf("login") == -1) {
            if (config.method === "post") {
              var data = QS.parse(config.data);
              data.isReception = 1;
              data.__sid = common.transUndefined(user.__sid);
              data.currentUserId = common.transUndefined(user.userCode);
              data.ownStreetCode = common.transUndefined(user.ownStreetCode);
              config.data = QS.stringify(data, {
                arrayFormat: "indices",
                allowDots: true
              });
            } else if (config.method === "get") {
              config.params.isReception = 1;
              config.params.__sid = common.transUndefined(user.__sid);
              config.params.currentUserId = common.transUndefined(user.userCode);
              config.params.ownStreetCode = common.transUndefined(
                user.ownStreetCode
              );
            }
          }
        }
      }
      return config;
    },
    function (error) {
      // 处理响应失败
      hideFullScreenLoading();
      return Promise.reject(error);
    }
  );
}

/**
 * 获取第三方接口路径
 * @param {Object} config key值
 * @param {Object} path 在其后拼接的路径
 * @param {Object} call 回调函数
 */
export function getThirdUrl(config, path, call, noHttp) {
  var thirdUrls = common.getStorage("thirdUrls");
  if (thirdUrls && thirdUrls != null && thirdUrls[config]) {
    var _url = thirdUrls[config];
    var lastStr = _url.substr(_url.length - 1, 1);
    if (lastStr == "/") {
      Notification.error({
        title: "错误",
        message:
          config +
          "第三方接口路径配置错误! “" +
          _url +
          "” 后含有斜杠“/”，请联系管理员"
      });
      return;
    }
    if (path) {
      path = path.replace(/^\/+/, "");
    }
    _url = _url + "/" + path;
    if (call) {
      call(_url);
    }
  } else {
    if (thirdUrls == undefined || thirdUrls == null) {
      thirdUrls = {};
    }
    if (noHttp) {
      var thirdSysUrl = "/sysConfig/getThirdSysConfig"
    } else {
      var thirdSysUrl = "/sysConfig/getThirdSysConfigByHttp"
    }
    sendGET(
      thirdSysUrl,
      {
        configKey: config,
        type: 2
      },
      function (d) {
        if (d.result == "true" && d.data && d.data != "") {
          var _url = d.data;
          var lastStr = _url.substr(_url.length - 1, 1);
          if (lastStr == "/") {
            try {
              Notification.error({
                title: "错误",
                message:
                  config +
                  "第三方接口路径配置错误! “" +
                  _url +
                  "” 后含有斜杠“/”，请联系管理员"
              });
            } catch (err) {
              alert(
                config +
                "第三方接口路径配置错误! “" +
                _url +
                "” 后含有斜杠“/”，请联系管理员"
              );
            }
            return;
          }
          if (path) {
            path = path.replace(/^\/+/, "");
          }
          thirdUrls[config] = _url;
          common.setStorage("thirdUrls", thirdUrls);
          _url = _url + "/" + path;
          if (call) {
            call(_url);
          }
        } else {
          try {
            Notification.error({
              title: "错误",
              message: config + "第三方接口路径未配置! ，请联系管理员"
            });
          } catch (err) {
            alert(config + "第三方接口路径未配置! ，请联系管理员");
          }
        }
      }
    );
  }
}
