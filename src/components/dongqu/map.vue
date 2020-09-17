 
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
        <Meature></Meature>
      </div>
      
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
          <table v-if="select.feature && select.feature.detail">
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
import 'cesium/Source/Widgets/widgets.css'
import CesiumNavigation from 'cesium-navigation-es6'
import common from '../../uitl/common'
// 三维模型
import shu from '../../../static/3dModel/comp/shu.gltf'
import lajitongStreet from '../../../static/3dModel/comp/lajitong_street.gltf'
import lajitongBusiness from '../../../static/3dModel/comp/lajitong_business.gltf'
import lajitongPark from '../../../static/3dModel/comp/lajitong_park.gltf'
import ludeng from '../../../static/3dModel/comp/ludeng.gltf'
import car from '../../../static/3dModel/CesiumMilkTruck.glb'
import man from '../../../static/3dModel/Cesium_Man.glb'
import jgLudeng from '../../../static/3dModel/comp/jinggai_ludeng1.gltf'
import jgRanqi from '../../../static/3dModel/comp/jinggai_ranqi.gltf'
import jgReli from '../../../static/3dModel/comp/jinggai_reli.gltf'
import jgXiangfang from '../../../static/3dModel/comp/jinggai_xiaofang.gltf'
import jgShangshuiN from '../../../static/3dModel/comp/jinggai_shangshui2.gltf'
import jgShangshuiO from '../../../static/3dModel/comp/jinggai_shangshui1.gltf'
import jgTongxin from '../../../static/3dModel/comp/jinggai_tongxin.gltf'
import jgYushui from '../../../static/3dModel/comp/jinggai_yushui.gltf'
import jgQita from '../../../static/3dModel/comp/jinggai_qita.gltf'
import huajiaBase from '../../../static/3dModel/comp/huajia_base.gltf'
import huajiaTree from '../../../static/3dModel/comp/huajia_tree.gltf'
import yushuibizi from '../../../static/3dModel/comp/yushuibizi.gltf'
// 组件
import ModeSwitcher from './child/modeSwitcher'
import Meature from './child/meature'
// 三维单体化数据--仅建筑物
import compData from '../../../static/data/comp.json'
// 三维单体化数据--倾斜摄影模型
import componentDataVersion1 from '../../../static/data/point_version1.json'
import componentDataVersion2 from '../../../static/data/point_version2.json'
import BuildingData from '../../../static/data/polygon_buffer.json'
import orgData from '../../../static/data/polyline.json'

let Cesium = require('cesium/Source/Cesium')
require('../../../static/libs/cesium/cesiumGeometry')

