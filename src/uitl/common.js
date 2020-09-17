import { Message } from 'element-ui'
import axios from 'axios'

//地图点数组

var currentMarker
var currentLine
var markerArr = []
var lineArr = []
let currentPolygon
let polygonArr = []
let SvgMarker = null
let currentSvgMarker

function transUndefined(value) {
  if (!value) {
    return '---'
  } else {
    return value
  }
}
// //初始化地图单个点信息
// async function initMarker(map, id, title, icon, point, callBack) {
//   if (!title) {
//     title = '暂无'
//   }
//   if (currentMarker != undefined) {
//     map.remove(currentMarker)
//   }
//   currentMarker = new AMap.Marker({
//     extData: { id: id },
//     title: title,
//     icon: icon,
//     position: point,
//     clickable: true
//   })
//   currentMarker.on('click', function() {
//     callBack(currentMarker)
//   })
//   map.add(currentMarker)
// }

// //地图铺多个点方法
// function initMarkerArr(map, titleName, list, category, icon, callBack) {
//   if (markerArr.length > 0) {
//     map.remove(markerArr)
//     markerArr = []
//   }
//   if (currentMarker != undefined) {
//     map.remove(currentMarker)
//   }
//   if (icon == null || icon == '') {
//     icon = 0
//   }
//   for (let i = 0; i < list.length; i++) {
//     if (list[i].longitude != undefined && list[i].latitude != undefined) {
//       if (category == 'part') {
//         icon = list[i].bigNationalCode ? list[i].bigNationalCode : '06'
//       }
//       let position = new AMap.LngLat(
//         Number(list[i].longitude),
//         Number(list[i].latitude)
//       )
//       let Marker = new AMap.Marker({
//         extData: { id: list[i].id },
//         title: list[i][titleName],
//         icon: mapIcon[category][icon],
//         position: position,
//         clickable: true
//       })
//       // map.clearMap();
//       Marker.on('click', function() {
//         callBack(Marker, list[i])
//       })
//       markerArr.push(Marker)
//       map.add(Marker)
//     }
//   }
// }

//清除地图上所有点
function clearMarkerArr(map) {
  if (currentMarker != null) {
    map.remove(currentMarker)
    currentMarker = null
  }
  if (markerArr && markerArr.length > 0) {
    map.remove(markerArr)
    markerArr = []
  }
}

//初始化地图单条线数据
function initLine(map, path, item, callBack) {
  if (currentLine != undefined) {
    map.remove(currentLine)
  }
  currentLine = new AMap.Polyline({
    extData: { id: item.id },
    path: path,
    isOutline: true,
    strokeColor: item.color, //线条颜色
    strokeWeight: 6, //线条宽度
    lineCap: 'round', //线条两端的形状
    showDir: true //线条本身
  })
  map.panTo(currentLine.getBounds().getCenter())
  currentLine.on('click', function() {
    callBack(currentLine, item)
  })
  map.add(currentLine)
}

//初始化地图多条线数据
function initLineArr(map, res, callBack) {
  if (currentLine != undefined) {
    map.remove(currentLine)
  }
  if (lineArr.length > 0) {
    map.remove(lineArr)
    lineArr = []
  }
  for (let i = 0; i < res.length; i++) {
    if (res[i].coordinate != '' && res[i].coordinate != undefined) {
      let jsonObj = JSON.parse(res[i].coordinate)
      let path
      if (jsonObj.type == 'MultiLineString') {
        path = jsonObj.coordinates[0]
      } else {
        path = jsonObj.coordinates
      }
      let line = new AMap.Polyline({
        extData: { id: res[i].id },
        path: path,
        isOutline: true,
        outlineColor: '#555555', //描边颜色
        strokeColor: res[i].color, //线条颜色
        strokeWeight: 6, //线条宽度
        lineCap: 'round', //线条两端的形状
        showDir: true //线条本身
      })
      line.on('click', function() {
        callBack(line, res[i])
      })
      lineArr.push(line)
      map.add(line)
    }
  }
}

