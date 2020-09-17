<template>
  <div class="map">
    <!-- 三维地图容器 -->
    <div id="cesiumContainer" ref="cesiumMap">
      <div class="cameraInfo">
        <div>{{currentCameraInfo}}</div>
      </div>
    </div>
    <!-- 二维地图容器 -->
    <div id="tianContainer" ref="tianMap">

    </div>
    <div class="tool" v-if="mapInited">
      <SceneModeSwitcher1></SceneModeSwitcher1>
      <BasemapSwitcher></BasemapSwitcher>
      <LayerManagement></LayerManagement>
      <DrawEntity></DrawEntity>
      <Meature></Meature>
      <Wander></Wander>
      <AddressSearch></AddressSearch>
      <!-- <Move3dtile></Move3dtile> -->
    </div>
  </div>
</template>

<script>
import 'cesium/Source/Widgets/widgets.css'
import CesiumNavigation from 'cesium-navigation-es6'
let Cesium = require('cesium/Source/Cesium')
// 工具组件
import SceneModeSwitcher1 from './tool/sceneModeSwitcher1'
import BasemapSwitcher from './tool/basemapSwitcher'
import LayerManagement from './tool/layerManagement'
import DrawEntity from './tool/drawEntity'
import Meature from './tool/meature'
import Wander from './tool/wander'
import AddressSearch from './tool/addressSearch'
import Move3dtile from './tool/move3dtile'

