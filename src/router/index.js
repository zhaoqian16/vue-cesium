import Vue from 'vue'
import Router from 'vue-router'

import Map from '@/components/map.vue'
// 工具组件
import SceneModeSwitcher1 from '@/components/tool/sceneModeSwitcher1'
import SceneModeSwitcher2 from '@/components/tool/sceneModeSwitcher2'
import BasemapSwitcher from '@/components/tool/basemapSwitcher'
import LayerManagement from '@/components/tool/layerManagement'
import DrawEntity from '@/components/tool/drawEntity'
import Meature from '@/components/tool/meature'
import Wander from '@/components/tool/wander'

// 粒子
import ParticleSystem from '@/components/partical/particleSystem'

// 东区项目
import Dongqu from '@/components/dongqu/map'
import Login from '@/components/dongqu/login'

// 其他
import ProfileAnalysis from '@/components/others/profileAnalysis'
import HeatMap from '@/components/others/heatMap'
import SubmergeAnalysis from '@/components/others/submergeAnalysis'
import VisibilityAnalysis from '@/components/others/visibilityAnalysis'

import AddWMTSLayer from '@/components/addLayer/addWMTSLayer'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'map',
      component: Map
    },
    {
      path: '/tool',
      children: [
        {
          path: 'sceneModeSwitcher1',
          name: 'sceneModeSwitcher1',
          component: SceneModeSwitcher1
        },
        {
          path: 'sceneModeSwitcher2',
          name: 'sceneModeSwitcher2',
          component: SceneModeSwitcher2
        },
        {
          path: 'basemapSwitcher',
          name: 'basemapSwitcher',
          component: BasemapSwitcher
        },
        {
          path: 'layerManagement',
          name: 'layerManagement',
          component: LayerManagement
        },
        {
          path: 'drawEntity',
          name: 'drawEntity',
          component: DrawEntity
        },
        {
          path: 'meature',
          name: 'meature',
          component: Meature
        },
        {
          path: 'wander',
          name: 'wander',
          component: Wander
        }
      ]
    },
    {
      path: '/particleSystem',
      name: 'particleSystem',
      component: ParticleSystem
    },
    {
      path: '/dongqu',
      name: 'dongqu',
      component: Dongqu
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/profileAnalysis',
      name: 'profileAnalysis',
      component: ProfileAnalysis
    },
    {
      path: '/heatMap',
      name: 'heatMap',
      component: HeatMap
    },
    {
      path: '/submergeAnalysis',
      name: 'submergeAnalysis',
      component: SubmergeAnalysis
    },
    {
      path: '/visibilityAnalysis',
      name: 'visibilityAnalysis',
      component: VisibilityAnalysis
    },
    {
      path: '/addWMTSLayer',
      name: 'addWMTSLayer',
      component: AddWMTSLayer
    }
  ]
})