//清除地图上所有线
function clearLineArr(map) {
  if (currentLine != null) {
    map.remove(currentLine)
    currentLine = null
  }
  map.remove(lineArr)
  lineArr = []
}
function setStorage(key, value) {
  if (arguments.length === 2) {
    var v = value
    if (typeof v == 'object') {
      v = JSON.stringify(v)
      v = 'obj-' + v
    } else {
      v = 'str-' + v
    }
    var ls = window.localStorage
    if (ls) {
      ls.setItem(key, v)
    }
  }
}

function getStorage(key) {
  var ls = window.localStorage
  if (ls) {
    var v = ls.getItem(key)
    if (!v) {
      return
    }
    if (v.indexOf('obj-') === 0) {
      v = v.slice(4)
      return JSON.parse(v)
    } else if (v.indexOf('str-') === 0) {
      return v.slice(4)
    }
  }
}

function rmStorage(key) {
  var ls = window.localStorage
  if (ls && key) {
    ls.removeItem(key)
  }
}

function clearStorage() {
  var ls = window.localStorage
  if (ls) {
    ls.clear()
  }
}

function getUrlParam(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
  var urlParam = window.location.search.substr(1)|| window.location.hash.split("?")[1];;   //页面参数
  if(!urlParam){
    return null
  }
  var r = urlParam.match(reg)
  if (r != null) return unescape(r[2])
  return null
}

function svgMarker(map, position, name, color, size) {
  return new Promise(resolve => {
    AMapUI.loadUI(['overlay/SvgMarker'], function(SvgMarker) {
      if (!SvgMarker.supportSvg) {
        alert('当前环境不支持SVG')
      }
      const marker = new SvgMarker(
        new SvgMarker.Shape.IconFont({
          // 参见 symbol引用, http://www.iconfont.cn/plus/help/detail?helptype=code
          symbolJs: '//at.alicdn.com/t/font_1248637_knbxedup4xr.js',
          icon: name,
          size: size || 50,

          fillColor: color
        }),
        {
          map: map,
          position: position,
          showPositionPoint: {
            color: 'orange'
          }
        }
      )
      resolve(marker)
    })
  })
}
async function initPolygon(map, point, item, callBack) {
  if (currentPolygon != undefined) {
    map.remove(currentPolygon.text)
    map.remove(currentPolygon.marker)
    map.remove(currentPolygon)
  }
  currentPolygon = await createPolygon(map, point, item)
  map.panTo(currentPolygon.getBounds().getCenter())
  currentPolygon.text.on('click', () => {
    callBack(currentPolygon)
  })

  currentPolygon.on('click', () => {
    callBack(currentPolygon)
  })
  currentPolygon.marker.on('click', () => {
    callBack(currentPolygon)
  })
  map.add(currentPolygon)
}
async function initPolygonArr(map, pointArr, item, callBack) {
  if (polygonArr.length > 0) {
    clearPolygonArr(map)
    polygonArr = []
  }
  if (pointArr.length !== 0) {
    for (let i = 0; i < pointArr.length; i++) {
      const poly = await createPolygon(map, pointArr[i], item)
      poly.text.on('click', () => {
        callBack(poly)
      })

      poly.on('click', () => {
        callBack(poly)
      })
      poly.marker.on('click', () => {
        callBack(poly)
      })
      map.add(poly)
      polygonArr.push(poly)
    }
    map.panTo(polygonArr[0].getBounds().getCenter())
  }
}
/**
 * @description: 初始化绿地多边形
 * @param {type}
 * @return:
 */
// async function createPolygon(map, points, item) {
//   const path = []
//   points.forEach(val => {
//     path.push(new AMap.LngLat(val[0], val[1]))
//   })
//   const polygon = new AMap.Polygon({
//     path: path,
//     fillColor: GREEN_STYLE[item.greenType]['bg_cl'],
//     strokeWeight: 1,
//     strokeColor: GREEN_STYLE[item.greenType]['br_cl'],
//     fillOpacity: 0.2,
//     bubble: true
//   })
//   polygon.marker = await svgMarker(
//     map,
//     polygon.getBounds().getCenter(),
//     'iconyuanlinlvhuasheshi3',
//     '',
//     30
//   )

