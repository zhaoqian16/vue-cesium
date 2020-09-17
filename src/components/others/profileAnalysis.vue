<!--
 * @Author: xiongqianqian
 * @Date: 2020-08-11 11:04:28
 * @LastEditTime: 2020-08-12 17:59:59
 * @LastEditors: Please set LastEditors
 * @Description: 获取断面高度的变化图
 * @FilePath: \cesium-vue-test\src\components\others\sectionHRange.vue
-->
<template>
  <div class="map">
    <Map></Map>
    <div class="operation">
      <el-button-group>
        <el-button size="mini" circle type="primary" @click="drawSection()">截面</el-button>
      </el-button-group>
    </div>

    <div class="section_info" v-if="sectionInfoVisible" style="top: 200px" v-drag>
      <div class="header">
        <span>剖面示意图</span>
        <span class="close" @click="handleClose()">×</span>
      </div>
      <div class="body">
        <div ref="chart" class="chart"></div>
      </div>
    </div>
    
  </div>
</template>

<script>
import 'cesium/Source/Widgets/widgets.css'
import Map from '../map.vue'

let Cesium = require('cesium/Source/Cesium')
let echarts = require('echarts')

export default {
  data () {
    return {
      sectionInfoVisible: false
    }
  },
  components: {
    Map
  },
  methods: {
    /**
     * @description: 绘制断面
     * @param {type} 
     * @return {type} 
     */
    drawSection () {
      const viewer = this.$children[0].viewer
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection)
      let section = {
        entity: null,
        points: [],
        interpCaretesians: [],
        clampCartegraphics: [],
        interpDegrees: [],
      }
      if (viewer.terrainProvider instanceof Cesium.CesiumTerrainProvider) {
        viewer.scene.globe.depthTestAgainstTerrain = true
      }

      handler.setInputAction(e => {
        let cartesian = this.getPointFromWindowPoint(e.position)
        if (!Cesium.defined(cartesian)) return
        if (!Cesium.defined(section.entity)) {
          section.points.push(cartesian.clone())
          section.points.push(cartesian)
          section.entity = viewer.entities.add({
            name: 'section-line',
            polyline: {
              positions: section.points,
              material: Cesium.Color.RED,
              width: 3,
              clampToGround: true
            }
          })
        } else {
          handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
          handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
          
          section.interpCaretesians = this.interpolation(section.points, 20)
          this.sectionInfoVisible = true
          this.sampleHeight(section.interpCaretesians, (array) => {
            let xData = [], yData = []
            for (let i = 0; i < array.length; i++) {
              if (i === 0) {
                xData[i] = 0
              } else {
                let point1 = new Cesium.Cartesian3.fromDegrees(array[i-1].lng, array[i-1].lat, 0)
                let point2 = new Cesium.Cartesian3.fromDegrees(array[i].lng, array[i].lat, 0)
                xData[i] = xData[i-1] + parseFloat(this.getSpaceDistance([point1, point2]))
              }
              yData[i] = parseFloat(array[i].alt.toFixed(2))
            }
            console.log(yData)
            this.showChart(xData, yData)
          })
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

      handler.setInputAction(e => {
        if (!Cesium.defined(section.entity)) return
        let moveCartesian = this.getPointFromWindowPoint(e.endPosition)
        if (!Cesium.defined(moveCartesian)) return
        section.points.pop()
        section.points.push(moveCartesian)
        section.entity.polyline.positions = new Cesium.CallbackProperty(() => {
          return section.points
        })
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    },
    getPointFromWindowPoint (windowPosition) {
      const viewer = this.$children[0].viewer
      if (viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider) { //未加地形
        return viewer.camera.pickEllipsoid(windowPosition, viewer.scene.globe.ellipsoid)
      } else if (viewer.terrainProvider instanceof Cesium.CesiumTerrainProvider) {
        return viewer.scene.pickPosition(windowPosition)
      } else {
        let ray = viewer.scene.camera.getPickRay(windowPosition)
        return viewer.scene.globe.pick(ray, viewer.scene)
      }
    },
    interpolation (positionArray, num) {
      let spline = new Cesium.LinearSpline({
        times: [0.0, 1.0],
        points: positionArray
      })
      let interpArr = []
      for (let i = 0; i <= num; i ++) {
        interpArr.push(spline.evaluate(i / num))
        this.$children[0].viewer.entities.add({
          position: spline.evaluate(i / num),
          point: {
            pixelSize: 5,
            color: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 1,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          }
        })
      }
      return interpArr
    },
    cartesian3ToWgs84 (viewer, cartesian) {
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
      let lat = Cesium.Math.toDegrees(cartographic.latitude)
      let lng = Cesium.Math.toDegrees(cartographic.longitude)
      let alt = viewer.scene.globe.getHeight(cartographic)
      return {
        lat: lat,
        lng: lng,
        alt: alt
      }
    },
    /**
     * @description: 计算三维坐标对应的贴地坐标
     * @param {type} 
     * @return {type} 
     */
    clampedCartesian (cartesian) {
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
      return new Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude)
    },
    showChart (xData, yData) {
      let myChart = echarts.init(this.$refs.chart)
      myChart.setOption({
        // title: {
        //   left: 'center',
        //   text: '剖面示意图'
        // },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['']
        },
        toolbox: {
          show : false,
          feature : {
            mark : {show: true},
            dataView : {show: true, readOnly: false},
            magicType : {show: true, type: ['line', 'bar']},
            restore : {show: true},
            saveAsImage : {show: true}
          }
        },
        calculable : true,
        xAxis: {
          type: 'category',
          name: '长度(米)',
          nameLocation: 'center',
          nameGap: 30,
          boundaryGap : false,
          data: xData,
          axisLabel: {
            color: 'white'
          },
          axisLine: {
            lineStyle: {
              color: 'white'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '高程（米）',
          axisLabel: {
            color: 'white'
          },
          axisLine: {
            lineStyle: {
              color: 'white'
            }
          }
        },
        series: [{
          name: '高程',
          type: 'line',
          data: yData,
          markPoint: {
            data: [
              { type : 'max', name: '最大值' },
              { type : 'min', name: '最小值' }
            ]
          },
          markLine: {
            data : [
              {type : 'average', name: '平均值'}
            ]
          }
        }]
      })
      console.log(myChart)
    },
    getSpaceDistance (positions) {
      /*
      * new Cesium.EllipsoidGeodesic(start, end, ellipsoid)获取两点之间的大底线
      * start和end是Cartographic，弧度坐标
      * 返回值的属性surfaceDistance获取两点之间的地表距离
      */
      let distance = 0
      for (let i = 0; i < positions.length - 1; i++) {
        let startCartographic = Cesium.Cartographic.fromCartesian(positions[i])
        let endCartographic = Cesium.Cartographic.fromCartesian(positions[i + 1])
        let geodesic = new Cesium.EllipsoidGeodesic(startCartographic, endCartographic)
        let s = geodesic.surfaceDistance
        s = Math.sqrt(Math.pow(s, 2) + Math.pow(endCartographic.height - startCartographic.height, 2))
        distance = distance + s
      }
      // 可把 Number 四舍五入为指定小数位数的数字。
      return parseInt(distance)
    },
    sampleHeight (cartesianArray, callback) {
      const viewer = this.$children[0].viewer
      const terrainProvider = viewer.terrainProvider
      let wgs84Array = []
      if (terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
        cartesianArray.map((item, index) => {
          wgs84Array[index] = this.cartesian3ToWgs84(viewer, item) // 不准确
        })
        callback(wgs84Array)
      } else if (terrainProvider instanceof Cesium.CesiumTerrainProvider) {
        let clampCartegraphicArray = []
        cartesianArray.map((item, index) => { 
          let coord = this.cartesian3ToWgs84(viewer, item)
          clampCartegraphicArray[index] = Cesium.Cartographic.fromDegrees(coord.lng, coord.lat)
        })
        Cesium.sampleTerrainMostDetailed(terrainProvider, clampCartegraphicArray)
        .then(updatePositions => {
          updatePositions.map((item, index) => {
            wgs84Array[index] = {
              lat: Cesium.Math.toDegrees(item.latitude),
              lng: Cesium.Math.toDegrees(item.longitude),
              alt: item.height
            }
          })
          callback(wgs84Array)
        })
      }
    },
    handleClose () {
      this.sectionInfoVisible = false
    }
  },
  directives: {
    drag: {
      inserted: (el, binding, vnode) => {
        el.onmousedown = ((e) => {
          if (e.target.className !== 'section_info' && e.target.parentElement.className !== 'section_info') {
            return
          }
          // 获取鼠标在弹窗中的位置
          let mouseX = e.clientX - vnode.elm.offsetLeft
          let mouseY = e.clientY - vnode.elm.offsetTop
         
          document.onmousemove = (e => {
            // 鼠标移动时，弹窗的实时位置
            let left = e.clientX - mouseX
            let top = e.clientY - mouseX
            let minX = 0 + vnode.elm.offsetWidth / 2
            let maxX = window.innerWidth - vnode.elm.offsetWidth / 2
            if (left <= minX) {
              left = minX
            } else if (left > maxX) {
              left = maxX
            }

            let minY = 0
            let maxY = window.innerHeight - vnode.elm.offsetHeight
            if (top <= minY) {
              top = minY
            } else if (top > maxY) {
              top = maxY
            }

            // 设置弹窗的位置
            vnode.elm.style.left = left + "px"
            vnode.elm.style.top = top + "px"
          })

          document.onmouseup = (() => {
            document.onmousemove = document.onmouseup = null
          })
        })
      }
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

.section_info {
  width: 500px;
  position: absolute;
  top: 200px;
  left: 50%;
  transform: translate(-50%, 0);
  background: url(../../../static/images/detailBox.png) no-repeat;
  background-size: 100% 100%;
  color: #fff;
}
.section_info .header {
  margin: 10px 20px 0 20px;
  line-height: 40px;
  font-size: 16px;
  border-bottom: 1px solid #fff;
}
.section_info .close {
  font-size: 30px;
  position: absolute;
  right: 20px;
}
.section_info .close:hover {
  cursor: pointer;
}
.section_info .body {
  /* margin: 20px 0 15px; */
  font-size: 14px;
}
.section_info .chart {
  height: 300px;
  width: 100%;
}
</style>