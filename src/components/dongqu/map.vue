<template>
    <div class="map">
      <div id="cContainer" ref="cesiumMap">
        <div class="camera-info">
          <div>{{currentCamera}}</div>
        </div>
      </div>
      <div id="tContainer" ref="tianMap"></div>
      <div v-if="mapInited">
        <ModeSwitcher ref="modeSwitch"></ModeSwitcher>
      </div>
      
      <!-- 控制按钮 -->
      <div class="control-button">
        <el-radio-group v-model="layer" @change="getCompLayer">
          <el-radio-button label="门店" size="mini"></el-radio-button>
          <el-radio-button label="部件" size="mini"></el-radio-button>
          <el-radio-button label="人员" size="mini"></el-radio-button>
          <el-radio-button label="摄像头" size="mini"></el-radio-button>
          <el-radio-button label="车辆" size="mini"></el-radio-button>
          <el-radio-button label="案件" size="mini"></el-radio-button>
        </el-radio-group>
        <el-button size="mini" @click="changeSceneMode('3D')">3d</el-button>
        <el-button size="mini" @click="changeSceneMode('2D')">2d</el-button>
        <el-button size="mini" @click="register()">登记案件</el-button>
        <el-button size="mini" @click="personTrack()">人员轨迹</el-button>
        <el-button size="mini" @click="toHomeView()">默认视角</el-button>
        <el-button size="mini" @click="toMainView()">主要视角</el-button>
      </div>
      <!-- 详情框 -->
      <div class="infobox-outer" v-if="infoBoxVisible">
        <div class="infobox-inner">
          <div class="header">
            <div class="title">详情</div>
            <div class="close" @click="closeInfoBox">×</div>
          </div>
          <div class="content">
            <table v-if="select.feature && select.feature.detail && select.type === 'shop'">
              <tr>
                <td class="key">名称</td>
                <td>{{ select.feature.detail.orgName || '-'}}</td>
              </tr>
              <tr>
                <td class="key">统一社会信用代码</td>
                <td>{{ select.feature.detail.socialCode || '-' }}</td>
              </tr>
              <tr>
                <td class="key">组织类型</td>
                <td>{{ select.feature.detail.orgType || '-'}}</td>
              </tr>
              <tr>
                <td class="key">所属机构</td>
                <td>{{ (select.feature.detail.orgOfficeCode != undefined&&select.feature.detail.orgOfficeCode.officeName!=undefined)?select.feature.detail.orgOfficeCode.officeName:'' }}</td>
              </tr>
              <tr>
                <td class="key">法定代表人</td>
                <td>{{ select.feature.detail.legalPerson || '-'}}</td>
              </tr>
              <tr>
                <td class="key">成立日期</td>
                <td>{{ select.feature.detail.createDate || '-'}}</td>
              </tr>
              <tr>
                <td class="key">营业期限</td>
                <td>{{ formatIsLong(select.feature.detail.isLong,select.feature.detail.businessBegins,select.feature.detail.businessEnds)}}</td>
              </tr>
              <tr>
                <td class="key">注册地址</td>
                <td>{{ select.feature.detail.address || '-'}}</td>
              </tr>
              <tr>
                <td class="key">经营范围</td>
                <td>{{ select.feature.detail.businessScope || '-'}}</td>
              </tr>
            </table>
            <table v-else-if="select.feature && select.feature.detail && select.type === 'building'">
              <tr>
                <td class="key">建筑类别：</td>
                <td>{{ select.feature.detail.typeOfBudingName || '-'}}</td>
                <td class="key">单元数：</td>
                <td>{{ select.feature.detail.unit || '-'}}</td>
              </tr>
              <tr>
                <td class="key">层数：</td>
                <td>{{ select.feature.detail.layers || '-'}}</td>
                <td class="key">总户数：</td>
                <td>{{ select.feature.detail.buildingTenement || '-'}}</td>
              </tr>
              <tr>
                <td class="key">居民数：</td>
                <td>{{ select.feature.detail.personNum || '-'}}</td>
                <td class="key">楼栋状况</td>
                <td>{{ select.feature.detail.budingConditionName || '-'}}</td>
              </tr>
              <tr>
                <td class="key">使用状况：</td>
                <td>{{ select.feature.detail.budingServiceConditionName || '-'}}</td>
                <td class="key">楼长：</td>
                <td>{{ select.feature.detail.contactMan || '-'}}</td>
              </tr>
              <tr>
                <td class="key">楼长联系方式：</td>
                <td>{{ select.feature.detail.contactTel || '-'}}</td>
              </tr>
              <tr>
                <td class="key">数据来源：</td>
                <td>{{ select.feature.detail.dataSourcesName || '-'}}</td>
              </tr>
              <tr>
                <td class="key">初始日期：</td>
                <td>{{ select.feature.detail.initialTime || '-'}}</td>
              </tr>
              <tr>
                <td class="key">变更日期：</td>
                <td>{{ select.feature.detail.changeTime || '-'}}</td>
              </tr>
              <tr>
                <td class="key">标识码：</td>
                <td>{{ select.feature.detail.identificationCode || '-'}}</td>
              </tr>
              <tr>
                <td class="key">门(楼)牌号：</td>
                <td>{{ select.feature.detail.buildingNumber || '-'}}</td>
              </tr>
              <tr>
                <td class="key">所属机构：</td>
                <td>{{ (select.feature.detail.deptCode && select.feature.detail.deptCode.officeName) || '-'}}</td>
              </tr>
              <tr>
                <td class="key">所在路段：</td>
                <td>{{ select.feature.detail.roadName || '-'}}</td>
              </tr>
              <tr>
                <td class="key">地址描述：</td>
                <td>{{ select.feature.detail.address || '-'}}</td>
              </tr>
              <tr>
                <td class="key">重点服务人员：</td>
                <td>{{ select.feature.detail.communityService || '-'}}</td>
                <td class="key">重点关注人员：</td>
                <td>{{ select.feature.detail.importantType || '-'}}</td>
              </tr>
            </table>
            <div  v-else-if="selectModel && selectModel.detail">
              <table>
                <tr>
                  <td class="key">大类</td>
                  <td>{{ selectModel.detail.bigName || '-'}}</td>
                </tr>
                <tr>
                  <td class="key">小类</td>
                  <td>{{ selectModel.detail.componentName || '-'}}</td>
                </tr>
                <tr>
                  <td class="key">状态</td>
                  <td>{{ selectModel.detail.componentStatusName || '-'}}</td>
                </tr>
                <tr>
                  <td class="key">所属机构</td>
                  <td>{{ selectModel.detail.areaName || '-'}}</td>
                </tr>
                <tr>
                  <td class="key">所在地址</td>
                  <td>{{ selectModel.detail.address || '-'}}</td>
                </tr>
              </table>
              <!-- <table v-else-if="selectModel.properties.CompName && selectModel.properties.CompName.indexOf('井盖') === -1">
                <tr>
                  <td class="key">名称</td>
                  <td>{{ selectModel.properties.CompName }}</td>
                </tr>
                <tr>
                  <td class="key">类型</td>
                  <td>{{ selectModel.properties.ChildType || '楸树' }}</td>
                </tr>
                <tr>
                  <td class="key">状态</td>
                  <td>{{ selectModel.properties.status || '完好'}}</td>
                </tr>
              </table>
              <table v-else-if="selectModel.properties.ObjName">
                <tr>
                  <td class="key">名称</td>
                  <td>{{ selectModel.properties.ObjName }}</td>
                </tr>
                <tr>
                  <td class="key">所属机构</td>
                  <td>{{ selectModel.properties.DeptName1 || '无' }}</td>
                </tr>
                <tr>
                  <td class="key">状态</td>
                  <td>{{ selectModel.properties.ObjState || '完好'}}</td>
                </tr>
                <tr>
                  <td class="key">位置</td>
                  <td>{{ selectModel.properties.ObjPos || '无'}}</td>
                </tr>
              </table>  -->
            </div> 
            <div v-else-if="selectEntity && selectEntity.name === 'person'" >
              <div>
                <table>
                  <tr>
                    <td class="key">名称</td>
                    <td>{{  selectEntity.property.userName || '-'}}</td>
                  </tr>
                </table>
              </div>
              <div class="footer">
                <el-button type="primary"
                      @click="personTrack()"
                      size="mini">历史轨迹</el-button>
                <el-button type="primary"
                          @click="personCall()"
                          size="mini">语音通话</el-button>
              </div>
            </div>
            <div v-else-if="selectEntity && selectEntity.name === 'video'" >
              <table>
                <tr>
                  <td class="key">类型</td>
                  <td>{{ selectEntity.property.videoType || '-' }}</td>
                </tr>
                <tr>
                  <td class="key">类别</td>
                  <td>{{ selectEntity.property.cameraType || '-' }}</td>
                </tr>
                <tr>
                  <td class="key">机构</td>
                  <td>{{ selectEntity.property.publicOffice.officeName }}</td>
                </tr>
                <tr>
                  <td class="key">路段</td>
                  <td>{{ selectEntity.property.publicOffice.roadName ?  selectEntity.property.publicOffice.roadName : '-'}}</td>
                </tr>
                <tr>
                  <td class="key">状态</td>
                  <td>{{ selectEntity.property.isOnline == 1 ? '在线' : '离线' }}</td>
                </tr>
                <tr>
                  <td class="key">地址</td>
                  <td>{{ selectEntity.property.address }}</td>
                </tr>
              </table>
              <div class="footer">
                <el-button type="primary" @click="showVideo(selectEntity.property.id)" size="mini">查看监控</el-button>
              </div>
            
            </div>
            <div v-else-if="selectEntity && selectEntity.name === 'car'" >
              <table>
                <tr>
                  <td class="key">车牌号</td>
                  <td>{{ selectEntity.property.carNo || '-' }}</td>
                </tr>
                <tr>
                  <td class="key">型号</td>
                  <td>{{ selectEntity.property.model || '-' }}</td>
                </tr>
                <tr>
                  <td class="key">颜色</td>
                  <td>{{ selectEntity.property.color || '-' }}</td>
                </tr>
                <tr>
                  <td class="key">品牌</td>
                  <td>{{ selectEntity.property.brand || '-' }}</td>
                </tr>
                <tr>
                  <td class="key">用途分类</td>
                  <td>{{ selectEntity.property.typeName || '-'}}</td>
                </tr>
                <tr>
                  <td class="key">注册日期</td>
                  <td>{{ selectEntity.property.createDate || '-' }}</td>
                </tr>
                <tr>
                  <td class="key">发证日期</td>
                  <td>{{ selectEntity.property.issuedate || '-' }}</td>
                </tr>
                <tr>
                  <td class="key">车辆识别代码</td>
                  <td>{{ selectEntity.property.vin || '-' }}</td>
                </tr>
                <tr>
                  <td class="key">发动机号码</td>
                  <td>{{ selectEntity.property.engine || '-' }}</td>
                </tr>
                <tr>
                  <td class="key">车辆所属单位</td>
                  <td>{{ selectEntity.property.company || '-' }}</td>
                </tr>
                <tr>
                  <td class="key">车主地址</td>
                  <td>{{ selectEntity.property.address || '-' }}</td>
                </tr>
                <tr>
                  <td class="key">更新时间</td>
                  <td>{{ selectEntity.property.updateDate }}</td>
                </tr>
              </table>
              <div class="footer">
                <el-button type="primary" @click="carTrack()" size="mini">历史轨迹</el-button>
                <el-button type="primary" @click="carCall()" size="mini">语音通话</el-button>
              </div>
            </div>
            <div v-else-if="selectEntity && selectEntity.name === 'case'">
              <tr>
                <td class="key">名称</td>
                <td>{{ selectEntity.property.objName }}</td>
              </tr>
              <tr>
                <td class="key">编号</td>
                <td>{{ selectEntity.property.eventCode }}</td>
              </tr>
              <tr>
                <td class="key">办事处</td>
                <td>{{ selectEntity.property.streetName || '-' }}</td>
              </tr>
              <tr>
                <td class="key">社区</td>
                <td>{{ selectEntity.property.communityName || '-' }}</td>
              </tr>
              <tr>
                <td class="key">路段</td>
                <td>{{ selectEntity.property.roadSectionName || '-' }}</td>
              </tr>
              <tr>
                <td class="key">案件来源</td>
                <td>{{ selectEntity.property.eventSourceName }}</td>
              </tr>
              <tr>
                <td class="key">案件类型/大</td>
                <td>{{ selectEntity.property.bigClassName }}</td>
              </tr>
              <tr>
                <td class="key">案件类型/小</td>
                <td>{{ selectEntity.property.smallClassName }}</td>
              </tr>
              <tr>
                <td class="key">上报时间</td>
                <td>{{ formatTime(selectEntity.property.uploadTime) }}</td>
              </tr>
              <tr>
                <td class="key">地址描述</td>
                <td>{{ selectEntity.property.objPosition }}</td>
              </tr>
            </div>
          </div>
        </div>
      </div>
      <div class="bindbox-outer" v-else-if="bindPromptVisible">
        <div class="bindbox-inner">
          <div class="header">
            <div class="title">绑定提示</div>
            <div class="close" @click="closeBindPrompt">×</div>
          </div>
          <div class="content">
            <table>
              <tr>
                <td class="key">模型id</td>
                <td>{{ bindId }}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
      <!-- 自定义的车辆轨迹弹出框 -->
      <div class="custom_box" v-if="carTrackVisible" style="top: 200px">
        <div class="header">
          <span>车辆轨迹</span>
          <span class="close" @click="carTrackClose()">×</span>
        </div>
        <div class="body">
          <div class="row_item">
            开始时间: 
            <el-date-picker v-model="carStartTime"
                      type="datetime"
                      placeholder="选择日期时间"
                      align="right"
                      :default-value="carStartTime"
                      @change="carStartTimeChange">
            </el-date-picker>
          </div>
          <div class="row_item">
            结束时间:
            <el-date-picker v-model="carEndTime"
                      type="datetime"
                      placeholder="选择日期结束时间"
                      align="right"
                      :default-value="carEndTime"
                      @change="carEndTimeChange">
           </el-date-picker>
          </div>
          <!-- <div class="row_item">
            播放速度:
            <el-slider v-model="carPlaySpeed" 
                      :step="1"
                      show-input
                      :min="1"
                      :max="100"></el-slider>
            </div> -->
          <div class="footer">
            <el-button type="primary" @click="carTrackShow()" size="mini">查看轨迹</el-button>
            <el-button type="primary" @click="carPathPlay()" size="mini">播放</el-button>
            <el-button type="primary" @click="fastForward()" size="mini">快进</el-button>
            <el-button type="primary" @click="fastBack()" size="mini">快退</el-button>
            <el-button type="primary" @click="carPathReplay()" size="mini">重放</el-button>
            <el-button type="primary" @click="carChangeSpeed(30)" size="mini">改变速度</el-button>
            <el-button type="primary" @click="carTrackExit()" size="mini">退出播放</el-button>
          </div>
        </div>
      </div>
      <!-- 自定义的人员轨迹弹出框 -->
      <div class="custom_box" v-if="personTrackVisible" style="top: 200px">
        <div class="header">
          <span>人员轨迹</span>
          <span class="close" @click="personTrackClose()">×</span>
        </div>
        <div class="body">
           <div class="row_item">
            开始时间: 
            <el-date-picker v-model="personStartTime"
                      type="datetime"
                      placeholder="选择日期时间"
                      align="right"
                      :default-value="personStartTime"
                      @change="personStartTimeChange">
          </el-date-picker>
          </div>
          <div class="row_item">
            结束时间:
            <el-date-picker v-model="personEndTime"
                        type="datetime"
                        placeholder="选择日期结束时间"
                        align="right"
                        :default-value="personEndTime"
                        @change="personEndTimeChange">
            </el-date-picker>
          </div>
          <div class="footer">
            <el-button type="primary" @click="personTrackShow()" size="medium">查看轨迹</el-button>
            <el-button type="primary" @click="personTrackPlay()" size="medium">播放</el-button>
          </div>
        </div>
      </div>
      <!-- 自定义的地址确认弹出框 -->
      <div class="custom_box" v-if="confirmVisible" style="top: 200px">
        <div class="header">
          <span>地址确认</span>
        </div>
        <div class="body">
          <div class="row_item">所属机构&nbsp;:&nbsp;{{ org.officeName }}</div>
          <div class="row_item">
            <el-input placeholder="请输入地址描述"
                    v-model="confirmAddress"
                    class="input-with-select">
              <el-button slot="append"
                        icon="el-icon-search"
                        type="primary"
                        @click="search()"></el-button>
            </el-input>
          </div>
          <div class="footer">
            <el-button type="primary"
                      @click="comfirmRegister()"
                      size="medium">确定</el-button>
            <el-button type="primary"
                      @click="cancleRegister()"
                      size="medium">取消</el-button>
            <el-button type="primary"
                      @click="removeRegisterPoint()"
                      size="medium">删除点</el-button>
          </div>
        </div>
      </div>

    </div>   
