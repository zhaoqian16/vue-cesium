<!--
 * @Author: your name
 * @Date: 2020-08-14 09:17:02
 * @LastEditTime: 2020-08-17 17:54:00
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \cesium-vue-test\src\components\others\submergAnalysis.vue
-->
<template>
  <div class="map">
    <Map></Map>
    <div class="operation">
      <el-button-group>
        <el-button size="mini" circle type="primary" @click="drawPolygon()">画面</el-button>
        <el-button size="mini" circle type="primary" @click="start()">开始</el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script>
import Map from '../map'
import Heatmap from 'heatmap.js'

import 'cesium/Source/Widgets/widgets.css'
let Cesium = require('cesium/Source/Cesium')
export default {
  data () {
    return {
      method: null
    }
  },
  components: {
    Map
  },
  mounted () {
    this.submergeMethod = this.createMethod()
  },
  methods: {
    createMethod () {
      let _self = this
      class SubmergenceAnalysis {
        constructor (viewer, height_min, height_max, speed) {
          this.viewer = viewer
          this.height_min = height_min
          this.height_max = height_max
          this.speed = speed
          this.polyPoints = []
          this.polygon = null
          this.polyline = []
          this.extrudedHeight = height_min
          this.timer = null
          this._addListener()
        }
        _addListener () {
          const viewer = this.viewer
          viewer.scene.globe.depthTestAgainstTerrain = true
          this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
          this._drawPoly(this.handler, viewer)
        }
        // 绘制面
        _drawPoly (handler, viewer, callback) {
          this.polyPoints = []
          let positions = this.polyPoints
          let floatPoint = null

          if (Cesium.defined(this.polygon)) {
            viewer.entities.remove(this.polygon)
            this.polygon = null
          }
          
          handler.setInputAction(e => {
            let cartesian = viewer.scene.pickPosition(e.position)
            if (!Cesium.defined(cartesian)) return
            cartesian =  _self.clampedCartesian(cartesian)
            if (!Cesium.defined(this.polygon)) {
              positions.push(cartesian.clone())
              this.polygon = viewer.entities.add({
                name: 'polygon',
                polygon: {
                  hierarchy: new Cesium.CallbackProperty(() => {
                    return new Cesium.PolygonHierarchy(positions)
                  }, false),
                  material: new Cesium.Color.fromBytes(64, 157, 253, 100),
                  heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                  // perPositionHeight: true,
                  
                }
              })
              this.polyline = viewer.entities.add({
                name: 'polyline',
                polyline: {
                  positions: new Cesium.CallbackProperty(() => {
                    return positions
                  }),
                  material: new Cesium.Color.fromBytes(64, 157, 253),
                  width: 3,
                  clampToGround: true
                }
              })
            }
            positions.push(cartesian)
          }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

          handler.setInputAction(e => {
            let cartesian = this.viewer.scene.pickPosition(e.endPosition)
            if (!Cesium.defined(cartesian)) return
            cartesian =  _self.clampedCartesian(cartesian)
            if (Cesium.defined(this.polygon)) {
              positions.pop()
              positions.push(cartesian)
            }
          }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

          handler.setInputAction(e => {
            positions.push(positions[0].clone())
            handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
            handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK)
          }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

          
        }

        start () {
          this.polygon.polygon.extrudedHeight =  new Cesium.CallbackProperty(() => {
            return this.extrudedHeight
          }, false)
          const that = this
          this.timer = window.setInterval(() => {
            if (that.height_max > that.extrudedHeight && that.extrudedHeight >= that.height_min) {
              that.extrudedHeight = that.extrudedHeight + that.speed
            } else {
              that.extrudedHeight = that.height_min
            }
          }, 500);
        }
      }
      const viewer = this.$children[0].viewer
      return new SubmergenceAnalysis(viewer, 0, 500, 10)
    },
    drawPolygon () {
      this.submergeMethod._drawPoly(this.submergeMethod.handler, this.submergeMethod.viewer, () => {
        const viewer = this.submergeMethod.viewer
        const globe = viewer.scene.globe
        let positions = this.submergeMethod.polygon.polygon.hierarchy.getValue().positions
        let boundingSphere = Cesium.BoundingSphere.fromPoints(positions)
        globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
          modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(boundingSphere.center),
          planes: [
            new Cesium.ClippingPlane(new Cesium.Cartesian3(1.0, 0.0, 0.0), boundingSphere.radius),
            new Cesium.ClippingPlane(new Cesium.Cartesian3(-1.0, 0.0, 0.0),  boundingSphere.radius),
            new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 1.0, 0.0),  boundingSphere.radius),
            new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, -1.0, 0.0),  boundingSphere.radius)
          ],
          unionClippingRegions: true
        })
        globe.clippingPlanes.enabled = true
        viewer.camera.viewBoundingSphere(boundingSphere)
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
      })
    },
    start () {
      this.submergeMethod.start()
    },
    /**
     * @description: 计算三维坐标对应的贴地坐标
     * @param {type} 
     * @return {type} 
     */
    clampedCartesian (cartesian) {
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
      return Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude)
    }
  }
}
</script>

<style scoped>
.map {
  position: absolute
}
.operation {
  position: relative;
  top: 150px;
  left: 10px;
}
</style>