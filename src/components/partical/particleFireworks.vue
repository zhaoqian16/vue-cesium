<template>
  <div class="map">
    <Map></Map>
  </div>
</template>

<script>
import 'cesium/Source/Widgets/widgets.css'
import CesiumNavigation from 'cesium-navigation-es6'
import { ParticleSystem } from 'cesium'
import Map from '../map.vue'

let Cesium = require('cesium/Source/Cesium')

export default {
  data () {
    return {

    }
  },
  components: {
    Map
  },
  mounted () {
    this.addPartical()
  },
  methods: {
    addPartical () {
      const viewer = this.$children[0].viewer
      // 添加运动的点实体
      const start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16))
      const stop = Cesium.JulianDate.addSeconds(start, 120, new Cesium.JulianDate())

      viewer.clock.startTime = start.clone()
      viewer.clock.stopTime = stop.clone()
      viewer.clock.currentTime = start.clone()
      viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP
      viewer.clock.multiplier = 1
      viewer.clock.shouldAnimate = true

      const pos1 = Cesium.Cartesian3.fromDegrees(-75.15787310614596, 39.97862668312678)
      const pos2 = Cesium.Cartesian3.fromDegrees(-75.1633691390455, 39.95355089912078)
      let positionProperty = new Cesium.SampledPositionProperty()
      positionProperty.addSample(start, pos1)
      positionProperty.addSample(stop, pos2)

      let entity = viewer.entities.add({
        availability: new Cesium.TimeIntervalCollection([
          new Cesium.TimeInterval({start: start, stop: stop})
        ]),
        position: positionProperty,
        model: {
          uri: '/static/3dModel/CesiumMilkTruck.glb',
          minimumPixelSize: 64
        },
        viewFrom: new Cesium.Cartesian3(-100, 0, 100.0),
        orientation: new Cesium.VelocityOrientationProperty(positionProperty)
      })
      viewer.trackedEntity = entity

      viewer.timeline.zoomTo(start, stop)
      let particleSystem = viewer.scene.primitives.add(new Cesium.ParticleSystem({
        image: '../../static/images/smoke.png',

        startColor: Cesium.Color.RED.withAlpha(0.8),
        endColor: Cesium.Color.WHITE.withAlpha(0),

        startScale: 1.0,
        endScale: 5.0,

        minimumParticleLife: 1.2,
        maximumParticleLife: 1.2,

        minimumSpeed: 1.0,
        maximumSpeed: 5.0,

        imageSize: new Cesium.Cartesian2(25, 25),

        // bursts: [
        //   new Cesium.ParticleBurst({time: 5.0, minimum: 10, maximum: 100}),
        //   new Cesium.ParticleBurst({time: 10.0, minimum: 50, maximum: 100}),
        //   new Cesium.ParticleBurst({time: 15.0, minimum: 200, maximum: 300})
        // ],
        lifetime: 16.0,
        emissionRate: 5,
        emitter: new Cesium.CircleEmitter(2.0),
        emitterModelMatrix: this.computeEmitterModelMatrix(),
        updateCallback: (particle, dt) => {
          let position = particle.position
          let gravityVector = Cesium.Cartesian3.normalize(position, new Cesium.Cartesian3())
          Cesium.Cartesian3.multiplyByScalar(gravityVector, 0 * dt, gravityVector)
          particle.velocity = Cesium.Cartesian3.add(particle.velocity, gravityVector, particle.velocity)
        }

      }))

      viewer.scene.preUpdate.addEventListener((scene, time) => {
        particleSystem.modelMatrix = entity.computeModelMatrix(time, new Cesium.Matrix4())
        particleSystem.emitterModelMatrix = this.computeEmitterModelMatrix()
      })
    },
    computeEmitterModelMatrix () {
      let hpr = Cesium.HeadingPitchRoll.fromDegrees(0.0, 0.0, 0.0, new Cesium.HeadingPitchRoll())
      let trs = new Cesium.TranslationRotationScale({
        translation: new Cesium.Cartesian3(-4.0, 0.0, 1.4),
        rotation: Cesium.Quaternion.fromHeadingPitchRoll(hpr, new Cesium.Quaternion())
      })
      return Cesium.Matrix4.fromTranslationRotationScale(
        trs,
        new Cesium.Matrix4()
      )
    }
  }
}
</script>