//   polygon.text = new AMap.Text({
//     text: item.name,
//     position: polygon.getBounds().getCenter(),
//     map: map,
//     bubble: true
//   })
//   polygon.text.setStyle({
//     background: 'transparent',
//     'font-family': '微软雅黑',
//     'font-size': '15px',
//     'font-weight': 'bold',
//     color: '#343942',
//     border: 'none',
//     'text-shadow': '1px 1px 0px #fff, -1px -1px 0 #fff'
//   })
//   return polygon
// }
/**
 * @description: 清除地图上的多边形
 * @param {type}
 * @return:
 */
function clearPolygonArr(map) {
  if (polygonArr.length !== 0) {
    for (let i = 0; i < polygonArr.length; i++) {
      map.remove(polygonArr[i].text)
      map.remove(polygonArr[i].marker)
      map.remove(polygonArr[i])
    }
  }
}
function clearPolygon(map) {
  if (currentPolygon != undefined) {
    map.remove(currentPolygon.text)
    map.remove(currentPolygon.marker)
    map.remove(currentPolygon)
  }
}

/**
 * 初始化时间控件数据
 */
function formatTime(time,notime) {
  if (time) {
    var date = new Date(time)
  } else {
    return ''
  }
  var yy = date.getFullYear()
  var MM = date.getMonth() + 1
  var dd = date.getDate()
  var hh = date.getHours() + ''
  var mm = date.getMinutes() + ''
  var ss = date.getSeconds() + ''
  if (MM < 10) {
    MM = '0' + MM
  }
  if (dd < 10) {
    dd = '0' + dd
  }
  if (hh.length == 1) {
    hh = '0' + hh
  }
  if (mm.length == 1) {
    mm = '0' + mm
  }
  if (ss.length == 1) {
    ss = '0' + ss
  }
  if(notime){
    return yy + '-' + MM + '-' + dd
  }
  return yy + '-' + MM + '-' + dd + ' ' + hh + ':' + mm + ':' + ss
}

/*
 * 初始化后台返回的表头数组
 */
function initBackTh(arr, table_th) {
  let th_arr = []
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < table_th.length; j++) {
      if (table_th[j].field == arr[i].fieldKey) {
        let obj = table_th[j]
        obj.bid = arr[i].bid //标识
        obj.show = arr[i].isShow == '1' ? true : false //隐藏
        obj.index = arr[i].orderNum //排序
        th_arr.push(obj)
      }
    }
  }
  return th_arr
}
function getSvgMarkerObj() {
  return new Promise((resolve, reject) => {
    AMapUI.loadUI(['overlay/SvgMarker'], SvgMarker => {
      if (!SvgMarker.supportSvg) {
        reject('当前环境不支持SVG')
      }
      resolve(SvgMarker)
    })
  })
}

/*
 * 单条下载文件
 * 两个参数,路径:src,名称:name
 */
function downloadFile(src, name) {
  // var imgsrc = currentFile.fileEntity.absFileUrl
  // var name = currentFile.fileName
  //	var fileType = currentFile.fileType
  axios({
    method: 'get',
    url: `${src}`,
    // 必须显式指明响应类型是一个Blob对象，这样生成二进制的数据，才能通过window.URL.createObjectURL进行创建成功
    responseType: 'blob'
  }).then(res => {
    if (!res) {
      return
    }
    // 将lob对象转换为域名结合式的url
    let blobUrl = window.URL.createObjectURL(res.data)
    let link = document.createElement('a')
    document.body.appendChild(link)
    link.style.display = 'none'
    link.href = blobUrl
    // 设置a标签的下载属性，设置文件名及格式，后缀名最好让后端在数据格式中返回
    //	    link.download = name + '.' + fileType
    link.download = name
    // 自触发click事件
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
  })
}

