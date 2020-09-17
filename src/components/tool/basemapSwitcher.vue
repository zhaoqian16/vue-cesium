<!--
 * @Author: xiongqianqian
 * @Date: 2019-12-24 14:09:48
 * @LastEditTime: 2020-09-02 15:33:30
 * @LastEditors: Please set LastEditors
 * @Description: cesium基础地图切换按钮（卫星图/标准地图）
 * @FilePath: \cesium-vue-test\src\components\tool\basemapSwitcher.vue
 -->
<template>
  <div class="mapSwicher">
    <el-select v-model="mapType" placeholder="请选择" size="mini">
      <el-option v-for="item in mapUrl"
                  :key="item.id"
                  :label="item.label"
                  :value="item.id">
    </el-option>
    </el-select>
    <el-button size="mini" @click="handleTerrain()">{{ terrainFlag ? '移除' : '添加'}}地形</el-button>
    <div id="map-color">
      <tr>
        <td class="title">Brightness</td>
        <td>
          <input type="range" min="0" max="10" step="0.02" v-model="color.brightness">
          <span>{{ brightness }}</span>
        </td>
      </tr>
      <tr>
        <td class="title">Contrast</td>
        <td>
          <input type="range" min="0" max="10" step="0.02" v-model="color.contrast">
          <span>{{ contrast }}</span>
        </td>
      </tr>
      <tr>
        <td class="title">Hue</td>
        <td>
          <input type="range" min="0" max="10" step="0.02" v-model="color.hue">
          <span>{{ hue }}</span>
        </td>
      </tr>
      <tr>
        <td class="title">Saturation</td>
        <td>
          <input type="range" min="0" max="10" step="0.02" v-model="color.saturation">
          <span>{{ saturation }}</span>
        </td>
      </tr>
      <tr>
        <td class="title">Gamma</td>
        <td>
          <input type="range" min="0" max="10" step="0.02" v-model="color.gamma">
          <span>{{ gamma }}</span>
        </td>
      </tr>
    </div>
  </div>
</template>
<script>
import 'cesium/Source/Widgets/widgets.css'
let Cesium = require('cesium/Source/Cesium')