export default {
  data () {
    return {
      viewer: '',
      tMap: '',
      mapInited: false,
      currentCameraInfo: ''
    }
  },
  components: {
    SceneModeSwitcher1,
    BasemapSwitcher,
    LayerManagement,
    DrawEntity,
    Meature,
    Wander,
    AddressSearch,
    Move3dtile
  },
  mounted () {
    this.initCMap()
    this.initTMap()
    this.mapInited = true
  },
  methods: {
    /**
     * @description: 初始化cesium视图
     * @param {type}
     * @return:
     */
    initCMap () {
      Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4ZDliYjU2OS03YTA0LTQ4NjUtYWE4Zi1iZTMzOTEzOGI5NmIiLCJpZCI6MTg0MzQsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NzM4MDA2MzR9.TiRGDlgKIT4SB2apFIwEAWyqp5Ad_qSqh3zrpE0l8h4'
      this.viewer = new Cesium.Viewer('cesiumContainer', {
        animation: true, // 关闭动画
        timeline: true, // 关闭时间线
        navigationHelpButton: false, // 关闭显示默认的相机控制提示
        fullscreenButton: false, // 关闭全屏按钮
        geocoder: false, // 关闭geocoder小部件
        selectionIndicator: false,
        infoBox: false, // 点击要素之后显示的信息,默认true
        baseLayerPicker: false, // 是否显示图层选择控件
        sceneModePicker: false, // 是否显示投影方式控件
        homeButton: false // 是否显示默认定位点的控件
      })
      this.viewer._cesiumWidget._creditContainer.style.display = 'none' // 默认去除版权信息
      this.viewer.imageryLayers.get(0).show = false // 默认不加载影像
      this.viewer.imageryLayers.remove(this.viewer.imageryLayers.get(0))
      this.viewer.scene.skyBox.show = false // 默认不显示背景图片
      this.viewer.scene.backgroundColor = new Cesium.Color(0.0, 0.0, 0.0, 0.0) // 默认将背景颜色设置为黑色
      this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK) // 屏蔽默认双击事件
      this.viewer.scene.preRender.addEventListener(this.undergroundMode) // 禁止相机进入地面以下

      // 动画和时间线控件的隐藏
      this.viewer.animation.container.style.visibility = 'hidden'
      this.viewer.timeline.container.style.visibility = 'hidden'

      // 如果使用默认的二三维切换工具，可去掉二三维切换动画效果
      // this.viewer.sceneModePicker.viewModel.duration = 0.0

      // 添加指南针
      var options = {
        defaultResetView: Cesium.Rectangle.fromDegrees(90, 5, 130, 60), // 用于在使用重置导航重置地图视图时设置默认视图控制。接受的值是Cesium.Cartographic 和 Cesium.Rectangle.
        enableCompass: true, // 用于启用或禁用罗盘。true是启用罗盘，false是禁用罗盘。默认值为true。如果将选项设置为false，则罗盘将不会添加到地图中。
        enableZoomControls: true, // 用于启用或禁用缩放控件。true是启用，false是禁用。默认值为true。如果将选项设置为false，则缩放控件将不会添加到地图中。
        enableDistanceLegend: false, // 用于启用或禁用距离图例。true是启用，false是禁用。默认值为true。如果将选项设置为false，距离图例将不会添加到地图中。
        enableCompassOuterRing: true // 用于启用或禁用指南针外环。true是启用，false是禁用。默认值为true。如果将选项设置为false，则该环将可见但无效。
      }
      CesiumNavigation(this.viewer, options)
      // 修改指南针的样式
      document.getElementsByClassName('navigation-controls')[0].style.backgroundColor = 'rgba(47, 53, 60, 0.5)'

      this.addBaseMap()
      this.directLocation()
      this.listenCamera()
    },
    /**
     * @description: 初始化天地图矢量地图
     * @param {type}
     * @return:
     */
    initTMap () {
      this.tMap = new T.Map('tianContainer', {
        center: new T.LngLat(116.40769, 39.89945),
        zoom: 12
      })
    },
    /**
     * @description: 默认添加NaturalEarthII为底图
     * @param {type}
     * @return:
     */
    addBaseMap () {
      let baseMap = new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
        url: '../../static/basemap/NaturalEarthII/{z}/{x}/{reverseY}.jpg',
        fileExtension: 'jpg',
        minimumLevel: 0,
        maximumLevel: 2,
        tileWidth: 256,
        tileHeight: 256,
        tilingScheme: new Cesium.GeographicTilingScheme({
          ellipsoid: Cesium.Ellipsoid.WGS84,
          rectangle: new Cesium.Rectangle.fromDegrees(-180, -90, 180, 90)
        })
      }), {
        show: true,
        brightness: 1.76,
        contrast: 1.48,
        hue: 0,
        saturation: 1.44,
        gamma: 0.68
      })
      baseMap.title = 'NaturalEarthII'
      this.viewer.imageryLayers.add(baseMap)
    },
    /**
     * @description: 设置地下浏览模式
     * @param {type}
     * @return:
     */
    undergroundMode () {
      if (this.viewer.scene.mode === Cesium.SceneMode.SCENE3D) {
        this.viewer.camera._suspendTerrainAdjustment = false
        this.viewer.scene.screenSpaceCameraController.enableCollisionDetection = true
        // this.viewer.camera._adjustHeightForTerrain() //1.71.0版本不可用
      }
    },
    /**
     * @description: 定位——直接定位至目标区域
     * @param {type}
     * @return:
     */
    directLocation () {
      const position = new Cesium.Cartesian3.fromDegrees(113.73089959, 34.755, 60000) // 经度、纬度、高度形成的笛卡尔三维坐标
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
     * @description: 定位——转动定位至目标区域并放大至合适视野
     * @param {type}
     * @return:
     */
    rotationLocation () {
      const position = new Cesium.Cartesian3.fromDegrees(113.73089959, 34.755, 1000000.0) // 经度、纬度、高度形成的笛卡尔三维坐标
      const orientation = new Cesium.HeadingPitchRoll.fromDegrees(0, -90, 0)
      const startView = {
        destination: position,
        duration: 50,
        flyOverLongitude: 1,
        orientation: {
          heading: orientation.heading,
          pitch: orientation.pitch,
          roll: orientation.roll
        }
      }
      const endView = {
        destination: Cesium.Cartesian3.fromDegrees(113.73089959,34.755, 100000.0),
        orientation: {
          heading: orientation.heading,
          pitch: orientation.pitch,
          roll: orientation.roll
        }
      }
      startView.complete = () => {
        this.viewer.camera.flyTo(endView)
      }
      this.viewer.camera.flyTo(startView)
    },
    /**
     * @description: 监听事件，获取当前相机参数
     * @param {type}
     * @return:
     */
    listenCamera () {
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
      this.currentCameraInfo = `经度: ${cameraInfo.longitude}° 纬度: ${cameraInfo.latitude}° 高度: ${cameraInfo.height} 航偏角: ${cameraInfo.heading}° 俯仰角: ${cameraInfo.pitch}° 翻滚角: ${cameraInfo.roll}°`
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
#cesiumContainer {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.cameraInfo {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 999;
  color: #000;
  background-color: #888 ;
  opacity: 0.8;
  padding: 5px 5px;
  font-size: 12px;
}
#tianContainer {
  width: 100%;
  height: 100%;
  z-index: 0;
}
/* 指南针样式 */
#navigationDiv .compass {
  top: 50px;
}
#navigationDiv .navigation-controls {
  top: 150px;
}
</style>