/*
 * 多文件打包下载
 * 一个参数，要下载的文件路径数组集合
 */
const getFile = url => {
  return new Promise((resolve, reject) => {
    axios({
      method: 'get',
      url,
      responseType: 'arraybuffer'
    })
      .then(data => {
        resolve(data.data)
      })
      .catch(error => {
        reject(error.toString())
      })
  })
}
// function downloadFileByZip(data) {
//   const zip = new JSZip()
//   const cache = {}
//   const promises = []
//   data.forEach(item => {
//     const promise = getFile(item.src).then(data => {
//       // 下载文件, 并存成ArrayBuffer对象
//       const file_name = item.name //获取文件名
//       zip.file(file_name, data, { binary: true }) // 逐个添加文件
//       cache[file_name] = data
//     })
//     promises.push(promise)
//   })

//   Promise.all(promises).then(() => {
//     zip.generateAsync({ type: 'blob' }).then(content => {
//       // 生成二进制流
//       FileSaver.saveAs(content, '打包下载.zip') // 利用file-saver保存文件
//     })
//   })
// }

async function initSvgMarker(map, id, title, iconName, point, callBack) {
  if (!SvgMarker) {
    SvgMarker = await getSvgMarkerObj().catch(error => {
      console.log(error)
    })
  }
  currentSvgMarker = new SvgMarker(
    new SvgMarker.Shape.IconFont({
      symbolJs: '//at.alicdn.com/t/font_1248637_knbxedup4xr.js',
      icon: iconName,
      size: 30
    }),
    {
      map: map,
      position: point,
      title: title,
      extData: { id: id }
    }
  )
  currentSvgMarker.on('click', function() {
    callBack(currentMarker)
  })
  // map.add(currentMarker);
}
function checkIDCard(idcode) {
  // 加权因子
  const weight_factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  // 校验码
  const check_code = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

  const code = idcode + ''
  const last = idcode[17] //最后一个

  const seventeen = code.substring(0, 17)

  // ISO 7064:1983.MOD 11-2
  // 判断最后一位校验码是否正确
  const arr = seventeen.split('')
  const len = arr.length
  let num = 0
  for (let i = 0; i < len; i++) {
    num = num + arr[i] * weight_factor[i]
  }

  // 获取余数
  const resisue = num % 11
  const last_no = check_code[resisue]

  // 格式的正则
  // 正则思路
  /*
     第一位不可能是0
     第二位到第六位可以是0-9
        第七位到第十位是年份，所以七八位为19或者20
        十一位和十二位是月份，这两位是01-12之间的数值
     十三位和十四位是日期，是从01-31之间的数值
        十五，十六，十七都是数字0-9
        十八位可能是数字0-9，也可能是X
        */
  const idcard_patter = /^[1-9][0-9]{5}([1][9][0-9]{2}|[2][0][0|1][0-9])([0][1-9]|[1][0|1|2])([0][1-9]|[1|2][0-9]|[3][0|1])[0-9]{3}([0-9]|[X])$/

  // 判断格式是否正确
  const format = idcard_patter.test(idcode)

  // 返回验证结果，校验码和格式同时正确才算是合法的身份证号码
  return last === last_no && format ? true : false
}
/**
 * @description: 字典查询
 * @param {string} type 字典查询key 值
 * @param {string} key 赋值变量的名称
 * @return:
 */
function getDic(that, type, key) {
  that.$thirdUrl('component_outer', '/res/dict/listData', url => {
    that.$get(url, { dictType: type }).then(res => {
      that[key] = res
      console.log(that)
    })
  })
}
/**
 * @description: 生成随机数
 * @param {type}
 * @return:
 */
function uuid() {
  var i, random
  var uuid = ''

  for (i = 0; i < 32; i++) {
    random = (Math.random() * 16) | 0
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      uuid += '-'
    }
    uuid += (i === 12 ? 4 : i === 16 ? (random & 3) | 8 : random).toString(16)
  }

  return uuid
}