</template>
<script>
import 'cesium/Source/Widgets/widgets.css';
let Cesium = require('cesium/Source/Cesium');
import CesiumNavigation from 'cesium-navigation-es6'; // 添加指南针插件
require('../../static/libs/cesium/cesiumGeometry');
import common from '../uitl/common'
// 三维模型
import shu from '../../static/3dModel/shu.gltf'
import lajitongStreet from '../../static/3dModel/comp/lajitong_street.gltf'
import lajitongBusiness from '../../static/3dModel/comp/lajitong_business.gltf'
import lajitongPark from '../../static/3dModel/comp/lajitong_park.gltf'
import ludeng from '../../static/3dModel/comp/ludeng.gltf'
import car from '../../static/3dModel/CesiumMilkTruck.glb'
import man from '../../static/3dModel/Cesium_Man.glb'
import jgLudeng from '../../static/3dModel/comp/jinggai_ludeng1.gltf'
import jgRanqi from '../../static/3dModel/comp/jinggai_ranqi.gltf'
import jgReli from '../../static/3dModel/comp/jinggai_reli.gltf'
import jgXiangfang from '../../static/3dModel/comp/jinggai_xiaofang.gltf'
import jgShangshuiN from '../../static/3dModel/comp/jinggai_shangshui2.gltf'
import jgShangshuiO from '../../static/3dModel/comp/jinggai_shangshui1.gltf'
import jgTongxin from '../../static/3dModel/comp/jinggai_tongxin.gltf'
import jgYushui from '../../static/3dModel/comp/jinggai_yushui.gltf'
import jgQita from '../../static/3dModel/comp/jinggai_qita.gltf'
import huajiaBase from '../../static/3dModel/comp/huajia_base.gltf'
import huajiaTree from '../../static/3dModel/comp/huajia_tree.gltf'
import yushuibizi from '../../static/3dModel/comp/yushuibizi.gltf'
// 组件
import ModeSwitcher from './tool/modeSwitcher'
import BasemapSwitcher from './tool/basemapSwitcher'
// 部件数据
import compData from '../../static/SampleData/3dComp.json'
import BuildingData from '../../static/SampleData/3dBuilding.json'
import orgData from '../../static/SampleData/3dOrg.json'

