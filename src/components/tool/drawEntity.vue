<!--
 * @Author: xiongqianqian
 * @Date: 2020-07-09 10:46:48
 * @LastEditTime: 2020-08-19 17:45:25
 * @LastEditors: Please set LastEditors
 * @Description: 绘制点、线、面、圆、矩形并编辑
 * @FilePath: \vue-cesium\src\components\tool\drawEntity.vue
-->
<template>
  <div>
    <!-- 绘制、编辑图形 -->
    <div class="draw">
      <el-button-group>
        <el-button size="mini" circle @click="drawPoint(callback)" >点</el-button>
        <el-button size="mini" circle @click="drawPolyline(callback)">线</el-button>
        <el-button size="mini" circle @click="drawPolygon(callback)">面</el-button>
        <el-button size="mini" circle @click="drawCircle(callback)">圆</el-button>
        <el-button size="mini" circle @click="drawRect(callback)" icon="el-icon-crop"></el-button>
        <el-button size="mini" circle @click="edit()" icon="el-icon-edit"></el-button>
        <el-button size="mini" circle @click="clear()" icon="el-icon-delete"></el-button>
      </el-button-group>
    </div>
  </div>
</template>
<script>
import 'cesium/Source/Widgets/widgets.css'
let Cesium = require('cesium/Source/Cesium')

