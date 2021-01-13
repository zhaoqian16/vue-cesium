<!--
 * @Author: zhaoqian
 * @Date: 2019-12-27 09:41:49
 * @LastEditTime: 2020-03-27 17:09:13
 * @LastEditors: Please set LastEditors
 * @Description: 
 * @FilePath: \cesium-vue\src\components\action\entityInfobox.vue
 -->

<template>
  <div>
    <el-button-group>
      <el-button size="mini" @click="addEntitiy(2)">2d点的info框</el-button>
      <el-button size="mini" @click="addEntitiy(3)">3d点的info框</el-button>
    </el-button-group>
    <div v-if="infoBoxVisible==true">
      <div class="info-box">
        <div class="head">
          <div class="title">属性</div>
          <div class="close" @click="closeInfoBox()">×</div>
        </div>
        <div class="body">
          <table>
            <tr v-for="(val, key) in pickedEntity.properties"
                 v-if="typeof(pickedEntity.properties[key]) !== 'function' && key.indexOf('_') !== 0 && val">
              <td>{{ key }}</td>
              <td>{{ val }}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import 'cesium/Widgets/widgets.css'
let Cesium = require('cesium/Cesium')
import Data from '../loadData/geojsonObject_data'
import gltfFile from '../../../static/3dModel/CesiumBalloon.glb'

export default {
  data () {
    return {
      infoBoxVisible: false,
      windowPosition: '',
      pickedEntity: null,
      gltfFile: gltfFile
    }
  },
  methods: {
    /**
     * @description: 解析json数据
     * @param {dMode} 维度模式（2/3）
     */
    addEntitiy (dMode) {
      const pointArr = Data.points
      let properties, lng, lat
      for (let item of pointArr) {
        lng = item.geometry.coordinates[0]
        lat = item.geometry.coordinates[1]
        properties = item.properties
        if (dMode === 2) {
          this.add2dEntity(lng, lat, properties)
        } else if (dMode === 3) {
          this.add3dEntity(lng, lat, properties)
        }
      }
      this.handleClickEvent()
    },
    /**
     * @description: 生成二维实体点, 并将属性挂载到点上
     *  @param {lng} 经度
     *  @param {lat} 纬度
     *  @param {properties} 属性信息
     */
    add2dEntity(lng, lat, properties) {
      let cartesian = Cesium.Cartesian3.fromDegrees(lng, lat, 0, this.ellipsoid)
      let entity = new Cesium.Entity({
        position: cartesian,
        point: {
          show: true
        },
        billboard: {
          verticalOrigin:  Cesium.VerticalOrigin.Bottom,
          scale: 0.2
        }
      })
      entity.properties = {}
      for (let key in properties) {
        entity.properties[key] = properties[key] 
      }
      entity.billboard.image = this.get2dEntityImage(entity.properties.org_type)
      this.$parent.viewer.entities.add(entity)
    },
    /**
     * @description: 基于三维模型生成三维实体点, 并将属性挂载到点上
     * @param {lng} 经度
     * @param {lat} 纬度
     * @param {properties} 属性信息
     */
    add3dEntity (lng, lat, properties) {
      let cartesian = Cesium.Cartesian3.fromDegrees(lng, lat, 0, this.ellipsoid)
      const url = this.gltfFile  // 三维模型
      let entity = new Cesium.Entity({
        name: url,
        position: cartesian,
        model: {
          uri: url,
          scale: 1000
        }
      })
      entity.properties = {}
      for (let key in properties) {
        entity.properties[key] = properties[key] 
      }
      this.$parent.viewer.entities.add(entity)
    },
    /**
     * @description: 给地图添加点击事件，使点击要素，获取要素信息并显示信息窗体
     */
    handleClickEvent () {
      let handler = new Cesium.ScreenSpaceEventHandler(this.$parent.viewer.scene.canvas)
      handler.setInputAction( (e) => {
        let pick = this.$parent.viewer.scene.pick(e.position)
        if (pick) {
          this.infoBoxVisible = true
          this.pickedEntity = pick.id
          this.initInfoBox(this.pickedEntity.position._value)
        } else {
          this.infoBoxVisible = false
        }
      },  Cesium.ScreenSpaceEventType.LEFT_CLICK)
    },
    /**
     * @description: 初始化信息窗体的位置
     * @param {position} 世界坐标
     */
    initInfoBox (position) {
      let cartesian = position
      this.windowPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.$parent.viewer.scene, cartesian) //世界转化为屏幕坐标
      let removeHandler = this.$parent.viewer.scene.postRender.addEventListener( () => {
        this.windowPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.$parent.viewer.scene, cartesian)
      })
    },
    /**
     * @description: 关闭信息窗体
     */
    closeInfoBox () {
      this.infoBoxVisible = false
    },
    /**
     * @description: 根据实体类型获取图片地址
     * @param {orgType} 实体类型
     * @return 图片地址
     */
    get2dEntityImage (orgType) {
      let image
      switch (orgType) {
        case '1': 
          image = '../../static/images/org/经济组织.svg'
          break
        case '2':
          image = '../../static/images/org/行政事业单位.svg'
          break
        case '3':
          image = '../../static/images/org/民办非企业单位.svg'
          break
        case '4':
          image = '../../static/images/org/医疗机构.svg'
          break
        case '5':
          image = '../../static/images/org/教育机构.svg'
          break
        case '6':
          image = '../../static/images/org/工地.svg'
          break
        case '7':
          image = '../../static/images/org/其他设施.svg'
          break
      }
      return image
    }
  },
  watch: {
    windowPosition (val) {
      if (this.infoBoxVisible) {
        let infobox = this.$el.getElementsByClassName("info-box")[0]
        if (infobox) {
          infobox.style.left = val.x -200 + 'px'
          infobox.style.top = val.y + 'px'
        }
      }
    }
  }
}
</script>
<style scoped>
.info-box {
  position: absolute;
  width: 300px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  border-bottom:2px solid #e8a346;
  line-height: 150%;
  filter: progid:DXImageTransform.Microsoft.Gradient(startColorStr='#FFFFFF',endColorStr='#FAFAFA',gradientType='0');
	background: -webkit-gradient(linear,center top,center bottom,from(#fff), to(#fafafa));
	color: #7e7975;
	box-shadow:	0 2px 2px rgba(0,0,0,0.2),0 1px 5px rgba(0,0,0,0.2),  0 0 0 10px rgba(255,255,255,0.1);
	overflow:auto;
  max-height: 400px;
}
.info-box .head {
  font-weight: 700;
  font-size: 14px;
  color: #666;
}
.head .title {
  width: 168px;
  padding: 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow-x: hidden;
  line-height: 100%;
}
.head .close {
  position: absolute;
  font-size: 20px;
  top: 5px;
  right: 5px;
  width: 12px;
  height: 12px;
  text-align: center;
  line-height: 12px;
  font-weight: 400;
}
.info-box .body {
  border-top: 1px solid #f6f6f6;
	background:#f6f6f6;
	min-height:70px;
}
.info-box .body p {
  margin: 10px;
  font-size: 12px;
  white-space: normal;
}
</style>