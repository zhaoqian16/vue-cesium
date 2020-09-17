//const baseURL = "http://test.hnzwdz.com/jeesite-icity/a/"; // 测试环境
// const baseURL = 'http://192.168.1.43:8980/jeesite-icity/a/'
// const baseURL = 'http://192.168.1.199:8981/jeesite-icity/a/'
// const baseURL = 'http://192.168.1.66:8280/icity/a/'
// const baseURL = 'http://192.168.1.67:8980/icity/a/'
const CITY = "郑州";
var currentProtocol = document.location.protocol;
// console.log(document.location)
var currentHostName = document.location.hostname;
var currentOrigin = document.location.origin;
if (currentHostName == "localhost" || currentHostName == "127.0.0.1") {
  var baseURL = "http://dev.hnzwdz.com/jeesite-icity/a/";
  var fileURL = "http://dev.hnzwdz.com/jeesite-icity";
  // var baseURL = "http://192.168.1.99:8981/jeesite-icity/a/";
  // var fileURL = "http://192.168.1.99:8981/jeesite-icity";
  var wsUrl = "ws://dev.hnzwdz.com/jeesite-icity";
  var wmsUrl = "http://test.hnzwdz.com/geoserver/districts/wms";
  var basePath = currentOrigin;
} else {
  var baseURL = currentOrigin + "/jeesite-icity/a/";
  var fileURL = currentOrigin + "/jeesite-icity";
  if (currentProtocol == "http:") {
    var wsUrl = "ws:" + currentHostName + "/jeesite-icity";
  } else {
    var wsUrl = "wss:" + currentHostName + "/jeesite-icity";
  }
  var wmsUrl =
    (currentOrigin == "http://dev.hnzwdz.com" ||
      currentOrigin == "https://dev.hnzwdz.com"
      ? "http://test.hnzwdz.com"
      : currentOrigin) + "/geoserver/districts/wms";
  var basePath = currentOrigin + "/newAdmin";
  var oldBasePath = currentOrigin + "/admin/";
}

// const wmsUrl = 'http://test.hnzwdz.com/'
// const basePath = 'http://test.hnzwdz.com/' + process.env.BASE_PATH
// if (PROTOCOL == "http:") {
//   var baseURL = process.env.API_ROOT_IN + "jeesite-icity/a/";
//   var fileURL = process.env.API_ROOT_IN + "jeesite-icity";
//   var wmsUrl = process.env.WMS_ROOT_IN;
//   var basePath = process.env.API_ROOT_IN + process.env.BASE_PATH;
// } else {
//   var baseURL = process.env.API_ROOT_OUT + "jeesite-icity/a/";
//   var fileURL = process.env.API_ROOT_IN + "jeesite-icity";
//   var wmsUrl = process.env.WMS_ROOT_OUT;
//   var basePath = process.env.API_ROOT_OUT + process.env.BASE_PATH;
// }
const ipHost = {
  lzh: {
    ips: ["61.163.86.186", "172.16.0.27"],
    pageUrl: "/lzhindex"
  }
};
//与后台约定的加密key
const secretKey = "thinkgem,jeesite,com";
const wmsPartParam = {
  LAYERS: "districts:t_basic_component",
  CQL_FILTER: "status in ('0')"
}; //所有部件
const wmsPublicParam = {
  LAYERS: "districts:t_basic_component",
  CQL_FILTER: "big_national_code in ('01') and status in ('0')"
}; //公用设施部件
const wmsTrafficParam = {
  LAYERS: "districts:t_basic_component",
  CQL_FILTER: "big_national_code in ('02') and status in ('0')"
}; // 交通设施部件

const wmsAppearanceParam = {
  LAYERS: "districts:t_basic_component",
  CQL_FILTER: "big_national_code in ('03') and status in ('0')"
}; //市容环境部件

const wmsGreenParam = {
  LAYERS: "districts:t_basic_component",
  CQL_FILTER: "big_national_code in ('04') and status in ('0')"
}; //园林绿化部件

const wmsOtherParam = {
  LAYERS: "districts:t_basic_component",
  CQL_FILTER: "big_national_code in ('06') and status in ('0')"
}; //其他部件
const wmsHouseParam = {
  LAYERS: "districts:t_basic_component",
  CQL_FILTER: "big_national_code in ('05') and status in ('0')"
};
const wmsExtensionParam = {
  LAYERS: "districts:t_basic_component",
  CQL_FILTER: "big_national_code in ('21') and status in ('0')"
};