//获取cookie
function djGetCookie(name) {
  var arr,
    reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
  if ((arr = document.cookie.match(reg))) return unescape(arr[2])
  else return null
}
//删除cookie
function djDelCookie(name) {
  var exp = new Date()
  exp.setTime(exp.getTime() - 1)
  var cval = djGetCookie(name)
  if (cval != null)
    document.cookie = name + '=' + cval + ';expires=' + exp.toGMTString()
}
// 退出登录
function logout(that) {
  that.$get('/logout', undefined).then(res => {
    setStorage('user', null)
    setStorage('remarksList', null)
    djDelCookie('vue_admin_template_token')
    top.location.href = that.GLOBAL.basePath + '/#/login'
  })
}

//呼叫某人
function callSomeOne(user){
  var rtcData = {
      isAccept:false,
      usertel:window.rongTelPrefix+"_"+user.userRongTel,
      userName:user.userName,
  }
  window.params.inviteUserIds =[]
  window.params.inviteUserIds.push(rtcData.usertel)
  window.params.targetId=rtcData.usertel;
}

//截取字符串
function simplifyValue(value, num) {
	if(!num) {
		num = 10;
	}
	if(value && value.length > num) {
		return value.substring(0, num) + "...";
	} else {
		return value;
	}
}
/**
 * 分割数组创建二维数组封装
 * @param data 数组
 * @param senArrLen 需要分割成子数组的长度
 */
function splitArrByLen(data , senArrLen){
  //处理成len个一组的数据
  let data_len = data.length;
  let arrOuter_len = data_len % senArrLen === 0 ? data_len / senArrLen : parseInt((data_len / senArrLen)+'') + 1;
  let arrSec_len = data_len > senArrLen ? senArrLen : data_len;//内层数组的长度
  let arrOuter = new Array(arrOuter_len);//最外层数组
  let arrOuter_index = 0;//外层数组的子元素下标
  // console.log(data_len % len);
  for (let i = 0; i < data_len; i++) {
      if (i % senArrLen === 0){
          arrOuter_index++;
          let len = arrSec_len * arrOuter_index;
          //将内层数组的长度最小取决于数据长度对len取余，平时最内层由下面赋值决定
          arrOuter[arrOuter_index-1] = new  Array(data_len % senArrLen);
          if(arrOuter_index === arrOuter_len)//最后一组
              data_len % senArrLen === 0 ?
                  len = data_len % senArrLen + senArrLen * arrOuter_index :
                  len = data_len % senArrLen + senArrLen * (arrOuter_index - 1);
          let arrSec_index = 0;//第二层数组的索引
          for (let k = i; k < len; k++) {//第一层数组的开始取决于第二层数组长度*当前第一层的索引
              arrOuter[arrOuter_index-1][arrSec_index] = data[k];
              arrSec_index++;
          }
      }
  }
  return arrOuter;
};
//去除数组中相同数据
function arrayUnique2(arr, name) {
  var hash = {};
  return arr.reduce(function (item, next) {
    hash[next[name]] ? '' : hash[next[name]] = true && item.push(next);
    return item;
  }, []);
}
// 预览图片
function showPreviewImg(src) {
  const previewWrap = document.createElement("div");
  previewWrap.setAttribute("class", "__previewWrap__");
  const previewImg = document.createElement("img");
  previewImg.setAttribute("src",src);
  previewWrap.appendChild(previewImg);
  document.body.appendChild(previewWrap);
  // 根据图片高宽比设置图片溢出修正, 不使用箭头函数是为了内部this指向图片节点
  previewImg.onload = function () {
    if (
      this.naturalWidth > this.naturalHeight &&
      previewWrap.clientWidth < this.naturalWidth
    ) {
      this.style.width = "80%";
    } else if (
      this.naturalWidth <= this.naturalHeight &&
      previewWrap.clientHeight < this.naturalHeight
    ) {
      this.style.height = "80%";
    }
  };
  function wheelHander(e){
    var oEvent = e || window.event;
    if(oEvent.wheelDelta){//非火狐
        var currentHright = Number(previewWrap.firstChild.style.height.split('%')[0]);
        if(oEvent.wheelDelta > 0){//向上滚动
          currentHright+=5;
          previewWrap.firstChild.style.height = currentHright+'%'
        }else{//向下滚动
          if(currentHright>10){
            currentHright-=5;
            previewWrap.firstChild.style.height = currentHright+'%'
          }
        }
    }else if(oEvent.detail){
        if(oEvent.detail > 0){//向下滚动
          previewWrap.height--;
        }else{//向上滚动
          previewWrap.height++;
        }
    }
  }
  //非火狐实现滚轮效果
  previewWrap.onmousewheel = wheelHander;//非火狐
  //火狐一家使用DOMMouseScroll实现滚轮效果
  previewWrap.addEventListener('DOMMouseScroll',wheelHander,false);
  
  previewWrap.addEventListener("click", e => {
    e.preventDefault();
    document.body.removeChild(previewWrap);
  });
}
// 根据文件名后缀区分 文件类型
function matchFileType(fileName){
  // 后缀获取
  var suffix = '';
  // 获取类型结果
  var result = '';
  try {
    var flieArr = fileName.split('.');
    suffix = flieArr[flieArr.length - 1];
  } catch (err) {
    suffix = '';
  }
  // fileName无后缀返回 false
  if (!suffix) {
    result = false;
    return result;
  }
  // 图片格式
  var imglist = ['png', 'jpg', 'jpeg', 'bmp', 'gif'];
  // 进行图片匹配
  result = imglist.some(function (item) {
    return item == suffix;
  });
  if (result) {
    result = 'image';
    return result;
  };
  // 匹配 视频
  var videolist = ['avi','dat','mkv','flv','vob','wmv','asf','asx','rm','rmvb','mpg','mpeg','mpe','3gp','mov','mp4','m4v'];
  result = videolist.some(function (item) {
    return item == suffix;
  });
  if (result) {
    result = 'video';
    return result;
  };
  // 其他 文件类型
  result = 'other';
  return result;
}