export default {
  data () {
    return {
      mapType: 5,
      SatelliteLayer: '',
      normalLayer: '',
      mapUrl: [
        {
          id: 0,
          value: 'gaodeMap', // 矢量图（含路网、含注记）
          url: 'http://wprd0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=2&style=5',
          label: '高德矢量图'
        }, {
          id: 1,
          value: 'gaodeSatelliteMap', // 影像底图（不含路网，不含注记）
          url: 'http://wprd0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=6',
          label: '高德影像图'
        }, {
          id: 2,
          value: 'tianMap',
          url: 'http://t{s}.tianditu.gov.cn/vec_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=76892c38deab957e65556e5824ca53e9',
          label: '天地图矢量图'
        }, {
          id: 3,
          value: 'tianSatelliteMap',
          url: 'http://t{s}.tianditu.gov.cn/img_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=76892c38deab957e65556e5824ca53e9',
          label: '天地图影像图'
        }, {
          id: 4,
          value: 'tianTerrainMap',
          url: 'http://t{s}.tianditu.gov.cn/ter_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=ter&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=76892c38deab957e65556e5824ca53e9',
          label: '天地图晕渲图'
        }, {
          id: 5,
          value: 'googleSatelliteMap',
          url: 'http://{s}.google.cn/vt?lyrs=s&x={TileCol}&y={TileRow}&z={TileMatrix}&s=Gali',
          label: '谷歌带有标签的影像'
        },
        {
          id: 6,
          value: 'arcgisMap',
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
          label: 'arcgis在线地图'
        },
        {
          id: 7,
          value: 'openstreetMap',
          url: 'https://a.tile.openstreetmap.org/',
          label: 'OpenStreet在线地图'
        },
        {
          id: 8,
          value: 'mapboxSatellite',
          label: 'Mapbox影像图'
        },
        {
          id: 9,
          value: 'maoboxVector',
          label: 'Mapbox矢量图'
        }
        
      ],
      maps: null,
      imageryCollection: null,
      color: {
        brightness: 1,
        contrast: 0,
        hue: 1,
        saturation: 1,
        gamma: 1
      },
      brightness: 1,
      contrast: 0,
      hue: 1,
      saturation: 1,
      gamma: 1,
      colorString: '',
      showLayer: null,
      terrainFlag: false
    }
  },
  mounted () {
    this.initBaseMap()
    this.show(this.mapType)
    this.colorChange()
  },
  methods: {
    /**
     * @description: 初始化基本地图图层
     * @param {type}
     * @return:
     */
    initBaseMap () {
      let viewer = this.$parent.viewer

      // 添加地形
      // viewer.terrainProvider = Cesium.createWorldTerrain({
      //   requestWaterMask : true, // required for water effects
      //   requestVertexNormals : true // required for terrain lighting
      // });
      // 打开深度检测，那么在地形以下的对象不可见
      // viewer.scene.globe.depthTestAgainstTerrain = true

      this.maps = [
        // 高德基本地图
        new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
          url: this.mapUrl.find(item => item.value === 'gaodeMap').url,
          subdomains: ['1', '2', '3', '4'],
          maximumLevel: 50
        }), {
          show: false
        }),
        // 高德影像图
        new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
          url: this.mapUrl.find(item => item.value === 'gaodeSatelliteMap').url,
          subdomains: ['1', '2', '3', '4']
        }), {
          show: false
        }),
        // 天地图基本地图
        new Cesium.ImageryLayer(new Cesium.WebMapTileServiceImageryProvider({
          url: this.mapUrl.find(item => item.value === 'tianMap').url,
          layer: 'tianMap',
          style: 'default',
          format: 'tiles',
          tileMatrixSetID: 'c',
          subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
          tilingScheme: new Cesium.GeographicTilingScheme(),
          tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
          maximumLevel: 18
        }), {
          show: false
        }),
        // 天地图影像图
        new Cesium.ImageryLayer(new Cesium.WebMapTileServiceImageryProvider({
          url: this.mapUrl.find(item => item.value === 'tianSatelliteMap').url,
          layer: 'tianSatelliteMap',
          style: 'default',
          format: 'tiles',
          tileMatrixSetID: 'c',
          subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
          tilingScheme: new Cesium.GeographicTilingScheme(),
          tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
          maximumLevel: 18
        }), {
          show: false
        }),
        // 天地图晕渲图
        new Cesium.ImageryLayer(new Cesium.WebMapTileServiceImageryProvider({
          url: this.mapUrl.find(item => item.value === 'tianTerrainMap').url,
          layer: 'tianTerrainMap',
          style: 'default',
          format: 'tiles',
          tileMatrixSetID: 'c',
          subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
          tilingScheme: new Cesium.GeographicTilingScheme(),
          tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
          maximumLevel: 18
        }), {
          show: false
        }),
        // google 影像图
        new Cesium.ImageryLayer(new Cesium.WebMapTileServiceImageryProvider({
          url: this.mapUrl.find(item => item.value === 'googleSatelliteMap').url,
          layer: 'googleSatelliteMap',
          style: 'default',
          format: 'tiles',
          tileMatrixSetID: 'c',
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
          tilingScheme: new Cesium.WebMercatorTilingScheme(),
          maximumLevel: 22
        }), {
          show: false,
          brightness: 1.76,
          contrast: 1.48,
          hue: 0,
          saturation: 1.44,
          gamma: 0.68
        }),
        // arcgis 影像图
        new Cesium.ImageryLayer(new Cesium.ArcGisMapServerImageryProvider({
          url: this.mapUrl.find(item => item.value === 'arcgisMap').url
        }), {
          show: false
        }),
        // openstreet 地图
        new Cesium.ImageryLayer(new Cesium.OpenStreetMapImageryProvider({
          url: this.mapUrl.find(item => item.value === 'openstreetMap').url
        }), {
          show: false
        }),
        // mapbox 影像图
        new Cesium.ImageryLayer(new Cesium.MapboxImageryProvider({
          mapId: 'mapbox.satellite',
          accessToken: 'pk.eyJ1IjoieGlvbmdxaWFucWlhbiIsImEiOiJjazVrYzNidzQwY2xsM2xqb2pqNTR6c2huIn0.NbOIQI9qF4winz6jY3FZOw'
        }), {
          show: false
        }),
        // mapbox 矢量图
        new Cesium.ImageryLayer(new Cesium.MapboxImageryProvider({
          mapId: 'mapbox.streets-v11',
          accessToken: 'pk.eyJ1IjoieGlvbmdxaWFucWlhbiIsImEiOiJjazVrYzNidzQwY2xsM2xqb2pqNTR6c2huIn0.NbOIQI9qF4winz6jY3FZOw'
        }), {
          show: false
        })
      ]
      this.maps.forEach((item, index) => {
        viewer.imageryLayers.add(item, index)
      })
    },
    /**
     * @description: 处理基本地图选择的点击事件。有wms图层，将其图层放至最顶层。
     * @param {type}
     * @return:
     */
    handleChange (event) {
      let raise = []
      const viewer = this.$parent.viewer
      for (let item of viewer.imageryLayers._layers) {
        if (item.title && item.title.indexOf('districts') === 0) {
          raise.push(item)
        } else if (item.title === 'NaturalEarthII') {
          viewer.imageryLayers.remove(item)
        } else {
          item.show = false
        }
        if (item._layerIndex === event) {
          item.show = true
        }
      }
      raise.forEach(item => viewer.imageryLayers.raiseToTop(item))
    },
    show (val) {
      let raise = []
      for (let item of this.$parent.viewer.imageryLayers._layers) {
        if (item.title && item.title.indexOf('districts') === 0) {
          raise.push(item)
        } else if (item.title === 'NaturalEarthII') {
          this.$parent.viewer.imageryLayers.remove(item)
        } else {
          item.show = false
        }
        if (item._layerIndex === val) {
          this.showLayer = item
          item.show = true
        }
      }
      raise.forEach(item => this.$parent.viewer.imageryLayers.raiseToTop(item))
    },
    colorChange () {
      let viewer = this.$parent.viewer
      Cesium.knockout.track(this.color)
      let mapColor = document.getElementById('map-color')
      Cesium.knockout.applyBindings(this.color, mapColor)

      this.subscribeLayerParameter('brightness')
      this.subscribeLayerParameter('contrast')
      this.subscribeLayerParameter('hue')
      this.subscribeLayerParameter('saturation')
      this.subscribeLayerParameter('gamma')

      viewer.imageryLayers.layerAdded.addEventListener(this.updateViewModel)
      viewer.imageryLayers.layerRemoved.addEventListener(this.updateViewModel)
      viewer.imageryLayers.layerMoved.addEventListener(this.updateViewModel)
      this.updateViewModel()
    },
    updateViewModel () {
      let viewer = this.$parent.viewer
      if (viewer.imageryLayers.length > 0) {
        let layer = this.showLayer
        this.color.brightness = this.brightness = layer.brightness
        this.color.contrast = this.contrast = layer.contrast
        this.color.hue = this.hue = layer.hue
        this.color.saturation = this.saturation = layer.saturation
        this.color.gamma = this.gamma = layer.gamma
      }
    },
    subscribeLayerParameter (name) {
      Cesium.knockout
        .getObservable(this.color, name)
        .subscribe(newValue => {
          if (this.$parent.viewer.imageryLayers.length > 0) {
            let layer = this.showLayer
            layer[name] = newValue
            this[name] = newValue
          }
        })
    },
    handleTerrain () {
      this.terrainFlag = !this.terrainFlag
      let terrain
      if (this.terrainFlag) {
        terrain = Cesium.createWorldTerrain({
          requestWaterMask : true, // required for water effects
          requestVertexNormals : true // required for terrain lighting
        });
      } else {
        terrain = new Cesium.EllipsoidTerrainProvider()
      }
      this.$parent.viewer.terrainProvider = terrain
    }

  },
  watch: {
    mapType (val) {
      this.show(val)
    }
  }
}
</script>
<style>
.mapSwicher {
  position: absolute;
  top: 0;
  left: 0;
}
#map-color {
  background-color: #fff;
  font-size: 12px;
  display: none;
}
</style>
