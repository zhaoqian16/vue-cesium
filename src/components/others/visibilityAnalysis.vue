<!--
 * @Author: xiongqianqian
 * @Date: 2020-08-18 10:00:37
 * @LastEditTime: 2020-08-20 15:52:56
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \cesium-vue-test\src\components\others\visibilityAnalysis.vue
-->
<template>
  <div class="map">
    <Map></Map>
    <div class="operation">
      <el-button-group>
        <el-button size="mini" @click="startDEM()">基于DEM通视分析</el-button>
        <el-button size="mini" @click="start3dtile()">基于3DTile透视分析</el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script>
import Map from '../map.vue'
import 'cesium/Source/Widgets/widgets.css'
let Cesium = require('cesium/Source/Cesium')

export default {
  data () {
    return {
      tileset: null,
      method: null,
      analysisClass: null
    }
  },
  components: {
    Map
  },
  mounted () {
    
    // this.startDEM()
  },
  methods: {
    createMethod () {
      class VisualAnalysis {
        constructor (viewer, type) {
          this.viewer = viewer
          this.startPoint = null
          this.endPoint = null
          this.startEntity = null
          this.endEntity = null
          this.positions = []
          this.allLine = null
          this.type = type // 0-dem, 1-3dtile
          // this._addListener()
        }

        // 1、绘制两个点
        // 2、在两点的线上进行插值，并逐一判断点的高程与该点对应的地面高程的关系
        //    如果点高程 > 点对应的地面点高程, 该点可通视
        //    如果点高程 < 点对应的地面店高程，该点不可透视
        // 3、连接起始点和最后一个透视点，为可透视的线
        //    连接最后一个透视点和终止点，为不可透视的线
        // 4、将透视结果显示为label到地图上
        _addListener () {
          const viewer = this.viewer
          const scene = viewer.scene
          this.depthTest = viewer.scene.globe.depthTestAgainstTerrain

          if (!this.depthTest) {
            viewer.scene.globe.depthTestAgainstTerrain = true
          }

          this.handler = new Cesium.ScreenSpaceEventHandler(scene.canvas)
          let isDrawing = false
          this.handler.setInputAction(e => {
            let cartesian = viewer.scene.pickPosition(e.position)
            if (!Cesium.defined(cartesian)) return
            if (!isDrawing) { // 开始绘制
              this.startPoint = cartesian.clone()
              this.positions.push(this.startPoint)
              this.endPoint = cartesian.clone()
              this.startEntity = this._drawPoint(this.startPoint, Cesium.Color.RED)
              this.fullLine = this._drawPolyline(Cesium.Color.RED)
              isDrawing = true
            } else {
              this.endPoint = cartesian.clone()
              this.endEntity.position.setValue(this.endPoint)
              this._getSightLine((visual_point) => {
                this.fullLine.polyline.show = false
                this._getVisualLine(this.startPoint, visual_point)
                this._getInvisualLine(visual_point, this.endPoint)
              })
              this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
              this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
            }
          }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

          this.handler.setInputAction(e => {
            if (!isDrawing) return 
            let cartesian = viewer.scene.pickPosition(e.endPosition)
            if (!Cesium.defined(cartesian)) return
            this.endPoint = cartesian
            if (!Cesium.defined(this.endEntity)) {
              this.endEntity = this._drawPoint(this.endPoint, Cesium.Color.RED)
            } else {
              this.endEntity.position.setValue(this.endPoint)
            }
            this.endPoint = cartesian
            
          },Cesium.ScreenSpaceEventType.MOUSE_MOVE)
        }

        _drawPoint (cartesian, color) {
          return this.viewer.entities.add({
            position: cartesian,
            point: {
              pixelSize: 10,
              color: color ? color : Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 1
            }
          })
        }

        _drawPolyline (color) {
          return this.viewer.entities.add({
            polyline: {
              show: true,
              positions: new Cesium.CallbackProperty(() => {
                return [this.startPoint, this.endPoint]
              }),
              material: color ? color: Cesium.Color.RED,
              width: 3
            }
          })
        }

        _getSightLine (callback) {
          if (this.type === 0) { // 0-dem
            this._getSightLinesForDEM(callback)
          } else if (this.type === 1) {
            this._getSightLinesFor3dtile(callback)
          }
        }

        _getSightLinesForDEM (callback) {
          const start = this._cartesianToWgs84(this.startPoint)
          const end = this._cartesianToWgs84(this.endPoint)
          const pointSum = 30
          let wgsPoints = []
          let car3Points = []
          for (let i = 0; i < pointSum; i++) {
            let offset = i / (pointSum - 1)
            let lng = Cesium.Math.lerp(start.lng, end.lng, offset)
            let lat = Cesium.Math.lerp(start.lat, end.lat, offset)
            let height = Cesium.Math.lerp(start.height, end.height, offset)
            wgsPoints.push({
              lng: lng,
              lat: lat,
              height: height
            })
            car3Points[i] = Cesium.Cartesian3.lerp(this.startPoint, this.endPoint, offset, new Cesium.Cartesian3())
          }
          let terrain = this.viewer.terrainProvider
          if (terrain instanceof Cesium.EllipsoidTerrainProvider) {
            terrain = Cesium.createWorldTerrain({
              requestWaterMask : true, // required for water effects
              requestVertexNormals : true // required for terrain lighting
            })
            this.viewer.terrainProvider = terrain
          }
          let cargPoints = wgsPoints.map(d => Cesium.Cartographic.fromDegrees(d.lng, d.lat))
          Cesium.sampleTerrainMostDetailed(terrain, cargPoints)
          .then(updatedPositions => {
            let visual_end_index = null
            for (let i = 1; i < updatedPositions.length -1; i++) {
              const position_updated = updatedPositions[i]
              if (!visual_end_index && position_updated) {
                if (position_updated.height > wgsPoints[i].height) {
                  visual_end_index = i
                  break
                }
              }
            }
            // 绘制可视线与不可视线
            let visual_end_point = car3Points[visual_end_index]
            if (callback && visual_end_index) {
              callback(visual_end_point)
            }
            
          })
        }
        
        _getSightLinesFor3dtile (callback) {
          const start = this._cartesianToWgs84(this.startPoint)
          const end = this._cartesianToWgs84(this.endPoint)
          const pointSum = 60
          let wgsPoints = []
          let car3Points = []
          for (let i = 0; i < pointSum; i++) {
            let offset = i / (pointSum - 1)
            let lng = Cesium.Math.lerp(start.lng, end.lng, offset)
            let lat = Cesium.Math.lerp(start.lat, end.lat, offset)
            let height = Cesium.Math.lerp(start.height, end.height, offset)
            wgsPoints.push({
              lng: lng,
              lat: lat,
              height: height
            })
            car3Points[i] = Cesium.Cartesian3.lerp(this.startPoint, this.endPoint, offset, new Cesium.Cartesian3())
            this.viewer.entities.add({
              position: car3Points[i],
              point: {
                pixelSize: 10,
                color: Cesium.Color.WHITE
              }
            })
          }
          this.viewer.scene.clampToHeightMostDetailed(car3Points)
          .then(updatedPositions => {
            // 可能会找不到最后一个透视点
            let visual_end_index = null
            for (let i = 1; i < updatedPositions.length -1; i++) {
              let position_updated = updatedPositions[i]
              position_updated = this._cartesianToWgs84(position_updated)
              if (!visual_end_index && position_updated) {
                if (position_updated.height > wgsPoints[i].height) {
                  visual_end_index = i
                  break
                }
              }
            }
            // 绘制可视线与不可视线
            let visual_end_point = car3Points[visual_end_index]
            if (callback && visual_end_index) {
              callback(visual_end_point)
            }
          })
        }

        _getVisualLine (start, end) {
          this.viewer.entities.add({
            polyline: {
              show: true,
              positions: [start, end],
              material: Cesium.Color.YELLOW,
              width: 3
            }
          })
        }

        _getInvisualLine (start, end) {
          this.viewer.entities.add({
            polyline: {
              show: true,
              positions: [start, end],
              material: Cesium.Color.BLUE,
              width: 3
            }
          })
        }

        _cartesianToWgs84 (cartesian) {
          let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
          let lng = Cesium.Math.toDegrees(cartographic.longitude)
          let lat = Cesium.Math.toDegrees(cartographic.latitude)
          return {
            lng: lng,
            lat: lat,
            height: cartographic.height
          }
        }

      }
      return VisualAnalysis
    },
    startDEM () {
      const viewer = this.$children[0].viewer
      const analysisClass = this.createMethod()
      // 打开地形
      if (viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
        viewer.terrainProvider = Cesium.createWorldTerrain({
          requestWaterMask : true, // required for water effects
          requestVertexNormals : true // required for terrain lighting
        })
      }
      let method = new analysisClass(viewer, 0)
      console.log(method)
      method._addListener()
    },
    start3dtile () {
      const viewer = this.$children[0].viewer
      const analysisClass = this.createMethod()
      // 关闭地形
      if (viewer.terrainProvider instanceof Cesium.CesiumTerrainProvider) {
        viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider()
      }
      this.load3DTile ()
      let method = new analysisClass(viewer, 1)
      method._addListener()
    },
    load3DTile () {
      const viewer = this.$children[0].viewer
      
      // 添加3dTile数据
      this.tileset = new Cesium.Cesium3DTileset({
        url: 'http://localhost:9000/model/ed744fa0e2a711eaafe4933aaa75cd5b/tileset.json',
        // maximumScreenSpaceError: 2,
        // skipScreenSpaceErrorFactor: 16
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
      let center = Cesium.Cartesian3.add(tilesetArr, Cesium.Cartesian3.fromArray([22.1, -49.2, -38]), new Cesium.Cartesian3())
      let m = Cesium.Matrix4.fromTranslation(center)
      this.tileset.modelMatrix = m
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