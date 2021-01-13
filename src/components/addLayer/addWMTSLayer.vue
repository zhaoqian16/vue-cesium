<template>
  <div class="main">
    <Map></Map>
    <div class="operation">
      <el-button size="mini" type="primary" @click="addWmtsLayer()">添加wmts图层</el-button>
    </div>
  </div>
</template>

<script>
import Map from '../map'
import 'cesium/Source/Widgets/widgets.css'
let Cesium = require('cesium/Source/Cesium')

export default {
  name: 'addWMTSLayer',
  components: {
    Map
  },
  mounted() {
    // this.addWmtsLayer()
  },
  methods: {
    addWmtsLayer() {
      let layer = new Cesium.ImageryLayer(new Cesium.WebMapTileServiceImageryProvider({
        url: 'http://localhost:8081/geoserver/gwc/service/wmts/rest/districts:mosaic/{style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}?format=image/png',
        layer:'districts:mosaic',
        style: 'raster',
        format: 'image/png',
        tileMatrixSetID: 'test_dom',
        tileMatrixLabels: ['EPSG:4326:1', 'EPSG:4326:2', 'EPSG:4326:3', 'EPSG:4326:4', 'EPSG:4326:5', 'EPSG:4326:6',
                           'EPSG:4326:7', 'EPSG:4326:8', 'EPSG:4326:9', 'EPSG:4326:10', 'EPSG:4326:11', 'EPSG:4326:12', 
                           'EPSG:4326:13', 'EPSG:4326:14', 'EPSG:4326:15','EPSG:4326:16', 'EPSG:4326:17', 'EPSG:4326:18', 
                           'EPSG:4326:19', 'EPSG:4326:20'],
        tilingScheme: new Cesium.GeographicTilingScheme({ // 重点：tileMatrix使用的是自定义的test_dom, scheme设置为默认的2,1时发现层级范围与自定义的tileMatrix层级差一倍
          numberOfLevelZeroTilesX: 4,
          numberOfLevelZeroTilesY: 2 
        }),
        tileWidth: 256,
        tileHeight: 256

      }))
      this.$children[0].viewer.imageryLayers.add(layer)
    }
  }
}
</script>

<style scoped>
.main {
  width: 100%;
  height: 100%;
  position: relative;
}
.operation {
  position: absolute;
  top: 120px;
  left: 5px;
}
</style>