export default {
  components: {
    ModeSwitcher,
    BasemapSwitcher
  },
  data () {
    return {
      viewer: '',
      tMap: '',
      sitelliteMap: '',
      vectorMap: '',
      customMap: '',
      labelMap: '',
      mapInited: false,
      windowPosition: '',
      entityDatasource: null,
      primitiveCollection: null,
      infoBoxVisible: false,
      windowPosition: '',
      select: {
        feature: undefined,
        attributes: new Cesium.Color(),
        type: ''
      },
      selectModel: null,
      selectModelBox: null,
      selectEntity: null,
      tileset: null,
      direction: '',
      cameraInfo: null, // 对象
      currentCamera: '', //当前相机参数
      layer: '',
      confirmVisible: false,
      confirmAddress: '',
      confirmLnglatGd: '',
      org: {},
      carInfoVisible: false,
      carTrackVisible: false,
      carPlaySpeed: 5,
      carStartTime: undefined,
      carEndTime: undefined,
      carPathData: undefined,
      currentCar: '豫A0603R',
      drawEntity: undefined,
      handler: undefined,
      personPlaySpeed: 5,
      personTrackVisible: false,
      personStartTime: undefined,
      personEndTime: undefined,
      personPathData: undefined,
      playFlag: true,
      currentPerson: '0867597017655702',
      userInfo: '',
      homeViewOptionsVersion1: {
        destination: Cesium.Cartesian3.fromDegrees(113.75885198222937, 34.78853390435369, 920.5362867864075),
        orientation: {
          heading: Cesium.Math.toRadians(17.959169620278136),
          pitch: Cesium.Math.toRadians(-41.39227922794142),
          roll: Cesium.Math.toRadians(0.07414207460638529)
        },
        duration: 2
      },
      homeViewOptions: {
        destination: Cesium.Cartesian3.fromDegrees(113.74159603307372, 34.77766781955999, 2308.593862489063),
        orientation: {
          heading: Cesium.Math.toRadians(30.261103209957636),
          pitch: Cesium.Math.toRadians(-42.77768958916718),
          roll: Cesium.Math.toRadians(0.12395771196527275)
        },
        duration: 2
      },
      carPassPath: [],
      sceneMode: '', // 维度模式
      unitStep: '',
      sumOffset: '',
      bindId: '', // 数据绑定的id
      bindPromptVisible: false, // 绑定提示弹框的可见性
    }
  },
  mounted () {
    this.initUserInfo()
    this.initViewer()
    this.mapInited = true
    let self = this;
    window.mapVue = self;
  },
  methods: {
    initUserInfo() {
      this.userInfo = common.getStorage('user');
      let currentPoint;
      if (this.userInfo == null) {
        this.userInfo = {}
        this.userInfo.isDistrict = 1
        this.userInfo.currentLevelCode = '410174'
        this.userInfo.districtCode = '410174'
        this.userInfo.id = 'dmdc2_akfr'
        this.mapCenter = [113.63288, 34.693875];
      } else {
        this.userInfo.districtCode = this.userInfo.districtCommandCode;
        if (this.userInfo.isDistrict != 0) {
          //区
          this.userInfo.currentLevelCode = this.userInfo.districtCommandCode;
          this.userInfo.currentLevelName = this.userInfo.districtCommandName;
        } else {
          //办事处
          this.userInfo.currentLevelCode = this.userInfo.officeCommandCode;
          this.userInfo.currentLevelName = this.userInfo.officeCommandName;
        }
        this.mapCenter = this.userInfo.centerPoint.split(',');
      }
    },
    /**
     * @description: 初始化cesium地图
     * @param {type} 
     * @return: 
     */
    initViewer () {
      // 初始化Viewer之前，将token加入，可避免报错{"code":"InvalidCredentials","message":"Invalid access token"}
      Cesium.Ion.defaultAccessToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4ZDliYjU2OS03YTA0LTQ4NjUtYWE4Zi1iZTMzOTEzOGI5NmIiLCJpZCI6MTg0MzQsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NzM4MDA2MzR9.TiRGDlgKIT4SB2apFIwEAWyqp5Ad_qSqh3zrpE0l8h4'
      this.viewer = new Cesium.Viewer('cContainer',{
        // animation: false, //关闭动画
        // timeline: false, //关闭时间线
        navigationHelpButton: false,  //关闭显示默认的相机控制提示
        fullscreenButton: false, //关闭全屏按钮
        geocoder: false, //关闭geocoder小部件
        selectionIndicator: false,
        infoBox: false,  //点击要素之后显示的信息,默认true
        baseLayerPicker: false, //是否显示图层选择控件
        sceneModePicker: false, //是否显示投影方式控件
        homeButton: false,  //是否显示默认定位点的控件
        shouldAnimate : true, 
        showRenderLoopErrors: false
      });


      this.viewer._cesiumWidget._creditContainer.style.display = 'none';  // 默认去除版权信息
      this.viewer.imageryLayers.get(0).show = true;  
      this.viewer.imageryLayers.remove(this.viewer.imageryLayers.get(0)) // 默认不加载影像
      this.viewer.scene.skyBox.show = false  // 默认不显示背景图片
      this.viewer.scene.backgroundColor = new Cesium.Color(0.0, 0.0, 0.0, 0.0) // 默认将背景颜色设置为黑色
      this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK) // 屏蔽默认双击事件
      
      // 隐藏动画和时间线控件
      this.viewer.animation.container.style.visibility = "hidden"
      this.viewer.timeline.container.style.visibility = "hidden"

      // 打开地形监测
      this.ellipsoid = this.viewer.scene.globe.ellipsoid
      this.viewer.scene.globe.depthTestAgainstTerrain = true

      // 禁止相机进入地面以下
      this.viewer.scene.preRender.addEventListener(this.undergroundMode)

      // 设置大气环境变量
      this.viewer.scene.shadowMap.darkness = 1.275
      this.viewer.scene.skyAtmosphere.brightShift = 0.4 // 大气的亮度
      this.viewer.scene.highDynamicRange = false
      this.viewer.scene.sun.show = false

      
      
      // 添加指南针
      var options = {
        defaultResetView: Cesium.Rectangle.fromDegrees(90, 5, 130, 60), // 用于在使用重置导航重置地图视图时设置默认视图控制。接受的值是Cesium.Cartographic 和 Cesium.Rectangle.
        enableCompass: true, // 用于启用或禁用罗盘。true是启用罗盘，false是禁用罗盘。默认值为true。如果将选项设置为false，则罗盘将不会添加到地图中。
        enableZoomControls: true, // 用于启用或禁用缩放控件。true是启用，false是禁用。默认值为true。如果将选项设置为false，则缩放控件将不会添加到地图中。
        enableDistanceLegend: false, // 用于启用或禁用距离图例。true是启用，false是禁用。默认值为true。如果将选项设置为false，距离图例将不会添加到地图中。
        enableCompassOuterRing: true // 用于启用或禁用指南针外环。true是启用，false是禁用。默认值为true。如果将选项设置为false，则该环将可见但无效。
      }
      CesiumNavigation(this.viewer, options)
      document.getElementsByClassName('navigation-controls')[0].style.backgroundColor = 'rgba(47, 53, 60, 0.5)' // 修改指南针的样式

      this.getCurrentCamera()

      // this.addCBasicMap()
      this.addSitelliteMap()
      this.addMapboxVectorMap()
      // this.addCVectorMap()
      this.directLocation()
      // this.addCustomSatellite()
      this.load3DTile()
    },
    /**
     * @description: 直接定位至目标区域
     * @param {type} 
     * @return: 
     */
    directLocation () {
      const position = new Cesium.Cartesian3.fromDegrees(113.73089959,34.755, 60000) // 经度、纬度、高度形成的笛卡尔三维坐标
      const orientation = new Cesium.HeadingPitchRoll.fromDegrees(0, -90, 0)
      const homeCameraView = {
        destination: position,
        orientation: {
          heading: orientation.heading,
          pitch: orientation.pitch,
          roll: orientation.roll
        },
        duration: 0
      }
      this.viewer.scene.camera.setView(homeCameraView)
    },
    /**
     * @description: 默认添加天地图卫星影像（未偏移）
     * @param {type} 
     * @return: 
     */
    addSitelliteMap () {
      this.sitelliteMap = new Cesium.ImageryLayer(
        new Cesium.WebMapTileServiceImageryProvider({
          url: "http://t{s}.tianditu.gov.cn/img_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=76892c38deab957e65556e5824ca53e9",
          layer: 'tianSatelliteMap',
          style: 'default',
          format: 'tiles',
          tileMatrixSetID: 'c',
          subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
          tilingScheme: new Cesium.GeographicTilingScheme(),
          tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
          maximumLevel: 18
        }), {
        show: true,
        brightness: 1.76,
        contrast: 1.48,
        hue: 0,
        saturation: 1.44,
        gamma: 0.68,
        colorToAlpha: "#2B53F9", // 添加颜色
        alpha: 0.5
      })
      this.sitelliteMap.title = 'sitelliteMap'
      this.viewer.imageryLayers.add(this.sitelliteMap)
    },
    /**
     * @description: 默认添加天地图矢量+标注地图
     * @param {type} 
     * @return: 
     */
    addCVectorMap () {
      this.vectorMap = new Cesium.ImageryLayer(new Cesium.WebMapTileServiceImageryProvider({
        url: 'http://t{s}.tianditu.gov.cn/vec_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=76892c38deab957e65556e5824ca53e9',
        layer: 'tianMap',
        style: 'default',
        format: 'tiles',
        tileMatrixSetID: 'c',
        subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
        tilingScheme: new Cesium.GeographicTilingScheme(),
        tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
        maximumLevel: 18
      }), {
        show: false,
        colorToAlpha: "#2B53F9",
        alpha: 0.3
      })
      this.vectorMap.title = 'vectorMap'
      this.viewer.imageryLayers.add(this.vectorMap)
      this.labelMap = new Cesium.ImageryLayer(new Cesium.WebMapTileServiceImageryProvider({
        url: 'http://t{s}.tianditu.gov.cn/cva_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=76892c38deab957e65556e5824ca53e9',
        layer: 'tianLabelMap',
        style: 'default',
        format: 'tiles',
        tileMatrixSetID: 'c',
        subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
        tilingScheme: new Cesium.GeographicTilingScheme(),
        tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
        maximumLevel: 18
      }), {
        show: false
      }) 
      this.labelMap.title = 'labelMap'
      this.viewer.imageryLayers.add(this.labelMap)
    },
    /**
     * 添加mapbox矢量地图
     */
    addMapboxVectorMap () {
      this.vectorMap = this.viewer.imageryLayers.addImageryProvider(
        new Cesium.MapboxStyleImageryProvider({
          url: 'https://api.mapbox.com/styles/v1/',
          username: 'xiongqianqian',
          styleId: 'ckm9xga5e1g1m17p35koqm2pp',
          accessToken: 'pk.eyJ1IjoieGlvbmdxaWFucWlhbiIsImEiOiJja202MjNlM3UwancxMnluNnN3YTJ5ZzZrIn0.H2aNQ0oHOUa3HhhvoPyxHQ'
        })
      )
      this.vectorMap.title = 'mapboxVectorMap'
      this.vectorMap.show = false
    },
    /**
     * @description: 添加自定义的影像图
     * @param {type} 
     * @return: 
     */
    addCustomSatellite () {
      this.customMap = new Cesium.ImageryLayer(new Cesium.WebMapServiceImageryProvider({
        url: 'http://117.159.25.220:8081/geoserver/districts/wms',
        layers: 'districts:basemap',
        parameters: {
          service: 'WMS',
          version: '1.1.0',
          request: 'GetMap',
          transparent: true,
          format: 'image/png',
        },
        tileWidth: 256,
        tileHeight: 256
      }), {
        show: true
      })
      this.customMap.title = 'customMap'
      this.viewer.imageryLayers.add(this.customMap);
    },
    /**
     * @description: 设置地下浏览模式
     * @param {type} 
     * @return: 
     */
    undergroundMode () {
      if (this.viewer.scene.mode === Cesium.SceneMode.SCENE3D) {
        this.viewer.camera._suspendTerrainAdjustment = false
        this.viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;
        this.viewer.camera._adjustHeightForTerrain();
      }
    },
    /**
     * @description: 监听事件，获取当前相机参数
     * @param {type} 
     * @return: 
     */
    getCurrentCamera () {
      this.getCameraParam()
       this.viewer.scene.postRender.addEventListener( e => {
        this.getCameraParam()
      })
    },
    /**
     * @description: 获取当前相机参数
     * @param {type} 
     * @return: 
     */
    getCameraParam () {
      let position = this.viewer.scene.camera.positionCartographic
      let cameraInfo = {
        height: position.height,
        latitude: Cesium.Math.toDegrees(position.latitude),
        longitude: Cesium.Math.toDegrees(position.longitude),
        heading: Cesium.Math.toDegrees(this.viewer.scene.camera.heading),
        pitch: Cesium.Math.toDegrees(this.viewer.scene.camera.pitch),
        roll: Cesium.Math.toDegrees(this.viewer.scene.camera.roll)
      }
      this.cameraInfo = cameraInfo
      this.currentCamera = `经度: ${cameraInfo.longitude}° 纬度: ${cameraInfo.latitude}° 高度: ${cameraInfo.height} 航偏角: ${cameraInfo.heading}° 俯仰角: ${cameraInfo.pitch}° 翻滚角: ${cameraInfo.roll}°`
    },
    /**
     * @description: 添加3dtile数据--只有建筑模型Version1
     * @param {type} 
     * @return: 
     */
    load3DTileVersion1 () {
      const viewer = this.viewer
      let _this = this
      this.tileset = new Cesium.Cesium3DTileset({
        url: './static/3dTiles/dongqu/tileset.json',
        imageBasedLightingFactor: new Cesium.Cartesian2(1, 1),
        lightColor: new Cesium.Cartesian3(10, 10, 10),
        luminanceAtZenith: 0.9
      })
      this.tileset.readyPromise.
        then( tileset => {
          viewer.scene.primitives.add(tileset)
          // 自己电脑适用
          // viewer.camera.flyTo({
          //   destination: Cesium.Cartesian3.fromDegrees(113.76037194463018, 34.793114893003974, 459.44543851945315),
          //   orientation: {
          //     heading: Cesium.Math.toRadians(17.959169558786204),
          //     pitch: Cesium.Math.toRadians(-41.39227901269581),
          //     roll: Cesium.Math.toRadians(0.0741421676052953)
          //   },
          //   duration: 2
          // })
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(113.75885198222937, 34.78853390435369, 920.5362867864075),
            orientation: {
              heading: Cesium.Math.toRadians(17.959169620278136),
              pitch: Cesium.Math.toRadians(-41.39227922794142),
              roll: Cesium.Math.toRadians(0.07414207460638529)
            },
            duration: 2
          })
          let center = Cesium.Cartesian3.add(Cesium.Cartesian3.fromDegrees(113.7623745395, 34.79762570275), Cesium.Cartesian3.fromArray([59.9, -24.9, 23.6]), new Cesium.Cartesian3())
          let m = Cesium.Transforms.eastNorthUpToFixedFrame(center)
          // 控制缩放比例
          // let scale = Cesium.Matrix4.fromScale(new Cesium.Cartesian3(1.62, 1.62, 1))
          // Cesium.Matrix4.multiply(m, scale, m)
          tileset._root.transform = m
          this.tileset = tileset
          
          this.loadCompVersion1() // 加载倾斜摄影数据时不显示
        }) 
        .otherwise( error => {
          console.log(error)
        })

        this.scenePickVersion1()
    },
    /**
     * @description: 添加部件数据--Version1
     * @param {type} 
     * @return: 
     */
    loadCompVersion1 () {
      const viewer = this.viewer
      let features = compData.features
      let treeInstances = [], ludengInstances = [], yushuiInstances = [], jgdengInstance = []
      let ljtStreetInstances = [], ljtBusinessInstances = [], ljtParkInstances = []
      let ludengjgInstances = [], ranqijgInstances = [], relijgInstances = [], xiaofangjgInstances = [], shangshuijgInstancesN = [], shangshuijgInstancesO = [], 
          tongxinjgInstances = [], yushuijgInstances = [], wushuijgInstances = [], dianlijgInstances = [], gonganjgInstances = [], qitajgInstances = []
      let huajiaBaseInstances = [], huajiaTreeInstances = []
      let barBdzInstances = [], sphereBdzInstances = []
      features.forEach( feature => {
        let lnglat = feature.geometry.coordinates
        let cartesian = Cesium.Cartesian3.fromDegrees(lnglat[0], lnglat[1])
        let scale = 1, modelMatrix
        let id = feature.properties.SurveyNO
        const compName = feature.properties.CompName
        const childType = feature.properties.ChildType
        const direction = feature.properties.direction
        // let modelInstance
        if (compName === '行树') {
          // modelInstance = new Cesium.ModelInstance(treeCollection, modelMatrix, id)
          // treeInstances.push(modelInstance)
          modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(cartesian, new Cesium.HeadingPitchRoll(0, 0, 0))
          Cesium.Matrix4.multiplyByUniformScale(modelMatrix, scale, modelMatrix)
          treeInstances.push({
            modelMatrix: modelMatrix,
            batchId: id
          })
        } else if (compName === '垃圾箱') {
          modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(cartesian, new Cesium.HeadingPitchRoll(0, 0, 0))
          Cesium.Matrix4.multiplyByUniformScale(modelMatrix, scale, modelMatrix)
          let rotateDegree = 0
          if (['N', "S"].includes(direction)) {
            rotateDegree = 66
          } else if (['E', "W"].includes(direction)) {
            rotateDegree = -24
          }
          let rotate = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(rotateDegree))
          Cesium.Matrix4.multiplyByMatrix3(modelMatrix, rotate, modelMatrix)
          let instance = {
            modelMatrix: modelMatrix,
            batchId: id
          }
          if (childType === '固定垃圾箱-路两侧') {
            ljtStreetInstances.push(instance)
          } else if (childType === '固定垃圾箱-商业街') {
            ljtBusinessInstances.push(instance)
          } else if (childType === '固定垃圾箱-公园') {
            ljtParkInstances.push(instance)
          }
        } else if (compName === '路灯') {
          modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(cartesian, new Cesium.HeadingPitchRoll(0, 0, 0))
          Cesium.Matrix4.multiplyByUniformScale(modelMatrix, scale, modelMatrix)
          let rotateDegree = 0
          if (direction === 'N') {
            rotateDegree = 150
          } else if (direction === 'W') {
            rotateDegree = -120
          } else if (direction === 'E') {
            rotateDegree = 60
          } else if (direction === 'S') {
            rotateDegree = 130
          } else if (direction.indexOf('N-') !== -1) {
            rotateDegree = direction.split('-')[1]
          } else if (direction.indexOf('S-') !== -1) {
            rotateDegree = direction.split('-')[1]
          }
          let rotate = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(rotateDegree))
          Cesium.Matrix4.multiplyByMatrix3(modelMatrix, rotate, modelMatrix)
          ludengInstances.push({
            modelMatrix: modelMatrix,
            batchId: id
          })
        } else if (compName.indexOf('井盖') !== -1) {
          scale = 1.5
          cartesian = Cesium.Cartesian3.add(cartesian, Cesium.Cartesian3.fromArray([0, 0, -0.07]),  new Cesium.Cartesian3())
          modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(cartesian, new Cesium.HeadingPitchRoll(0, 0, 0))
          Cesium.Matrix4.multiplyByUniformScale(modelMatrix, scale, modelMatrix)
          let rotateDegree = Math.random() * 360
          let rotate = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(rotateDegree))
          Cesium.Matrix4.multiplyByMatrix3(modelMatrix, rotate, modelMatrix)
          let instance = {
            modelMatrix: modelMatrix,
            batchId: id
          }
          if (compName === '路灯井盖') {
            ludengjgInstances.push(instance)
          } else if (compName === '燃气井盖') {
            ranqijgInstances.push(instance)
          } else if (compName === '热力井盖') {
            relijgInstances.push(instance)
          } else if (compName === '上水井盖') {
            if (childType === '消防井盖') {
              xiaofangjgInstances.push(instance)
            } else {
              if (direction === 'N') {
                shangshuijgInstancesN.push(instance)
              } else {
                shangshuijgInstancesO.push(instance)
              }
            }
          } else if (compName === '通信井盖') {
            tongxinjgInstances.push(instance)
          } else if (compName === '雨水井盖') {
            yushuijgInstances.push(instance)
          } else if (compName === '污水井盖') {
            wushuijgInstances.push(instance)
          } else if (compName === '电力井盖') {
            dianlijgInstances.push(instance)
          } else if (compName === '公安井盖') {
            gonganjgInstances.push(instance)
          } else {
            qitajgInstances.push(instance)
          }
        } else if (compName === '花架花钵') {
          modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(cartesian, new Cesium.HeadingPitchRoll(0, 0, 0))
          Cesium.Matrix4.multiplyByUniformScale(modelMatrix, scale, modelMatrix)
          let rotateDegree = -25
          let rotate = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(rotateDegree))
          Cesium.Matrix4.multiplyByMatrix3(modelMatrix, rotate, modelMatrix)
          huajiaBaseInstances.push({
            modelMatrix: modelMatrix,
            batchId: id
          })
          let modelMatrix_tree =  Cesium.Transforms.headingPitchRollToFixedFrame(Cesium.Cartesian3.add(cartesian, Cesium.Cartesian3.fromArray([-0.15, 0.5, 0.2]),  
                                                                      new Cesium.Cartesian3()), new Cesium.HeadingPitchRoll(0, 0, 0))
          huajiaTreeInstances.push({
            modelMatrix: modelMatrix_tree,
            batchId: id + '-tree'
          })
        } else if (compName === '雨水箅子') {
          modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(cartesian, new Cesium.HeadingPitchRoll(0, 0, 0))
          Cesium.Matrix4.multiplyByUniformScale(modelMatrix, scale, modelMatrix)
          let rotateDegree = 0
          if (['N', "S"].includes(direction)) {
            rotateDegree = 66
          } else if (['E', "W"].includes(direction)) {
            rotateDegree = -24
          } else if (direction.indexOf('N-') !== -1) {
            rotateDegree = direction.split('-')[1]
          }
          let rotate = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(rotateDegree))
          Cesium.Matrix4.multiplyByMatrix3(modelMatrix, rotate, modelMatrix)
          yushuiInstances.push({
            modelMatrix: modelMatrix,
            batchId: id
          })
        } else if (compName === '景观灯') {
          modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(cartesian, new Cesium.HeadingPitchRoll(0, 0, 0))
          Cesium.Matrix4.multiplyByUniformScale(modelMatrix, scale, modelMatrix)
          let rotateDegree = 0
          let rotate = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(rotateDegree))
          Cesium.Matrix4.multiplyByMatrix3(modelMatrix, rotate, modelMatrix)
          jgdengInstance.push({
            modelMatrix: modelMatrix,
            batchId: id
          })
        } else if (compName === '便道桩') {
          let instance = {
            modelMatrix: modelMatrix,
            batchId: id
          }
          if (childType === '柱形') {
            barBdzInstances.push(instance)
          } else {
            sphereBdzInstances.push(instance)
          }
        }
      })
      let treeCollection = this.createInstanceCollection(shu, treeInstances)
      // 垃圾桶
      let ljtStreetCollection = this.createInstanceCollection(lajitongStreet, ljtStreetInstances) // 路两侧的垃圾桶
      let ljtBusinessCollection = this.createInstanceCollection(lajitongBusiness, ljtBusinessInstances) // 商业街的垃圾桶
      let ljtParkCollection = this.createInstanceCollection(lajitongPark, ljtParkInstances) // 公园的垃圾桶
      // 井盖
      let ludengjgCollection = this.createInstanceCollection(jgLudeng, ludengjgInstances, false) // 路灯井盖
      let ranqijgCollection =  this.createInstanceCollection(jgRanqi, ranqijgInstances, false) // 天然气井盖
      let relijgCollection = this.createInstanceCollection(jgReli, relijgInstances, false) // 热力井盖
      let xiaofangjgCollection = this.createInstanceCollection(jgXiangfang, xiaofangjgInstances, false) //消防井盖
      let shangshuijgCollectionN = this.createInstanceCollection(jgShangshuiN, shangshuijgInstancesN, false) // 带花色的上水井盖
      let shangshuijgCollectionO = this.createInstanceCollection(jgShangshuiO, shangshuijgInstancesO, false)  // 不带花色的上水井盖
      let tongxinjgCollection = this.createInstanceCollection(jgTongxin, tongxinjgInstances, false)  // 通信井盖
      let yushuijgCollection = this.createInstanceCollection(jgYushui, yushuijgInstances, false) // 雨水井盖
      // let wushuijgCollection = this.createInstanceCollection(jgWushui, wushuijgInstances, false) // 污水井盖
      // let dianlijgCollection = this.createInstanceCollection(jgDianli, dianlijgInstances, false) // 雨水井盖
      // let gonganjgCollection = this.createInstanceCollection(jgGongan, gonganjgInstances, false) // 公安井盖
      let qitajgCollection = this.createInstanceCollection(jgQita, qitajgInstances, false)
      // 花架
      let huajiaBaseCollection = this.createInstanceCollection(huajiaBase, huajiaBaseInstances) // 花架底座
      let huajiaTreeCollection = this.createInstanceCollection(huajiaTree, huajiaTreeInstances) // 花架里的树
      // 雨水箅子
      let yushuiCollection = this.createInstanceCollection(yushuibizi, yushuiInstances)
      // 路灯
      let ludengCollection = this.createInstanceCollection(ludeng, ludengInstances)
      // 景观灯
      // let jgdengCollection = this.createInstanceCollection(jgdeng, jgdengInstance)
      // 便道桩
      // let barBdzCollection = this.createInstanceCollection(barBdz, barBdzInstances) // 柱形便道桩
      // let sphereCollection = this.createInstanceCollection(sphereBdz, sphereBdzInstances) // 球形便道桩
    },
    /**
     * @description: 创建ModelInstanceCollection来批量加载gltf或者glb格式的三维模型
     * @param {type} 
     * @return: 
     */
    createInstanceCollection (model, instances, lightFlag) {
      if (lightFlag === undefined) lightFlag = true
      let lightColor = lightFlag ? new Cesium.Cartesian3(20, 20, 20) : new Cesium.Cartesian3(1, 1, 1)  
      return this.viewer.scene.primitives.add(new Cesium.ModelInstanceCollection({
        url: model,
        instances: instances,
        imageBasedLightingFactor: new Cesium.Cartesian2(1, 1),
        lightColor: lightColor,
      }))
    },
    /**
     * @description: 加载倾斜摄影数据--Version2（清除道路上树和垃圾桶）
     * @param {type} 
     * @return: 
     */
    load3DTile () {
      const viewer = this.viewer
      // 1. 添加3dTile数据
      this.tileset = new Cesium.Cesium3DTileset({
        // url: this.GLOBAL.baseOrigin+"/3dTiles/tileset.json",
        url: 'http://dev.hnzwdz.com/3dTiles/tileset.json'
        // maximumScreenSpaceError: 2,
        // skipScreenSpaceErrorFactor: 16
      })
      
      viewer.scene.primitives.add(this.tileset)

      // 2. 相机视角
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(113.74159603307372, 34.77766781955999, 2308.593862489063),
        orientation: {
          heading: Cesium.Math.toRadians(30.261103209957636),
          pitch: Cesium.Math.toRadians(-42.77768958916718),
          roll: Cesium.Math.toRadians(0.12395771196527275)
        },
        duration: 2
      })

      // 3. 设置瓦片的model的Matrix，将倾斜摄影数据移动到与地图匹配的位置
      let tilesetArr = Cesium.Cartesian3.fromArray([
        this.tileset.modelMatrix[12],
        this.tileset.modelMatrix[13],
        this.tileset.modelMatrix[14]
      ])
      let center = Cesium.Cartesian3.add(tilesetArr, Cesium.Cartesian3.fromArray([21.6, -48.3, -36.9]), new Cesium.Cartesian3())
      let m = Cesium.Matrix4.fromTranslation(center)
      this.tileset.modelMatrix = m

      // 4. 添加倾斜摄影的单体化数据，主要包括：建筑物、门店、部件
      this.addMonomerData()
      this.scenePick()
    },
    /**
     * @description: 添加倾斜摄影的单体化数据--建筑物、门店、部件
     * @param {type} 
     * @return: 
     */
    addMonomerData () {
      const viewer = this.viewer
      
      // 1. 添加单体化数据——建筑物（由polygon--》polygon类型，给高度）
      BuildingData.features.forEach(feature => {
        const instance = new Cesium.GeometryInstance({
          id: feature.properties.id,
          geometry: new Cesium.PolygonGeometry.fromPositions({
            positions: Cesium.Cartesian3.fromDegreesArray([].concat.apply([], feature.geometry.coordinates[0][0])),
            extrudedHeight: 100,
            vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL
          }),
          attributes : {
            color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.AQUA.withAlpha(0.01))
          }
        })
        viewer.scene.primitives.add(new Cesium.ClassificationPrimitive({
          geometryInstances: instance,
          appearance : new Cesium.PerInstanceColorAppearance(),
          classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
          releaseGeometryInstances: false
        }))
      })
      // 2. 添加单体化数据——门店（由line--》wall类型）
      orgData.features.forEach(feature => {
        let minHeight = feature.properties.minHeight
        let maxHeight = feature.properties.maxHeight
        const id = feature.properties.id
        const instance = new Cesium.GeometryInstance({
          id:  id,
          geometry: new Cesium.WallGeometry({
            positions: Cesium.Cartesian3.fromDegreesArray([].concat.apply([], feature.geometry.coordinates[0])),
            granularity: 5,
            maximumHeights: Array(feature.geometry.coordinates[0].length).fill(maxHeight), // 最高高度
            minimumHeights: Array(feature.geometry.coordinates[0].length).fill(minHeight), // 最低高度
            vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL
          }),
          attributes : {
            color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.BLUE.withAlpha(0.01))
          }
        })
        viewer.scene.primitives.add(new Cesium.Primitive({
          geometryInstances: instance,
          appearance : new Cesium.PerInstanceColorAppearance(),
          releaseGeometryInstances: false
        }))
      })

      // 3. 添加单体模型——部件
      let instances = []
      let ludengjgInstances = [], ranqijgInstances = [], relijgInstances = [], xiaofangjgInstances = [], shangshuijgInstances = [], shangshuijgInstancesO = [], 
          tongxinjgInstances = [], yushuijgInstances = [], wushuijgInstances = [], dianlijgInstances = [], gonganjgInstances = [], qitajgInstances = []
      let lajitongInstances = []
      let shumuInstances = []
      let ludengInstances = []
      compData.features.forEach(feature => {
        const id = feature.properties.id
        const compName = feature.properties.名称
        // 3.1. 获取点在倾斜摄影数据表面/地表的坐标
        let clampedCartesian = feature.properties.clampedCartesian 
        let cartesian = clampedCartesian ? 
            new Cesium.Cartesian3(clampedCartesian.x, clampedCartesian.y, clampedCartesian.z) :
            Cesium.Cartesian3.fromDegrees(feature.geometry.coordinates[0],feature.geometry.coordinates[1]) 

        // 3.2. 创建不同部件的instance实例（偏移、旋转、放大），并push入对应的部件实例集合中
        let modelMatrix, rotateDegree, scale, offset
        if (compName.indexOf('井盖') != -1) {
          offset = Cesium.Cartesian3.fromArray([0, 0, -0.07])
          cartesian = Cesium.Cartesian3.add(cartesian, offset,  new Cesium.Cartesian3())
          rotateDegree = Math.random() * 360
          scale = 2.5
          modelMatrix = this.cartesianToMatrix4(cartesian, scale, rotateDegree)
          const instance = {
            batchId: `${id}_jinggai`,
            modelMatrix: modelMatrix 
          }
          switch (compName) {
            case '路灯井盖': 
              ludengjgInstances.push(instance)
              break;
            case '天然气井盖':
              ranqijgInstances.push(instance)
              break;
            case '热力井盖': 
              relijgInstances.push(instance)
              break;
            case '给水井盖':
              shangshuijgInstances.push(instance)
              break;
            case '通信井盖' || '通讯井盖' :
              tongxinjgInstances.push(instance)
              break;
            case '雨水井盖':
              yushuijgInstances.push(instance)
              break;
            case '污水井盖':
              wushuijgInstances.push(instance)
              break;
            case '电力井盖':
              dianlijgInstances.push(instance)
              break;
            case '公安井盖':
              gonganjgInstances.push(instance)
              break;
            case '消防井盖':
              xiaofangjgInstances.push(instance)
              break;
            default:
              qitajgInstances.push(instance)
              break;
          }
        } else if (compName === '垃圾箱') {
          scale = 1
          rotateDegree = feature.properties.angle
          modelMatrix = this.cartesianToMatrix4(cartesian, scale, rotateDegree)
          const instance = {
            batchId: `${id}_lajitong`,
            modelMatrix: modelMatrix
          }
          lajitongInstances.push(instance)
        } else if (compName === '树木') {
          scale = 1
          modelMatrix = this.cartesianToMatrix4(cartesian, scale)
          const instance = {
            batchId: `${id}_shumu`,
            modelMatrix: modelMatrix
          }
          shumuInstances.push(instance)
        } else if (compName === '路灯') {
          scale = 1
          rotateDegree = feature.properties.angle
          modelMatrix = this.cartesianToMatrix4(cartesian, scale, rotateDegree)
          const instance = {
            batchId: `${id}_ludeng`,
            modelMatrix: modelMatrix
          }
          ludengInstances.push(instance)
        }
      })
      // 3.3. 创建ModelInstanceCollection来批量加载gltf或者glb格式的三维模型
      this.createInstanceCollection(jgQita, ludengjgInstances, false) // 路灯井盖
      this.createInstanceCollection(jgQita, ranqijgInstances, false) // 天然气井盖
      this.createInstanceCollection(jgQita, relijgInstances, false) // 热力井盖
      this.createInstanceCollection(jgQita, xiaofangjgInstances, false) //消防井盖
      this.createInstanceCollection(jgQita, shangshuijgInstances, false) // 带花色的上水井盖
      this.createInstanceCollection(jgQita, shangshuijgInstancesO, false)  // 不带花色的上水井盖
      this.createInstanceCollection(jgQita, tongxinjgInstances, false)  // 通信井盖
      this.createInstanceCollection(jgQita, yushuijgInstances, false) // 雨水井盖
      this.createInstanceCollection(jgQita, wushuijgInstances, false) // 污水井盖
      this.createInstanceCollection(jgQita, dianlijgInstances, false) // 雨水井盖
      this.createInstanceCollection(jgQita, gonganjgInstances, false) // 公安井盖
      this.createInstanceCollection(jgQita, qitajgInstances, false)
      this.createInstanceCollection(shu, shumuInstances) // 树木
      // 垃圾桶
      this.createInstanceCollection(lajitongStreet, lajitongInstances) // 路两侧的垃圾桶
      this.createInstanceCollection(ludeng, ludengInstances) // 路灯
    },
    /**
     * @description: 将世界坐标、尺度因子、旋转角度整合为四维的变换矩阵
     * @param {*} cartesian Object 世界坐标
     * @param {*} scale Number 尺度因子
     * @param {*} rotateDegree Number 旋转角度
     * @return {*}
     */
    cartesianToMatrix4 (cartesian, scale, rotateDegree) {
      let modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(cartesian, new Cesium.HeadingPitchRoll(0, 0, 0))
      Cesium.Matrix4.multiplyByUniformScale(modelMatrix, scale, modelMatrix)
      if (rotateDegree) {
        const rotate = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(rotateDegree))
        Cesium.Matrix4.multiplyByMatrix3(modelMatrix, rotate, modelMatrix)
      }
      return modelMatrix
    },
    /**
     * @description: 选择部件类型去铺点
     * @param {String} type
     * @return: 
     */
    getCompLayer (type) {
      this.infoBoxVisible = false
      this.carInfoVisible = false
      this.carTrackVisible = false
      this.bindPromptVisible = false
      this.handleClose();
      this.$el.style.cursor = 'default'
      this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
      
      if (type === '人员') {
        this.compLayerControl('person')
      } else if (type === '摄像头') {
        this.compLayerControl('video')
      } else if (type === '车辆') {
        this.compLayerControl('car')
      } else if (type === '案件') {
        this.compLayerControl('case')
      } else if (type === '门店') {
        this.compLayerControl('shop')
      } else if (type === '部件') {
        this.compLayerControl('part')
      }
      this.scenePick()
    },
    /**
     * @description: 根据类型创建或显示图层（dataSource）
     * @param {String} type
     * @return: 
     */
    compLayerControl (type) {
      const viewer = this.viewer
      const dataSources = viewer.dataSources
      let ds

      // 1. 地图中有该类型的数据层：获取并显示该数据层，其他数据层隐藏
      if (dataSources.getByName(type+this.sceneMode).length > 0) {
        for (let i = 0; i < viewer.dataSources.length; i++) {
          let _ds = dataSources.get(i)
          if (_ds.name === type+this.sceneMode) {
            _ds.show = true
            viewer.zoomTo(_ds)
            ds = _ds
          } else {
            _ds.show = false
          }
        }
      } else { 
        // 2. 地图中无该类型的数据层
        // 2.1. 隐藏其他数据层
        if (dataSources.length > 0) {
          for (let i = 0; i < viewer.dataSources.length; i++) {
            dataSources.get(i).show = false
          }
        }
        // 2.2. 创建类型对应的数据层
        ds = new Cesium.CustomDataSource(type+this.sceneMode)
        dataSources.add(ds)
        // 2.3. 根据类型请求数据并打点（到对应图层），缩放到图层点的范围
        this.addPointInLayer(type, ds)
      }
    },
    /**
     * @description: 根据类型及当前维度获取图标，请求数据并打点（到对应图层），缩放到图层点的范围
     * @param {String} type
     * @param {Cesium.CustomDataSource} ds
     * @return: 
     */
    addPointInLayer (type, ds) {
      const viewer = this.viewer
      // 1. 根据类型及当前维度获取需显示的图标
      if(this.sceneMode == '3D'){
        var img = {
          person: {
            online: require('../../static/images/icon/人员_在线.svg'),
            offline: require('../../static/images/icon/人员_不在线.svg')
          },
          video: {
            online: require('../../static/images/icon/摄像头_在线.svg'),
            offline: require('../../static/images/icon/摄像头_不在线.svg')
          },
          car: {
            online: require('../../static/images/icon/车辆_在线.svg'),
            offline: require('../../static/images/icon/车辆_不在线.svg')
          },
          case: require('../../static/images/icon/案件.svg'),
        }
      }else{
        var img = {
          person: {
            online: require('../../static/images/icon/person_2.svg'),
            offline: require('../../static/images/icon/person_1.svg')
          },
          video: {
            online: require('../../static/images/icon/video_2.svg'),
            offline: require('../../static/images/icon/video_1.svg')
          },
          car: {
            online: require('../../static/images/icon/car_2.svg'),
            offline: require('../../static/images/icon/car_1.svg')
          },
          case:{
            onGoing: require('../../static/images/icon/case_1.svg'),
            closed: require('../../static/images/icon/case_3.svg'),
          },
          shop: require('../../static/images/icon/shop.svg'),
          part: require('../../static/images/icon/part.svg')
        }
      }
      
      // 2. 请求数据并打点（到对应图层）
      if (type === 'person') {
        const param = {isShowOnline: '0', isAllOnline: '0'};
        const url = '/command/aSignIn/getUserPoint';
        const msg = '暂无人员信息';
        this.requestPointData(param,url,msg).then( points => {
          points && points.length > 0 &&
          points.forEach( item => {
            if (item.longitude && item.latitude) {
              item.isAppOnline === 1 ? this.addBillboard(item, img.person.online, ds, type) : 
                                       this.addBillboard(item, img.person.offline, ds, type)
            }
          })
          viewer.zoomTo(ds)
        })
      } else if ( type === 'video' ) {
        const param = {};
        const url = '/video/video/listData';
        const msg = '暂无摄像头信息';
        this.requestPointData(param,url,msg).then( points => {
          points && points.length > 0 &&
          points.forEach( item => {
            item.isOnline === 1 ? this.addBillboard(item, img.video.online, ds, type) :
                                  this.addBillboard(item, img.video.offline, ds, type)
          })
          viewer.zoomTo(ds)
        })
      } else if ( type === 'car') {
        const param = {};
        const url = '/slagcars/slagcars/listAll.json';
        const msg = '暂无车辆信息';
        this.requestPointData(param,url,msg).then( points => {
          points.forEach( item => {
            if (item.longitude && item.latitude) {
              item.isOnline === 1 ? this.addBillboard(item, img.car.online, ds, type) :
                                    this.addBillboard(item, img.car.offline, ds, type)
            }
          })
          viewer.zoomTo(ds)
        })
      } else if (type === 'case') {
        const param = {countyName: this.userInfo.currentLevelName};
        const url = '/event/eventInfo/queryListForMap';
        const msg = '暂无案件信息';
        this.requestPointData(param,url,msg).then( points => {
          points.forEach( item => {
            if (item.longitude && item.latitude && !this.out_of_china(item.longitude, item.latitude)) {
              if(this.sceneMode == '3D'){
                this.addBillboard(item, img.case, ds, type)
              }else{
                if(item.eventPhase == 6){
                  this.addBillboard(item, img.case.closed, ds, type)
                }else{
                  this.addBillboard(item, img.case.onGoing, ds, type)
                }
              }
            }
          })
          viewer.zoomTo(ds)
        })
      }else if(type === 'shop'){
        const param = {orgIsShop: "1",pageSize:99999};
        const url = '/org/torgInfo/listData';
        const msg = '暂无门店信息';
        this.requestPointData(param,url,msg,type).then( points => {
          points.forEach( item => {
            if (item.longitude && item.latitude && !this.out_of_china(item.longitude, item.latitude)) {
              this.addBillboard(item, img.shop, ds, type)
            }
          })
          viewer.zoomTo(ds)
        })
      }else if(type === 'part'){
        const param = {pageSize:30};
        const msg = '暂无部件信息';
        this.$thirdUrl('component_outer', '/res/resource/component/basicComponent/queryCompList', (url)=>{
          this.requestPointData(param,url,msg,type).then( points => {
            points.forEach( item => {
              if (item.longitude && item.latitude && !this.out_of_china(item.longitude, item.latitude)) {
                this.addBillboard(item, img.part, ds, type)
              }
            })
            viewer.zoomTo(ds)
          })
        })
      }
    },
    /**
     * @description: 打点--点为图片格式
     * @param {Object} item 属性数据，里边的经纬度是【高德坐标】
     * @param {url} url
     * @param {Cesium.CustomDataSource} ds
     * @param {String} type
     * @return: 
     */
    addBillboard (item, url, ds, type) {
      // let lnglat = this.gcj02towgs84(item.longitude, item.latitude) // 高德坐标转换为wgs84坐标
      let entity = ds.entities.add({
        name: type,
        position: Cesium.Cartesian3.fromDegrees(item.longitude, item.latitude),
        billboard:{
          image: url,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          scale: this.sceneMode=='3D'?1:0.3,  //scale>1在自身大小的基础上翻倍，为-1时倒置
        }
      })
      entity.property = item 
      return entity
    },
    /**
     * @description: 点实体的聚合
     * @param {dataSource} 
     * @return: 
     */
    cluster (dataSource) {
      dataSource.clustering.enabled = true
      let removeListener
      let pinBuilder = new Cesium.PinBuilder()
      const singleDigitPins = {}
      if (Cesium.defined(removeListener)) {
            removeListener()
            removeListener = undefined
        } else {
          removeListener = dataSource.clustering.clusterEvent.addEventListener( (clusteredEntities, cluster) => {
            let count = clusteredEntities.length
            cluster.billboard.show = true
            cluster.label.show = false //聚合后的label使不显示
            cluster.billboard.id = cluster.label.id
            cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM
            // 根据点聚合的数量确定图片
            if (!singleDigitPins[count]) {
              singleDigitPins[count] = pinBuilder.fromText(count, Cesium.Color.BLUE, 48).toDataURL()
            }
            cluster.billboard.image = singleDigitPins[count]
          }
        )
      }
    },
    /**
     * 获取铺点数据通用方法
     */
    requestPointData(param,url,msg,type){
      return new Promise( resolve => {
        this.$post(url, param).then( res => {
          if(type == 'shop' || type == 'part'){
            if (res && res.data && res.data.list.length === 0) {
              this.$message({ message: msg, type: 'warning' })
            }
            const data = res.data.list || []
            resolve(data)
          }else{
            if (res && res.data && res.data.length === 0) {
              this.$message({ message: msg, type: 'warning' })
            }
            const data = res.data || res.list || []
            resolve(data)
          }
        })
      })
    },
    /**
     * @description: 建筑物模型的点击事件--version1
     * @param {type} 
     * @return: 
     */
    scenePickVersion1 () {
      const viewer = this.viewer

        // 鼠标点击单体，显示其属性
      viewer.screenSpaceEventHandler.setInputAction(e => {
        this.infoBoxVisible = false
        let picked = viewer.scene.pick(e.position)
        if (Cesium.defined(this.select.feature)) {
          if (!Cesium.defined(this.select.feature.color)) return
          this.select.feature.color = this.select.attributes
          this.select.feature = undefined
        }
        if (Cesium.defined(this.selectModel)) {
          this.selectModel = undefined
        }
        
        if (Cesium.defined(this.selectEntity)) {
          this.selectEntity = undefined
        }
  
        if (Cesium.defined(picked)) {
          let matrix, cartesian3, lnglat
          if (picked instanceof Cesium.Cesium3DTileFeature) {
            this.select.feature = picked
            matrix = this.select.feature.content._model.modelMatrix
            Cesium.Color.clone(picked.color, this.select.attributes)
            picked.color = Cesium.Color.YELLOW
            let cartesian3 = new Cesium.Cartesian3(matrix[12], matrix[13], matrix[14])
            this.initInfobox(cartesian3)
            const modelId = this.select.feature.getProperty('id')
            const param = {modelId: modelId};
            this.getSingleDetail(param,'model_shop')
            // lnglat = this.cartesian2Wgs84(cartesian3)
            // viewer.camera.setView({
            //   destination: Cesium.Cartesian3.fromDegrees(lnglat.lng, lnglat.lat - 0.003, lnglat.alt + 100),
            //   orientation: {
            //     heading: Cesium.Math.toRadians(0),
            //     pitch: Cesium.Math.toRadians(-28),
            //     roll: Cesium.Math.toRadians(0)
            //   }
            // })
          } else if (picked instanceof Cesium.ModelInstance) {
            this.selectModel = picked
            matrix = this.selectModel._modelMatrix
            // this.selectModel.properties =  compData.features.find( item => this.selectModel._instanceId === item.properties.SurveyNO 
            //                                                             || this.selectModel._instanceId === item.properties.SurveyNO + '-tree').properties
            let cartesian3 = new Cesium.Cartesian3(matrix[12], matrix[13], matrix[14])
            
            this.initInfobox(cartesian3)
            // let compName = this.selectModel.properties.CompName
            const modelId = this.selectModel._instanceId;
            const param = {modelId: modelId}
            // if (compName && compName.indexOf('井盖') !== -1) {
            this.getSingleDetail(param,'model_part')
            // } else {
            //   this.infoBoxVisible = true
            // }
            
            // lnglat = this.cartesian2Wgs84(cartesian3)
            // viewer.camera.setView({
            //   destination: Cesium.Cartesian3.fromDegrees(lnglat.lng - 0.0006, lnglat.lat, lnglat.alt + 50),
            //   orientation: {
            //     heading: Cesium.Math.toRadians(80),
            //     pitch: Cesium.Math.toRadians(-33),
            //     roll: Cesium.Math.toRadians(0)
            //   }
            // })
          } else if (picked.id instanceof Cesium.Entity) {
            this.carTrackVisible = false
            this.selectEntity = picked.id
            cartesian3 = this.selectEntity.position.getValue()
            this.initInfobox(cartesian3)
            this.infoBoxVisible=true;
            if (this.selectEntity.name === 'shop') {
              this.select.feature = {};
              this.select.feature.detail = this.selectEntity.property
            }
            if (this.selectEntity.name === 'part') {
              this.selectModel = {};
              this.selectModel.detail = this.selectEntity.property
            }
            // if (this.selectEntity.name === 'video') {
            //    const param = {
            //     id: this.selectEntity.property.id
            //   }
            //   this.$get('video/video/querySingle', param, res => {
            //     console.log(res)
            //     this.infoBoxVisible = this.infoBoxVisible || true
            //   })
            // } else if (this.selectEntity.name === 'car') {
            //   const param = {
            //     car_number: this.selectEntity.property.carNo
            //   }
            //   this.$post('http://192.168.1.180:8021/extend/car/basic/info').then( res => {
            //     console.log(res)
            //   })
            // }
            if (this.selectEntity.name === 'case') {
              this.infoBoxVisible=false;
              window.parent.popHome.getCaseDetail(this.selectEntity.property.id)
            }

            // lnglat = this.cartesian2Wgs84(cartesian3)
            // viewer.camera.setView({
            //   destination: Cesium.Cartesian3.fromDegrees(lnglat.lng, lnglat.lat-0.0015, lnglat.alt + 200),
            //   orientation: {
            //     heading: Cesium.Math.toRadians(0),
            //     pitch: Cesium.Math.toRadians(-45.11690269384763),
            //     roll: Cesium.Math.toRadians(0)
            //   }
            // })
          }
        } else {
          this.infoBoxVisible = false
        }  
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    },
    /**
     * @description: 倾斜摄影--cesium视图的点击事件--倾斜摄影数据version2(去除倾斜摄影上路边的树、垃圾桶、停放的车辆等)
     * @param {type} 
     * @return: 
     */
    scenePick () {
      const viewer = this.viewer
      let attributes, currentColor, currentShow

      // 1. 创建可以匹配树木、垃圾桶、井盖、路灯等部件的盒子，使点击单体部件时可以高亮
      const shumuBox = Cesium.BoxGeometry.fromDimensions({
        vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL,
        dimensions: new Cesium.Cartesian3(5, 5, 16)
      })
      const lajitongBox = Cesium.BoxGeometry.fromDimensions({
        vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL,
        dimensions: new Cesium.Cartesian3(1.5, 1.5, 3)
      })
      const jinggaiBox = Cesium.BoxGeometry.fromDimensions({
        vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL,
        dimensions: new Cesium.Cartesian3(0.6, 0.6, 0.3)
      })
      const ludengBox = Cesium.BoxGeometry.fromDimensions({
        vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL,
        dimensions: new Cesium.Cartesian3(1, 1, 23)
      })
      const boxRotate = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(45))

      // 2. 定义全局的单击事件
      viewer.screenSpaceEventHandler.setInputAction(e =>{
        const picked = viewer.scene.pick(e.position)
        // 2.1. 拾取的是空或3dTile：不作处理
        if (!Cesium.defined(picked) || picked.primitive instanceof Cesium.Cesium3DTileset) return
        // 2.2. 清除置空已有的高亮的建筑（primitive）、部件盒子（box）
        // 2.2.1. 若已有高亮的建筑，清除其高亮
        if (Cesium.defined(this.select.feature) && Cesium.defined(this.select.feature.primitive)) {
          if (picked.id === this.select.feature.id) return
          attributes = this.select.feature.primitive.getGeometryInstanceAttributes(this.select.feature.id)
          attributes.show = [0]
          attributes.color = [0, 0, 255, 1]
          attributes = {}
          this.select.feature = undefined
          this.select.type = undefined
        }
        // 2.2.2. 若已有高亮的部件，清除其高亮
        if (Cesium.defined(this.selectModel) && this.selectModel.instanceId) {
          if (picked.instanceId === this.selectModel.instanceId) return
          this.selectModel = undefined
          viewer.scene.primitives.remove(this.selectModelBox)
        }
        // 2.2.3. 若已有选中的billboard的实体，清空
        if (Cesium.defined(this.selectEntity)) {
          if (picked.id.id === this.selectEntity.id) return
          this.selectEntity = undefined
        }
        
        // 2.3. 当前拾取的是部件（modelInstance）
        if (picked instanceof Cesium.ModelInstance) {
          // 2.3.1. 获取拾取的modelInstance的世界坐标，并转化为转移矩阵
          this.selectModel = picked
          let matrix = this.selectModel.modelMatrix
          let centerCartesian =  new Cesium.Cartesian3(matrix[12], matrix[13], matrix[14])
          Cesium.Matrix4.multiplyByMatrix3(matrix, boxRotate, matrix)

          // 2.3.2. 获取拾取的modelInstance的类型，添加对应的高亮盒子
          const type = this.selectModel.instanceId.split('_')[1]
          let box
          switch (type) {
            case 'shumu':
              box = shumuBox
              break
            case 'jinggai':
              box = jinggaiBox
              break
            case 'ludeng':
              box = ludengBox
              break
            case 'lajitong':
              box = lajitongBox
              break
          }
          this.selectModelBox = viewer.scene.primitives.add(new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
              id: 'select-model',
              geometry: box,
              modelMatrix: matrix,
              attributes : {
                color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.YELLOW.withAlpha(0.5))
              }
            }),
            appearance : new Cesium.PerInstanceColorAppearance(),
            releaseGeometryInstances: false
          }))

          // 2.3.4. 初始化info弹出框的位置
          this.initInfobox(centerCartesian)
          // 2.3.5. 获取部件的详情，并展示在info弹出框中
          const id = this.selectModel.instanceId.split('_')[0]
          const param = {modelId: id}
          this.getSingleDetail(param, 'model_part')
          return
        }

        // 2.4. 当前拾取的是门店（2d）、部件（2d）、人员（2d/3d）、摄像头(2d/3d)、车辆(2d/3d)、案件(2d/3d)等实体
        if (picked.id instanceof Cesium.Entity) {

          // 2.4.1. 隐藏车辆轨迹，初始化info弹出框的位置
          this.carTrackVisible = false
          this.selectEntity = picked.id
          let centerCartesian = this.selectEntity.position.getValue()
          this.initInfobox(centerCartesian)
          this.infoBoxVisible = true
          // 2.4.2. 拾取的是门店
          if (this.selectEntity.name === 'shop') {
            this.select.feature = {};
            this.select.feature.detail = this.selectEntity.property
          }

          // 2.4.3. 拾取的是部件
          if (this.selectEntity.name === 'part') {
            this.selectModel = {};
            this.selectModel.detail = this.selectEntity.property
          }
        } else {

          // 2.5. 当前拾取的是门店（3d）、建筑（3d）
          const pickedGeom = picked.primitive.geometryInstances.geometry
          // 2.5.1. 拾取的是建筑（3d）
          if (pickedGeom instanceof Cesium.PolygonGeometry) { 
            // 高亮
            this.select.feature = picked
            this.select.type = 'building'
            var attributes = picked.primitive.getGeometryInstanceAttributes(picked.id)
            attributes.color = [255, 255, 0, 128]
            attributes.show = [1]
            // 获取中心点坐标
            const buildingId =  picked.id
            let feature = BuildingData.features.find(feature => feature.properties.id === buildingId)
            let centerCartesian = Cesium.Cartesian3.fromDegrees(feature.properties.center_lon, feature.properties.center_lat)
            // 显示信息框
            this.initInfobox(centerCartesian)
            const param =  {modelId: buildingId} 
            this.getSingleDetail(param, 'model_building')
            
          } else if (pickedGeom instanceof Cesium.WallGeometry) {
            // 2.5.1. 拾取的是门店（3d）
            // 高亮
            this.select.feature = picked
            this.select.type = 'shop'
            let attributes = picked.primitive.getGeometryInstanceAttributes(picked.id)
            attributes.color = [255, 255, 0, 128]
            attributes.show = [1]
            const orgId =  picked.id
            let feature = orgData.features.find(feature => feature.properties.id === orgId)
            // 计算中心点坐标
            let height = picked.primitive.geometryInstances.geometry._maximumHeights[0]
            let centerCartesian = Cesium.Cartesian3.fromDegrees(feature.properties.center_lon, feature.properties.center_lat, height)
            // 显示信息框
            this.initInfobox(centerCartesian)
            const param =  {modelId: orgId}
            this.getSingleDetail(param,'model_shop')
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    },
    /**
     * @description: 获取一条线上的中心点
     * @param {Cesium.Cartesian3} cartesian3
     * @return: 
     */
    getLineCenter (positions) {
      let center = {x: 0, y: 0, z: 0}
      positions.forEach(item => {
        center.x = item.x + center.x
        center.y = item.y + center.y
        center.z = item.z + center.z
      })
      center.x = center.x / positions.length
      center.y = center.y / positions.length
      center.z = center.z / positions.length
      return new Cesium.Cartesian3(center.x, center.y, center.z)
    },
    /**
     * @description: 世界坐标--》wgs1984地理坐标
     * @param {Cesium.Cartesian3} cartesian3
     * @return: 
     */
    cartesian2Wgs84 (cartesian3) {
      let cartograhphic = Cesium.Cartographic.fromCartesian(cartesian3)
      return {
        lat: Cesium.Math.toDegrees(cartograhphic.latitude),
        lng: Cesium.Math.toDegrees(cartograhphic.longitude),
        alt: cartograhphic.height
      }
    },
    /**
     * @description: 初始化info弹出框，并实时监听其世界坐标，保证对地图进行移动、旋转等操作时info框能随之移动
     * @param {type} 
     * @return: 
     */
    initInfobox (cartesian) {
      const viewer = this.viewer
      this.infoBoxVisible = false
      this.windowPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, cartesian)
      let removeHandler = viewer.scene.postRender.addEventListener( () => {
        this.windowPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, cartesian)
      })
    },
    /**
     * @description: 关闭info弹出框
     * @param {type} 
     * @return: 
     */
    closeInfoBox () {
      this.infoBoxVisible = false
      // 1. 移除高亮的部件点的盒子
      this.viewer.scene.primitives.remove(this.selectModelBox)
      // 2. 移清除高亮的门店、建筑
      if (Cesium.defined(this.select.feature)) {
        let attributes = this.select.feature.primitive.getGeometryInstanceAttributes(this.select.feature.id)
        attributes.show = [0]
        attributes.color = [0, 0, 255, 1]
        attributes = {}
        this.viewer.scene.primitives.remove(this.select.feature)
        this.select.feature = undefined
      }
    },
    /**
     * @description: 案件登记
     * @param {type} 
     * @return: 
     */
    register () {
      const viewer = this.viewer
      // 1. 移除全局的单击事件
      viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
      
      // 2. 若已存在登记点，移除打点的单击操作，不可再进行打点的操作
      if (Cesium.defined(this.drawEntity)) {
        viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
        return
      }

      // 3. 隐藏info框，移除地图上的所有图层
      this.infoBoxVisible = false
      viewer.dataSources.removeAll()
      viewer.entities.removeAll()
      
      // 4. 添加全局的单击事件----案件登记事件
      this.$el.style.cursor = 'crosshair'
      viewer.screenSpaceEventHandler.setInputAction(this.addPointAndConfirm, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    },
    /**
     * @description: 案件登记--打点并反查地址
     * @param {type} 
     * @return: 
     */
    addPointAndConfirm (e) {
      const viewer = this.viewer  
      
      // 1. 只进行一次打点操作
      if (Cesium.defined(this.drawEntity)) {
        viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
        return 
      }

      // 2. 获取点击的位置，在地图上添加案件登记点
      let cartesian = viewer.camera.pickEllipsoid(e.position, viewer.scene.globe.ellipsoid)
      this.drawEntity = this.addPoint(cartesian)

      this.$el.style.cursor = 'default'

      // 3. 弹出地址确认框
      this.confirmVisible = true
      let lnglat = this.cartesian2Wgs84(cartesian) 
      this.confirmLnglat = lnglat // cgcs2000坐标
      // 3.1. 查询所属机构（高德坐标）
      this.confirmLnglatGd = this.wgs84togcj02(lnglat.lng, lnglat.lat) // 高德坐标
      this.getOrg(this.confirmLnglatGd)
      // 3.2. 查询结构化地址（cgcs2000，天地图api）
      this.$get(`http://api.tianditu.gov.cn/geocoder?postStr={'lon':${lnglat.lng},'lat':${lnglat.lat},'ver':1}&type=geocode&tk=76892c38deab957e65556e5824ca53e9`)
        .then( res => {
          if (res.status == '0' && res.result) {
            this.confirmAddress = res.result.formatted_address
          } 
          // 3.3. 为案件登记点添加事件，使其可以拖拽并更新地址确认框中的内容
          this.movePoint()
        })
    },
    /**
     * @description: 登记案件--打点
     * @param {type} 
     * @return: 
     */
    addPoint(cartesian) {
      const viewer = this.viewer
      let option = {
        name: '登记点',
        position: cartesian,
        ellipse: {
          semiMinorAxis: 100,
          semiMajorAxis: 100,
          material: new Cesium.CircleWaveMaterialProperty({
            duration: 2e3,
            gradient: 0,
            color: Cesium.Color.fromCssColorString('#FF0000'),
            count: 2
          })
        }
      }
      if (this.viewer.scene.mode === Cesium.SceneMode.SCENE3D) {
        option.ellipse.heightReference = Cesium.HeightReference.NONE
      } else {
        option.ellipse.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND
        option.ellipse.height = 5
      }
      return viewer.entities.add(option)
    },
    /**
     * @description: 登记案件--点可拖拽，并更新地址确认框中内容--所属机构、结构化地址
     * @param {type} 
     * @return: 
     */
    movePoint () {
      const viewer = this.viewer
      let leftDownDrag = false
      let pointDraged = null
      
      this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
      
      // 1. 添加 鼠标按下 事件
      this.handler.setInputAction( e => {
        this.$el.style.cursor = 'move'
        // 1.1. 获取待拖拽的登记点，对鼠标按下进行标识
        pointDraged = viewer.scene.pick(e.position)
        leftDownDrag = true
        // 1.2. 获取到登记点后，暂停视图的旋转/移动事件
        if (!pointDraged) return
        if (pointDraged.id && pointDraged.id.name === '登记点') {
          this.viewer.scene.mode === Cesium.SceneMode.SCENE3D ? viewer.scene.screenSpaceCameraController.enableRotate = false :
                                                                viewer.scene.screenSpaceCameraController.enableTranslate = false
        }
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN)

      // 2. 添加 鼠标移动 事件--根据鼠标位置更新登记点的位置
      this.handler.setInputAction( e => {
        if (leftDownDrag === true && pointDraged != null) {
          let ray = viewer.camera.getPickRay(e.endPosition)
          let cartesian = viewer.scene.globe.pick(ray, viewer.scene)
          pointDraged.id.position = new Cesium.CallbackProperty( () => {
            return cartesian
          }, false)
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

      // 3. 添加 鼠标释放 事件
      this.handler.setInputAction( () => {
        // 3.1. 光标恢复为默认样式
        this.$el.style.cursor = 'default'
        if (!pointDraged) return

        // 3.2. 获取拖拽后的登记点坐标
        let lnglat = this.cartesian2Wgs84(pointDraged.id.position.getValue())
        // 3.3. 更新【地址确认框】的所属机构（高德坐标）
        this.confirmLnglatGd = this.wgs84togcj02(lnglat.lng, lnglat.lat)
        this.getOrg(this.confirmLnglatGd)
        // 3.4. 更新【地址确认框】的结构化地址（cgcs2000，天地图api）
        this.$get(`http://api.tianditu.gov.cn/geocoder?postStr={'lon':${lnglat.lng},'lat':${lnglat.lat},'ver':1}&type=geocode&tk=76892c38deab957e65556e5824ca53e9`)
          .then( res => {
            if (res.status == '0' && res.result) {
            this.confirmAddress = res.result.formatted_address
            } 
          })
        // 3.5. 标识鼠标按下事件为false
        leftDownDrag = false
        pointDraged = null
        // 3.6. 恢复视图的旋转/移动事件
        this.viewer.scene.mode === Cesium.SceneMode.SCENE3D ? viewer.scene.screenSpaceCameraController.enableRotate = true :
                                                              viewer.scene.screenSpaceCameraController.enableTranslate = true
      }, Cesium.ScreenSpaceEventType.LEFT_UP)

      
    },
    /**
     * @description: 登记案件--地址反查（结构化地址-->经纬度）
     * @param {type} 
     * @return: 
     */
    search () {
      const viewer = this.viewer
      // 结构化地址-->经纬度（天地图api）
      this.$get(`http://api.tianditu.gov.cn/geocoder?ds={"keyWord":"郑州市${this.confirmAddress}"}&tk=76892c38deab957e65556e5824ca53e9`)
        .then( res => {
          if (res.status == 0 && res.location) {
            // 1. 移除登记点
            viewer.entities.remove(this.drawEntity)
            // 2. 添加新的登记点
            let cartesian = Cesium.Cartesian3.fromDegrees(res.location.lon, res.location.lat)
            this.drawEntity = this.addPoint(cartesian)
            viewer.zoomTo([this.drawEntity])
            // 3. 更新【地址确认框】的所属机构（高德坐标）
            this.confirmLnglatGd = this.wgs84togcj02(lnglat.lng, lnglat.lat) // 高德坐标
            this.getOrg(this.confirmLnglatGd)
          } else {
            this.$message({
              message: '地址不存在',
              type:'warning'
            })
          }
        })
    },
    /**
     * @description: 登记案件--【地址确认框】的地址确认
     * @param {type} 
     * @return: 
     */
    comfirmRegister () {
      const viewer = this.viewer
      // this.confirmVisible = false // 打包时显示
      // this.viewer.entities.remove(this.drawEntity) 
      // this.drawEntity = undefined 

      // window.parent.popHome.updateCaseAddress({ // 打包时显示
      //     address: this.confirmAddress,
      //     latitude: this.confirmLnglatGd[0],
      //     longitude: this.confirmLnglatGd[1]
      //   }, this.org.data)

      // 1. 移除 案件登记 的拖动事件
      if (this.handler) {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN)
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP)
      }
      
      // 2. 移除 案件登记 的点击事件
      viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)

      // 3. 恢复全局的单击事件
      this.scenePick()
    },
    /**
     * @description: 登记案件--取消登记
     * @param {type} 
     * @return: 
     */
    cancleRegister () {
      const viewer = this.viewer
      // 1. 移除 登记点
      viewer.entities.remove(this.drawEntity)
      this.drawEntity = undefined
      
      // 2. 隐藏 地址确认框，移除 案件登记 的拖动事件
      this.confirmVisible = false
      if (this.handler) {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN)
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP)
      }

      // 3. 移除 案件登记的 点击事件
      viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)

      this.scenePick()
    },
    /**
     * @description: 登记案件--【地址确认框】中的删除点操作
     * @param {type} 
     * @return: 
     */
    removeRegisterPoint () {
      this.viewer.entities.remove(this.drawEntity)
      this.drawEntity = undefined
    },
    /**
     * @description: 获取点的机构代码（点需为高德坐标）
     * @param {type} 
     * @return: 
     */
    getOrg(lnglat) {
      const param = {
        longitude: lnglat[0],
        latitude: lnglat[1],
        geo_type: 'gaode'
      };
      this.$thirdUrl('eventAddressPath_outer', '/office/area/platform/office/decide', (url) => {
        this.$post(url, param, res => {
          let str_1 = res.data['区名称'] != undefined ? res.data['区名称'] : '';
          let str_2 = res.data['办事处名称'] != undefined ? res.data['办事处名称'] : '';
          let str_3 = res.data['社区名称'] != undefined ? res.data['社区名称'] : '';
          let officeName = str_1 + str_2 + str_3 == '' ? '未查到所属机构' : str_1 + str_2 + str_3
          if (officeName && this.userInfo.keyWordIsReplace == '1' && this.userInfo.districtCode === '410174') { // 郑东新区的人员在设置了字符替换的情况下，将地址中的金水区换成郑东新区
            officeName = officeName.replace(/金水区/g, '郑东新区')
            res.data['区名称'] = res.data['区名称'] && res.data['区名称'].replace(/金水区/g, '郑东新区')
            res.data['办事处名称'] = res.data['办事处名称'] && res.data['办事处名称'].replace(/金水区/g, '郑东新区')
            res.data['社区名称'] = res.data['社区名称'] && res.data['社区名称'].replace(/金水区/g, '郑东新区')
          }
          this.org = {
            officeName,
            data: res.data
          }
        })
      })
    },
    /**
     * 父级页面--播放视频
     */
    showVideo (id) {
      window.parent.popHome.getVideoInfo(id) // 打包时显示
    },
    /**
     * 车辆轨迹开始时间改变
     */
    carStartTimeChange (val) {
      this.carStartTime && this.getTips(this.carStartTime, this.carEndTime)
    },
    /**
     * 车辆轨迹结束时间改变
     */
    carEndTimeChange (val) {
      this.carEndTime && this.getTips(this.carStartTime, this.carEndTime)
    },
    /**
     * @description: 车辆--请求历史轨迹数据
     * @param {type} 
     * @return: 
     */
    requestCarTrack (param) {
      const thirdUrlKey = 'python_street_outer'
      return new Promise((resolve, reject) => {
        this.$thirdUrl(thirdUrlKey, '/car/history/track', url => {
          this.$post(url, param, (res) => {
            if (res.code === 0 && res.data && res.data.length <= 0) { 
              reject(res.data && res.data.message || res.msg)
            } else {
              resolve(res.data)
            }
          })
        })
      })
    },
    /**
     * @description: 车辆--历史轨迹查询
     * @param {*} id
     * @return {*}
     */
    carTrack (id) {
      // 1. 隐藏的info框，显示车辆轨迹查询界面
      this.infoBoxVisible = false
      this.carTrackVisible = true
      // 2. 初始化轨迹查询条件：开始时间、结束时间
      this.carEndTime = new Date()
      const times = this.carEndTime.getTime() - 24 * 60 * 60 * 1000
      this.carStartTime = new Date(times) 
    },
    /**
     * @description: 车辆轨迹--根据选择日期查询轨迹并显示
     * @param {*}
     * @return {*}
     */
    carTrackShow () {
      const viewer = this.viewer
      this.carInfoVisible = false
      // this.carTrackVisible = false // 打包时显示
      
      // 1. 判断输入时间和结束时间是否正确
      if (!this.carStartTime || !this.carEndTime) {
        this.$message('开始时间和结束时间都不能为空')
        return
      }
      // 2. 根据查询条件，获取车辆轨迹数据
      let param = { start_time: this.carStartTime.getTime(),
                    end_time: this.carEndTime.getTime(),
                    car_number: this.currentCar }
      if (!this.getTips(this.carStartTime, this.carEndTime)) return
      this.requestCarTrack(param).then(res => {
        // 2.1. 移除已有的车辆轨迹
        viewer.entities.remove(viewer.entities.getById('CarFullPath'))
        this.handleClose()
        let fullPath, path_84 = [], path_84_Cartesian = []
        let path = res // 高德坐标
        // 2.2. 将轨迹点由高德坐标转化为wgs84坐标，计算84坐标对应的世界坐标cartesian3
        for (let i=0; i < path.length; i++) {
          let point = this.gcj02towgs84(path[i].longitude, path[i].latitude)
          path[i].longitude = point[0]
          path[i].latitude = point[1]
          if (path[i].status.indexOf('记录仪速度')  !== -1) {
            path_84.push(path[i])
            path_84_Cartesian.push(Cesium.Cartesian3.fromDegrees(point[0], point[1]))
          }
        }
        // 2.3. 没有轨迹点，作出警告
        if (path_84_Cartesian.length === 0) {
          this.$message({ message: '车辆在该时段内未移动', type: 'warning'})
          return
        }
        // 2.4. 贴地添加车辆轨迹
        fullPath = this.viewer.entities.add({
          name: "CarFullPath",
          id: "CarFullPath",
          polyline: {
            show: true,
            positions: path_84_Cartesian,
            material: Cesium.Color.fromCssColorString('#ff5816'),
            width: 4,
            clampToGround: true
          }
        })
        this.carPathData = path_84
        viewer.zoomTo(fullPath)

        // 仪表盘显示
        // window.parent.popHome.updateCarMeterStatus(true, this.selectEntity.property) // 打包时显示
      }).catch(() => {
        this.$message({ message: '暂无轨迹数据', type: 'error' })
      })
    },
    /**
     * @description: 车辆轨迹--开始播放轨迹
     */
    carPathPlay (speed) {
      const viewer = this.viewer
      
      // 1. 计算轨迹播放的开始时间和结束时间
      let path = this.carPathData
      let start = Cesium.JulianDate.fromDate(new Date(path[0].uploadTime)) // 轨迹数据开始的时间
      let stop = Cesium.JulianDate.addSeconds(start, path.length, new Cesium.JulianDate()) 
      
      // 2. 配置时钟参数
      viewer.clock.startTime = start.clone()
      viewer.clock.currentTime = start.clone()
      viewer.clock.stopTime = stop.clone()
      viewer.clock.multiplier = speed || this.carPlaySpeed
      viewer.clock.clockRange = Cesium.ClockRange.CLAMPED
      viewer.timeline.zoomTo(start, stop)
      
      // 3. 若当前轨迹正在播放，则重新播放
      let moveEntity 
      if (moveEntity = viewer.entities.getById("move-car")) {
        viewer.clock.currentTime = start.clone()
        this.animationControl("forward")
        return
      }

      // 4. 创建可移动的车辆实体
      let positionProperty = new Cesium.SampledPositionProperty()
      let speedProperty = new Cesium.SampledProperty(Number)
      let directionProperty = new Cesium.SampledProperty(Number)
      // let distanceProperty = new Cesium.SampledProperty(Number)
      for (let i = 0; i< path.length; i++) {
        let time = Cesium.JulianDate.addSeconds(start, i, new Cesium.JulianDate())
        let position = Cesium.Cartesian3.fromDegrees(path[i].longitude, path[i].latitude)
        positionProperty.addSample(time, position)
        speedProperty.addSample(time, path[i].speed)
        directionProperty.addSample(time, path[i].direction)
        // distanceProperty.addSample(time, path[i].gpsDistance)
      }
      positionProperty.setInterpolationOptions({
        interpolationDegree: 1,
        interpolationAlgorithm: Cesium.LinearApproximation
      })
      moveEntity = viewer.entities.add({
        name: 'move-car',
        id: 'move-car',
        availability: new Cesium.TimeIntervalCollection([
          new Cesium.TimeInterval({start: start, stop: stop})
        ]),
        position: positionProperty,
        orientation: new Cesium.VelocityOrientationProperty(positionProperty),
        viewFrom: new Cesium.Cartesian3(-150, 150, 100),
        model: {
          uri: car,
          scale: 1,
          minimumPixelSize: 64,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        },
        properties: new Cesium.PropertyBag({
          speed: speedProperty,
          direction: directionProperty,
          // distance: distanceProperty
        })
      })
      // 5. 开始移动
      this.animationControl('forward')

      // 6. 显示车辆的已走路径
      let passPath = []
      let previousTime = moveEntity.position.getValue(viewer.clock.currentTime)
      passPath.push(Cesium.Cartesian3.fromDegrees(path[0].longitude, path[0].latitude))
      let _this = this
      viewer.entities.add({
        id: 'CarPassPath',
        polyline: {
          show: true,
          positions: new Cesium.CallbackProperty( (time) => {
            let floatCartesian = moveEntity.position.getValue(time)
            _this.playFlag = true
            if (time.secondsOfDay >= previousTime.secondsOfDay) {
              if (floatCartesian) {
                passPath.push(floatCartesian)
              } else {
                passPath = []
                passPath.length = 0
                passPath.push(Cesium.Cartesian3.fromDegrees(path[0].longitude, path[0].latitude))
                _this.playFlag = false
              }
            } else {
              if (passPath.length >= 1) {
                passPath.splice(passPath.length-1, 1)
              } else {
                passPath = []
                passPath.length = 0
                _this.playFlag = false
              }
            }
            
            previousTime = time
            return passPath
          }, false),
          material: Cesium.Color.fromCssColorString('#2f25ff'),
          width: 4,
          clampToGround: true
        }
      })
      
      // 添加帧监听事件，以得到实时的速度、方向
      viewer.scene.postRender.addEventListener( () => {
        // 得到实时的车速、车的方向
        let carSpeed = moveEntity.properties.speed.getValue(viewer.clock.currentTime)
        let carDirection = moveEntity.properties.direction.getValue(viewer.clock.currentTime)
        // let carDistance =  moveEntity.properties.distance.getValue(currentTime).toFixed(2)
        // 向父页面传递车速、方向
        // window.parent.popHome.updateCarMeterInfo(carSpeed, carDirection) // 打包时显示
        
        /* 简易的车辆实时速度、方向显示框
        let carMoveInfoBox = this.$el.getElementsByClassName('carMoveInfoBox')[0]
        carMoveInfoBox.style.display = "block"
        let cartesian =  moveEntity.position.getValue(currentTime)
        let wp = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, cartesian)
        carMoveInfoBox.style.left = wp.x + "px"
        carMoveInfoBox.style.top = wp.y + "px"
        carMoveInfoBox.textContent = `速度：${carSpeed}, 方向：${carDirection}, 行驶里程：${carDistance}`
        */
      })
      
    },
    /**
     * @description: 车辆轨迹--改变速度重新播放
     * @param {*}
     * @return {*}
     */
    carChangeSpeed (speed) {
      const viewer = this.viewer
      if (this.playFlag) {
        // 停止当前播放，改变速度重新开始播放
        this.handleClose('replay')
        this.carPathPlay(speed)
      } else {
        this.carPathPlay()
      }
    },
    /**
     * @description: 车辆轨迹--重新播放
     * @param {*}
     * @return {*}
     */
    carPathReplay () {
      const viewer = this.viewer
      if (this.playFlag) {
        this.handleClose('replay')
        // 停止当前播放，重新开始播放
        this.carPathPlay()
      } else {
        this.carPathPlay()
      }
    },
    /**
     * 车辆轨迹--退出播放
     */
    carTrackExit () {
      this.handleClose()
      this.viewer.scene.camera.setView(this.homeViewOptions)
    },
    /**
     * 轨迹--播放控制
     */
    animationControl (action) {
      let viewer = this.viewer
      let viewModel = viewer.animation.viewModel
      let command
      if (action === "reverse") { // 反向播放
        command = viewModel.playReverseViewModel.command
      } else if (action === "pause"){ // 暂停
        command = viewModel.pauseViewModel.command
      } else if (action === "forward") { // 正向播放
        command = viewModel.playForwardViewModel.command
      } else if (action === "faster") { // 加快速度
        command = viewModel.faster
      } else if (action === 'slower') { // 放慢速度
        command = viewModel.slower
      }
      if (command.canExecute) {
        command()
      }
    },
    /**
     * @description: 轨迹--向前加速
     * @param {*}
     * @return {*}
     */
    fastForward () {
      this.animationControl('forward')
      this.animationControl('faster')
    },
    /**
     * @description: 轨迹--反向运动
     * @param {*}
     * @return {*}
     */
    fastBack () {
      this.animationControl('reverse')
    },
    /**
     * @description: 轨迹--停止播放、移除轨迹、运动物体
     * @param {*} flag 标识是否是 replay （重新播放）：true（重新播放）, false(第一次播放)
     * @return {*}
     */
    handleClose (flag) {
      const viewer = this.viewer
      if (viewer.entities) {
        // 1. 获取当前场景中与轨迹相关的实体Id
        const entityIds = flag === 'replay' ? 
                          ['move-person','PersonPassPath', 'move-car', 'CarPassPath'] :
                          ['PersonFullPath', 'move-person','PersonPassPath', 'CarFullPath', 'move-car', 'CarPassPath']
        entityIds.forEach( item => {
          // 2. 获取实体
          let entity = viewer.entities.getById(item)
          // 3. 实体存在：停止播放、移除实体
          if (entity) {
            this.animationControl("pause")
            viewer.entities.remove(entity)
            viewer.trackedEntity = undefined
          }
        })
      }
    },
    /**
     * @description: 人员--历史轨迹查询
     * @param {*}
     * @return {*}
     */
    personTrack () {
      // 1. 隐藏的info框，显示车辆轨迹查询界面
      this.infoBoxVisible=false;
      this.personTrackVisible = true
      // 2. 初始化人员轨迹查询条件：开始时间、结束时间
      this.personEndTime = new Date()
      const times = this.personEndTime.getTime() - 24 * 60 * 60 * 1000
      this.personStartTime = new Date(times)
    },
    /**
     * @description: 父级页面--通话
     * @param {*}
     * @return {*}
     */
    personCall () {
      window.parent.popHome.beginCall(this.selectEntity.property) // 打包时显示
    },
    /**
     * @description: 人员轨迹--根据选择日期查询轨迹并显示
     * @param {*}
     * @return {*}
     */
    personTrackShow () {
      this.infoBoxVisible = false
      const viewer = this.viewer

      this.handleClose()

      // 1. 判断输入时间和结束时间是否正确
      if (!this.personStartTime || !this.personEndTime) {
        this.$message('开始时间和结束时间都不能为空')
        return
      }

      // 2. 根据查询条件，获取人员轨迹数据
      console.log(this.currentPerson)
      if (!this.getTips(this.personStartTime, this.personEndTime)) return
      let param = { start_time: this.formatTime(this.personStartTime),
                    end_time: this.formatTime(this.personEndTime), 
                    device_id: this.currentPerson,
                    device_type: 'card'}
      this.requestPersonTrack(param).then(res => {
        if (Cesium.defined(viewer.entities) && (fullPath = viewer.entities.getById('PersonFullPath'))) {
          return
        }
        let fullPath, path_84 = []
        let path = res // 高德坐标
        // 2.1. 将轨迹点由高德坐标转化为wgs84坐标，计算84坐标对应的世界坐标cartesian3
        for (let i=0; i < path.length; i++) {
          path[i].lon_lat = this.gcj02towgs84(path[i].lon_lat[0], path[i].lon_lat[1])
          path_84.push(Cesium.Cartesian3.fromDegrees(path[i].lon_lat[0], path[i].lon_lat[1]))
        }
        // 2.2. 贴地添加人员轨迹
        fullPath = viewer.entities.add({
          name: "PersonFullPath",
          id: "PersonFullPath",
          polyline: {
            show: true,
            positions: pathArr,
            material: Cesium.Color.fromCssColorString('#ff5816'),
            width: 4,
            clampToGround: true
          }
        })
        viewer.zoomTo(fullPath)
        this.personPathData = path
      }).catch(() => {
        this.$message({ message: '暂无轨迹数据', type: 'error' })
      })
    },
    /**
     * @description: 人员轨迹--开始播放轨迹
     * @param {*} speed
     * @return {*}
     */
    personTrackPlay (speed) {
      const viewer = this.viewer
      
      // 1. 计算轨迹播放的开始时间和结束时间
      let path = this.personPathData
      let start = Cesium.JulianDate.fromDate(new Date(path[0].gps_time))
      let stop = Cesium.JulianDate.addSeconds(start, path.length, new Cesium.JulianDate())

      // 2. 配置时钟参数
      viewer.clock.startTime = start.clone()
      viewer.clock.currentTime = start.clone()
      viewer.clock.stopTime = stop.clone()
      viewer.clock.multiplier = speed || this.personPlaySpeed
      viewer.clock.clockRange = Cesium.ClockRange.CLAMPED
      viewer.timeline.zoomTo(start, stop)

      // 3. 若当前轨迹正在播放，则重新播放
      let moveEntity
      if (moveEntity = viewer.entities.getById("move-person")) {
        viewer.clock.currentTime = start.clone()
        this.animationControl("forward")
        return
      }
      
      // 4. 创建可移动的人员实体
      let positionProperty = new Cesium.SampledPositionProperty()
      for (let i = 0; i< path.length; i++) {
        let time =  Cesium.JulianDate.addSeconds(start, i, new Cesium.JulianDate())
        let position = Cesium.Cartesian3.fromDegrees(path[i].lon_lat[0], path[i].lon_lat[1])
        positionProperty.addSample(time, position)
      }

      positionProperty.setInterpolationOptions({
        interpolationDegree: 1,
        interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
      })

      moveEntity = viewer.entities.add({
        name: 'move-person',
        id: 'move-person',
        availability: new Cesium.TimeIntervalCollection([
          new Cesium.TimeInterval({start: start, stop: stop})
        ]),
        position: positionProperty,
        orientation: new Cesium.VelocityOrientationProperty(positionProperty),
        // viewFrom: new Cesium.Cartesian3(-100, -100, 200), // 第一视角
        viewFrom: new Cesium.Cartesian3(-5000, -5000, 12000),
        model: {
          show: this.viewer.scene.mode === Cesium.SceneMode.SCENE3D ? true : false,
          uri: man,
          scale: 10,
          minimumPixelSize: 64,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        },
        billboard: {
          show: this.viewer.scene.mode === Cesium.SceneMode.SCENE2D ? true : false,
          image: require('../../static/images/car.png'),
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          scale: 1,
        }
      })
      
      // 5. 开始移动
      this.animationControl("forward")
      
      // 6. 显示车辆的已走路径
      let passPath = []
      passPath.push(Cesium.Cartesian3.fromDegrees(path[0].lon_lat[0], path[0].lon_lat[1]))
      let passLineEntity = viewer.entities.add({
        id: 'PersonPassPath',
        polyline: {
          show: true,
          positions: new Cesium.CallbackProperty(function (time, result) {
            let floatCartesian = moveEntity.position.getValue(time)
            if (floatCartesian) {
              passPath.push(floatCartesian)
            } else {
              passPath = []
              passPath.push(Cesium.Cartesian3.fromDegrees(path[0].lon_lat[0], path[0].lon_lat[1]))
            }
            return passPath
          }, false),
          material: Cesium.Color.fromCssColorString('#2f25ff'),
          width: 4,
          clampToGround: true
        }
      })
    },
    /**
     * @description: 人员--请求历史轨迹数据
     * @param {*} param Object
     * @return {*}
     */
    requestPersonTrack (param) {
      // param.device_id = this.currentPersonnelData.id
      let url = "http://192.168.1.180:8021/watch/gps/now"
      return new Promise((resolve, reject) => {
        this.$post(url, param, (res) => {
          if (res.code === 0 && res.data && res.data.length > 0) {
            resolve(res.data)
          } else {
            reject()
          }
        })
      })
    },
    /**
     * @description: 人员轨迹开始时间改变
     * @param {*} val
     * @return {*}
     */
    personStartTimeChange (val) {
      this.personStartTime && this.getTips(this.personStartTime, this.personEndTime)
    },
    /**
     * @description: 人员轨迹结束时间改变
     * @param {*} val
     * @return {*}
     */
    personEndTimeChange (val) {
      this.personEndTime && this.getTips(this.personStartTime, this.personEndTime)
    },
    /**
     * @description: 切换到默认视角
     * @param {type} 
     * @return: 
     */
    toHomeView () {
      this.$el.style.cursor = 'default'
      // 1.  停止全局单击事件并重新定义全局单击事件
      this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
      this.scenePick()
      // 2. 切换到默认视角
      this.viewer.scene.camera.setView(this.homeViewOptions)
      // 3. 移除地图上的所有图层及实体
      this.layer = undefined
      this.viewer.dataSources.removeAll()
      this.viewer.entities.removeAll()

    },
    /**
     * @description: 切换到主要视角—门店和部件的十字路口部分
     * @param {type} 
     * @return: 
     */
    toMainView () {
      this.$el.style.cursor = 'default'
      // 1. 停止全局单击事件并重新定义全局单击事件
      this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
      this.scenePick()
      // 2. 切换到主要视角
      this.viewer.scene.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(113.75996737452304, 34.797545852443754, 101.00276253205915),
        orientation: {
          heading: Cesium.Math.toRadians(48.11319432921307),
          pitch: Cesium.Math.toRadians(-27.101389302784444),
          roll: Cesium.Math.toRadians(0.150809650182686)
        },
        duration: 2
      })
      // 3. 移除地图上的所有图层及实体
      this.layer = undefined
      this.viewer.dataSources.removeAll()
      this.viewer.entities.removeAll()
    },
    /**
     * @description: 车辆轨迹查询框关闭
     * @param {*}
     * @return {*}
     */
    carTrackClose () {
      this.carTrackVisible = false
      this.handleClose()
    },
    /**
     * @description: 人员轨迹查询框关闭
     * @param {*}
     * @return {*}
     */
    personTrackClose () {
      this.personTrackVisible = false
      this.handleClose()
    },
    /**
     * @description: 判断时间选择
     * @param {*} startTime
     * @param {*} endTime
     * @return {*}
     */
    getTips (startTime, endTime) {
      const secondesOfTwoDay = 24 * 60 * 60 * 1000 * 2 // 两天时间的毫秒数
      const dateDiff = endTime.getTime() - startTime.getTime();//时间差的毫秒数

      if (dateDiff <= 0) {
        this.$message({
          message: '开始时间不能大于或者等于结束时间',
          type: 'warning'
        })
        return false
      } 
      if (dateDiff - secondesOfTwoDay > 0) {
        this.$message({
          message: '时间间隔不能大于两天',
          type: 'warning'
        })
        return false
      }
      return true
    },
    /**
     * @description: 时间格式化
     * @param {*} time
     * @param {*} notime
     * @return {*}
     */
    formatTime (time, notime) {
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
      if (notime) {
        return yy + '-' + MM + '-' + dd
      } 
      return yy + '-' + MM + '-' + dd + ' ' +  hh + ':' + mm + ':' + ss
    },
    /**
      * WGS84 转 GCj02
      * @param lng Number 经度
      * @param lat Number 纬度
      * @returns {*[]}
    */
    wgs84togcj02 (lng, lat) {
      const PI = 3.1415926535897932384626
      const ee = 0.00669342162296594323
      const a = 6378245.0
      if (this.out_of_china(lng, lat)) {
          return [lng, lat]
      }
      else {
          var dlat = this.transformlat(lng - 105.0, lat - 35.0);
          var dlng = this.transformlng(lng - 105.0, lat - 35.0);
          var radlat = lat / 180.0 * PI;
          var magic = Math.sin(radlat);
          magic = 1 - ee * magic * magic;
          var sqrtmagic = Math.sqrt(magic);
          dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
          dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
          var mglat = lat + dlat;
          var mglng = lng + dlng;
          return [mglng, mglat]
      }
    },
    /**
      * GCJ02 转换为 WGS84
      * @param lng
      * @param lat
      * @returns {*[]}
    */
    gcj02towgs84(lng, lat) {
      const PI = 3.1415926535897932384626
      const ee = 0.00669342162296594323
      const a = 6378245.0
      if (this.out_of_china(lng, lat)) {
          return [lng, lat]
      }
      else {
          var dlat = this.transformlat(lng - 105.0, lat - 35.0);
          var dlng = this.transformlng(lng - 105.0, lat - 35.0);
          var radlat = lat / 180.0 * PI;
          var magic = Math.sin(radlat);
          magic = 1 - ee * magic * magic;
          var sqrtmagic = Math.sqrt(magic);
          dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
          dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
          var mglat = lat + dlat;
          var mglng = lng + dlng;
          return [lng * 2 - mglng, lat * 2 - mglat]
      }
    },
    transformlat(lng, lat) {
      const PI = 3.1415926535897932384626
      var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
      ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
      ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
      ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
      return ret
    },
    transformlng(lng, lat) {
      const PI = 3.1415926535897932384626
      var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
      ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
      ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
      ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
      return ret
    },
    /**
      * 判断是否在国内，不在国内则不做偏移
      * @param lng
      * @param lat
      * @returns {boolean}
    */
    out_of_china(lng, lat) {
      return (lng < 72.004 || lng > 137.8347) || ((lat < 0.8293 || lat > 55.8271) || false);
    },
    /*
    * 处理营业期限
    */
    formatIsLong(isLong,begin,end){
      if(isLong == '1'){
        return '长期';
      }else if(isLong == '0'){
        return begin+' -- '+end;
      }else{
        return '';
      }
    },
    /**
     * 获取单个数据详情
     */
    getSingleDetail(param,type){
      if(type == 'model_shop'){
        this.select.feature.detail = null
        this.$post('/org/torgInfo/listData', param).then( res => {
          if (res.data && res.data.list && res.data.list.length > 0) {
            this.select.feature.detail = res.data.list[0]
            console.log(this.select.feature)
            this.bindPromptVisible = false
            this.infoBoxVisible = true
          }else{
            this.$message({
              message: `未获取到详细信息，请绑定数据！`,
              type: 'warning'
            })
            this.bindId = param.modelId
            this.infoBoxVisible = false
            this.bindPromptVisible = true
          }
        })
      }else if(type == 'model_part'){
        this.$thirdUrl('component_outer', '/res/resource/component/basicComponent/queryCompSimpleList', (url)=>{
          this.$get(url, param).then( res => {
            if (res.data && res.data.list && res.data.list.length > 0) {
              this.selectModel.detail = res.data.list[0]
              this.bindPromptVisible = false
              this.infoBoxVisible = true
              console.log(this.selectModel)
            }else{
              this.$message({
                message: `未获取到详细信息，请绑定数据！`,
                type: 'warning'
              })
              this.bindId = param.modelId
              this.infoBoxVisible = false
              this.bindPromptVisible = true
            }
          })
        })
      }else if (type === 'model_building') {
        this.select.feature.detail = null
        this.$post('/basicbuilding/tbasicBuilding/stringData', param).then( res => {
          if (res.data && res.data.list && res.data.list.length > 0) {
            this.select.feature.detail = res.data.list[0]
            console.log(this.select.feature)
            this.bindPromptVisible = false
            this.infoBoxVisible = true
          }else{
            this.$message({
              message: `未获取到详细信息，请绑定数据！`,
              type: 'warning'
            })
            this.bindId = param.modelId
            this.infoBoxVisible = false
            this.bindPromptVisible = true
          }
        })
      }
    },
    changeSceneMode(mode){
      this.$refs.modeSwitch.dType = mode;
    },
    /**
     * @description: 关闭绑定提示框
     * @param {type} 
     * @return {type} 
     */
    closeBindPrompt () {
       this.bindPromptVisible = false
      // 1. 移除高亮的部件点的盒子
      this.viewer.scene.primitives.remove(this.selectModelBox)
      // 2. 移除高亮的org、building的颜色
      if (Cesium.defined(this.select.feature)) {
        let attributes = this.select.feature.primitive.getGeometryInstanceAttributes(this.select.feature.id)
        attributes.show = [0]
        attributes.color = [0, 0, 255, 1]
        attributes = {}
        this.viewer.scene.primitives.remove(this.select.feature)
        this.select.feature = undefined
      }
    }
  },
  watch: {
    sceneMode(){
      if (this.layer) {
        this.getCompLayer(this.layer)
      }
      if(window.parent.popHome){
        window.parent.popHome.sceneMode = this.sceneMode;
      }
    },    
    windowPosition (val) {
      if (val) {
        if (this.infoBoxVisible) {
          let infobox = this.$el.getElementsByClassName("infobox-outer")[0]
          if (infobox) {
            infobox.style.left = val.x + 50 + 'px'
            infobox.style.top = val.y  - infobox.offsetHeight * 0.65 + 'px'
          }
        } else if (this.bindPromptVisible) {
          let bindbox = this.$el.getElementsByClassName("bindbox-outer")[0]
          if (bindbox) {
            bindbox.style.left = val.x + 50 + 'px'
            bindbox.style.top = val.y  - bindbox.offsetHeight * 0.65 + 'px'
          }
        }
      } else {
        this.infoBoxVisible = false
      }
    }
  }
}
</script>

