import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import gsap from 'gsap'

export interface PortalState {
  phase: 0 | 1 | 2 | 3
  arcProgress: number
  sparksActivated: number
  coreNeedsFullCircle: boolean
}

export interface PortalSceneApi {
  init(el: HTMLDivElement, width: number, height: number): void
  resetVisuals(): void
  dispose(): void
  getPortalGroup(): THREE.Group | null
}

export interface PortalSceneOpts {
  ringSize: number
  ground: boolean
  sparks: boolean
  core: boolean
  haze: boolean
  bloom: boolean
}

function createGlowTexture(): THREE.Texture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255, 180, 60, 0.9)')
  gradient.addColorStop(0.2, 'rgba(240, 120, 20, 0.6)')
  gradient.addColorStop(0.5, 'rgba(200, 60, 5, 0.25)')
  gradient.addColorStop(0.8, 'rgba(140, 20, 2, 0.08)')
  gradient.addColorStop(1, 'rgba(80, 5, 0, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

/**
 * All Three.js objects are always created. `opts` flags are checked every frame
 * so they can be toggled at runtime (e.g. from a debug panel).
 */
export function usePortalScene(
  state: PortalState,
  opts: PortalSceneOpts,
): PortalSceneApi {
  let renderer: THREE.WebGLRenderer | null = null
  let composer: EffectComposer | null = null
  let portalGroup: THREE.Group | null = null
  let animationId = 0
  let resetVisualsFn: (() => void) | null = null
  let disposeThreeObjectsFn: (() => void) | null = null

  function init(el: HTMLDivElement, w: number, h: number) {
    if (renderer) return

    const dpr = 2
    const scene = new THREE.Scene()
    const fov = 50
    const aspect = w / h
    const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100)
    const visualDiameter = 3.0
    camera.position.z = visualDiameter * h / (2 * opts.ringSize * Math.tan((fov / 2) * Math.PI / 180))

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: false })
    renderer.setSize(w, h)
    renderer.setPixelRatio(dpr)
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping = THREE.LinearToneMapping
    renderer.toneMappingExposure = 1.0
    el.appendChild(renderer.domElement)

    // Always create bloom composer so it can be toggled at runtime
    const renderTarget = new THREE.WebGLRenderTarget(w * dpr, h * dpr, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      samples: 0,
    })
    composer = new EffectComposer(renderer, renderTarget)
    composer.addPass(new RenderPass(scene, camera))
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(w * dpr, h * dpr),
      0.4,   // strength
      0.4,   // radius
      0.75,  // threshold
    )
    composer.addPass(bloomPass)
    composer.addPass(new OutputPass())

    portalGroup = new THREE.Group()
    scene.add(portalGroup)

    const glowTex = createGlowTexture()
    const RING_SPEED = 14.0
    const RING_RADIUS = 1.15
    const SPARK_COUNT = 2800
    const TRAIL_LEN = 0.18
    const GROUND_Y = -RING_RADIUS - 0.025
    const ARC_START = Math.PI / 2

    // --- Spark emitter (always allocated, visibility controlled by opts.sparks) ---

    const sparkX = new Float32Array(SPARK_COUNT)
    const sparkY = new Float32Array(SPARK_COUNT)
    const sparkVx = new Float32Array(SPARK_COUNT)
    const sparkVy = new Float32Array(SPARK_COUNT)
    const sparkAge = new Float32Array(SPARK_COUNT)
    const sparkMaxAge = new Float32Array(SPARK_COUNT)
    const sparkZ = new Float32Array(SPARK_COUNT)

    function spawnSpark(i: number, t: number) {
      let ringAngle: number
      if (state.phase === 1 || state.phase === 3) {
        ringAngle = ARC_START + Math.random() * state.arcProgress
      } else {
        ringAngle = t * RING_SPEED + Math.random() * Math.PI * 2
      }
      const r = RING_RADIUS + (Math.random() - 0.5) * 0.06
      sparkX[i] = Math.cos(ringAngle) * r
      sparkY[i] = Math.sin(ringAngle) * r
      sparkZ[i] = (Math.random() - 0.5) * 0.08

      const tangentSpeed = RING_SPEED * r
      const tx = -Math.sin(ringAngle)
      const ty = Math.cos(ringAngle)
      const rx = Math.cos(ringAngle)
      const ry = Math.sin(ringAngle)
      const radialKick = 0.1 + Math.random() * 0.3
      const jitter = (Math.random() - 0.5) * 0.2
      sparkVx[i] = tx * tangentSpeed * (0.15 + Math.random() * 0.15) + rx * radialKick + jitter
      sparkVy[i] = ty * tangentSpeed * (0.15 + Math.random() * 0.15) + ry * radialKick + jitter

      sparkAge[i] = 0
      sparkMaxAge[i] = 0.12 + Math.random() * 0.35
    }

    function killAllSparks() {
      for (let i = 0; i < SPARK_COUNT; i++) {
        sparkAge[i] = 999
        sparkMaxAge[i] = 1
      }
    }

    killAllSparks()

    // Trail line segments
    const trailPositions = new Float32Array(SPARK_COUNT * 2 * 3)
    const trailColors = new Float32Array(SPARK_COUNT * 2 * 3)
    const trailGeo = new THREE.BufferGeometry()
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3))
    trailGeo.setAttribute('color', new THREE.BufferAttribute(trailColors, 3))
    const trailMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const trailMesh = new THREE.LineSegments(trailGeo, trailMat)
    trailMesh.frustumCulled = false
    portalGroup.add(trailMesh)

    // Ember heads
    const emberPositions = new Float32Array(SPARK_COUNT * 3)
    const emberGeo = new THREE.BufferGeometry()
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3))
    const emberMat = new THREE.PointsMaterial({
      map: glowTex,
      color: 0xee8811,
      size: 0.045,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const emberMesh = new THREE.Points(emberGeo, emberMat)
    emberMesh.frustumCulled = false
    portalGroup.add(emberMesh)

    // --- Core glow band (always allocated, visibility controlled by opts.core) ---

    const coreCount = 800
    const corePositions = new Float32Array(coreCount * 3)
    for (let i = 0; i < coreCount; i++) {
      corePositions[i * 3 + 2] = -999
    }
    const coreGeo = new THREE.BufferGeometry()
    coreGeo.setAttribute('position', new THREE.BufferAttribute(corePositions, 3))
    const coreMat = new THREE.PointsMaterial({
      map: glowTex, color: 0xee8811, size: 0.06,
      transparent: true, opacity: 0.7,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
    const coreParticles = new THREE.Points(coreGeo, coreMat)
    coreParticles.frustumCulled = false
    portalGroup.add(coreParticles)

    let lastTime = performance.now() * 0.001

    // --- Subtle red haze behind the portal ring (always allocated, visibility controlled by opts.haze) ---

    const hazeSize = 256
    const hazeCanvas = document.createElement('canvas')
    hazeCanvas.width = hazeSize
    hazeCanvas.height = hazeSize
    const hazeCtx = hazeCanvas.getContext('2d')!
    const hazeCx = hazeSize / 2
    const hazeGrad = hazeCtx.createRadialGradient(hazeCx, hazeCx, 0, hazeCx, hazeCx, hazeCx)
    hazeGrad.addColorStop(0, 'rgba(0, 0, 0, 0)')
    hazeGrad.addColorStop(0.35, 'rgba(60, 8, 0, 0)')
    hazeGrad.addColorStop(0.52, 'rgba(120, 25, 2, 0.2)')
    hazeGrad.addColorStop(0.65, 'rgba(80, 12, 0, 0.12)')
    hazeGrad.addColorStop(0.85, 'rgba(40, 5, 0, 0.04)')
    hazeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
    hazeCtx.fillStyle = hazeGrad
    hazeCtx.fillRect(0, 0, hazeSize, hazeSize)
    const hazeTex = new THREE.CanvasTexture(hazeCanvas)
    const hazeMat = new THREE.SpriteMaterial({
      map: hazeTex,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const hazeSprite = new THREE.Sprite(hazeMat)
    hazeSprite.scale.set(4.0, 4.0, 1)
    hazeSprite.position.z = -0.1
    hazeSprite.visible = false
    portalGroup.add(hazeSprite)

    let hazeFadedIn = false

    // --- Reset callback ---
    resetVisualsFn = () => {
      killAllSparks()
      gsap.killTweensOf(hazeMat)
      hazeSprite.visible = false
      hazeMat.opacity = 1.0
      hazeFadedIn = false
      const cPos = coreGeo.attributes.position.array as Float32Array
      for (let i = 0; i < coreCount; i++) {
        cPos[i * 3] = 0
        cPos[i * 3 + 1] = 0
        cPos[i * 3 + 2] = -999
      }
      coreGeo.attributes.position.needsUpdate = true
      coreParticles.rotation.z = 0
    }

    // --- Disposal callback ---
    disposeThreeObjectsFn = () => {
      trailGeo.dispose()
      trailMat.dispose()
      emberGeo.dispose()
      emberMat.dispose()
      coreGeo.dispose()
      coreMat.dispose()
      glowTex.dispose()
      hazeTex.dispose()
      hazeMat.dispose()
      renderTarget.dispose()
    }

    function animate() {
      const t = performance.now() * 0.001
      const dt = Math.min(t - lastTime, 0.05)
      lastTime = t

      // Core glow: phase-aware positioning
      coreParticles.visible = opts.core
      if (opts.core) {
        const cPos = coreGeo.attributes.position.array as Float32Array
        if (state.phase === 0) {
          // No-op — core particles stay off-screen from reset
        } else if (state.phase === 1 || state.phase === 3) {
          coreParticles.rotation.z = 0
          for (let i = 0; i < coreCount; i++) {
            if (state.arcProgress < 0.01) {
              cPos[i * 3 + 2] = -999
            } else {
              const angle = ARC_START + Math.random() * state.arcProgress
              const r = RING_RADIUS + (Math.random() - 0.5) * 0.06
              cPos[i * 3] = Math.cos(angle) * r
              cPos[i * 3 + 1] = Math.sin(angle) * r
              cPos[i * 3 + 2] = (Math.random() - 0.5) * 0.05
            }
          }
          coreGeo.attributes.position.needsUpdate = true
        } else {
          if (state.coreNeedsFullCircle) {
            state.coreNeedsFullCircle = false
            for (let i = 0; i < coreCount; i++) {
              const angle = Math.random() * Math.PI * 2
              const r = RING_RADIUS + (Math.random() - 0.5) * 0.06
              cPos[i * 3] = Math.cos(angle) * r
              cPos[i * 3 + 1] = Math.sin(angle) * r
              cPos[i * 3 + 2] = (Math.random() - 0.5) * 0.05
            }
            coreGeo.attributes.position.needsUpdate = true
          }
          coreParticles.rotation.z = t * RING_SPEED
        }
      }

      // Haze: fade in when arc > PI during creation, fade out when arc < PI during reverse
      if (opts.haze) {
        if ((state.phase === 1 || state.phase === 3) && state.arcProgress > Math.PI && !hazeFadedIn) {
          hazeSprite.visible = true
          hazeMat.opacity = 0
          gsap.killTweensOf(hazeMat)
          gsap.to(hazeMat, { opacity: 1.0, duration: 1.0, ease: 'power2.out' })
          hazeFadedIn = true
        }
        if (state.phase === 3 && state.arcProgress <= Math.PI && hazeFadedIn) {
          gsap.killTweensOf(hazeMat)
          gsap.to(hazeMat, { opacity: 0, duration: 0.6, ease: 'power2.in', onComplete: () => { hazeSprite.visible = false } })
          hazeFadedIn = false
        }
      } else {
        if (hazeSprite.visible) {
          gsap.killTweensOf(hazeMat)
          hazeSprite.visible = false
        }
      }

      // Spark visibility
      trailMesh.visible = opts.sparks
      emberMesh.visible = opts.sparks

      if (opts.sparks) {
        // Gradually adjust sparksActivated proportional to arc progress
        if (state.phase === 1 || state.phase === 3) {
          state.sparksActivated = Math.floor((state.arcProgress / (Math.PI * 2)) * SPARK_COUNT)
        }

        const tPos = trailGeo.attributes.position.array as Float32Array
        const tCol = trailGeo.attributes.color.array as Float32Array
        const ePos = emberGeo.attributes.position.array as Float32Array

        for (let i = 0; i < SPARK_COUNT; i++) {
          sparkAge[i] += dt

          if (sparkAge[i] >= sparkMaxAge[i]) {
            if (state.phase >= 1 && i < state.sparksActivated) {
              spawnSpark(i, t)
            } else {
              ePos[i * 3] = 0
              ePos[i * 3 + 1] = 0
              ePos[i * 3 + 2] = -999
              tPos[i * 6] = 0; tPos[i * 6 + 1] = 0; tPos[i * 6 + 2] = -999
              tPos[i * 6 + 3] = 0; tPos[i * 6 + 4] = 0; tPos[i * 6 + 5] = -999
              tCol[i * 6] = 0; tCol[i * 6 + 1] = 0; tCol[i * 6 + 2] = 0
              tCol[i * 6 + 3] = 0; tCol[i * 6 + 4] = 0; tCol[i * 6 + 5] = 0
              continue
            }
          }

          if (opts.ground) sparkVy[i] -= 0.8 * dt

          sparkX[i] += sparkVx[i] * dt
          sparkY[i] += sparkVy[i] * dt

          sparkVx[i] *= (1 - 3.0 * dt)
          sparkVy[i] *= (1 - 3.0 * dt)

          if (opts.ground && sparkY[i] < GROUND_Y) {
            sparkY[i] = GROUND_Y
            sparkVy[i] = 0
            sparkVx[i] *= 0.85
          }

          const life = sparkAge[i] / sparkMaxAge[i]

          const hx = sparkX[i]
          const hy = sparkY[i]
          const hz = sparkZ[i]
          const trailScale = Math.max(0, 1 - life * life)
          const rawTailX = hx - sparkVx[i] * TRAIL_LEN * trailScale
          const rawTailY = hy - sparkVy[i] * TRAIL_LEN * trailScale
          const rawTailDist = Math.sqrt(rawTailX * rawTailX + rawTailY * rawTailY)
          const tailX = rawTailDist > 0 ? (rawTailX / rawTailDist) * RING_RADIUS : rawTailX
          const tailY = rawTailDist > 0 ? (rawTailY / rawTailDist) * RING_RADIUS : rawTailY

          const headX = tailX + (hx - tailX) * trailScale
          const headY = tailY + (hy - tailY) * trailScale
          tPos[i * 6] = headX
          tPos[i * 6 + 1] = headY
          tPos[i * 6 + 2] = hz
          tPos[i * 6 + 3] = tailX
          tPos[i * 6 + 4] = tailY
          tPos[i * 6 + 5] = hz

          const dist = Math.sqrt(hx * hx + hy * hy)
          const distFromRing = Math.max(0, dist - RING_RADIUS)
          const rs = Math.min(1, distFromRing * 7.0)
          const fade = Math.max(0, 1 - life * life)

          tCol[i * 6]     = (0.6 - rs * 0.15) * fade
          tCol[i * 6 + 1] = (0.25 - rs * 0.22) * fade
          tCol[i * 6 + 2] = (0.02 - rs * 0.02) * fade
          const trs = Math.min(1, rs + 0.4)
          const tailFade = fade * 0.6
          tCol[i * 6 + 3] = (0.5 - trs * 0.15) * tailFade
          tCol[i * 6 + 4] = (0.1 - trs * 0.09) * tailFade
          tCol[i * 6 + 5] = 0.0

          if (fade > 0.05) {
            ePos[i * 3] = hx
            ePos[i * 3 + 1] = hy
            ePos[i * 3 + 2] = hz
          } else {
            ePos[i * 3] = 0
            ePos[i * 3 + 1] = 0
            ePos[i * 3 + 2] = -999
          }
        }

        trailGeo.attributes.position.needsUpdate = true
        trailGeo.attributes.color.needsUpdate = true
        emberGeo.attributes.position.needsUpdate = true
      }

      if (opts.bloom) {
        composer!.render()
      } else {
        renderer!.render(scene, camera)
      }
      animationId = requestAnimationFrame(animate)
    }

    animate()
  }

  function resetVisuals() {
    resetVisualsFn?.()
  }

  function dispose() {
    if (animationId) cancelAnimationFrame(animationId)
    animationId = 0
    disposeThreeObjectsFn?.()
    disposeThreeObjectsFn = null
    resetVisualsFn = null
    if (composer) {
      composer.dispose()
      composer = null
    }
    if (renderer) {
      renderer.dispose()
      renderer.domElement.remove()
      renderer = null
    }
    portalGroup = null
  }

  function getPortalGroup(): THREE.Group | null {
    return portalGroup
  }

  return { init, resetVisuals, dispose, getPortalGroup }
}