function normalizeServerUrl(url){
  const protocol = window.location.protocol + "//";
  const matchProtocol = /^http(s)?\:\/\//;
  const matchLine = /^(\/)+/;
  if (matchProtocol.test(url)) {
    url = url.replace(matchProtocol, protocol);
  } else if (matchLine.test(url)) {
    url = url.replace(matchLine, protocol);
  } else {
    url = protocol + url;
  }
  return url;
};

function getRoomId() {
    let weishu = Math.floor(Math.random() * 10 + 2)
    let id = ''
    for(let i = 0; i< weishu; i++) {
        const data = Math.floor(Math.random() * 10)
        id += data
    }
    return id
}

const common = {
  transUndefined: transUndefined,
  // initMarker: initMarker,
  markerArr: markerArr,
  currentMarker: currentMarker,
  // initMarkerArr: initMarkerArr,
  clearMarkerArr: clearMarkerArr,
  initLine: initLine,
  initLineArr: initLineArr,
  clearLineArr: clearLineArr,
  getStorage: getStorage,
  setStorage: setStorage,
  rmStorage: rmStorage,
  clearStorage: clearStorage,
  getUrlParam: getUrlParam,
  initPolygon: initPolygon,
  clearPolygonArr: clearPolygonArr,
  formatTime: formatTime,
  initBackTh: initBackTh,
  getSvgMarkerObj,
  initSvgMarker,
  clearPolygon,
  initPolygonArr,
  downloadFile,
  checkIDCard,
  getDic,
  // downloadFileByZip,
  uuid,
  djGetCookie,
  djDelCookie,
  logout,
  callSomeOne,
  simplifyValue,
  splitArrByLen,
  arrayUnique2,
  showPreviewImg,
  matchFileType,
  getRoomId,
  normalizeServerUrl
}

export default common