export default {
  components: {
    ModeSwitcher,
    Meature
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
      select: {
        primitive: undefined,
        attributes: new Cesium.Color()
      },
      selectModel: null,
      selectModelBox: null,
      selectEntity: null,
      tileset: null,
      direction: '',
      currentCamera: '', // 当前相机参数
      layer: '',
      confirmVisible: false,
      confirmAddress: '',
      confirmLnglatGd: '',
      org: {},
      carInfoVisible: false,
      carTrackVisible: false,
      carPlaySpeed: 5,
      carStartTime: undefined,
      carEndTime: new Date(),
      carPathData: undefined,
      currentCar: '豫A0603R',
      drawEntity: undefined,
      handler: undefined,
      personPlaySpeed: 5,
      personTrackVisible: false,
      personStartTime: undefined,
      personEndTime: new Date('2020-07-23 11:13:26'),
      personPathData: undefined,
      playFlag: true,
      currentPerson: '0867597017655702',
      userInfo: '',
      homeViewOptions: {
        destination: Cesium.Cartesian3.fromDegrees(113.75885198222937, 34.78853390435369, 920.5362867864075),
        orientation: {
          heading: Cesium.Math.toRadians(17.959169620278136),
          pitch: Cesium.Math.toRadians(-41.39227922794142),
          roll: Cesium.Math.toRadians(0.07414207460638529)
        },
        duration: 2
      },
      carPassPath: [],
      sceneMode: '', // 维度模式
      unitStep: '',
      sumOffset: ''
    }
  },
  mounted () {
    // this.initUserInfo()
    this.initViewer()
    // this.initTMap()
    this.mapInited = true
    let self = this
    window.mapVue = self
  },
  methods: {
    initUserInfo () {
      this.userInfo = common.getStorage('user')
      let currentPoint
      if (this.userInfo == null) {
        this.userInfo = {}
        this.userInfo.isDistrict = 1
        this.userInfo.currentLevelCode = '410174'
        this.userInfo.districtCode = '410174'
        this.userInfo.id = 'dmdc2_akfr'
        this.mapCenter = [113.63288, 34.693875]
      } else {
        this.userInfo.districtCode = this.userInfo.districtCommandCode
        if (this.userInfo.isDistrict != 0) {
          // 区
          this.userInfo.currentLevelCode = this.userInfo.districtCommandCode
          this.userInfo.currentLevelName = this.userInfo.districtCommandName
        } else {
          // 办事处
          this.userInfo.currentLevelCode = this.userInfo.officeCommandCode
          this.userInfo.currentLevelName = this.userInfo.officeCommandName
        }
        this.mapCenter = this.userInfo.centerPoint.split(',')
      }
    },
    /**
     * @description: 初始化cesium地图
     * @param {type}
     * @return:
     */
    initViewer () {
      // 初始化Viewer之前，将token加入，可避免报错{"code":"InvalidCredentials","message":"Invalid access token"}
      // Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4ZDliYjU2OS03YTA0LTQ4NjUtYWE4Zi1iZTMzOTEzOGI5NmIiLCJpZCI6MTg0MzQsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NzM4MDA2MzR9.TiRGDlgKIT4SB2apFIwEAWyqp5Ad_qSqh3zrpE0l8h4'
      this.viewer = new Cesium.Viewer('cContainer', {
        // animation: false, // 关闭动画
        // timeline: false, // 关闭时间线
        navigationHelpButton: false, // 关闭显示默认的相机控制提示
        fullscreenButton: false, // 关闭全屏按钮
        geocoder: false, // 关闭geocoder小部件
        selectionIndicator: false,
        infoBox: false, // 点击要素之后显示的信息,默认true
        baseLayerPicker: false, // 是否显示图层选择控件
        sceneModePicker: false, // 是否显示投影方式控件
        homeButton: false, // 是否显示默认定位点的控件
        shouldAnimate: true,
        showRenderLoopErrors: false
      })

      this.viewer._cesiumWidget._creditContainer.style.display = 'none' // 默认去除版权信息
      this.viewer.imageryLayers.get(0).show = false // 默认不加载影像
      this.viewer.scene.skyBox.show = false // 默认不显示背景图片
      this.viewer.scene.backgroundColor = new Cesium.Color(0.0, 0.0, 0.0, 0.0) // 默认将背景颜色设置为黑色
      this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK) // 屏蔽默认双击事件

      // 动画和时间线控件的隐藏
      this.viewer.animation.container.style.visibility = 'hidden'
      this.viewer.timeline.container.style.visibility = 'hidden'

      this.viewer.scene.globe.depthTestAgainstTerrain = true

      

      this.viewer.scene.shadowMap.darkness = 1.275
      this.viewer.scene.skyAtmosphere.brightShift = 0.4 // 大气的亮度
      // this.viewer.scene.debugShowFramesPerSecond = true
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
      document.getElementsByClassName('navigation-controls')[0].style.backgroundColor = 'rgba(47, 53, 60, 0.5)'

      this.getCurrentCamera()
      // this.viewer.scene.preRender.addEventListener(this.undergroundMode) // 禁止相机进入地面以下

      this.addCSitelliteMap()
      this.addCVectorMap()
      this.directLocation()
      this.addCustomMap()
      // this.load3DTile()
      // this.load3DPhotographyVersion1()
      this.load3DPhotographyVersion2()
    },
    /**
     * @description: 初始化天地图矢量地图
     * @param {type}
     * @return: 
     */
    initTMap () {
      this.tMap = new T.Map('tContainer', {
        center: new T.LngLat(116.40769, 39.89945),
        zoom: 12
      })
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
     * @description: 默认添加谷歌卫星影像（未偏移）
     * @param {type} 
     * @return: 
     */
    addCSitelliteMap () {
      this.sitelliteMap = new Cesium.ImageryLayer(new Cesium.WebMapTileServiceImageryProvider({
          url: 'http://{s}.google.cn/vt?lyrs=s&x={TileCol}&y={TileRow}&z={TileMatrix}&s=Gali',
          layer: 'googleSitelliteMap',
          style: 'default',
          format: 'tiles',
          tileMatrixSetID: 'c',
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
          tilingScheme: new Cesium.WebMercatorTilingScheme(),
          maximumLevel: 22
        }), {
        show: true,
        brightness: 1.76,
        contrast: 1.48,
        hue: 0,
        saturation: 1.44,
        gamma: 0.68
      })
      this.sitelliteMap.title = 'sitelliteMap'
      this.viewer.imageryLayers.add(this.sitelliteMap)
    },
    /**
     * @description: 默认添加天地图矢量地图
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
        show: false
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
     * @description: 添加自定义的影像图
     * @param {type} 
     * @return: 
     */
    addCustomMap () {
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
      this.currentCamera = `经度: ${cameraInfo.longitude}° 纬度: ${cameraInfo.latitude}° 高度: ${cameraInfo.height} 航偏角: ${cameraInfo.heading}° 俯仰角: ${cameraInfo.pitch}° 翻滚角: ${cameraInfo.roll}°`
    },
    /**
     * @description: 添加3dtile数据
     * @param {type} 
     * @return: 
     */
    load3DTile () {
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
          
          this.loadComp() // 加载倾斜摄影数据时不显示
        }) 
        .otherwise( error => {
          console.log(error)
        })

        this.scenePick()
    },
    loadComp () {
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
          if (['N', 'S'].includes(direction)) {
            rotateDegree = 66
          } else if (['E', 'W'].includes(direction)) {
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
          if (['N', 'S'].includes(direction)) {
            rotateDegree = 66
          } else if (['E', 'W'].includes(direction)) {
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
     * @description: 添加倾斜摄影的3dtile数据--version1
     * @param {type} 
     * @return: 
     */
    load3DPhotographyVersion1 () {
      const viewer = this.viewer
      this.tileset = new Cesium.Cesium3DTileset({
        // url: 'http://localhost:9000/model/e4a5daf0c81311eaacc441ac2be39f5c/Production_7.json',
        // maximumScreenSpaceError: 2,
        // skipScreenSpaceErrorFactor: 16,

        url: 'http://dev.hnzwdz.com/admin/3dtile/tileset.json'
        // url: this.GLOBAL.oldBasePath + '3dtile/tileset.json'
      })

      viewer.scene.primitives.add(this.tileset)
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(113.74877613016302, 34.7717961878329, 1380.5041499769425),
        orientation: {
          heading: Cesium.Math.toRadians(17.978938787560683),
          pitch: Cesium.Math.toRadians(-26.967121385480244),
          roll: Cesium.Math.toRadians(0.062458385695531214)
        },
        duration: 2
      })

      let tilesetArr = Cesium.Cartesian3.fromArray([
        this.tileset.modelMatrix[12],
        this.tileset.modelMatrix[13],
        this.tileset.modelMatrix[14]
      ])
      // let transform = Cesium.Cartesian3.add(tilesetArr, Cesium.Cartesian3.fromArray([21, -50, -39]), new Cesium.Cartesian3())
      let transform = Cesium.Cartesian3.add(tilesetArr, Cesium.Cartesian3.fromArray([21.4, -48.3, -36.7]), new Cesium.Cartesian3())
      this.tileset.modelMatrix = Cesium.Matrix4.fromTranslation(transform)
      this.addMonomerDataVersion1()

      this.scenePickVersion1()
    },
    /**
     * @description: 添加倾斜摄影的单体化数据--version1
     * @param {type}
     * @return:
     */
    addMonomerDataVersion1 () {
      const viewer = this.viewer
      
      // 添加倾斜摄影的单体数据——建筑物
      BuildingData.features.forEach(feature => {
        const instance = new Cesium.GeometryInstance({
          id: `building-${feature.properties.ORIG_FID}`,
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
      // 添加倾斜摄影的单体数据——门店
      orgData.features.forEach(feature => {
        let minHeight = feature.properties.minHeight
        let maxHeight = feature.properties.maxHeight
        const id = feature.properties.OBJECTID
        const instance = new Cesium.GeometryInstance({
          id:  `org-${id}`,
          geometry: new Cesium.WallGeometry({
            positions: Cesium.Cartesian3.fromDegreesArray([].concat.apply([], feature.geometry.coordinates[0])),
            granularity: 5,
            maximumHeights: [maxHeight, maxHeight, maxHeight],
            minimumHeights: [minHeight, minHeight, minHeight],
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
      // let cartesians = []
      // PointData.features.forEach(feature => {
      //   const id = feature.properties.OBJECTID
      //   const coordinates = feature.geometry.coordinates
      //   const cartesian = Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1])
      //   cartesians.push(cartesian)
      // })

      // viewer.scene.clampToHeightMostDetailed(cartesians)
      // .then(clampedCartesians => {
      //   console.log(clampedCartesians)
      //   clampedCartesians.map((item, index) => {
      //     PointData.features[index].clampedCartesian = item
      //   })
      //   console.log(JSON.stringify(PointData))
      // })
      // 添加倾斜摄影的单体数据——部件
      let instances = []
      let ludengjgInstances = [], ranqijgInstances = [], relijgInstances = [], xiaofangjgInstances = [], shangshuijgInstances = [], shangshuijgInstancesO = [], 
          tongxinjgInstances = [], yushuijgInstances = [], wushuijgInstances = [], dianlijgInstances = [], gonganjgInstances = [], qitajgInstances = []
      let lajitongInstances = []
      let shumuInstances = []
      let jinggaiInstances = []
      const lajitongBox = Cesium.BoxGeometry.fromDimensions({
        vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL,
        dimensions: new Cesium.Cartesian3(1.2, 1.2, 1.5)
      })
      const shumuBox = Cesium.BoxGeometry.fromDimensions({
        vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL,
        dimensions: new Cesium.Cartesian3(7, 7, 20)
      })
      const jinggaiBox = Cesium.BoxGeometry.fromDimensions({
        vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL,
        dimensions: new Cesium.Cartesian3(1.5, 1.5, 5)
      })
      componentDataVersion1.features.forEach(feature => {
        const id = feature.properties.id
        const compName = feature.properties.名称
        
        let modelMatrix
        if (compName.indexOf('井盖') != -1) {
          let cartesian = Cesium.Cartesian3.fromDegrees(feature.geometry.coordinates[0], feature.geometry.coordinates[1], 5.5)
          modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(cartesian, new Cesium.HeadingPitchRoll(0, 0, 0))
          const instance = new Cesium.GeometryInstance({
            id: `component-${id}`,
            geometry: jinggaiBox,
            modelMatrix: modelMatrix,
            attributes : {
              color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED.withAlpha(0.01))
            }
          })
          viewer.scene.primitives.add(new Cesium.Primitive({
            geometryInstances: instance,
            appearance : new Cesium.PerInstanceColorAppearance(),
            releaseGeometryInstances: false
          }))
        } else if (compName === '垃圾箱') {
          let cartesian = Cesium.Cartesian3.fromDegrees(feature.geometry.coordinates[0], feature.geometry.coordinates[1], 3.5)
          modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(cartesian, new Cesium.HeadingPitchRoll(0, 0, 0))
          const instance = new Cesium.GeometryInstance({
            id: `component-${id}`,
            geometry: lajitongBox,
            modelMatrix: modelMatrix,
            attributes : {
              color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.PINK.withAlpha(0.01))
            }
          })
          viewer.scene.primitives.add(new Cesium.ClassificationPrimitive({
            geometryInstances: instance,
            appearance : new Cesium.PerInstanceColorAppearance(),
            classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
            releaseGeometryInstances: false
          }))
        } else if (compName === '树木') {
          let cartesian = Cesium.Cartesian3.fromDegrees(feature.geometry.coordinates[0], feature.geometry.coordinates[1], 10.5)
          modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(cartesian, new Cesium.HeadingPitchRoll(0, 0, 0))
          const instance = new Cesium.GeometryInstance({
            id: `component-${id}`,
            geometry: shumuBox,
            modelMatrix: modelMatrix,
            attributes : {
              color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.ORANGE.withAlpha(0.01)),
              show: new Cesium.ShowGeometryInstanceAttribute(true)
            }
          })
          viewer.scene.primitives.add(new Cesium.ClassificationPrimitive({
            geometryInstances: instance,
            appearance : new Cesium.PerInstanceColorAppearance(),
            classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
            releaseGeometryInstances: false
          }))
        }
        // // 在模型上显示所有部件
        // let cartesian
        // if (feature.clampedCartesian) {
        //   cartesian = new Cesium.Cartesian3(feature.clampedCartesian.x, feature.clampedCartesian.y, feature.clampedCartesian.z)
        // } else {
        //   cartesian = new Cesium.Cartesian3.fromDegrees(feature.geometry.coordinates[0], feature.geometry.coordinates[1])
        // }
        // let modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(cartesian, new Cesium.HeadingPitchRoll(0, 0, 0))
        // Cesium.Matrix4.multiplyByUniformScale(modelMatrix, 1, modelMatrix)
        // const instance = {
        //     batchId: `component-${id}`,
        //     modelMatrix: modelMatrix
        //   }
        //   instances.push(instance)
      })
      this.createInstanceCollection(lajitongStreet, instances, true)
      // // 井盖
      // let ludengjgCollection = this.createInstanceCollection(jgLudeng, ludengjgInstances, false) // 路灯井盖
      // let ranqijgCollection =  this.createInstanceCollection(jinggai, ranqijgInstances, false) // 天然气井盖
      // let relijgCollection = this.createInstanceCollection(jinggai, relijgInstances, false) // 热力井盖
      // let xiaofangjgCollection = this.createInstanceCollection(jinggai, xiaofangjgInstances, false) //消防井盖
      // let shangshuijgCollectionN = this.createInstanceCollection(jinggai, shangshuijgInstances, false) // 带花色的上水井盖
      // let shangshuijgCollectionO = this.createInstanceCollection(jinggai, shangshuijgInstancesO, false)  // 不带花色的上水井盖
      // let tongxinjgCollection = this.createInstanceCollection(jinggai, tongxinjgInstances, false)  // 通信井盖
      // let yushuijgCollection = this.createInstanceCollection(jinggai, yushuijgInstances, false) // 雨水井盖
      // // let wushuijgCollection = this.createInstanceCollection(jgQita, wushuijgInstances, false) // 污水井盖
      // // let dianlijgCollection = this.createInstanceCollection(jgQita, dianlijgInstances, false) // 雨水井盖
      // // let gonganjgCollection = this.createInstanceCollection(jgQita, gonganjgInstances, false) // 公安井盖
      // let qitajgCollection = this.createInstanceCollection(jinggai, qitajgInstances, false)
    },
    /**
     * @description: 加载清除道路上树和垃圾桶的倾斜摄影--version2
     * @param {type} 
     * @return: 
     */
    load3DPhotographyVersion2 () {
      const viewer = this.viewer
      
      // // 添加3dTile数据
      // this.tileset = new Cesium.Cesium3DTileset({
      //   url: 'http://localhost:9000/model/ed744fa0e2a711eaafe4933aaa75cd5b/tileset.json',
      //   // maximumScreenSpaceError: 2,
      //   // skipScreenSpaceErrorFactor: 16
      // })
      
      // viewer.scene.primitives.add(this.tileset)

      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(113.74877613016302, 34.7717961878329, 1380.5041499769425),
        orientation: {
          heading: Cesium.Math.toRadians(17.978938787560683),
          pitch: Cesium.Math.toRadians(-26.967121385480244),
          roll: Cesium.Math.toRadians(0.062458385695531214)
        },
        duration: 2
      })
      // let tilesetArr = Cesium.Cartesian3.fromArray([
      //   this.tileset.modelMatrix[12],
      //   this.tileset.modelMatrix[13],
      //   this.tileset.modelMatrix[14]
      // ])
      // let center = Cesium.Cartesian3.add(tilesetArr, Cesium.Cartesian3.fromArray([22, -50.6, -38.7]), new Cesium.Cartesian3())
      // let m = Cesium.Matrix4.fromTranslation(center)
      // this.tileset.modelMatrix = m
  
      this.addMonomerDataVersion2()
      this.scenePickVersion2()
    },
    /**
     * @description: 添加倾斜摄影的单体化数据--version2
     * @param {type} 
     * @return: 
     */
    addMonomerDataVersion2 () {
      const viewer = this.viewer
      
      // 添加倾斜摄影的单体数据——建筑物
      BuildingData.features.forEach(feature => {
        const instance = new Cesium.GeometryInstance({
          id: `building-${feature.properties.ORIG_FID}`,
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
      // 添加倾斜摄影的单体数据——门店
      orgData.features.forEach(feature => {
        let minHeight = feature.properties.minHeight
        let maxHeight = feature.properties.maxHeight
        const id = feature.properties.OBJECTID
        const instance = new Cesium.GeometryInstance({
          id:  `org-${id}`,
          geometry: new Cesium.WallGeometry({
            positions: Cesium.Cartesian3.fromDegreesArray([].concat.apply([], feature.geometry.coordinates[0])),
            granularity: 5,
            maximumHeights: [maxHeight, maxHeight, maxHeight],
            minimumHeights: [minHeight, minHeight, minHeight],
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
      // // 获取点在倾斜摄影的顶部坐标
      // let cartesians = []
      // componentData.features.forEach(feature => {
      //   const id = feature.properties.OBJECTID
      //   const coordinates = feature.geometry.coordinates
      //   const cartesian = Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1])
      //   cartesians.push(cartesian)
      // })

      // viewer.scene.clampToHeightMostDetailed(cartesians)
      // .then(clampedCartesians => {
      //   clampedCartesians.map((item, index) => {
      //     componentData.features[index].clampedCartesian = item
      //   })
      //   console.log(JSON.stringify(componentData))
      // })
      // 添加倾斜摄影的单体数据——部件
      let instances = []
      let ludengjgInstances = [], ranqijgInstances = [], relijgInstances = [], xiaofangjgInstances = [], shangshuijgInstances = [], shangshuijgInstancesO = [], 
          tongxinjgInstances = [], yushuijgInstances = [], wushuijgInstances = [], dianlijgInstances = [], gonganjgInstances = [], qitajgInstances = []
      let lajitongInstances = []
      let shumuInstances = []
      let jinggaiInstances = []
      componentDataVersion2.features.forEach(feature => {
        const id = feature.properties.id
        const compName = feature.properties.名称
        
        let cartesian = feature.clampedCartesian ? 
            new Cesium.Cartesian3(feature.clampedCartesian.x, feature.clampedCartesian.y, feature.clampedCartesian.z) :
            Cesium.Cartesian3.fromDegrees(feature.geometry.coordinates[0],feature.geometry.coordinates[1])

        let modelMatrix, rotateDegree, scale, offset
        if (compName.indexOf('井盖') != -1) {
          offset = Cesium.Cartesian3.fromArray([0, 0, -0.07])
          cartesian = Cesium.Cartesian3.add(cartesian, offset,  new Cesium.Cartesian3())
          rotateDegree = Math.random() * 360
          scale = 2.5
          modelMatrix = this.cartesianToMatrix4(cartesian, scale, rotateDegree)
          const instance = {
            batchId: `component-${id}-jinggai`,
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
          }
        } else if (compName === '垃圾箱') {
          scale = 1
          modelMatrix = this.cartesianToMatrix4(cartesian, scale)
          const instance = {
            batchId: `component-${id}-lajitong`,
            modelMatrix: modelMatrix
          }
          lajitongInstances.push(instance)
        } else if (compName === '树木') {
          scale = 1
          modelMatrix = this.cartesianToMatrix4(cartesian, scale)
          const instance = {
            batchId: `component-${id}-shumu`,
            modelMatrix: modelMatrix
          }
          shumuInstances.push(instance)
        }
      })
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
    },
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
      this.scenePickVersion1()
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
      if (dataSources.getByName(type).length > 0) {
        for (let i = 0; i < viewer.dataSources.length; i++) {
          let _ds = dataSources.get(i)
          if (_ds.name === type) {
            _ds.show = true
            viewer.zoomTo(_ds)
            ds = _ds
          } else {
            _ds.show = false
          }
        }
      } else {
        if (dataSources.length > 0) {
          for (let i = 0; i < viewer.dataSources.length; i++) {
            dataSources.get(i).show = false
          }
        }
        ds = new Cesium.CustomDataSource(type)
        dataSources.add(ds)
        this.addPointInLayer(type, ds)
      }
    },
    /**
     * @description: 根据类型请求数据并打点（到对应图层），缩放到图层点的范围
     * @param {String} type
     * @param {Cesium.CustomDataSource} ds
     * @return: 
     */
    addPointInLayer (type, ds) {
      const viewer = this.viewer
      if(this.sceneMode == '3D'){
        var img = {
          person: {
            online: require('../../../static/images/icon/人员_在线.svg'),
            offline: require('../../../static/images/icon/人员_不在线.svg')
          },
          video: {
            online: require('../../../static/images/icon/摄像头_在线.svg'),
            offline: require('../../../static/images/icon/摄像头_不在线.svg')
            },
          car: {
            online: require('../../../static/images/icon/车辆_在线.svg'),
            offline: require('../../../static/images/icon/车辆_不在线.svg')
            },
          case: require('../../../static/images/icon/案件.svg'),
        }
      }else{
        var img = {
          person: {
            online: require('../../../static/images/icon/person_2.svg'),
            offline: require('../../../static/images/icon/person_1.svg')
          },
          video: {
            online: require('../../../static/images/icon/video_2.svg'),
            offline: require('../../../static/images/icon/video_1.svg')
            },
          car: {
            online: require('../../../static/images/icon/car_2.svg'),
            offline: require('../../../static/images/icon/car_1.svg')
            },
          case:{
            onGoing: require('../../../static/images/icon/case_1.svg'),
            closed: require('../../../static/images/icon/case_3.svg'),
          },
          shop: require('../../../static/images/icon/shop.svg'),
          part: require('../../../static/images/icon/part.svg')
        }
      }
      
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
        const param = {orgIsShop: '1',pageSize:99999};
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
     * @description: cesium视图的点击事件（3dtile, modelInstance, entity）
     * @param {type} 
     * @return: 
     */
    scenePick () {
      const viewer = this.viewer

        // 鼠标点击单体，显示其属性
      viewer.screenSpaceEventHandler.setInputAction(e => {
        this.infoBoxVisible = false
        let picked = viewer.scene.pick(e.position)
        if (Cesium.defined(this.select.feature)) {
          console.log(this.select.feature)
          // if (picked._batchId === this.select.feature._batchId) return
          console.log(this.select.feature.content.batchTable)
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
              this.infoBoxVisible = false;
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
     * @description: 倾斜摄影--cesium视图的点击事件--倾斜摄影数据version1
     * @param {type} 
     * @return: 
     */
    scenePickVersion1 () {
      const viewer = this.viewer
      let attributes, currentColor, currentShow
      
      viewer.screenSpaceEventHandler.setInputAction(e =>{
        const picked = viewer.scene.pick(e.position)
        if (!Cesium.defined(picked) || picked.primitive instanceof Cesium.Cesium3DTileset) return
        if (Cesium.defined(this.select.feature)) {
          if (picked.id === this.select.feature.id) return
          attributes = this.select.feature.primitive.getGeometryInstanceAttributes(this.select.feature.id)
          attributes.show = [0]
          attributes.color = [0, 0, 0, 0]
          attributes = {}
          this.select.feature = undefined
        }
        if (Cesium.defined(this.selectModel)) {
          if (picked.id === this.selectModel.id) return
          this.selectModel = undefined
        }
        if (Cesium.defined(this.selectEntity)) {
          if (picked.id.id === this.selectEntity.id) return
          this.selectEntity = undefined
        }
        

        if (picked.id instanceof Cesium.Entity) {
          this.carTrackVisible = false
          this.selectEntity = picked.id
          let centerCartesian = this.selectEntity.position.getValue()
          this.initInfobox(centerCartesian)
          this.infoBoxVisible = true
          if (this.selectEntity.name === 'shop') {
            this.select.feature = {};
            this.select.feature.detail = this.selectEntity.property
          }
          if (this.selectEntity.name === 'part') {
            this.selectModel = {};
            this.selectModel.detail = this.selectEntity.property
          }
        } else {
          const pickedGeom = picked.primitive.geometryInstances.geometry
          if (pickedGeom instanceof Cesium.PolygonGeometry) { 
            this.select.feature = picked
            var attributes = picked.primitive.getGeometryInstanceAttributes(picked.id)
            attributes.color = [255, 0, 0, 128]
            attributes.show = [1]
            // 获取其详情信息
            const buildingId =  parseInt(picked.id.split('-')[1])
            let feature = BuildingData.features.find(feature => feature.properties.ORIG_FID === buildingId)
            let centerCartesian = Cesium.Cartesian3.fromDegrees(feature.properties.center_lon, feature.properties.center_lat)
            // 显示信息框
            this.initInfobox(centerCartesian)
            this.infoBoxVisible = true
            const param =  {modelId: 'dqjz72'} // ==============参数待修改
            this.getSingleDetail(param, 'model_shop')
          } else if (pickedGeom instanceof Cesium.WallGeometry) {
            this.select.feature = picked
            let attributes = picked.primitive.getGeometryInstanceAttributes(picked.id)
            attributes.color = [255, 0, 0, 128]
            attributes.show = [1]
            const orgId =  parseInt(picked.id.split('-')[1])
            let feature = orgData.features.find(feature => feature.properties.OBJECTID === orgId)
            // 计算中心点坐标
            let centerCartesian = Cesium.Cartesian3.fromDegrees(feature.properties.center_lon, feature.properties.center_lat)
            // 显示信息框
            this.initInfobox(centerCartesian)
            this.infoBoxVisible = true
            const param =  {modelId: 'dqjz72'}
            this.getSingleDetail(param,'model_shop')
          } else if (pickedGeom instanceof Cesium.BoxGeometry) {
            this.selectModel = picked
            const componentId =  parseInt(picked.id.split('-')[1])
            let feature = componentData.features.find(feature => feature.properties.id === componentId)
            const matrix = picked.primitive.geometryInstances.modelMatrix
            let centerCartesian = new Cesium.Cartesian3(matrix[12], matrix[13], matrix[14])
            this.initInfobox(centerCartesian)
            const param =  {modelId: '170'}
            this.getSingleDetail(param,'model_part')
          }
        }
        
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    },
    /**
     * @description: 倾斜摄影--cesium视图的点击事件--倾斜摄影数据version2(去除倾斜摄影上路边的树、垃圾桶、停放的车辆等)
     * @param {type} 
     * @return: 
     */
    scenePickVersion2 () {
      const viewer = this.viewer
      let attributes, currentColor, currentShow

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
      const boxRotate = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(45))

      viewer.screenSpaceEventHandler.setInputAction(e =>{
        const picked = viewer.scene.pick(e.position)
        console.log(picked)
        if (!Cesium.defined(picked) || picked.primitive instanceof Cesium.Cesium3DTileset) return
        if (Cesium.defined(this.select.feature) && Cesium.defined(this.select.feature.primitive)) {
          if (picked.id === this.select.feature.id) return
          attributes = this.select.feature.primitive.getGeometryInstanceAttributes(this.select.feature.id)
          attributes.show = [0]
          attributes.color = [0, 0, 0, 0]
          attributes = {}
          this.select.feature = undefined
        }
        if (Cesium.defined(this.selectModel) && this.selectModel.instanceId) {
          if (picked.instanceId === this.selectModel.instanceId) return
          this.selectModel = undefined
          viewer.scene.primitives.remove(this.selectModelBox)
        }
        if (Cesium.defined(this.selectEntity)) {
          if (picked.id.id === this.selectEntity.id) return
          this.selectEntity = undefined
        }
        
        if (picked instanceof Cesium.ModelInstance) {
          this.selectModel = picked
          let matrix = this.selectModel.modelMatrix
          let centerCartesian =  new Cesium.Cartesian3(matrix[12], matrix[13], matrix[14])

          Cesium.Matrix4.multiplyByMatrix3(matrix, boxRotate, matrix)
          const type = this.selectModel.instanceId.split('-')[2]
          let box = type === 'shumu' ? shumuBox : type === 'lajitong' ? lajitongBox : jinggaiBox
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
          this.initInfobox(centerCartesian)
          const id = parseInt(this.selectModel.instanceId.split('-')[1])
          const param = {modelId: 170}
          this.getSingleDetail(param, 'model_part')
          return
        }

        if (picked.id instanceof Cesium.Entity) {
          this.carTrackVisible = false
          this.selectEntity = picked.id
          let centerCartesian = this.selectEntity.position.getValue()
          this.initInfobox(centerCartesian)
          this.infoBoxVisible = true
          if (this.selectEntity.name === 'shop') {
            this.select.feature = {};
            this.select.feature.detail = this.selectEntity.property
          }
          if (this.selectEntity.name === 'part') {
            this.selectModel = {};
            this.selectModel.detail = this.selectEntity.property
          }
        } else {
          const pickedGeom = picked.primitive.geometryInstances.geometry
          if (pickedGeom instanceof Cesium.PolygonGeometry) { 
            this.select.feature = picked
            var attributes = picked.primitive.getGeometryInstanceAttributes(picked.id)
            attributes.color = [255, 0, 0, 128]
            attributes.show = [1]
            // 获取其详情信息
            const buildingId =  parseInt(picked.id.split('-')[1])
            let feature = BuildingData.features.find(feature => feature.properties.ORIG_FID === buildingId)
            let centerCartesian = Cesium.Cartesian3.fromDegrees(feature.properties.center_lon, feature.properties.center_lat)
            // 显示信息框
            this.initInfobox(centerCartesian)
            this.infoBoxVisible = true
            const param =  {modelId: 'dqjz72'} // ==============参数待修改
            this.getSingleDetail(param, 'model_shop')
          } else if (pickedGeom instanceof Cesium.WallGeometry) {
            this.select.feature = picked
            let attributes = picked.primitive.getGeometryInstanceAttributes(picked.id)
            attributes.color = [255, 0, 0, 128]
            attributes.show = [1]
            const orgId =  parseInt(picked.id.split('-')[1])
            let feature = orgData.features.find(feature => feature.properties.OBJECTID === orgId)
            // 计算中心点坐标
            let centerCartesian = Cesium.Cartesian3.fromDegrees(feature.properties.center_lon, feature.properties.center_lat)
            // 显示信息框
            this.initInfobox(centerCartesian)
            this.infoBoxVisible = true
            const param =  {modelId: 'dqjz72'}
            this.getSingleDetail(param,'model_shop')
          }
        }
        
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    },
    /**
     * @description: 获取线的中心点
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
     * @description: 世界坐标转换为wgs1984地理坐标
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
     * @description: 初始化info弹出框
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
      this.viewer.scene.primitives.remove(this.selectModelBox)
    },
    /**
     * @description: 案件登记
     * @param {type} 
     * @return: 
     */
    register () {
      const viewer = this.viewer
      viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
      
      if (Cesium.defined(this.drawEntity)) {
        viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
        return
      }
      this.infoBoxVisible = false
      viewer.dataSources.removeAll()
      viewer.entities.removeAll()
      
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
      
      // 只可点击一次打点
      if (Cesium.defined(this.drawEntity)) {
        viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
        return 
      }

      let cartesian = viewer.camera.pickEllipsoid(e.position, viewer.scene.globe.ellipsoid)
      this.drawEntity = this.addPoint(cartesian)

      this.$el.style.cursor = 'default'

      // TODO：弹出地址确认框
      // TODO: 使用天地图api查询该点对应的地址 http://lbs.tianditu.gov.cn/server/geocodinginterface.html
      this.confirmVisible = true
      let lnglat = this.cartesian2Wgs84(cartesian)
      this.confirmLnglat = lnglat // cgcs2000坐标
      this.confirmLnglatGd = this.wgs84togcj02(lnglat.lng, lnglat.lat) // 高德坐标
      this.getOrg(this.confirmLnglatGd)
      this.$get(`http://api.tianditu.gov.cn/geocoder?postStr={'lon':${lnglat.lng},'lat':${lnglat.lat},'ver':1}&type=geocode&tk=76892c38deab957e65556e5824ca53e9`)
        .then( res => {
          if (res.status == '0' && res.result) {
            this.confirmAddress = res.result.formatted_address
          } 
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
     * @description: 登记案件--点可拖拽
     * @param {type} 
     * @return: 
     */
    movePoint () {
      const viewer = this.viewer
      let leftDownDrag = false
      let pointDraged = null
      
      this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
      
      this.handler.setInputAction( e => {
        this.$el.style.cursor = 'move'
        pointDraged = viewer.scene.pick(e.position)
        leftDownDrag = true
        if (!pointDraged) return
        if (pointDraged.id && pointDraged.id.name === '登记点') {
          this.viewer.scene.mode === Cesium.SceneMode.SCENE3D ? viewer.scene.screenSpaceCameraController.enableRotate = false :
                                                                viewer.scene.screenSpaceCameraController.enableTranslate = false
          
        }
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN)

      this.handler.setInputAction( e => {
        if (leftDownDrag === true && pointDraged != null) {
          let ray = viewer.camera.getPickRay(e.endPosition)
          let cartesian = viewer.scene.globe.pick(ray, viewer.scene)
          pointDraged.id.position = new Cesium.CallbackProperty( () => {
            return cartesian
          }, false)
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

      this.handler.setInputAction( () => {
        this.$el.style.cursor = 'default'
        if (!pointDraged) return
        let lnglat = this.cartesian2Wgs84(pointDraged.id.position.getValue())
        this.confirmLnglatGd = this.gcj02towgs84(lnglat.lng, lnglat.lat) // 高德坐标
        this.getOrg(this.confirmLnglatGd)
        this.$get(`http://api.tianditu.gov.cn/geocoder?postStr={'lon':${lnglat.lng},'lat':${lnglat.lat},'ver':1}&type=geocode&tk=76892c38deab957e65556e5824ca53e9`)
          .then( res => {
            if (res.status == '0' && res.result) {
            this.confirmAddress = res.result.formatted_address
            } 
          })
        leftDownDrag = false
        pointDraged = null
        this.viewer.scene.mode === Cesium.SceneMode.SCENE3D ? viewer.scene.screenSpaceCameraController.enableRotate = true :
                                                              viewer.scene.screenSpaceCameraController.enableTranslate = true
        // this.handler.destroy()
      }, Cesium.ScreenSpaceEventType.LEFT_UP)

      
    },
    /**
     * @description: 登记案件--地址查询（位置-->经纬度）
     * @param {type} 
     * @return: 
     */
    search () {
      const viewer = this.viewer
      this.$get(`http://api.tianditu.gov.cn/geocoder?ds={'keyWord':'郑州市${this.confirmAddress}'}&tk=76892c38deab957e65556e5824ca53e9`)
        .then( res => {
          if (res.status == 0 && res.location) {
            let cartesian = Cesium.Cartesian3.fromDegrees(res.location.lon, res.location.lat)
            viewer.entities.remove(this.drawEntity)
            this.drawEntity = this.addPoint(cartesian)
            viewer.zoomTo([this.drawEntity])
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
     * @description: 登记案件--地址确认
     * @param {type} 
     * @return: 
     */
    comfirmRegister () {
      const viewer = this.viewer
      this.confirmVisible = false // 打包时显示
      // this.viewer.entities.remove(this.drawEntity) 
      // this.drawEntity = undefined 

      window.parent.popHome.updateCaseAddress({ // 打包时显示
          address: this.confirmAddress,
          latitude: this.confirmLnglatGd[0],
          longitude: this.confirmLnglatGd[1]
        }, this.org.data)

      // 移除 drawEntity 的拖动事件
      if (this.handler) {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN)
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP)
      }
      
      // 移除 上报案件的 点击事件
      viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)

      this.scenePickVersion1()
    },
    /**
     * @description: 登记案件--取消登记
     * @param {type} 
     * @return: 
     */
    cancleRegister () {
      const viewer = this.viewer
      // 移除drawEntity
      viewer.entities.remove(this.drawEntity)
      this.drawEntity = undefined
      
      // 地址确认框取消
      this.confirmVisible = false
      if (this.handler) {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN)
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP)
      }

      // 移除 上报案件的 点击事件
      viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)

      this.scenePickVersion1()
    },
    /**
     * @description: 登记案件--删除点
     * @param {type} 
     * @return: 
     */
    removeRegisterPoint () {
      this.viewer.entities.remove(this.drawEntity)
      this.drawEntity = undefined
    },
    /**
     * @description: 获取点的机构代码
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
    
    showVideo (id) {
      window.parent.popHome.getVideoInfo(id) // 打包时显示
    },
    carStartTimeChange (val) {
      this.carStartTime && this.getTips(this.carStartTime, this.carEndTime)
    },
    carEndTimeChange (val) {
      this.carEndTime && this.getTips(this.carStartTime, this.carEndTime)
    },
    /**
     * @description: 请求历史轨迹数据
     * @param {type} 
     * @return: 
     */
    requestCarTrack (param) {
      const thirdUrlKey = 'python_street_outer'
      return new Promise((resolve, reject) => {
        this.$thirdUrl(thirdUrlKey, '/car/history/track', url => {
          this.$post(url, param, (res) => {
            if (res.data) { // 完善
              resolve(res.data)
            } else {
              reject(res.data && res.data.message || res.msg)
            }
          })
        })
      })
    },
    carTrack (id) {
      this.infoBoxVisible = false
      this.carTrackVisible = true
      // 初始化时间
      const times = this.carEndTime.getTime() - 24 * 60 * 60 * 1000
      this.carStartTime = new Date(times) 
    },
    // 车辆轨迹--根据选择日期查询轨迹并显示
    carTrackShow () {
      const viewer = this.viewer
      this.carInfoVisible = false
      // this.carTrackVisible = false // 打包时显示
      
      // 判断输入时间和结束时间是否正确
      if (!this.carStartTime || !this.carEndTime) {
        this.$message('开始时间和结束时间都不能为空')
        return
      }
      // this.currentCar = this.selectEntity.property.cid
      let param = { start_time: this.carStartTime.getTime(),
                    end_time: this.carEndTime.getTime(),
                    car_number: this.currentCar }
      if (!this.getTips(this.carStartTime, this.carEndTime)) return
      this.$thirdUrl('python_street_outer', '/car/history/track', url => {
        this.$post(url, param).then(res => {
          if (res.code == 0 && res.data && res.data.length <= 0) {
            this.$message({ message: '暂无轨迹数据', type: 'error' })
            return
          } else {
            let fullPath
            if (fullPath = viewer.entities.getById('CarFullPath')) {
              return
            }
            this.handleClose()
            let path = res.data
            let pathMove = []
            let pathArr = []
            for (let i=0; i < path.length; i++) {
              let point = this.gcj02towgs84(path[i].longitude, path[i].latitude)
              path[i].longitude = point[0]
              path[i].latitude = point[1]
              if (path[i].status.indexOf('记录仪速度')  !== -1) {
                pathMove.push(path[i])
                pathArr.push(Cesium.Cartesian3.fromDegrees(point[0], point[1]))
              }
            }
            fullPath = this.viewer.entities.add({
              name: 'CarFullPath',
              id: 'CarFullPath',
              polyline: {
                show: true,
                positions: pathArr,
                material: Cesium.Color.fromCssColorString('#ff5816'),
                width: 4,
                clampToGround: true
              }
            })
            this.carPathData = pathMove
            viewer.zoomTo(fullPath)
            // 仪表盘显示
            // window.parent.popHome.updateCarMeterStatus(true, this.selectEntity.property) // 打包时显示
          }
        })
      })
    },
    // 车辆轨迹--开始播放
    carPathPlay (speed) {
      const viewer = this.viewer
      
      let path = this.carPathData
      let start = Cesium.JulianDate.fromDate(new Date(path[0].uploadTime))
      let stop = Cesium.JulianDate.addSeconds(start, path.length, new Cesium.JulianDate())
      
      viewer.clock.startTime = start.clone()
      viewer.clock.currentTime = start.clone()
      viewer.clock.stopTime = stop.clone()
      viewer.clock.multiplier = speed || this.carPlaySpeed
      viewer.clock.clockRange = Cesium.ClockRange.CLAMPED
      viewer.timeline.zoomTo(start, stop)
      
      let moveEntity 
      if (moveEntity = viewer.entities.getById('move-car')) {
        viewer.clock.currentTime = start.clone()
        this.animationControl('forward')
        return
      }
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
      
      // viewer.trackedEntity = moveEntity
      this.animationControl('forward')

      let passPath = []
      let previousTime = moveEntity.position.getValue(viewer.clock.currentTime)
      passPath.push(Cesium.Cartesian3.fromDegrees(path[0].longitude, path[0].latitude))
      let _this = this
      let passLineEntity = viewer.entities.add({
        id: 'CarPassPath',
        polyline: {
          show: true,
          positions: new Cesium.CallbackProperty( (time, result) => {
            // 实时更新车的已走路径
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
      
      viewer.scene.postRender.addEventListener( () => {
        
        // // 实时更新车的已走路径 ================= 未完成
        // let currentTime = viewer.clock.currentTime.secondsOfDay
        // let floatCartesian = moveEntity.position.getValue(currentTime)
        // console.log(currentTime)
        // if (currentTime >= previousTime) {
        //   if (floatCartesian) {
        //     passPath.push(floatCartesian)
        //   } else {
        //     passPath = []
        //     passPath.push(Cesium.Cartesian3.fromDegrees(path[0].longitude, path[0].latitude))
        //   }
        // } else {
        //   if (passPath.length >= 1) {
        //     passPath.splice(passPath.length-1, 1)
        //   } else {
        //     passPath = []
        //   }
        // }
        // previousTime = currentTime
        // passLineEntity.polyline.positions = passPath
        
        // 得到实时的车速、车的方向
        let carSpeed = moveEntity.properties.speed.getValue(viewer.clock.currentTime)
        let carDirection = moveEntity.properties.direction.getValue(viewer.clock.currentTime)
        // let carDistance =  moveEntity.properties.distance.getValue(currentTime).toFixed(2)
        // 向父页面传递车速、方向
        // window.parent.popHome.updateCarMeterInfo(carSpeed, carDirection) // 打包时显示
        // let carMoveInfoBox = this.$el.getElementsByClassName('carMoveInfoBox')[0]
        // carMoveInfoBox.style.display = 'block'
        // let cartesian =  moveEntity.position.getValue(currentTime)
        // let wp = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, cartesian)
        // carMoveInfoBox.style.left = wp.x + 'px'
        // carMoveInfoBox.style.top = wp.y + 'px'
        // carMoveInfoBox.textContent = `速度：${carSpeed}, 方向：${carDirection}, 行驶里程：${carDistance}`
      })
      
    },
    // 车辆轨迹--改变速度重新播放
    carChangeSpeed (speed) {
      const viewer = this.viewer
      // 停止当前播放
      if (this.playFlag) {
        this.handleClose('replay')
        // 重新开始播放
        this.carPathPlay(speed)
      } else {
        this.carPathPlay()
      }
    },
    // 车辆轨迹--重新播放
    carPathReplay () {
      const viewer = this.viewer
      // 停止当前播放
      if (this.playFlag) {
        this.handleClose('replay')
        // 重新开始播放
        this.carPathPlay()
      } else {
        this.carPathPlay()
      }
    },
    // 车辆轨迹--退出播放
    carTrackExit () {
      this.handleClose()
      this.viewer.scene.camera.setView(this.homeViewOptions)
    },
    animationControl (action) {
      let viewer = this.viewer
      let viewModel = viewer.animation.viewModel
      let command
      if (action === 'reverse') { //反向播放
        command = viewModel.playReverseViewModel.command
      } else if (action === 'pause'){ //暂停
        command = viewModel.pauseViewModel.command
      } else if (action === 'forward') { //播放
        command = viewModel.playForwardViewModel.command
      } else if (action === 'faster') { //加快速度
        command = viewModel.faster
      } else if (action === 'slower') { //放慢速度
        command = viewModel.slower
      }
      if (command.canExecute) {
        command()
      }
    },
    fastForward () {
      this.animationControl('forward')
      this.animationControl('faster')
    },
    fastBack () {
      this.animationControl('reverse')
      // this.animationControl('faster')
    },
    handleClose (flag) {
      const viewer = this.viewer
      if (viewer.entities) {
        
        const entityIds = flag === 'replay' ? 
                          ['move-person','PersonPassPath', 'move-car', 'CarPassPath'] :
                          ['PersonFullPath', 'move-person','PersonPassPath', 'CarFullPath', 'move-car', 'CarPassPath']
        entityIds.forEach( item => {
          let entity = viewer.entities.getById(item)
          if (entity) {
            this.animationControl('pause')
            viewer.entities.remove(entity)
            viewer.trackedEntity = undefined
          }
        })
      }
    },
    personTrack () {
      this.infoBoxVisible=false;
      this.personTrackVisible = true
      const times = this.personEndTime.getTime() - 24 * 60 * 60 * 1000
      this.personStartTime = new Date(times)
    },
    personCall () {
      window.parent.popHome.beginCall(this.selectEntity.property) // 打包时显示
    },
    personTrackShow () {
      this.infoBoxVisible = false
      const viewer = this.viewer

      this.handleClose()
      // 判断输入时间和结束时间是否正确
      if (!this.personStartTime || !this.personEndTime) {
        this.$message('开始时间和结束时间都不能为空')
        return
      }

      if (!this.getTips(this.personStartTime, this.personEndTime)) return
      let param = { start_time: this.formatTime(this.personStartTime),
                    end_time: this.formatTime(this.personEndTime), 
                    device_id: this.currentPerson,
                    device_type: 'card'}
      // this.$thirdUrl('python_street_outer', 'about_duty/history/track', url => {
        this.$post('http://192.168.1.180:8021/watch/gps/now', param).then(res => {
          let fullPath
          if (res.code === 0 && res.data && res.data.length <= 0) {
            this.$message({ message: '暂无轨迹数据', type: 'error' })
            return
          } else {
            if ( Cesium.defined(viewer.entities) && (fullPath = viewer.entities.getById('PersonFullPath'))) {
              return
            }
            let path = res.data // 高德坐标
            let pathArr = []
            for (let i=0; i < path.length; i++) {
              path[i].lon_lat = this.gcj02towgs84(path[i].lon_lat[0], path[i].lon_lat[1])
              pathArr.push(Cesium.Cartesian3.fromDegrees(path[i].lon_lat[0], path[i].lon_lat[1]))
            }
            
            fullPath = viewer.entities.add({
              name: 'PersonFullPath',
              id: 'PersonFullPath',
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
          }
        })
      // })
    },
    personTrackPlay (speed) {
      const viewer = this.viewer
      
      let path = this.personPathData
      let start = Cesium.JulianDate.fromDate(new Date(path[0].gps_time))
      let stop = Cesium.JulianDate.addSeconds(start, path.length, new Cesium.JulianDate())
      // let stop = Cesium.JulianDate.fromDate(new Date(path[path.length-1].gps_time))
      

      viewer.clock.startTime = start.clone()
      viewer.clock.currentTime = start.clone()
      viewer.clock.stopTime = stop.clone()
      viewer.clock.multiplier = speed || this.personPlaySpeed
      viewer.clock.clockRange = Cesium.ClockRange.CLAMPED
      viewer.timeline.zoomTo(start, stop)

      let moveEntity
      if (moveEntity = viewer.entities.getById('move-person')) {
        viewer.clock.currentTime = start.clone()
        this.animationControl('forward')
        return
      }
      
      let positionProperty = new Cesium.SampledPositionProperty()
      for (let i = 0; i< path.length; i++) {
        // let time = Cesium.JulianDate.fromDate(new Date(path[i].gps_time))
        let time =  Cesium.JulianDate.addSeconds(start, i, new Cesium.JulianDate())
        let position = Cesium.Cartesian3.fromDegrees(path[i].lon_lat[0], path[i].lon_lat[1])
        positionProperty.addSample(time, position)
      }

      positionProperty.setInterpolationOptions({
        interpolationDegree: 1,
        interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
      })

      console.log(man)
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
          show: true,
          uri: man,
          scale: 10,
          minimumPixelSize: 64,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
      })
      
      // viewer.trackedEntity = moveEntity
      this.animationControl('forward')
      
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
              // currentTime = start.clone()
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
    requestPersonTrack (param) {
      param.device_id = this.currentPersonnelData.id
      return new Promise((resolve, reject) => {
        this.$thirdUrl('attenceWatch_outer', '/extend/about_duty/history/track', url => {
          this.$post(url, param, (res) => {
            if (res.data) {
              const points = this.formatData(res.data)
              resolve(points)
            } else {
              reject(res.data.message)
            }
          })
        })
      })
    },
    personStartTimeChange (val) {
      this.personStartTime && this.getTips(this.personStartTime, this.personEndTime)
    },
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
      this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
      this.scenePickVersion1()
      this.viewer.scene.camera.setView(this.homeViewOptions)
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
      this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
      this.scenePickVersion1()
      this.viewer.scene.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(113.75996737452304, 34.797545852443754, 101.00276253205915),
        orientation: {
          heading: Cesium.Math.toRadians(48.11319432921307),
          pitch: Cesium.Math.toRadians(-27.101389302784444),
          roll: Cesium.Math.toRadians(0.150809650182686)
        },
        duration: 2
      })
      this.viewer.dataSources.removeAll()
      this.viewer.entities.removeAll()
    },
    carTrackClose () {
      this.carTrackVisible = false
      this.handleClose()
    },
    personTrackClose () {
      this.personTrackVisible = false
      this.handleClose()
    },
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
      * WGS84转GCj02
      * @param lng
      * @param lat
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
            this.infoBoxVisible = true
          }else{
            this.$message({
              message: '未获取到详细信息！',
              type: 'warning'
            })
          }
        })
      }else if(type == 'model_part'){
        this.$thirdUrl('component_outer', '/res/resource/component/basicComponent/queryCompSimpleList', (url)=>{
          this.$get(url, param).then( res => {
            if (res.data && res.data.list && res.data.list.length > 0) {
              this.selectModel.detail = res.data.list[0]
              this.infoBoxVisible = true
              console.log(this.selectModel)
            }else{
              this.$message({
                message: '未获取到详细信息！',
                type: 'warning'
              })
            }
          })
        })
      }
    },
    changeSceneMode(mode){
      this.$refs.modeSwitch.dType = mode;
      this.getCompLayer(this.layer)
    },
    /**
     * @description: 高德坐标、84坐标的对比
     * @param {type} 
     * @return: 
     */
    coordsCompare () {
      const viewer = this.viewer
      let gdPoint = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(113.815409, 34.78824),
        point: {
          pixelSize: 10,
          color: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 1,
          heightReference: Cesium.HeightReference.NONE
        }
      })
      let wgs84Coord = this.gcj02towgs84(113.815409, 34.78824)
      console.log(wgs84Coord)
      let wgs84Point = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(wgs84Coord[0], wgs84Coord[1]),
        point: {
          pixelSize: 10,
          color: Cesium.Color.RED,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 1,
          heightReference: Cesium.HeightReference.NONE
        }
      })
      viewer.zoomTo(gdPoint)
    },
    // 3dtile 移动
    startOffset (offsetAxis, flag) {
      let stepArr, tans
      this.unitStep = this.unitStep || '1'
      let step = flag === 'plus' ? parseFloat(this.unitStep) : -parseFloat(this.unitStep)

      if (offsetAxis === 'x') {
        stepArr = Cesium.Cartesian3.fromArray([step, 0, 0])
      } else if (offsetAxis === 'y') {
        stepArr = Cesium.Cartesian3.fromArray([0, step, 0])
      } else if (offsetAxis === 'z') {
        stepArr = Cesium.Cartesian3.fromArray([0, 0, step])
      }
      let tilesetArr = Cesium.Cartesian3.fromArray([
        this.tileset.modelMatrix[12],
        this.tileset.modelMatrix[13],
        this.tileset.modelMatrix[14]
      ])
      let trans = Cesium.Cartesian3.add(tilesetArr, stepArr, new Cesium.Cartesian3())
      this.tileset.modelMatrix = Cesium.Matrix4.fromTranslation(trans)

      if (!Cesium.defined(this.sumTrans)) {
        this.sumTrans = Cesium.Cartesian3.fromArray([0, 0, 0])
      }
      this.sumTrans =  Cesium.Cartesian3.add(this.sumTrans, stepArr, new Cesium.Cartesian3())
      this.sumOffset = `x: ${this.sumTrans.x}, y: ${this.sumTrans.y}, z: ${this.sumTrans.z}`
    }
  },
  watch: {
    sceneMode(){
      if(window.parent.popHome){
        window.parent.popHome.sceneMode = this.sceneMode;
      }
    },    
    windowPosition (val) {
      if (val) {
        if (this.infoBoxVisible) {
          let infobox = this.$el.getElementsByClassName('infobox-outer')[0]
          if (infobox) {
            infobox.style.left = val.x + 50 + 'px'
            infobox.style.top = val.y  - infobox.offsetHeight * 0.65 + 'px'
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
  display: block;  /* 打包时显示 */
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
  background: url(../../../static/images/detailBox.png) no-repeat;
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
  width: 80px;
}
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
  background: url(../../../static/images/detailBox.png) no-repeat;
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
