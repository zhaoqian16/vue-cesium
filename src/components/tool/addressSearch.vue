<!--
 * @Author: xiongqianqian
 * @Date: 2020-09-03 16:50:12
 * @LastEditTime: 2020-09-08 17:20:55
 * @LastEditors: xiongqianqian
 * @Description: 地址搜索框
 * @FilePath: \cesium-vue-test\src\components\tool\addressSearch.vue
-->
<template>
  <div class="map_search">
    <el-popover placement="bottom-start"
                width="250"
                trigger="manual"
                v-model="popoverVisible">
      <div class="searchResultPanel">
        <div v-for="item in autoData" :key="item._district+item.name" class="singleResult" @click="handleSelect(item)">&nbsp;{{ item.name }}&nbsp;
            <span class="singleResult-inner">&nbsp;{{item._city}}{{item._district}}</span>
        </div>
      </div>
      <el-input slot="reference" placeholder="请输入地址描述" v-model="inputAddress">
        <el-button slot="append" icon="el-icon-search" type="primary" @click="mapSearchEvent()"></el-button>
      </el-input>
    </el-popover>
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
      autoData: [],
      handler: null
    }
  },
  methods: {
    handleSelect (item) {
      this.inputAddress = item.address + item.name
      this.selectStatus = true
      this.mapSearchEvent()
    },
    mapSearchEvent () {
      this.$get(`http://api.tianditu.gov.cn/geocoder?ds={"keyWord":"${this.inputAddress}"}&tk=76892c38deab957e65556e5824ca53e9`)
      .then(res => {
        if (res.status == '0' && res.location) {
          this.addMarker(res.location.lon, res.location.lat)
          this.moveMarker()
        } 
      })
    },
    addMarker (lng, lat) {
      const viewer = this.$parent.viewer

      if (this.marker != null) {
        viewer.entities.remove(this.marker)
        this.marker = null
      }
      this.marker = viewer.entities.add({
        name: 'marker',
        position: Cesium.Cartesian3.fromDegrees(lng, lat),
        billboard: {
          image: '../../static/images/icon/car_1.svg',
          scale: 0.5,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM
        }
      })
      return this.marker
    },
    autoSeach () {
      let center = [113.64964385,34.7566100641] 
      this.$get(`http://api.tianditu.gov.cn/search?postStr={"keyWord":"${this.inputAddress}","level":"13","mapBound":"113.33,34.64,113.97,34.94","queryType":"4","count":"10","start":"0"}&type=query&tk=76892c38deab957e65556e5824ca53e9`)
      .then(res => {
        if (res.resultType === '4') {
          if (!res.suggests) {
            this.popoverVisible = false
            this.autoData = []
          } else {
            this.autoData = res.suggests
            this.autoData.map(item => {
              item._province = item.address.slice(0, item.address.indexOf('省',0)+1)
              item._city = item.address.indexOf('市',0)!=-1 ? 
                          item.address.slice(item.address.indexOf('省',0)+1, item.address.indexOf('市',0)+1) : ''
              item._district = item.address.indexOf('区',0)!=-1 || item.address.indexOf('市',item.address.indexOf('市',0)+1)!=-1
                              || item.address.indexOf('县',item.address.indexOf('市',0)+1)!=-1 ?
                              item.address.slice(item.address.indexOf('市',0)+1) : ''
            })
          }
        } 
      })
    },
    moveMarker () {
      const viewer = this.$parent.viewer
      let leftDownDrag = false
      let pointDraged = null
      
      this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
      
      this.handler.setInputAction( e => {
        this.$parent.$el.style.cursor = 'move'
        pointDraged = viewer.scene.pick(e.position)
        leftDownDrag = true
        if (!pointDraged) return
        if (pointDraged.id && pointDraged.id.name === 'marker') {
          viewer.scene.mode === Cesium.SceneMode.SCENE3D ? viewer.scene.screenSpaceCameraController.enableRotate = false :
                                                           viewer.scene.screenSpaceCameraController.enableTranslate = false
          
        }
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN)

      this.handler.setInputAction( e => {
        if (leftDownDrag === true && pointDraged != null) {
          let ray = viewer.camera.getPickRay(e.endPosition)
          let cartesian = viewer.scene.globe.pick(ray, viewer.scene)
          pointDraged.id.position = new Cesium.CallbackProperty( () => {
            return cartesian
          }, false)
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

      this.handler.setInputAction( () => {
        this.$parent.$el.style.cursor = 'default'
        if (!pointDraged) return
        let lnglat = this.cartesian2Wgs84(pointDraged.id.position.getValue())
        this.$get(`http://api.tianditu.gov.cn/geocoder?postStr={'lon':${lnglat.lng},'lat':${lnglat.lat},'ver':1}&type=geocode&tk=76892c38deab957e65556e5824ca53e9`)
          .then( res => {
            if (res.status == '0' && res.result) {
            this.inputAddress = res.result.formatted_address
            console.log(this.inputAddress)
            } 
          })
        leftDownDrag = false
        pointDraged = null
        viewer.scene.mode === Cesium.SceneMode.SCENE3D ? viewer.scene.screenSpaceCameraController.enableRotate = true :
                                                         viewer.scene.screenSpaceCameraController.enableTranslate = true
        this.popoverVisible = false
        // this.handler.destroy()
      }, Cesium.ScreenSpaceEventType.LEFT_UP)
    },
    /**
     * @description: 世界坐标转换为wgs1984地理坐标
     * @param {Cesium.Cartesian3} cartesian3
     * @return: 
     */
    cartesian2Wgs84 (cartesian3) {
      let cartograhphic = Cesium.Cartographic.fromCartesian(cartesian3)
      return {
        lat: Cesium.Math.toDegrees(cartograhphic.latitude),
        lng: Cesium.Math.toDegrees(cartograhphic.longitude),
        alt: cartograhphic.height
      }
    }
  },
  watch: {
    inputAddress (val) {
      if (val) {
        this.autoSeach()
        if (!this.selectStatus) {
          this.popoverVisible = true
        } else {
          this.popoverVisible = false;
          this.selectStatus = false;
        }
      } else {
        this.popoverVisible = false;
      }
    }
  }
}
</script>

<style scoped>
.map_search {
  min-width: 300px;
  height: auto;
  top: 120px;
  left: 10px;
  position: absolute;
  background-color: #fff;
}
.el-autocomplete {
  width: 100%;
}

.singleResult {
  font-size: 14px;
  cursor: pointer;
  line-height: 28px;
}
.singleResult:hover {
  background-color: rgba(0,0,0,0.1);
}
.singleResult-inner {
  font-size: 12px;
  color: #7e7975;
}
</style>