<template>
  <div class="move_tile">
    <el-radio-group v-model="unitStep" size="mini">
      <el-radio-button label="0.01"></el-radio-button>
      <el-radio-button label="0.1"></el-radio-button>
      <el-radio-button label="1"></el-radio-button>
      <el-radio-button label="10"></el-radio-button>
      <el-radio-button label="100"></el-radio-button>
    </el-radio-group>
    <el-radio-group v-model="axis">
      <el-radio-button label="x">{{ xStep }}</el-radio-button>
      <el-radio-button label="y">{{ yStep }}</el-radio-button>
      <el-radio-button label="z">{{ zStep }}</el-radio-button>
    </el-radio-group>
    <el-button-group>
      <el-button size="mini" @click="startOffset('plus')">++</el-button>
      <el-button size="mini" @click="startOffset('minus')">--</el-button>
    </el-button-group>
  </div>
</template>

<script>
export default {
  data () {
    return {
      unitStep: 1
    }
  },
  methods: {
    startOffset (flag) {
      let stepArr, tans
      if (!this.unitStep || !this.axis) {
        this.$emit()
      }
      this.unitStep = this.unitStep || '1'
      let step = flag === 'plus' ? parseFloat(this.unitStep) : -parseFloat(this.unitStep)

      if (offsetAxis === 'x') {
        stepArr = Cesium.Cartesian3.fromArray([step, 0, 0])
      } else if (offsetAxis === 'y') {
        stepArr = Cesium.Cartesian3.fromArray([0, step, 0])
      } else if (offsetAxis === 'z') {
        stepArr = Cesium.Cartesian3.fromArray([0, 0, step])
      }
      let tilesetArr = Cesium.Cartesian3.fromArray([
        this.tileset.modelMatrix[12],
        this.tileset.modelMatrix[13],
        this.tileset.modelMatrix[14]
      ])
      let trans = Cesium.Cartesian3.add(tilesetArr, stepArr, new Cesium.Cartesian3())
      this.tileset.modelMatrix = Cesium.Matrix4.fromTranslation(trans)

      if (!Cesium.defined(this.sumTrans)) {
        this.sumTrans = Cesium.Cartesian3.fromArray([0, 0, 0])
      }
      this.sumTrans =  Cesium.Cartesian3.add(this.sumTrans, stepArr, new Cesium.Cartesian3())
      this.sumOffset = `x: ${this.sumTrans.x}, y: ${this.sumTrans.y}, z: ${this.sumTrans.z}`
    },
  }
}
</script>

<style scoped>

</style>