<!--
 * @Author: xiongqianqian
 * @Date: 2019-12-24 14:06:40
 * @LastEditTime: 2020-07-09 10:54:18
 * @LastEditors: Please set LastEditors
 * @Description: wms图层的控制
 * @FilePath: \vue-cesium\src\components\tool\layerControl.vue
-->
<template>
  <div class="layers-control">
    <el-tree :data="layersData"
              show-checkbox
              :highlight-current="true"
              @check-change="handleCheckChange"
              node-key="id"
              :check-strictly="false"
              :props="defaultProps"
              :default-checked-keys="[]">
    </el-tree>
  </div>
</template>
<script>
import 'cesium/Source/Widgets/widgets.css'
let Cesium = require('cesium/Source/Cesium')

export default {
  data () {
    return {
      layerUrl: 'http://localhost:8081/geoserver/districts/wms',
      layersData: [
        {
          id: 1,
          pid: 0,
          label: '基础图层',
          checked: false,
          children: [
            {id: 11, pid: 1, label: '区级区划', layerName: 'districts:quhua', IsWebMercatorTilingScheme: true, checked: false},
            {id: 12, pid: 1, label: '部件', layerName: 'districts:t_basic_component', IsWebMercatorTilingScheme: true, checked: false}
          ]
        }
      ],
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    }
  },
  created () {
    this.initWmsLayers()
  },
  methods: {
    /**
     * @description: 循环初始化wms图层
     * @param {type}
     * @return:
     */
    initWmsLayers () {
      const viewer = this.$parent.viewer
      // 循环初始化图层，将其放入imgerylayer中，根据选中情况进行添加
      for (let i = 0; i < this.layersData[0].children.length; i++) {
        const item = this.layersData[0].children[i]
        const wmsP = new Cesium.WebMapServiceImageryProvider({
          url: this.layerUrl,
          layers: item.layerName,
          parameters: {
            service: 'WMS',
            version: '1.1.0',
            request: 'GetMap',
            transparent: true,
            format: 'image/png'
          },
          tileWidth: 256,
          tileHeight: 256
        })
        let wmsLayer
        if (item.layerName.indexOf('quhua') !== -1) {
          wmsLayer = new Cesium.ImageryLayer(wmsP, {
            show: false
          })
        } else {
          wmsLayer = new Cesium.ImageryLayer(wmsP, {
            show: false
          })
        }
        wmsLayer.title = item.layerName
        viewer.imageryLayers.add(wmsLayer)
      }
    },
    /**
     * @description: 选中某个图层则显示该图层，否则则隐藏
     * @param {node} 选中的节点
     * @param {checked} checkbox的状态
     * @return:
     */
    handleCheckChange (node, checked) {
      let index
      const viewer = this.$parent.viewer
      for (var i = 0; i < viewer.imageryLayers._layers.length; i++) {
        if (node.layerName === viewer.imageryLayers.get(i).title) {
          index = i
          break
        }
      }
      let layer = this.$parent.viewer.imageryLayers.get(index)
      if (checked) {
        layer.show = true
      } else {
        layer.show = false
      }
    }
  }
}
</script>

<style>
.layers-control {
  position: absolute;
  top: 35px;
  right: 5px;
  width: 182px;
}
</style>
