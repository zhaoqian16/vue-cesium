<!--
 * @Author: xiongqianqian
 * @Date: 2020-07-09 10:40:39
 * @LastEditTime: 2020-07-09 14:48:09
 * @LastEditors: Please set LastEditors
 * @Description: 基于cesium谷歌影像图（三维）和天地图矢量地图（二维）的二三维切换
 * @FilePath: \cesium-vue-test\src\components\tool\modeSwitcher_ct.vue
-->
<template>
  <div class="dSwitch" id="dSwitchContainer" ref="switcher">
    <el-radio-group v-model="dType" size="mini">
      <el-radio-button label="3D"></el-radio-button>
      <el-radio-button label="2D"></el-radio-button>
    </el-radio-group>
  </div>
</template>

<script>

import 'cesium/Source/Widgets/widgets.css'
let Cesium = require('cesium/Source/Cesium')
export default {
  data () {
    return {
      dType: '3D',
      cesiumExtent: '',
      tianExtent: ''
    }
  },
  mounted () {
    this.listen3DExtent()
    this.listen2DExtent()
  },
  methods: {
    listen3DExtent () {
      this.get3DExtent()
      this.$parent.viewer.scene.postRender.addEventListener(e => {
        this.get3DExtent()
      })
    },
    get3DExtent () {
      var rectangle = this.$parent.viewer.camera.computeViewRectangle()
      var west = rectangle.west / Math.PI * 180
      var north = rectangle.north / Math.PI * 180
      var east = rectangle.east / Math.PI * 180
      var south = rectangle.south / Math.PI * 180
      this.cesiumExtent = {
        west: west,
        east: east,
        north: north,
        south: south
      }
    },
    listen2DExtent () {
      const tMap = this.$parent.tMap
      tMap.addEventListener('move', () => {
        let extent = this.$parent.tMap.getBounds()
        this.tianExtent = {
          west: extent.kq.lng < -180 ? 180 : extent.kq.lng,
          east: extent.Lq.lng > 180 ? 180 : extent.Lq.lng,
          south: extent.Lq.lat,
          north: extent.kq.lat
        }
      })
      tMap.addEventListener('zoomend', () => {
        let extent = this.$parent.tMap.getBounds()
        this.tianExtent = {
          west: extent.kq.lng < -180 ? 180 : extent.kq.lng,
          east: extent.Lq.lng > 180 ? 180 : extent.Lq.lng,
          south: extent.Lq.lat,
          north: extent.kq.lat
        }
      })
      tMap.addEventListener('resize', () => {
        let extent = this.$parent.tMap.getBounds()
        this.tianExtent = {
          west: extent.kq.lng < -180 ? -180 : extent.kq.lng,
          east: extent.Lq.lng > 180 ? 180 : extent.Lq.lng,
          south: extent.Lq.lat,
          north: extent.kq.lat
        }
      })
    }
  },
  watch: {
    dType (val) {
      if (val === '3D') {
        this.$parent.$refs.cesiumMap.style.display = 'block'
        this.$parent.$refs.tianMap.style.display = 'none'
      } else {
        this.$parent.$refs.tianMap.style.display = 'block'
        this.$parent.$refs.cesiumMap.style.display = 'none'
      }
    },
    cesiumExtent: { // 三维联动二维
      handler (val, oldVal) {
        if (this.dType === '2D') return
        let points = [
          new T.LngLat(val.west, val.north),
          new T.LngLat(val.west, val.south),
          new T.LngLat(val.east, val.south),
          new T.LngLat(val.east, val.north)
        ]
        this.$parent.tMap.setViewport(points)
      },
      deep: true
    },
    tianExtent: { // 二维联动三维
      handler (val, oldVal) {
        if (this.dType === '3D') return
        var rectangle = Cesium.Rectangle.fromDegrees(val.west, val.south, val.east, val.north)
        this.$parent.viewer.camera.setView({
          destination: rectangle
        })
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.dSwitch {
  position: absolute;
  top: 5px;
  right: 5px
}
</style>