export default {
  data () {
    return {
      terrainFlag: '',
    }
  },
  mounted () {
    this.terrainFlag = this.$parent.viewer.terrainProvider instanceof Cesium.CesiumTerrainProvider
  },
  methods: {
    /**
     * @description: 画点
     * @param {type}
     * @return:
     */
    drawPoint (callback) {
      const viewer = this.$parent.viewer
      let positions = []
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
      if (this.terrainFlag) {
        viewer.scene.globe.depthTestAgainstTerrain = true
      }

      // 单击鼠标左键画点
      handler.setInputAction(e => {
        let cartesian = this.terrainFlag ? viewer.scene.pickPosition(e.position) :
                                           viewer.camera.pickEllipsoid(e.position, viewer.scene.globe.ellipsoid)
        positions.push(cartesian)
        viewer.entities.add({
          name: '点',
          position: cartesian,
          point: {
            color: Cesium.Color.RED,
            pixelSize: 10,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          }
        })
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

      // 单击鼠标右键结束画点
      handler.setInputAction(e => {
        handler.destroy()
        callback(positions) // 将世界坐标转化为wgs84坐标
        if (this.terrainFlag) {
          viewer.scene.globe.depthTestAgainstTerrain = false
        }
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    },
    /**
     * @description: 画线
     * @param {type}
     * @return:
     */
    drawPolyline (callback) {
      const viewer = this.$parent.viewer
      let PolylinePrimitive = (function () {
        function _ (positions) {
          this.options = {
            name: '线',
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
      if (this.terrainFlag) {
        viewer.scene.globe.depthTestAgainstTerrain = true
      }
      let positions = []
      let polyline
      let floatPoint = null

      handler.setInputAction(e => {
        let cartesian = this.terrainFlag ? viewer.scene.pickPosition(e.position)
                                         : viewer.camera.pickEllipsoid(e.position, viewer.scene.globe.ellipsoid)
        if (positions.length === 0) {
          floatPoint = viewer.entities.add({
            position: cartesian,
            point: {
              color: Cesium.Color.WHITE,
              pixelSize: 10,
              outlineColor: Cesium.Color.fromCssColorString('#010301'),
              outlineWidth: 0.5,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
          })
          positions.push(cartesian.clone())
          polyline = new PolylinePrimitive(positions)
        }
        positions.push(cartesian)
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

      handler.setInputAction(e => {
        let cartesian = this.terrainFlag ? viewer.scene.pickPosition(e.endPosition)
                                         : viewer.camera.pickEllipsoid(e.endPosition, viewer.scene.globe.ellipsoid)
        if (Cesium.defined(polyline)) {
          if (cartesian) {
            floatPoint.position.setValue(cartesian)
            positions.pop()
            positions.push(cartesian)
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

      handler.setInputAction(e => {
        viewer.entities.remove(floatPoint)
        handler.destroy()
        callback(positions)
        if (this.terrainFlag) {
          viewer.scene.globe.depthTestAgainstTerrain = false
        }
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    },
    /**
     * @description: 画面
     * @param {type}
     * @return:
     */
    drawPolygon (callback) {
      const viewer = this.$parent.viewer
      let PolygonPrimitive = (function () {
        function _ (positions) {
          this.options = {
            name: '面',
            polygon: {
              hierarchy: [],
              material: Cesium.Color.RED.withAlpha(0.4)
            }
          }
          this.positions = positions
          this._init()
        }

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

      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
      if (this.terrainFlag) {
         viewer.scene.globe.depthTestAgainstTerrain = true
      }
      let positions = []
      let polygon
      let floatPoint = null

      handler.setInputAction(e => {
        let cartesian = this.terrainFlag ? viewer.scene.pickPosition(e.position)
                                         : viewer.camera.pickEllipsoid(e.position, viewer.scene.globe.ellipsoid)
        if (positions.length === 0) {
          floatPoint = viewer.entities.add({
            position: cartesian,
            point: {
              color: Cesium.Color.WHITE,
              pixelSize: 5,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
          })
          positions.push(cartesian.clone())
          polygon = new PolygonPrimitive(positions)
        }
        positions.push(cartesian)
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

      handler.setInputAction(e => {
        let cartesian = this.terrainFlag ? viewer.scene.pickPosition(e.endPosition)
                                         : viewer.camera.pickEllipsoid(e.endPosition, viewer.scene.globe.ellipsoid)
        if (Cesium.defined(polygon)) {
          if (cartesian) {
            floatPoint.position.setValue(cartesian)
            positions.pop()
            positions.push(cartesian)
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

      handler.setInputAction(e => {
        viewer.entities.remove(floatPoint)
        handler.destroy()
        callback(positions)
        if (this.terrainFlag) {
          viewer.scene.globe.depthTestAgainstTerrain = false
        }
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    },
    /**
     * @description: 画圆
     * @param {type}
     * @return:
     */
    drawCircle () {
      const viewer = this.$parent.viewer
      let circle = {
        points: [],
        rect: null,
        entity: null,
        r: 1
      }

      let tempPosition
      let cartographic1
      let p
      let tempLon, tempLat
      
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
      viewer.scene.globe.depthTestAgainstTerrain = true
      const _this = this
      handler.setInputAction(e => {
        tempPosition = this.getPointFromWindowPoint(e.position)
        // 选择的点在球面上
        if (tempPosition) {
          function callBackPos () {
            const minlon = Cesium.Math.toDegrees(circle.points[0].longitude)
            const minlat = Cesium.Math.toDegrees(circle.points[0].latitude)
            const maxlon = Cesium.Math.toDegrees(circle.points[1].longitude)
            const maxlat = Cesium.Math.toDegrees(circle.points[1].latitude)
            const r = _this.getFlatternDistance(minlat, minlon, maxlat, maxlon)
            if (r) {
              return r
            }
            return 1
          }

          if (circle.points.length === 0) {
            p = e.position
            // 世界坐标转化为经纬度坐标
            cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(tempPosition) // 世界坐标转化为弧度坐标
            circle.points.push(viewer.scene.globe.ellipsoid.cartesianToCartographic(tempPosition))
            circle.points.push(viewer.scene.globe.ellipsoid.cartesianToCartographic(tempPosition))
            tempLon = Cesium.Math.toDegrees(cartographic1.longitude)
            tempLat = Cesium.Math.toDegrees(cartographic1.latitude)
            circle.entity = viewer.entities.add({
              name: '圆',
              position: Cesium.Cartesian3.fromDegrees(tempLon, tempLat),
              ellipse: {
                semiMinorAxis: new Cesium.CallbackProperty(callBackPos, false),
                semiMajorAxis: new Cesium.CallbackProperty(callBackPos, false),
                material: Cesium.Color.RED.withAlpha(0.3),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
              }
            })
          } else {
            handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE) // 移除鼠标移动事件
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK) // 移除鼠标左击事件
            // 获取圆形实体对应的圆形轮廓的位置信息
            let tempCircle = new Cesium.CircleOutlineGeometry({
              center: Cesium.Cartesian3.fromDegrees(tempLon, tempLat),
              radius: callBackPos(),
              graularity: Math.PI / 2
            }) // 椭球体上圆形轮廓的描述
            let geometry = Cesium.CircleOutlineGeometry.createGeometry(tempCircle) // 计算椭球体上圆形轮廓的几何表示
            let float64ArrayPositionsIn = geometry.attributes.position.values // 圆形轮廓的位置信息值
            let positionsIn = [].slice.call(float64ArrayPositionsIn)
            viewer.scene.globe.depthTestAgainstTerrain = false
            // let positions = []
            // for (let i = 0; i < positionsIn.length; i+=36) {
            //   viewer.entities.add({
            //     position: new Cesium.Cartesian3(positionsIn[i], positionsIn[i+1], positionsIn[i+2]),
            //     point: {
            //       show: true,
            //       color: Cesium.Color.fromCssColorString('#FFFFFF'),
            //       outlineColor: Cesium.Color.fromCssColorString('#010301'),
            //       outlineWidth: 0.5,
            //       pixelSize: 5,
            //       heightReference: Cesium.HeightReference.NONE
            //     }
            //   })
            // }
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

      handler.setInputAction(e => {
        if (circle.points.length === 0) {
          return
        }
        let moveEndPosition = this.getPointFromWindowPoint(e.endPosition)
        if (moveEndPosition) {
          circle.points.pop()
          circle.points.push(viewer.scene.globe.ellipsoid.cartesianToCartographic(moveEndPosition))
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    },
    /**
     * @description: 画矩形
     * @param {type}
     * @return:
     */
    drawRect (callback) {
      const viewer = this.$parent.viewer
      let pointsArr = []
      let shape = {
        points: [],
        rect: null,
        entity: null
      }
      let tempPosition
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
      if (this.terrainFlag) { // 有地形图层，打开深度检测，能获取准确的点坐标
        viewer.scene.globe.depthTestAgainstTerrain = true
      }

      handler.setInputAction(e => {
        tempPosition = this.getPointFromWindowPoint(e.position)
        if (tempPosition) {
          if (shape.points.length === 0) {
            pointsArr.push(tempPosition)
            shape.points.push(viewer.scene.globe.ellipsoid.cartesianToCartographic(tempPosition))
            shape.rect = Cesium.Rectangle.fromCartographicArray(shape.points) // 通过提供矩阵的所有位置创建一个最小矩形
            shape.rect.east += 0.000001
            shape.rect.north += 0.000001
            shape.entity = viewer.entities.add({
              name: '矩形',
              rectangle: {
                coordinates: shape.rect,
                material: Cesium.Color.RED.withAlpha(0.4),
                outline: true,
                outlineWidth: 2,
                outlineColor: Cesium.Color.RED,
                heightReference: Cesium.HeightReference.NONE
              }
            }) // 将该矩形添加为实体至视图上
          } else {
            handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
            callback(pointsArr)
            if (this.terrainFlag) { 
              viewer.scene.globe.depthTestAgainstTerrain = false
            }
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

      handler.setInputAction(e => {
        if (shape.points.length === 0) {
          return
        }

        let moveEndPosition = this.getPointFromWindowPoint(e.endPosition)
        if (moveEndPosition) {
          pointsArr[1] = moveEndPosition
          shape.points[1] = viewer.scene.globe.ellipsoid.cartesianToCartographic(moveEndPosition) // 鼠标移动点作为生成矩形的第二个点
          shape.rect = Cesium.Rectangle.fromCartographicArray(shape.points) // 通过提供矩阵的所有位置创建一个最小矩形
          // 保证可以生成一个有效的最小矩形
          if (shape.rect.west === shape.rect.east) {
            shape.rect.east += 0.000001
          }
          if (shape.rect.south === shape.rect.north) {
            shape.rect.north += 0.000001
          }
          // 更新矩形实体的坐标信息
          shape.entity.rectangle.coordinates = new Cesium.CallbackProperty(() => {
            return shape.rect
          },false)
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    },
    /**
     * @description: 回调函数——使绘制实体的坐标矩阵由笛卡尔坐标转化为经纬度
     * @param {positionArr} 绘制实体的笛卡尔坐标矩阵
     * @return:
     */
    callback (positionArr) {
      let positions = []
      for (let i = 0; i < positionArr.length; i++) {
        let wgsPoint = this.cartesian3ToWgs84(positionArr[i])
        positions.push(wgsPoint)
      }
      console.log(positions)
    },
    /**
     * @description: 屏幕坐标转化为笛卡尔坐标（世界坐标）
     * @param {windowPosition} 屏幕坐标
     * @return: 笛卡尔坐标（世界坐标）
     */
    getPointFromWindowPoint (windowPosition) {
      const viewer = this.$parent.viewer
      if (viewer.scene.terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
        return viewer.camera.pickEllipsoid(windowPosition, viewer.scene.globe.ellipsoid)
      } else {
        let ray = viewer.scene.camera.getPickRay(windowPosition)
        return viewer.scene.globe.pick(ray, viewer.scene)
      }
    },
    /**
     * @description: 获取两个点（经纬度）之间的最短直线距离
     * @param {lat1} 点1的纬度
     * @param {lng1} 点1的经度
     * @param {lat2} 点2的纬度
     * @param {lng2} 点2的经度
     * @return: 两点间的最短直线距离
     */
    getFlatternDistance (lat1, lng1, lat2, lng2) {
      var EARTH_RADIUS = 6378137.0 // 单位M
      var PI = Math.PI

      function getRad (d) {
        return d * PI / 180.0
      }
      var f = getRad((lat1 + lat2) / 2)
      var g = getRad((lat1 - lat2) / 2)
      var l = getRad((lng1 - lng2) / 2)

      var sg = Math.sin(g)
      var sl = Math.sin(l)
      var sf = Math.sin(f)

      var s, c, w, r, d, h1, h2
      var a = EARTH_RADIUS
      var fl = 1 / 298.257

      sg = sg * sg
      sl = sl * sl
      sf = sf * sf

      s = sg * (1 - sl) + (1 - sf) * sl
      c = (1 - sg) * (1 - sl) + sf * sl

      w = Math.atan(Math.sqrt(s / c))
      r = Math.sqrt(s * c) / w
      d = 2 * w * a
      h1 = (3 * r - 1) / 2 / c
      h2 = (3 * r + 1) / 2 / s

      return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
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
      console.log(cartographic)
      return {
        lat: lat,
        lng: lng,
        alt: alt
      }
    },
    /**
     * @description: WGS84 坐标转换为 笛卡尔坐标（世界坐标）
     * @param {point} wgs84坐标
     * @return:
     */
    wgs84ToCartesian (point) {
      let cartesian = Cesium.Cartesian3.fromDegrees(point.lng, point.lat, point.alt)
      return {
        x: cartesian.x,
        y: cartesian.y,
        z: cartesian.z
      }
    },
    /**
     * @description: 清除实体
     * @param {type}
     * @return:
     */
    clear () {
      this.$parent.viewer.entities.removeAll()
      this.circle = null
      this.shape = null
    },
    /**
     * @description: 编辑选中图形=====================待修正
     * @param {type}
     * @return:
     */
    edit () {
      const viewer = this.$parent.viewer
      let pointsId = []
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
      let currentPoint
      let editEntity
      let editPositions

      handler.setInputAction(e => {
        let pick = viewer.scene.pick(e.position)
        if (!Cesium.defined(pick)) return

        let pickEntity = pick.id

        if (pickEntity.name === 'edit-point' || pickEntity.name === '点') {
          currentPoint = pickEntity
        } else {
          if (editPositions) return
          editEntity = pickEntity
          if (editEntity.name === '线') {
            editPositions = editEntity.polyline.positions.getValue()
          } else if (editEntity.name === '面') {
            editPositions = editEntity.polygon.hierarchy.getValue().positions
          } else if (editEntity.name === '矩形') {
            // editPositions = editEntity.rectangle.coordinates.getValue() 
            let extent = editEntity.rectangle.coordinates.getValue()
            editPositions = [
              Cesium.Cartesian3.fromRadians(extent.east, extent.north), // 东北
              Cesium.Cartesian3.fromRadians(extent.west, extent.north), // 西北
              Cesium.Cartesian3.fromRadians(extent.west, extent.south), // 西南
              Cesium.Cartesian3.fromRadians(extent.east, extent.south) // 东南
            ]
          } else if (editEntity.name === '圆') {
            let tempCircle = new Cesium.CircleOutlineGeometry({
              center: editEntity.position.getValue(),
              radius: editEntity.ellipse.semiMajorAxis.getValue(),
              graularity: Math.PI / 2
            })
            let geometry = Cesium.CircleOutlineGeometry.createGeometry(tempCircle) // 计算椭球体上圆形轮廓的几何表示
            let float64ArrayPositionsIn = geometry.attributes.position.values // 圆形轮廓的位置信息值
            let positionsIn = [].slice.call(float64ArrayPositionsIn)
            editPositions = []
            for (let i = 0; i < positionsIn.length; i+=36) {
              editPositions.push(new Cesium.Cartesian3(positionsIn[i], positionsIn[i+1], positionsIn[i+2]))
            }
          }
          for (let cartesian of editPositions) {
            let point = viewer.entities.add({
              name: 'edit-point',
              position: cartesian,
              point: {
                show: true,
                color: Cesium.Color.fromCssColorString('#FFFFFF'),
                outlineColor: Cesium.Color.fromCssColorString('#010301'),
                outlineWidth: 0.5,
                pixelSize: 5,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
              }
            })
            pointsId.push(point.id)
          }
        }

        if (viewer.scene.mode === Cesium.SceneMode.SCENE3D) {
          viewer.scene.screenSpaceCameraController.enableRotate = false
          viewer.scene.screenSpaceCameraController.enableZoom = false
        } else {
          viewer.scene.screenSpaceCameraController.enableTranslate = false
        }
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN)

      handler.setInputAction(e => {
        if (currentPoint) {
          let cartesian = this.getPointFromWindowPoint(e.endPosition)
          if (!cartesian) return
          currentPoint.position = new Cesium.CallbackProperty(() => {
            return cartesian
          })
          if (currentPoint.name === '点') return
          let points = []
          let cartogPoints = []
          for (let id of pointsId) {
            let car3 = viewer.entities.getById(id).position.getValue()
            points.push(car3)
            if (editEntity.name === '矩形') {
              cartogPoints.push(Cesium.Cartographic.fromCartesian(car3))
            }
          }

          if (editEntity.name === '线') {
            editEntity.polyline.positions = new Cesium.CallbackProperty(() => {
              return points
            })
          } else if (editEntity.name === '面') {
            editEntity.polygon.hierarchy = new Cesium.CallbackProperty(() => {
              return new Cesium.PolygonHierarchy(points)
            })
          } else if (editEntity.name === '矩形') {
            let newRect
            let changeDirect = Cesium.Rectangle.contains(editEntity.rectangle.coordinates.getValue(), Cesium.Cartographic.fromCartesian(currentPoint.position.getValue())) // 判断待移动点是向里走还是向外走
            if (changeDirect) { // 向里走，取最小矩形
              newRect = Cesium.Rectangle.fromRadians(
                Math.max(cartogPoints[1].longitude, cartogPoints[2].longitude),
                Math.max(cartogPoints[2].latitude, cartogPoints[3].latitude),
                Math.min(cartogPoints[3].longitude, cartogPoints[0].longitude),
                Math.min(cartogPoints[0].latitude, cartogPoints[1].latitude),
                newRect
              )
            } else { // 向外走，取最大矩形
              newRect = Cesium.Rectangle.fromCartesianArray(points)
            }
            viewer.entities.getById(pointsId[0]).position = new Cesium.CallbackProperty( () => {
              return Cesium.Cartesian3.fromRadians(newRect.east, newRect.north)
            })
            viewer.entities.getById(pointsId[1]).position = new Cesium.CallbackProperty( () => {
              return Cesium.Cartesian3.fromRadians(newRect.west, newRect.north)
            })
            viewer.entities.getById(pointsId[2]).position = new Cesium.CallbackProperty( () => {
              return Cesium.Cartesian3.fromRadians(newRect.west, newRect.south)
            })
            viewer.entities.getById(pointsId[3]).position = new Cesium.CallbackProperty( () => {
              return Cesium.Cartesian3.fromRadians(newRect.east, newRect.south)
            })
            editEntity.rectangle.coordinates = new Cesium.CallbackProperty( () => {
              return newRect
            })
          } else if (editEntity.name === '圆') {
            // 重新计算点到中心点的距离
            let centerCar3 = editEntity.position.getValue()
            let centerDegree = this.cartesian3ToWgs84(centerCar3)
            let outlineCar3 = currentPoint.position.getValue()
            let outlineDegree = this.cartesian3ToWgs84(outlineCar3)
            let r = this.getFlatternDistance(centerDegree.lat, centerDegree.lng, outlineDegree.lat, outlineDegree.lng)

            let _changeR = function () {
              return r
            }
            // 更新圆的信息
            editEntity.ellipse.semiMinorAxis = new Cesium.CallbackProperty(_changeR, false)
            editEntity.ellipse.semiMajorAxis = new Cesium.CallbackProperty(_changeR, false)
            // 更新圆上点的信息
            let tempCircle = new Cesium.CircleOutlineGeometry({
              center: editEntity.position.getValue(),
              radius: editEntity.ellipse.semiMajorAxis.getValue(),
              graularity: Math.PI / 2
            })
            let geometry = Cesium.CircleOutlineGeometry.createGeometry(tempCircle) // 计算椭球体上圆形轮廓的几何表示
            let float64ArrayPositionsIn = geometry.attributes.position.values // 圆形轮廓的位置信息值
            let positionsIn = [].slice.call(float64ArrayPositionsIn)
            let endPositions = []
            for (let i = 0; i < positionsIn.length; i+=36) {
              endPositions.push(new Cesium.Cartesian3(positionsIn[i], positionsIn[i+1], positionsIn[i+2]))
            }
            viewer.entities.getById(pointsId[0]).position = new Cesium.CallbackProperty( () => {
              return endPositions[0]
            })
            viewer.entities.getById(pointsId[1]).position = new Cesium.CallbackProperty( () => {
              return endPositions[1]
            })
            viewer.entities.getById(pointsId[2]).position = new Cesium.CallbackProperty( () => {
              return endPositions[2]
            })
            viewer.entities.getById(pointsId[3]).position = new Cesium.CallbackProperty( () => {
              return endPositions[3]
            })
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
      
      handler.setInputAction(e => {
        currentPoint = undefined
        if (viewer.scene.mode === Cesium.SceneMode.SCENE3D) {
          viewer.scene.screenSpaceCameraController.enableRotate = true
          viewer.scene.screenSpaceCameraController.enableZoom = true
        } else {
          viewer.scene.screenSpaceCameraController.enableTranslate = true
        }
      }, Cesium.ScreenSpaceEventType.LEFT_UP)

      handler.setInputAction(e => {
        let removeEntities = viewer.entities.values.filter(item => item.name === 'edit-point')
        removeEntities.forEach(entity => {
          viewer.entities.remove(entity)
        })
        handler.destroy()
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    }
  }
}
</script>

<style scoped>
.draw {
  position: absolute;
  top: 40px;
  left: 5px;
}
</style>
