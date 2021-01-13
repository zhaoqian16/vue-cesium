<!--
 * @Author: zhaoqian
 * @Date: 2019-12-27 15:41:13
 * @LastEditTime: 2020-03-27 17:02:41
 * @LastEditors: Please set LastEditors
 * @Description: 添加wms地图服务，实现点击要素并显示信息窗体
 * @FilePath: \cesium-vue\src\components\action\wmsInfobox.vue
 -->
<template>
  <div>
    <div class="button-list">
      <el-button size="mini" @click="addWmsLayer()">wms图层</el-button>
    </div>
    <div v-if="infoBoxVisible==true">
      <div class="info-box">
        <div class="head">
          <div class="title">属性</div>
          <div class="close" @click="closeInfoBox()">×</div>
        </div>
        <div class="body">
          <table>
            <tr v-for="(val, key) in pickedFeature.properties" v-if="val">
              <td>{{ key }}</td>
              <td>{{ val }}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import 'cesium/Widgets/widgets.css'
let Cesium = require('cesium/Cesium')

export default {
  data () {
    return {
      infoBoxVisible: false,
      windowPosition: '',
      pickedFeature: null
    }
  },
  methods: {
    /**
     * @description: 添加地图服务
     */
    addWmsLayer () {
      // 添加部件服务--------部件的样式时2d图形，所以无法三维显示
      const wmsP = new Cesium.WebMapServiceImageryProvider({
        url: 'http://localhost:8081/geoserver/districts/wms',
        layers: 'districts:t_basic_component',
        parameters: {
          service: 'WMS',
          version: '1.1.0',
          request: 'GetMap',
          transparent: true,
          format: 'image/png'
        },
        tileWidth: 256,
        tileHeight: 256
      })
      let wmsLayer = new Cesium.ImageryLayer(wmsP, {
        show: true,
      })
      this.$parent.viewer.imageryLayers.add(wmsLayer)
      this.handleClickEvent()
    },
    /**
     * @description: 给地图添加点击事件，使点击要素获取要素信息并显示信息窗体
     */
    handleClickEvent () {
      let handler = new Cesium.ScreenSpaceEventHandler(this.$parent.viewer.scene.canvas)
      handler.setInputAction( e => {
        // 获取与点击点光线相交的图层要素
        let pickRay = this.$parent.viewer.camera.getPickRay(e.position)  //获取光线
        let featurePromise = this.$parent.viewer.imageryLayers.pickImageryLayerFeatures(pickRay, this.$parent.viewer.scene)
        if (Cesium.defined(featurePromise)) {
          Cesium.when(featurePromise, (features) => {
            if (features.length > 0) {
              let pickFeature = features[0]
              let pickFeaturePosition = pickFeature.data.geometry.coordinates
              let cartesian3 = Cesium.Cartesian3.fromDegrees(pickFeaturePosition[0], pickFeaturePosition[1])  // 经纬度坐标转化为世界坐标
              this.pickedFeature = {
                position: cartesian3,  
                properties: pickFeature.properties
              }
              this.infoBoxVisible = true
              this.initInfoBox(this.pickedFeature.position)
            } else {
              this.infoBoxVisible = false
            }
          })
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    },
    /**
     * @description: 初始化信息窗体的位置
     * @param {position} 世界坐标
     */
    initInfoBox (position) {
      let cartesian = position
      this.windowPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.$parent.viewer.scene, cartesian) //世界坐标转化为屏幕坐标
      let removeHandler = this.$parent.viewer.scene.postRender.addEventListener( () => {
        this.windowPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.$parent.viewer.scene, cartesian)
      })
    },
   /**
     * @description: 关闭信息窗体
     */
    closeInfoBox () {
      this.infoBoxVisible = false
    }
  },
  watch: {
    windowPosition (val) {
      if (this.infoBoxVisible) {
        let infobox = this.$el.getElementsByClassName("info-box")[0]
        if (infobox) {
          infobox.style.left = val.x -150 + 'px'
          infobox.style.top = val.y + 'px'
        }
      }
    },
  }
}
</script>
<style scoped>

.info-box {
  position: absolute;
  width: 240px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  border-bottom:2px solid #e8a346;
  line-height: 150%;
  filter: progid:DXImageTransform.Microsoft.Gradient(startColorStr='#FFFFFF',endColorStr='#FAFAFA',gradientType='0');
	background: -webkit-gradient(linear,center top,center bottom,from(#fff), to(#fafafa));
	color: #7e7975;
	box-shadow:	0 2px 2px rgba(0,0,0,0.2),0 1px 5px rgba(0,0,0,0.2),  0 0 0 10px rgba(255,255,255,0.1);
	overflow: auto;
  max-height: 400px;
}
.info-box .head {
  font-weight: 700;
  font-size: 14px;
  color: #666;
}
.head .title {
  width: 168px;
  padding: 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow-x: hidden;
  line-height: 100%;
}
.head .close {
  position: absolute;
  font-size: 20px;
  top: 5px;
  right: 5px;
  width: 12px;
  height: 12px;
  text-align: center;
  line-height: 12px;
  font-weight: 400;
}
.info-box .body {
  border-top: 1px solid #f6f6f6;
	background:#f6f6f6;
	min-height:70px;
}
.info-box .body p {
  margin: 10px;
  font-size: 12px;
  white-space: normal;
}
</style>