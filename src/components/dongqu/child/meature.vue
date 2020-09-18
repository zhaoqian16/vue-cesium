<!--
 * @Author: xiongqianqian
 * @Date: 2020-07-09 10:54:36
 * @LastEditTime: 2020-08-25 17:44:49
 * @LastEditors: Please set LastEditors
 * @Description: 测距、测面积
 * @FilePath: \vue-cesium\src\components\tool\meature.vue
-->
<template>
  <div>
    <div class="meature">
      <el-button-group>
        <el-button size="mini" @click="meatureLineSurface()">测距</el-button>
        <el-button size="mini" @click="meatureAreaSpace()">测面积</el-button>
        <el-button size="mini" @click="meatureTriangleSpace()">三角测量</el-button>
        <el-button size="mini" @click="meatureAngle()">测角度</el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script>
import 'cesium/Source/Widgets/widgets.css'
let Cesium = require('cesium/Source/Cesium')

export default {
  mounted () {
    this.$parent.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(113.72653841711949, 34.81400680763838),
      model: {
        uri: '../../../static/3dModel/Cesium_Man.glb',
        scale: 10,
        minimumPixelSize: 64,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    })
  },
  methods: {
    /**
     * @description: 测距--地表
     * @param {type}
     * @return:
     */
    meatureLineSurface () {
      let viewer = this.$parent.viewer
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection)
      let positions = []
      let distance = 0
      let cartesian = null
      let floatingPoint
      let poly = null
      let textDistance

      handler.setInputAction(e => {
        let cartesian = viewer.camera.pickEllipsoid(e.endPosition, viewer.scene.globe.ellipsoid)
        if (Cesium.defined(cartesian)) {
          // 绘制一个点后，创建线实体
          if (positions.length >= 2) {
            if (!Cesium.defined(poly)) {
              poly = new PolyLineEntity(positions)
            } else {
              positions.pop()
              positions.push(cartesian)
            }
            distance = getSpaceDistance(positions)
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

      handler.setInputAction(e => {
        let cartesian = viewer.camera.pickEllipsoid(e.position, viewer.scene.globe.ellipsoid)
        if (Cesium.defined(cartesian)) {
          if (positions.length === 0) {
            positions.push(cartesian.clone()) // clone拷贝后，指向不同的数据
          }
          positions.push(cartesian)
        }
        // 在线的末端标记结点及距离
        textDistance = distance + '米'
        floatingPoint = viewer.entities.add({
          name: '空间直线距离',
          position: cartesian,
          point: {
            pixelSize: 5,
            color: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 1
          },
          label: {
            text: textDistance,
            font: '18px sans-serif',
            fillColor: Cesium.Color.GOLD,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(20, -20)
          }
        })
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

      handler.setInputAction(e => {
        handler.destroy()
        positions.pop() // 最后一个点无效
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
      // 创建线实体
      // PolyLinePrimitive是自调用函数的返回值
      var PolyLineEntity = (function () {
        // 线实体的样式及坐标
        function _ (positions) {
          this.options = {
            name: 'polyline',
            polyline: {
              show: true,
              positions: [],
              material: Cesium.Color.CHARTREUSE,
              width: 3,
              clampToGroud: true
            }
          }
          this.positions = positions
          this._init()
        }
        // 初始化线实体，使其带有更新功能
        _.prototype._init = function () {
          let _self = this
          // 回调函数中的更新函数
          let _update = function () {
            return _self.positions
          }
          this.options.polyline.positions = new Cesium.CallbackProperty(_update, false)
          viewer.entities.add(this.options)
        }
        return _
      })()

      function getSpaceDistance (positions) {
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
        return distance.toFixed(2)
      }
    },
    /**
     * @description: 测量面积
     * @param {type}
     * @return:
     */
    meatureAreaSpace () {
      const viewer = this.$parent.viewer
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection)
      let positions = []
      let polygon
      let wgsPositions = []
      let floatingPoint

      handler.setInputAction(e => {
        let cartesian = viewer.camera.pickEllipsoid(e.endPosition, viewer.scene.globe.ellipsoid)
        if (positions.length >= 2) {
          if (!Cesium.defined(polygon)) {
            polygon = new PolygonEntity(positions)
          } else {
            positions.pop()
            positions.push(cartesian)
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

      handler.setInputAction(e => {
        let cartesian = viewer.camera.pickEllipsoid(e.position, viewer.scene.globe.ellipsoid)
        if (!cartesian) return
        if (positions.length === 0) {
          positions.push(cartesian.clone())
        }
        positions.push(cartesian)
        let wgsPosition = this.cartesian3ToWgs84(cartesian)
        wgsPositions.push(wgsPosition)
        floatingPoint = viewer.entities.add({
          name: 'polygon_area',
          position: positions[positions.length - 1],
          point: {
            pixelSize: 5,
            color: Cesium.Color.RED,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.None
          }
        })
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

      handler.setInputAction(e => {
        handler.destroy()
        positions.pop()

        let text = getArea(tempPositions) + '平方公里'
        viewer.entities.add({
          name: 'polygon_area',
          position: positions[positions.length - 1],
          label: {
            text: text,
            font: '18px sans-serif',
            fillColor: Cesium.Color.GLOD,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM
          }
        })
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

      // 创建面实体
      let PolygonEntity = (function () {
        function _ (positions) {
          this.options = {
            name: 'polygon',
            polygon: {
              hierarchy: [],
              perPositionHeight: true,
              material: Cesium.Color.RED.withAlpha(0.5),
              heightReference: Cesium.HeightReference.NONE
            }
          }
          this.positions = positions
          this._init()
        }
        // 初始化面实体
        _.prototype._init = function () {
          let _self = this
          let _update = function () {
            return new Cesium.PolygonHierarchy(_self.positions)
          }
          this.options.polygon.hierarchy = new Cesium.CallbackProperty(_update, false)
          viewer.entities.add(this.options)
        }

        return _
      })()

      const radiansPerDegree = Math.PI / 180.0 // 角度转化为弧度
      const degreesPerRadian = 180.0 / Math.PI // 弧度转化为角度

      // 计算多边形面积
      function getArea (points) {
        var res = 0

        // 拆分多边形为三角形
        for (var i = 0; i < points.length - 2; i++) {
          let p1 = points[i]
          let p2 = points[i + 1]
          let p3 = points[i + 2]
          var angle = Angle(p1, p2, p3)

          var dis12 = distance(p1, p2)
          var dis23 = distance(p2, p3)
     
          res += dis12 * dis23 * Math.abs(Math.sin(angle))
        }

        return (res / 1000000.0).toFixed(4)
      }

      function Angle (p1, p2, p3) {
        var bearing21 = Bearing(p2, p1)
        var bearing23 = Bearing(p2, p3)

        var angle = bearing21 - bearing23
        if (angle < 0) {
          angle += 360
        }
        return angle
      }
      // 方向
      function Bearing (from, to) {
        var lat1 = from.lat * radiansPerDegree
        var lng1 = from.lng * radiansPerDegree
        var lat2 = to.lat * radiansPerDegree
        var lng2 = to.lng * radiansPerDegree
        var angle = -Math.atan2(Math.sin(lng1 - lng2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng1 - lng2))

        if (angle < 0) {
          angle += Math.PI * 2
        }
        angle = angle * degreesPerRadian
        return angle
      }

      function distance (point1, point2) {
        var startCartographic = Cesium.Cartographic.fromDegrees(point1.lng, point1.lat)
        var endCartographic = Cesium.Cartographic.fromDegrees(point2.lng, point2.lat)
        var geodesic = new Cesium.EllipsoidGeodesic(startCartographic, endCartographic)
        var s = geodesic.surfaceDistance
        s = Math.sqrt(Math.pow(s, 2) + Math.pow(endCartographic.height - startCartographic.height, 2))
        return s
      }
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
        lat: lat,
        lng: lng,
        alt: alt
      }
    },
    meatureTriangleSpace () {
      let viewer = this.$parent.viewer
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection)
      let shape = {
        points: [],
        wgsPoints: [],
        entity: null,
        horizenEntity: null,
        verticleEntity: null,
      }
      let startNode, endNode
      viewer.scene.globe.depthTestAgainstTerrain = true

      handler.setInputAction(e => {
        let cartesian = viewer.scene.pickPosition(e.position)
        if (!Cesium.defined(cartesian)) return
        let wgs84 = this.cartesian3ToWgs84(cartesian)
        if (shape.points.length === 0) {
          shape.points.push(cartesian.clone())
          shape.points.push(cartesian)
          shape.wgsPoints.push(wgs84)
          shape.wgsPoints.push(wgs84)
          shape.entity = viewer.entities.add({
            name: '空间线',
            polyline: {
              positions: shape.points,
              material: Cesium.Color.RED,
              width: 3,
            },
            position: cartesian,
            label: {
              text: this.getLineCenter(shape.points) + '米',
              font: '14px sans-serif',
              fillColor: Cesium.Color.GOLD,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 2,
              verticalOrigin: Cesium.VerticalOrigin.CENTER,
              pixelOffset: new Cesium.Cartesian2(20, -20)
            }
          })
          shape.horizenEntity = viewer.entities.add({
            name: '水平线',
            show: false,
            polyline: {
              positions: shape.points,
              material: new Cesium.PolylineDashMaterialProperty({
                color: Cesium.Color.YELLOW
              }),
              width: 3
            },
            position: cartesian,
            label: {
              text: this.getLineCenter(shape.points) + '米',
              font: '14px sans-serif',
              fillColor: Cesium.Color.GOLD,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 2,
              verticalOrigin: Cesium.VerticalOrigin.CENTER,
              pixelOffset: new Cesium.Cartesian2(20, -20)
            }
          })
          shape.verticleEntity = viewer.entities.add({
            name: '竖直线',
            show: false,
            polyline: {
              positions: shape.points,
              material: new Cesium.PolylineDashMaterialProperty({
                color: Cesium.Color.YELLOW
              }),
              width: 3
            },
            position: cartesian,
            label: {
              text: this.getLineCenter(shape.points) + '米',
              font: '14px sans-serif',
              fillColor: Cesium.Color.GOLD,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 2,
              verticalOrigin: Cesium.VerticalOrigin.CENTER,
              pixelOffset: new Cesium.Cartesian2(20, -20)
            }
          })
          startNode = viewer.entities.add({
            name: 'node',
            position: cartesian,
            point: {
              pixelSize: 5,
              color: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 1
            }
          })
        } else {
          handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
          handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
          viewer.scene.globe.depthTestAgainstTerrain = false
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

      handler.setInputAction( e => {
        if (shape.points.length === 0) return
        let moveCartesian = viewer.scene.pickPosition(e.endPosition)
        if (!Cesium.defined(moveCartesian)) return
        let wgs84 = this.cartesian3ToWgs84(moveCartesian)

        if (Cesium.defined(endNode)) {
          endNode.position.setValue(moveCartesian)
        } else {
          endNode = viewer.entities.add({
            name: 'node',
            position: moveCartesian,
            point: {
              pixelSize: 5,
              color: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 1
            }
          })
        }
        shape.points[1] = moveCartesian
        shape.wgsPoints[1] = wgs84
        shape.entity.polyline.positions = new Cesium.CallbackProperty(() => {
          shape.entity.position.setValue(this.getLineCenter(shape.points))
          shape.entity.label.text = this.getSpaceDistance(shape.points) + '米'
          return shape.points
        }, false)
        if (!shape.horizenEntity.show || !shape.verticleEntity.show) {
          shape.horizenEntity.show = true
          shape.verticleEntity.show = true
        }
        shape.horizenEntity.polyline.positions = new Cesium.CallbackProperty(() => {
          let nodeArray
          if (shape.wgsPoints[0].alt >= shape.wgsPoints[1].alt) {
            nodeArray = [ shape.points[0], 
                          Cesium.Cartesian3.fromDegrees(shape.wgsPoints[1].lng, shape.wgsPoints[1].lat, shape.wgsPoints[0].alt) ]
          } else {
            nodeArray = [ shape.points[1],
                          Cesium.Cartesian3.fromDegrees(shape.wgsPoints[0].lng, shape.wgsPoints[0].lat, shape.wgsPoints[1].alt) ]
          }
          shape.horizenEntity.position.setValue(this.getLineCenter(nodeArray))
          shape.horizenEntity.label.text = this.getSpaceDistance(nodeArray) + '米'
          return nodeArray
        }, false)
        shape.verticleEntity.polyline.positions = new Cesium.CallbackProperty(() => {
          let nodeArray
          if (shape.wgsPoints[0].alt >= shape.wgsPoints[1].alt) {
            nodeArray = [ Cesium.Cartesian3.fromDegrees(shape.wgsPoints[1].lng, shape.wgsPoints[1].lat, shape.wgsPoints[0].alt),
                          shape.points[1] ]
          } else {
            nodeArray = [ Cesium.Cartesian3.fromDegrees(shape.wgsPoints[0].lng, shape.wgsPoints[0].lat, shape.wgsPoints[1].alt),
                          shape.points[0] ]
          }
          shape.verticleEntity.position.setValue(this.getLineCenter(nodeArray))
          shape.verticleEntity.label.text = Math.abs(shape.wgsPoints[0].alt - shape.wgsPoints[1].alt).toFixed(2) + '米'
          return nodeArray
        }, false)
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    },
    /**
     * @description: 获取两点所连的直线的中心点
     * @param {type} 
     * @return {type} 
     */
    getLineCenter (positions) {
      return new Cesium.Cartesian3((positions[0].x + positions[1].x)/2, (positions[0].y + positions[1].y)/2, (positions[0].z + positions[1].z)/2)
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
      return distance.toFixed(2)
    },
    /**
     * @description: 测角度
     * @param {type} 
     * @return {type} 
     */
    meatureAngle () {
      let viewer = this.$parent.viewer
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection)
      let positions = [], polyline, floatPoint, angle
      handler.setInputAction(e => {
        let cartesian = this.getPointFromWindowPoint(e.position)
        if (!Cesium.defined(cartesian)) return
        if (positions.length === 0) {
          positions.push(cartesian.clone())
          polyline = viewer.entities.add({
            name: 'polyline',
            polyline: {
              show: true,
              positions: new Cesium.CallbackProperty(() => {
                  return positions
                }, false),
              material: Cesium.Color.RED,
              width: 3,
              clampToGroud: true
            }
          })
        }
        positions.push(cartesian)
        
        if (positions.length >= 4) {
          floatPoint = viewer.entities.add({
            name: '空间角度',
            position: positions[positions.length-3],
            label: {
              text: angle.toFixed(2) + '°',
              font: '20px sans-serif',
              fillColor: Cesium.Color.RED,
              style: Cesium.LabelStyle.FILL,
              pixelOffset: new Cesium.Cartesian2(20, -20)
            }
          })
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

      handler.setInputAction(e => {
        let cartesian = this.getPointFromWindowPoint(e.endPosition)
        if (!Cesium.defined(cartesian)) return
        if (positions.length >= 2) {
          positions.pop()
          positions.push(cartesian)
        }
        if (positions.length >= 3) {
          angle = this.getAngle(positions[positions.length-3], positions[positions.length-2], positions[positions.length-1])
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

      handler.setInputAction(e => {
        handler.destroy()
        positions.pop() // 最后一个点无效
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    },
    /**
     * @description: 获取屏幕坐标对应的世界坐标
     * @param {type} 
     * @return {type} 
     */
    getPointFromWindowPoint (windowPosition) {
      const viewer = this.$parent.viewer
      if (viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider) { //未加地形
        return viewer.camera.pickEllipsoid(windowPosition, viewer.scene.globe.ellipsoid)
      } else if (viewer.terrainProvider instanceof Cesium.CesiumTerrainProvider) {
        return viewer.scene.pickPosition(windowPosition)
      } else {
        let ray = viewer.scene.camera.getPickRay(windowPosition)
        return viewer.scene.globe.pick(ray, viewer.scene)
      }
    },
    /**
     * @description: 计算角度
     * @param {type} 
     * @return {type} 
     */
    getAngle (point1, point2, point3) {
      let x1 = point1.x
      let y1 = point1.y
      let z1 = point1.z
      let x2 = point2.x
      let y2 = point2.y
      let z2 = point2.z
      let x3 = point3.x
      let y3 = point3.y
      let z3 = point3.z

      let _p1p2 = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2) 
      let _p2p3 = Math.sqrt((x3 - x2) ** 2 + (y3 - y2) ** 2 + (z3 - z2) ** 2)
      let p = (x1 - x2) * (x3 - x2) + (y1 - y2) * (y3 - y2) + (z1 - z2) * (z3 - z2)
      let angle = (Math.acos(p / (_p1p2 * _p2p3)) / Math.PI) * 180
      return angle
    }
  }
}
</script>

<style scoped>
.meature {
  position: absolute;
  top: 60px;
  left: 10px;
}
</style>
