/**
 * Generate a styled QR code matching the presentation's amber/dark theme.
 *
 * Usage:
 *   node scripts/generate-qr.mjs [url]
 *
 * Outputs: public/qr-code.png
 *
 * Swap in the real URL once you have it and re-run.
 */
import { createCanvas } from 'canvas'
import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const url = process.argv[2] || 'https://example.com/rvatech-2026'

// Generate QR matrix
const qrData = QRCode.create(url, { errorCorrectionLevel: 'H' })
const modules = qrData.modules
const moduleCount = modules.size
const data = modules.data

// Dimensions
const dotSize = 14
const margin = 40
const canvasSize = moduleCount * dotSize + margin * 2
const dotRadius = dotSize * 0.42  // rounded dots

// Theme colors
const BG_COLOR = '#12121a'
const DOT_COLOR = '#f59e0b'
const FINDER_COLOR = '#f97316'    // corner squares get the brighter orange

const canvas = createCanvas(canvasSize, canvasSize)
const ctx = canvas.getContext('2d')

// Background
ctx.fillStyle = BG_COLOR
ctx.fillRect(0, 0, canvasSize, canvasSize)

// Subtle rounded border
const borderRadius = 16
ctx.strokeStyle = 'rgba(245, 158, 11, 0.15)'
ctx.lineWidth = 2
roundedRect(ctx, 1, 1, canvasSize - 2, canvasSize - 2, borderRadius)
ctx.stroke()

// Check if a module is part of a finder pattern (the three big corner squares)
function isFinderPattern(row, col) {
  // Top-left
  if (row < 7 && col < 7) return true
  // Top-right
  if (row < 7 && col >= moduleCount - 7) return true
  // Bottom-left
  if (row >= moduleCount - 7 && col < 7) return true
  return false
}

// Check if module is the inner part of finder (3x3 center)
function isFinderInner(row, col) {
  // Top-left inner
  if (row >= 2 && row <= 4 && col >= 2 && col <= 4) return true
  // Top-right inner
  if (row >= 2 && row <= 4 && col >= moduleCount - 5 && col <= moduleCount - 3) return true
  // Bottom-left inner
  if (row >= moduleCount - 5 && row <= moduleCount - 3 && col >= 2 && col <= 4) return true
  return false
}

// Draw rounded rectangle helper
function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// Draw the finder patterns as styled rounded squares
function drawFinderPattern(startRow, startCol) {
  const x = margin + startCol * dotSize
  const y = margin + startRow * dotSize

  // Outer ring (7x7) — rounded rect outline
  ctx.strokeStyle = FINDER_COLOR
  ctx.lineWidth = dotSize * 0.7
  roundedRect(ctx, x + dotSize * 0.5, y + dotSize * 0.5, dotSize * 6, dotSize * 6, dotSize * 1.2)
  ctx.stroke()

  // Inner square (3x3) — filled rounded rect
  ctx.fillStyle = FINDER_COLOR
  roundedRect(ctx, x + dotSize * 2, y + dotSize * 2, dotSize * 3, dotSize * 3, dotSize * 0.6)
  ctx.fill()
}

// Draw finder patterns
drawFinderPattern(0, 0)
drawFinderPattern(0, moduleCount - 7)
drawFinderPattern(moduleCount - 7, 0)

// Draw data dots (skip finder areas)
for (let row = 0; row < moduleCount; row++) {
  for (let col = 0; col < moduleCount; col++) {
    if (isFinderPattern(row, col)) continue

    const idx = row * moduleCount + col
    if (!data[idx]) continue

    const cx = margin + col * dotSize + dotSize / 2
    const cy = margin + row * dotSize + dotSize / 2

    ctx.fillStyle = DOT_COLOR
    ctx.beginPath()
    ctx.arc(cx, cy, dotRadius, 0, Math.PI * 2)
    ctx.fill()
  }
}

// Save
const outPath = path.resolve(__dirname, '..', 'public', 'qr-code.png')
const buffer = canvas.toBuffer('image/png')
fs.writeFileSync(outPath, buffer)

console.log(`QR code saved to ${outPath}`)
console.log(`URL encoded: ${url}`)
console.log(`Size: ${canvasSize}x${canvasSize}px`)
