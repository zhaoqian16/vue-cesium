<!--
 * @Author: xiongqianqian
 * @Date: 2020-07-17 16:16:45
 * @LastEditTime: 2020-07-22 17:22:55
 * @LastEditors: Please set LastEditors
 * @Description: 定义漫游路线，实现地面漫游
 * @FilePath: \cesium-vue-test\src\components\tool\wander.vue
-->
<template>
  <div>
    <div class="personWander">
      <el-button-group>
        <el-button size="mini" circle type="primary" @click="drawRoute()">定义路线</el-button>
        <el-button size="mini" circle type="primary" @click="wandering()">开始漫游</el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script>
import 'cesium/Source/Widgets/widgets.css'
// let jsts = require('jsts')
let Cesium = require('cesium/Source/Cesium')

export default {
  data () {
    return {
      route: []
    }
  },
  created () {

  },
  methods: {
    /**
     * @description: 定义漫游路线
     * @param {type}
     * @return:
     */
    drawRoute () {
      const viewer = this.$parent.viewer
      if (Cesium.defined(viewer.entities.getById('wander-route'))) return
      let PolylinePrimitive = (function () {
        function _ (positions) {
          this.options = {
            id: 'wander-route',
            name: '漫游路线',
            polyline: {
              show: true,
              positions: [],
              material: Cesium.Color.RED,
              width: 3,
              clampToGround: true
            }
          }
          this.positions = positions
          this._init()
        }

        _.prototype._init = function () {
          let _self = this
          let _update = function () {
            return _self.positions
          }
          this.options.polyline.positions = new Cesium.CallbackProperty(_update, false)
          viewer.entities.add(this.options)
        }

        return _
      })()

      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
      let positions = []
      let floatPoint
      let polyline
      handler.setInputAction(e => {
        let cartesian = viewer.camera.pickEllipsoid(e.position, viewer.scene.globe.ellipsoid)
        if (positions.length === 0) {
          floatPoint = viewer.entities.add({
            position: cartesian,
            point: {
              color: Cesium.Color.WHITE,
              pixelSize: 10,
              outlineColor: Cesium.Color.fromCssColorString('#010301'),
              outlineWidth: 0.5
            }
          })
          positions.push(cartesian.clone())
          this.route.length = 0
          this.route = []
          polyline = new PolylinePrimitive(positions)
        }
        positions.push(cartesian)
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

      handler.setInputAction(e => {
        let cartesian = viewer.camera.pickEllipsoid(e.endPosition, viewer.scene.globe.ellipsoid)
        if (!Cesium.defined(polyline)) return
        if (cartesian) {
          floatPoint.position.setValue(cartesian)
          positions.pop()
          positions.push(cartesian)
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

      handler.setInputAction(e => {
        viewer.entities.remove(floatPoint)
        handler.destroy()
        // 将世positions转化为经纬度坐标
        // for (let i = 0; i < positions.length; i++) {
        //   let wgsPoint = this.cartesian3ToWgs84(positions[i])
        //   this.route.push(wgsPoint)
        // }
        this.route = positions
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    },
    /**
     * @description: 笛卡尔坐标（世界坐标）转换为WGS84坐标系
     * @param {cartesian} 笛卡尔坐标（世界坐标）
     * @return:
     */
    cartesian3ToWgs84 (cartesian) {
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
      let lat = Cesium.Math.toDegrees(cartographic.latitude)
      let lng = Cesium.Math.toDegrees(cartographic.longitude)
      let alt = cartographic.height
      return {
        lng: lng,
        lat: lat,
        alt: alt
      }
    },
    /**
     * @description: tsjs对绘制的路径进行加密
     * @param {type}
     * @return:
     */
    density () {
      // 加密
      let geomFactory = new jsts.geom.GeometryFactory()
      let coordinateArr = []
      this.route.forEach(item => {
        let coordinate = new jsts.geom.Coordinate(item.lng, item.lat, item.alt)
        coordinateArr.push(coordinate)
      })
      let line = geomFactory.createLineString(coordinateArr)
      let densifier = new jsts.densify.Densifier(line)
      densifier.setDistanceTolerance(0.001)
      let densifyGeom = densifier.getResultGeometry()
      let densifyCoords = densifyGeom.getCoordinates()
      let densifyArr = []
      densifyCoords.forEach(item => {
        densifyArr.push(Cesium.Cartesian3.fromDegrees(item.x, item.y))
      })
      // 添加加密的线
      const viewer = this.$parent.viewer
      let routeEntity = viewer.entities.add({
        id: 'wander-route-densify',
        name: '漫游加密路线',
        polyline: {
          show: true,
          positions: densifyArr,
          material: Cesium.Color.RED,
          width: 3,
          clampToGround: true
        }
      })
      viewer.entities.remove(viewer.entities.getById('wander-route'))
      viewer.zoomTo(routeEntity)

      return densifyArr
    },
    interpolation (num) {
      let spline = new Cesium.LinearSpline({
        times: [0.0, 1.5, 3.0, 4.5, 6.0],
        points: this.route
      })
      let interpArr = []
      for (let i = 0; i <= num; i++) {
        interpArr.push(spline.evaluate(i / num))
      }

      const viewer = this.$parent.viewer
      let routeEntity = viewer.entities.add({
        id: 'wander-route-densify',
        name: '漫游加密路线',
        polyline: {
          show: true,
          positions: interpArr,
          material: Cesium.Color.RED,
          width: 3,
          clampToGround: true
        }
      })
      viewer.entities.remove(viewer.entities.getById('wander-route'))
      viewer.zoomTo(routeEntity)

      return interpArr
    },
    /**
     * @description: 漫游—开始、暂停、继续
     * @param {type}
     * @return:
     */
    wandering () {
      const viewer = this.$parent.viewer
      const path = this.interpolation(200)

      const startTime = (new Date()).getTime()
      let start = Cesium.JulianDate.fromDate(new Date(startTime - 2 * 60 * 60 * 1000))
      let stop = Cesium.JulianDate.addSeconds(start, 5 * path.length, new Cesium.JulianDate())

      viewer.clock.startTime = start.clone()
      viewer.clock.currentTime = start.clone()
      viewer.clock.stopTime = stop.clone()
      viewer.clock.multiplier = 5
      viewer.clock.clockRange = Cesium.ClockRange.CLAMPED

      let wanderEntity

      let positionProperty = new Cesium.SampledPositionProperty()
      path.forEach((cartesian, i) => {
        let time = Cesium.JulianDate.addSeconds(start, i * 5, new Cesium.JulianDate())
        positionProperty.addSample(time, cartesian)
      })
      
      wanderEntity = viewer.entities.add({
        name: 'wander-entity',
        id: 'wander-entity',
        availability: new Cesium.TimeIntervalCollection([
          new Cesium.TimeInterval({ start: start, stop: stop })
        ]),
        position: positionProperty,
        orientation: new Cesium.VelocityOrientationProperty(positionProperty),
        viewerFrom: new Cesium.Cartesian3(10000, 10000, 20000),
        model: {
          uri: '../../../static/3dModel/Cesium_Man.glb',
          scale: 1,
          minimumPixelSize: 32,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
      })
      viewer.trackedEntity = wanderEntity
      this.animationControl('forward')
    },
    animationControl (action) {
      let viewer = this.$parent.viewer
      let viewModel = viewer.animation.viewModel
      let command
      if (action === 'reverse') { // 反向播放
        command = viewModel.playReverseViewModel.command
      } else if (action === 'pause') { // 暂停
        command = viewModel.pauseViewModel.command
      } else if (action === 'forward') { // 播放
        command = viewModel.playForwardViewModel.command
      } else if (action === 'faster') { // 加快速度
        command = viewModel.faster
      } else if (action === 'slower') { // 放慢速度
        command = viewModel.slower
      }
      if (command.canExecute) {
        command()
      }
    }
  }
}
</script>

<style>
.personWander {
  position: absolute;
  top: 100px;
  left: 10px;
}
</style>