<!--
 * @Author: xiongqianqian
 * @Date: 2020-07-09 10:40:18
 * @LastEditTime: 2020-07-09 14:36:39
 * @LastEditors: Please set LastEditors
 * @Description: 基于cesium的二三维转换
 * @FilePath: \cesium-vue-test\src\components\tool\modeSwitcher_s.vue
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
  },
  methods: {
    /**
     * @description: 维度控制
     * @param {type}
     * @return:
     */
    sceneModeControl (action) {
      let command
      if (action === '3D') {
        command = this.sceneModePicker.viewModel.morphTo3D
        // 显示三维指南针
        document.getElementById('navigationDiv').style.display = 'block'
      } else if (action === '2D') {
        command = this.sceneModePicker.viewModel.morphTo2D
        // 隐藏三维指南针
        document.getElementById('navigationDiv').style.display = 'none'
        // 切换二维时保证视图范围大致一致
        let extent = this.get3DExtent()
        this.$parent.viewer.camera.setView({
          destination: Cesium.Rectangle.fromDegrees(extent.west, extent.south, extent.east, extent.north)
        })
      }
      if (command.canExecute) {
        command()
      }
    },
    /**
     * @description: 获取三维视图下的可视范围
     * @param {type}
     * @return:
     */
    get3DExtent () {
      var rectangle = this.$parent.viewer.camera.computeViewRectangle()
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
    }
  },
  watch: {
    dType (val) {
      this.sceneModeControl(val)
    }
  }
}
</script>

<style>
  .dSwitch {
    position: absolute;
    top: 5px;
    right: 5px
  }
</style>