<style scoped>
.map {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
#cContainer {
  width: 100%;
  height: 100%;
}
#tContainer {
  width: 100%;
  height: 100%;
  z-index: 0;
}
.control-button {
  position: absolute;
  left: 10px;
  top: 10px;
  /* display: none;  打包时显示 */
}
.camera-info {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 999;
  color: #000;
  background-color: #888 ;
  opacity: 0.8;
  padding: 3px 8px;
  font-size: 12px;
}

.infobox-outer {
  position: absolute;
  left: 50%;
  top: 50%;
  padding: 5px;
}
.infobox-inner {
  min-width: 400px;
  max-width: 400px;
  background: url(../../static/images/detailBox.png) no-repeat;
  /* background-color: #003a6c; */
  background-size: 100% 100%;
  /* opacity: 0.8; */
  /* filter: alpha(opacity=50); */
  color: #ffffff;  
  overflow: hidden;
}

.infobox-inner .header {
  margin-top: 20px;
  padding: 0 12px 0 15px;
  height: 36px;
  line-height: 36px;
  position: relative;
}
.infobox-inner .title {
  border-bottom: 1px solid #33a3dc;
}
.infobox-inner .header .close {
  font-size: 30px;
  position: absolute;
  right: 5px;
  top: 0;
  height: 30px;
  width: 40px;
  text-align: center;
  line-height: 30px;
  cursor: pointer;
  color: #ffffff;
}

