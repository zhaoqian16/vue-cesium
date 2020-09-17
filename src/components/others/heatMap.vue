<template>
  <div class="map">
    <Map></Map>
    <div id="heatmapContainer"></div>
  </div>
</template>

<script>
import Map from '../map'
import Heatmap from 'heatmap.js'
import heatData from '../../../static/data/heatmap.json'

let Cesium = require('cesium/Source/Cesium')
export default {
  data () {
    return {

    }
  },
  mounted () {
    this.createHeatmap()
  },
  components: {
    Map
  },
  methods: {
    /**
     * @description: 配置属性，创建热图
     * @param {type} 
     * @return {type} 
     */
    createHeatmap () {
      const config = {
        container: document.getElementById('heatmapContainer'),
        radius: 10,
        maxOpacity: .5,
        minOpacity: 0,
        blur: .75,
        gradient: {
          '.0': 'blue',
          '.25': 'cyan',
          '.5': 'green',
          '.75': 'yellow',
          '1': 'red'
        }
      }
      let heatmapInstance = Heatmap.create(config)
      let data = this.dataOrganize()
      heatmapInstance.setData(data.interpData)
      this.addHeatmap(data.bound)
    },
    /**
     * @description: 热图数据的组织
     * @param {type} 
     * @return {type} 
     */
    dataOrganize () {
      // 获取最小经度、最大经度、最小纬度、最大纬度
      let latMin, latMax, lngMin, lngMax, valueMax
      heatData.forEach((item, index) => {
        if (index === 0) {
          latMin = latMax = item.lat
          lngMin = lngMax = item.lng
          valueMax = item.count
        } else {
          latMin = Math.min(latMin, item.lat)
          latMax = Math.max(latMax, item.lat)
          lngMin = Math.min(lngMin, item.lng)
          lngMax = Math.max(lngMax, item.lng)
          valueMax = Math.max(valueMax, item.count)
        }
      })
      // 将经纬度坐标转换为像素坐标
      let organized = []
      let width = document.getElementById('heatmapContainer').offsetWidth
      let height = document.getElementById('heatmapContainer').offsetHeight
      heatData.forEach(item => {
        let point = {
          x: Math.floor((item.lat - latMin) / (latMax - latMin) * width),
          y: Math.floor((item.lng - lngMin) / (lngMax - lngMin) * height),
          value: item.count
        }
        organized.push(point)
      })
      return {
        interpData: {
          max: valueMax,
          data: organized
        },
        bound: {
          latMin: latMin,
          latMax: latMax,
          lngMin: lngMin,
          lngMax: lngMax
        }
      }
    },
    /**
     * @description: 将热图作为实体添加到地图上
     * @param {type} 
     * @return {type} 
     */    
    addHeatmap (bound) {
      const viewer = this.$children[0].viewer
      let entity = viewer.entities.add({
        name: 'heatmap',
        rectangle: {
          coordinates: Cesium.Rectangle.fromDegrees(bound.lngMin, bound.latMin, bound.lngMax, bound.latMax),
          material: new Cesium.ImageMaterialProperty({
            image: document.getElementsByClassName('heatmap-canvas')[0],
            transparent: true
          })
        }
      })
      viewer.zoomTo(entity)
    }
    
  }
}
</script>

<style scoped>
.map {
  widows: 100%;
  height: 100%;
}
#heatmapContainer {
  width: 500px;
  height: 500px;
}
</style>