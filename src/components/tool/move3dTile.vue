<template>
  <div class="move_tile">
    <el-radio-group v-model="unitStep" size="mini">
      <el-radio-button label="0.01"></el-radio-button>
      <el-radio-button label="0.1"></el-radio-button>
      <el-radio-button label="1"></el-radio-button>
      <el-radio-button label="10"></el-radio-button>
      <el-radio-button label="100"></el-radio-button>
    </el-radio-group>
    <el-row>
      <label>x:</label>
      <el-button size="mini" @click="startOffset('plus', 'x')">+</el-button>
      <el-inputNumber v-model="xOffset" :step="parseFloat(unitStep)" size="mini" :controls="false" @change="handleChangeX" :precision="2"></el-inputNumber>
      <el-button size="mini" @click="startOffset('minus', 'x')">--</el-button>
    </el-row>
     <el-row>
      <label>y:</label>
      <el-button size="mini" @click="startOffset('plus', 'y')">+</el-button>
      <el-inputNumber v-model="yOffset" :step="parseFloat(unitStep)" size="mini" :controls="false" @change="handleChangeY" :precision="2"></el-inputNumber>
      <el-button size="mini" @click="startOffset('minus', 'y')">--</el-button>
    </el-row>
     <el-row>
      <label>z:</label>
      <el-button size="mini" @click="startOffset('plus', 'z')">+</el-button>
      <el-inputNumber v-model="zOffset" :step="parseFloat(unitStep)" size="mini" :controls="false" @change="handleChangeZ" :precision="2"></el-inputNumber>
      <el-button size="mini" @click="startOffset('minus', 'z')">--</el-button>
    </el-row>
  </div>
</template>

<script>
let Cesium = require('cesium/Source/Cesium')

export default {
  data () {
    return {
      unitStep: 1,
      sumOffset: null,
      xOffset: 0,
      yOffset: 0,
      zOffset: 0
    }
  },
  props: {
    tileset: Object
  },
  mounted () {

  },
  methods: {
    startOffset (flag, axis) {
      let stepArr, tans
      if (!this.unitStep) {
        this.$message({
          message: '请选择移动步长!',
          type: 'error'
        })
        return
      }
      this.unitStep = this.unitStep || '1'
      let step = flag === 'plus' ? parseFloat(this.unitStep) : -parseFloat(this.unitStep)

      if (axis === 'x') {
        stepArr = Cesium.Cartesian3.fromArray([step, 0, 0])
      } else if (axis === 'y') {
        stepArr = Cesium.Cartesian3.fromArray([0, step, 0])
      } else if (axis === 'z') {
        stepArr = Cesium.Cartesian3.fromArray([0, 0, step])
      }
      let tilesetArr = Cesium.Cartesian3.fromArray([
        this.tileset.modelMatrix[12],
        this.tileset.modelMatrix[13],
        this.tileset.modelMatrix[14]
      ])
      let offset = Cesium.Cartesian3.add(tilesetArr, stepArr, new Cesium.Cartesian3())
      this.tileset.modelMatrix = Cesium.Matrix4.fromTranslation(offset)

      if (!Cesium.defined(this.sumOffset)) {
        this.sumOffset = Cesium.Cartesian3.fromArray([0, 0, 0])
      }
      this.sumOffset =  Cesium.Cartesian3.add(this.sumOffset, stepArr, new Cesium.Cartesian3())
      this.xOffset = this.sumOffset.x
      this.yOffset = this.sumOffset.y
      this.zOffset = this.sumOffset.z
    },
    handleChangeX (newVal, oldVal) {
      this.handleChange(newVal - oldVal, 'x')
    },
    handleChangeY (newVal, oldVal) {
      this.handleChange(newVal, oldVal, 'y',)
    },
    handleChangeZ (newVal, oldVal) {
      this.handleChange(newVal, oldVal, 'z')
    },
    handleChange (changeNum, axis) {
      let offset
      if (axis === 'x') {
        offset = Cesium.Cartesian3.fromArray([changeNum, this.yOffset, this.zOffset])
      } else if (axis === 'y') {
        offset = Cesium.Cartesian3.fromArray([this.xOffset, changeNum, this.zOffset])
      } else if (axis === 'z') {
        offset = Cesium.Cartesian3.fromArray([this.xOffset, this.yOffset, changeNum])
      }

      let matrix3 = Cesium.Cartesian3.fromArray([
        this.tileset.modelMatrix[12],
        this.tileset.modelMatrix[13],
        this.tileset.modelMatrix[14]
      ])

      matrix3 = Cesium.Cartesian3.add(matrix3, offset, new Cesium.Cartesian3())
      this.tileset.modelMatrix = Cesium.Matrix4.fromTranslation(matrix3)
      this.sumOffset = offset
    }
  }
}
</script>

<style scoped>
.move_tile {
  position: absolute;
  top: 170px;
  left: 5px;
}
label {
  color: #fff;
}
.el-button--mini {
  padding: 7px 5px;
}
.el-input-number--mini {
  width: 70px;
}
.el-input-number.is-without-controls input.el-input__inner {
  padding: 0 5px;
}
.el-row {
  margin-top: 8px;
}
</style>