.infobox-inner .content {
  padding: 15px;
  font-size: 13px;
}
.infobox-inner .footer {
  text-align: center;
  margin: 10px 0;
}
.infobox-inner .key {
  width: 91px;
}
/* bind-box */
.bindbox-outer {
  position: absolute;
  left: 50%;
  top: 50%;
  padding: 5px;
}
.bindbox-inner {
  min-width: 300px;
  max-width: 400px;
  background: url(../../static/images/detailBox.png) no-repeat;
  /* background-color: #003a6c; */
  background-size: 100% 100%;
  /* opacity: 0.8; */
  /* filter: alpha(opacity=50); */
  color: #ffffff;  
  overflow: hidden;
}

.bindbox-inner .header {
  margin-top: 20px;
  padding: 0 12px 0 15px;
  height: 36px;
  line-height: 36px;
  position: relative;
}
.bindbox-inner .title {
  border-bottom: 1px solid #33a3dc;
}
.bindbox-inner .header .close {
  font-size: 30px;
  position: absolute;
  right: 5px;
  top: 0;
  height: 30px;
  width: 40px;
  text-align: center;
  line-height: 30px;
  cursor: pointer;
  color: #ffffff;
}

.bindbox-inner .content {
  padding: 15px;
  font-size: 13px;
}
.bindbox-inner .footer {
  text-align: center;
  margin: 10px 0;
}
.bindbox-inner .key {
  width: 50px;
}
/* bind-box */
.button {
  position: absolute;
  top: 10px;
  left: 10px;
}
.custom_box {
  width: 350px;
  position: absolute;
  top: 200px;
  left: 40%;
  transform: translate(-50%, 0);
  background: url(../../static/images/detailBox.png) no-repeat;
  background-size: 100% 100%;
  padding: 10px 20px;
  color: #fff;
}
.custom_box .header {
  line-height: 40px;
  font-size: 16px;
  border-bottom: 1px solid #fff;
}
.custom_box .close {
  font-size: 30px;
  position: absolute;
  right: 20px;
}
.custom_box .close:hover {
  cursor: pointer;
}
.custom_box .body {
  margin: 20px 0 15px;
  font-size: 14px;
}
.custom_box .row_item {
  padding-bottom: 10px
}
.custom_box .footer {
  text-align: center;
  margin-top: 10px;
}
.reposition {
  position: absolute;
  left: 0;
  bottom: 50px;
}
</style>

<style>
/* 指北针样式 */
.compass {
  top: 50px;
}
.navigation-controls {
  top: 140px;
}
</style>
