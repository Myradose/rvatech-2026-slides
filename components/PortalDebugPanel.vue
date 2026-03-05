<script setup lang="ts">
import { ref } from 'vue'
import type { PortalSceneOpts } from '../composables/usePortalScene'

const props = defineProps<{
  status: string
  opts: PortalSceneOpts
}>()

const rootRef = ref<HTMLDivElement>()
const barRef = ref<HTMLDivElement>()

function setProgress(p: number) {
  if (barRef.value) barRef.value.style.width = `${p * 100}%`
}

function containsElement(el: Node): boolean {
  return rootRef.value?.contains(el) ?? false
}

defineExpose({ setProgress, containsElement })

const FEATURE_TOGGLES: { key: keyof PortalSceneOpts; label: string }[] = [
  { key: 'sparks', label: 'Sparks' },
  { key: 'core', label: 'Core' },
  { key: 'haze', label: 'Haze' },
  { key: 'bloom', label: 'Bloom' },
  { key: 'ground', label: 'Ground' },
]

const SLIDER_CONTROLS: { key: keyof PortalSceneOpts; label: string; min: number; max: number; step: number }[] = [
  { key: 'ringSpeed', label: 'Speed', min: 1, max: 30, step: 0.5 },
  { key: 'trailLen', label: 'Trail', min: 0.01, max: 0.5, step: 0.01 },
  { key: 'bloomStrength', label: 'Bloom str', min: 0, max: 2, step: 0.05 },
  { key: 'bloomRadius', label: 'Bloom rad', min: 0, max: 2, step: 0.05 },
  { key: 'bloomThreshold', label: 'Bloom thr', min: 0, max: 1, step: 0.05 },
  { key: 'coreSize', label: 'Core size', min: 0.01, max: 0.2, step: 0.005 },
  { key: 'emberSize', label: 'Ember size', min: 0.01, max: 0.15, step: 0.005 },
  { key: 'hazeIntensity', label: 'Haze int', min: 0, max: 3, step: 0.1 },
  { key: 'groundY', label: 'Gnd pos', min: -2.5, max: -0.5, step: 0.025 },
  { key: 'groundDim', label: 'Gnd dim', min: 0, max: 1, step: 0.05 },
]

const DEFAULTS: Partial<PortalSceneOpts> = {
  ground: true, sparks: true, core: true, haze: true, bloom: true,
  ringSpeed: 13.5, trailLen: 0.16,
  bloomStrength: 0.4, bloomRadius: 0.4, bloomThreshold: 0.25,
  coreSize: 0.12, emberSize: 0.06, hazeIntensity: 1.3,
  groundY: -1.18, groundDim: 0.35,
}

function resetOpts() {
  Object.assign(props.opts, DEFAULTS)
}
</script>

<template>
  <div ref="rootRef" class="portal-debug">
    <div class="portal-debug-title">Portal Debug</div>
    <div class="portal-debug-phase">{{ status }}</div>
    <div class="portal-debug-bar-track">
      <div ref="barRef" class="portal-debug-bar-fill" />
    </div>
    <label v-for="toggle in FEATURE_TOGGLES" :key="toggle.key" class="portal-debug-toggle">
      <input
        type="checkbox"
        :checked="opts[toggle.key] as boolean"
        @change="(opts[toggle.key] as any) = ($event.target as HTMLInputElement).checked"
      />
      {{ toggle.label }}
    </label>
    <div class="portal-debug-divider" />
    <label v-for="slider in SLIDER_CONTROLS" :key="slider.key" class="portal-debug-slider">
      <span class="portal-debug-slider-label">{{ slider.label }}</span>
      <input
        type="range"
        :min="slider.min"
        :max="slider.max"
        :step="slider.step"
        :value="opts[slider.key]"
        @input="(opts[slider.key] as any) = parseFloat(($event.target as HTMLInputElement).value)"
      />
      <span class="portal-debug-slider-value">{{ (opts[slider.key] as number).toFixed(2) }}</span>
    </label>
    <button class="portal-debug-reset" @click="resetOpts">Reset</button>
  </div>
</template>

<style scoped>
.portal-debug {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 100;
  width: 195px;
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(255, 140, 40, 0.4);
  border-radius: 8px;
  padding: 10px 14px;
  font-family: monospace;
  font-size: 13px;
  color: #eee;
  pointer-events: auto;
  user-select: none;
}

.portal-debug-phase {
  margin-bottom: 4px;
  color: rgba(255, 200, 100, 0.9);
}

.portal-debug-bar-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin-bottom: 8px;
  overflow: hidden;
}

.portal-debug-bar-fill {
  height: 100%;
  background: rgba(255, 140, 40, 0.8);
  border-radius: 2px;
}

.portal-debug-title {
  font-weight: bold;
  color: rgba(255, 140, 40, 0.9);
  margin-bottom: 6px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.portal-debug-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 0;
  cursor: pointer;
}

.portal-debug-toggle input {
  accent-color: #ee8811;
  cursor: pointer;
}

.portal-debug-divider {
  height: 1px;
  background: rgba(255, 140, 40, 0.2);
  margin: 6px 0;
}

.portal-debug-slider {
  display: grid;
  grid-template-columns: 66px 1fr 36px;
  align-items: center;
  gap: 4px;
  padding: 1px 0;
  font-size: 11px;
}

.portal-debug-slider-label {
  color: #ccc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.portal-debug-slider input[type="range"] {
  width: 100%;
  height: 4px;
  appearance: none;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.portal-debug-slider input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ee8811;
  cursor: pointer;
}

.portal-debug-slider input[type="range"]::-moz-range-thumb {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ee8811;
  border: none;
  cursor: pointer;
}

.portal-debug-slider-value {
  color: rgba(255, 200, 100, 0.8);
  text-align: right;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}

.portal-debug-reset {
  margin-top: 6px;
  width: 100%;
  padding: 3px 0;
  background: rgba(255, 140, 40, 0.15);
  border: 1px solid rgba(255, 140, 40, 0.35);
  border-radius: 4px;
  color: rgba(255, 200, 100, 0.9);
  font-family: monospace;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.15s;
}

.portal-debug-reset:hover {
  background: rgba(255, 140, 40, 0.3);
}
</style>
