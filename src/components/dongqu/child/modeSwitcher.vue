<!--
 * @Author: xiongqianqian
 * @Date: 2020-07-09 10:40:18
 * @LastEditTime: 2020-07-30 09:49:25
 * @LastEditors: Please set LastEditors
 * @Description: 基于cesium的二三维转换
 * @FilePath: \cesium-vue-test\src\components\tool\modeSwitcher2.vue
-->
<template>
  <div>
    <!-- 切换2d3d模式 -->
    <div class="dSwitch" id="dSwitchContainer" ref="switcher">
      <el-radio-group v-model="dType" size="mini">
        <el-radio-button label="3D"></el-radio-button>
        <el-radio-button label="2D"></el-radio-button>
      </el-radio-group>
    </div>
  </div>
</template>
<script>
import 'cesium/Source/Widgets/widgets.css'
let Cesium = require('cesium/Source/Cesium')

export default {
  data () {
    return {
      dType: '3D',
      sceneModePicker: ''
    }
  },
  mounted () {
    const scene = this.$parent.viewer.scene
    this.sceneModePicker = new Cesium.SceneModePicker('dSwitchContainer', scene, 0)
    this.$refs.switcher.children[1].style.display = 'none'
    this.$parent.sceneMode = this.dType;
  },
  methods: {
    sceneModeControl (action) {
      let command
      let primitives = this.$parent.viewer.scene.primitives._primitives
      const dataSources = this.$parent.viewer.dataSources
      if (dataSources.length > 0) {
        for (let i = 0; i < dataSources.length; i++) {
          var current = dataSources.get(i);
          dataSources.remove(current)
        }
      }
      if (action === '3D') {
        // 三维模型隐藏
        this.$parent.tileset.show = true
        primitives.forEach(item => {
          if (item instanceof Cesium.ModelInstanceCollection) {
            item.show = true
          }
        })
        // 显示影像图
        this.$parent.sitelliteMap.show = true
        // this.$parent.customMap.show = true
        this.$parent.labelMap.show = false
        this.$parent.vectorMap.show = false
        this.$parent.sceneMode = '3D';
        command = this.sceneModePicker.viewModel.morphTo3D
        // 显示三维指南针
        document.getElementById('navigationDiv').style.display = 'block'

      } else if (action === '2D') {
        // 三维模型隐藏
        this.$parent.tileset.show = false
        primitives.forEach(item => {
          if (item instanceof Cesium.ModelInstanceCollection) {
            item.show = false
          }
        })
        // 显示天地图矢量地图
        this.$parent.vectorMap.show = true
        this.$parent.labelMap.show = true
        this.$parent.sitelliteMap.show = false
        // this.$parent.customMap.show = false
        this.$parent.sceneMode = '2D';
        // 隐藏三维指南针
        document.getElementById('navigationDiv').style.display = 'none'
        command = this.sceneModePicker.viewModel.morphTo2D

      }
      if (command.canExecute) {
        command()
      }
    },
    get3DExtent() {
      var rectangle = this.$parent.viewer.camera.computeViewRectangle();
      var west = rectangle.west / Math.PI * 180
      var north = rectangle.north / Math.PI * 180
      var east = rectangle.east / Math.PI * 180
      var south = rectangle.south / Math.PI * 180
      return {
        west: west,
        east: east,
        north: north,
        south: south
      }
    },
  },
  watch: {
    dType () {
      if (this.dType === '3D') {
        // this.$parent.viewer.scene.morphTo3D(1)
        this.sceneModeControl('3D')
      } else {
        // this.$parent.viewer.scene.morphTo2D(1)
        this.sceneModeControl('2D')
      }
    }
  }
}
</script>

<style >
  .dSwitch {
    position: absolute;
    top: 5px;
    right: 5px;
    display: none;
  }
</style>
