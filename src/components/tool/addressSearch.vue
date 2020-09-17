<!--
 * @Author: your name
 * @Date: 2020-09-03 16:50:12
 * @LastEditTime: 2020-09-08 17:20:55
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \cesium-vue-test\src\components\tool\addressSearch.vue
-->
<template>
  <div class="map_search">
    <el-popover placement="bottom-start"
                width="250"
                trigger="manual"
                v-model="popoverVisible"></el-popover>
    <div class="res_panel">
      <div v-for="item in autoData" :key="item.district+item.name" class="single_res" @click="handleSelect(key)">hello
          <span class="singleResult-inner">&nbsp;你好</span>
      </div>
    </div>
    <el-input slot="reference" placeholder="请输入地址描述" v-model="inputAddress">
      <el-button slot="append" icon="el-icon-search" type="primary" @click="mapSearchEvent()"></el-button>
    </el-input>
  </div>
</template>

<script>
import 'cesium/Source/Widgets/widgets.css'
let Cesium = require('cesium/Source/Cesium')

export default {
  data () {
    return {
      inputAddress: '',
      marker: '',
      dragStatus: '',
      popoverVisible: false,
      selectStatus: false,
      dragStatus: false,
      autoData: []
    }
  },
  methods: {
    handleSelect (item) {
    },
    mapSearchEvent () {
      this.$get(`http://api.tianditu.gov.cn/geocoder?ds={"keyWord":"${this.inputAddress}"}&tk=76892c38deab957e65556e5824ca53e9`)
      .then(res => {
        console.log(res)
        if (res.status == '0' && res.location) {
          this.addEntity(res.location.lon, res.location.lat)
        } 
      })
    },
    addEntity (lng, lat) {
      const viewer = this.$parent.viewer
      let option = {
        position: Cesium.Cartesian3.fromDegrees(lng, lat),
        billboard: {
          image: '../../static/images/icon/car_1.svg',
          width: 10,
          height: 10,
          scale: 5,
          pixelOffset: new Cesium.Cartesian2(1, 1),
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          heightReference: Cesium.HeightReference.NONE
        }
      }
      return viewer.entities.add(option)
    }

  }
}
</script>

<style scoped>
.map_search {
  min-width: 250px;
  height: auto;
  top: 150px;
  left: 10px;
  position: absolute;
  background-color: #fff;
}
.el-autocomplete {
  width: 100%;
}
.single_res {
  font-size: 14px;
  cursor: pointer;
  line-height: 28px;
}
.single_res:hover {
  background-color: rgba(0,0,0,0.1);
}
.single_res-inner {
  font-size: 12px;
  color: #7e7975;
}
</style>