const wmsSurveyParam = {
  LAYERS: "districts:t_basic_toilet",
  CQL_FILTER: "status in ('0')"
}; //公厕
const wmsBridgeParam = {
  LAYERS: "districts:t_basic_component",
  CQL_FILTER: "municipal_type in ('1') AND status in ('0')"
}; //桥梁
const wmsTunnelParam = {
  LAYERS: "districts:t_basic_component",
  CQL_FILTER: "municipal_type in ('2') AND status in ('0')"
}; //隧道
const wmsFacilitiesParam = {
  LAYERS: "districts:t_basic_component",
  CQL_FILTER: "municipal_type in ('3') AND status in ('0')"
}; //市政设施
const wmsTreeParam = {
  LAYERS: "districts:t_basic_component",
  CQL_FILTER:
    "big_national_code in ('04') AND small_national_code in ('01') AND status in ('0')"
}; // 古树名木
const wmsParkParam = {
  LAYERS: "t_greenbelt_info",
  CQL_FILTER: "green_type in ('1') AND status in ('0')"
}; // 公园绿地
const wmsProtectiveParam = {
  LAYERS: "t_greenbelt_info",
  CQL_FILTER: "green_type in ('2') AND status in ('0')"
}; // 防护绿地
const wmsPlazaParam = {
  LAYERS: "t_greenbelt_info",
  CQL_FILTER: "green_type in ('3') AND status in ('0')"
}; //广场绿地
const wmsAttachedParam = {
  LAYERS: "t_greenbelt_info",
  CQL_FILTER: "green_type in ('4') AND status in ('0')"
}; //附属绿地
const wmsRegionalParam = {
  LAYERS: "t_greenbelt_info",
  CQL_FILTER: "green_type in ('5') AND status in ('0')"
}; // 区域绿地
const wmsOrgParam = {
  LAYERS: "districts:t_org_info",
  CQL_FILTER: ""
}; // 组织全部
const wmsOrgShopParam = {
  LAYERS: "districts:t_org_info",
  CQL_FILTER: "org_is_shop in ('1')"
}; // 门店组织
const wmsOrgJjParam = {
  LAYERS: "districts:t_org_info",
  CQL_FILTER: "org_type in ('1')"
}; // 经济组织
const wmsOrgXzParam = {
  LAYERS: "districts:t_org_info",
  CQL_FILTER: "org_type in ('2')"
}; // 行政组织
const wmsOrgMbParam = {
  LAYERS: "districts:t_org_info",
  CQL_FILTER: "org_type in ('3')"
}; // 民办组织
const wmsOrgYlParam = {
  LAYERS: "districts:t_org_info",
  CQL_FILTER: "org_type in ('4')"
}; // 医疗组织
const wmsOrgJyParam = {
  LAYERS: "districts:t_org_info",
  CQL_FILTER: "org_type in ('5')"
}; // 教育组织
const wmsOrgGdParam = {
  LAYERS: "districts:t_org_info",
  CQL_FILTER: "org_type in ('6')"
}; // 工地组织
const wmsOrgQtParam = {
  LAYERS: "districts:t_org_info",
  CQL_FILTER: "org_type in ('7')"
}; // 其他组织
const wmsOrgXqdParam = {
  LAYERS: "districts:t_org_info",
  CQL_FILTER: "org_back_three in ('1')"
}; // 兴趣点
const wmsZoningParam = [
  "districts:quhua",
  "districts:one",
  "districts:two",
  "districts:three"
];
const wmsBuildingParam = {
  LAYERS: "districts:t_basic_building",
  CQL_FILTER: ""
}; // 楼栋
const wmsVideoParam = {
  LAYERS: "districts:t_basic_video",
  CQL_FILTER: ""
}; // 摄像头

export default {
  CITY,
  baseURL,
  fileURL,
  secretKey,
  wmsUrl,
  wsUrl,
  basePath,
  oldBasePath,
  ipHost,
  wmsPartParam,
  wmsZoningParam,
  wmsSurveyParam,
  wmsBridgeParam,
  wmsTunnelParam,
  wmsFacilitiesParam,
  wmsTreeParam,
  wmsPublicParam,
  wmsTrafficParam,
  wmsAppearanceParam,
  wmsGreenParam,
  wmsOtherParam,
  wmsParkParam,
  wmsProtectiveParam,
  wmsPlazaParam,
  wmsRegionalParam,
  wmsAttachedParam,
  wmsExtensionParam,
  wmsHouseParam,
  wmsOrgParam,
  wmsOrgJjParam,
  wmsOrgXzParam,
  wmsOrgMbParam,
  wmsOrgYlParam,
  wmsOrgJyParam,
  wmsOrgGdParam,
  wmsOrgQtParam,
  wmsOrgShopParam,
  wmsOrgXqdParam,
  wmsBuildingParam,
  wmsVideoParam
};
