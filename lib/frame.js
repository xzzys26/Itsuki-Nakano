import { createCanvas, loadImage } from '@napi-rs/canvas'
import fetch from 'node-fetch'

export const FRAME_CATEGORIES = {
  normal: 'Normal',
  legendary: 'Legendario',
  mythic: 'Mítico'
}

// Define initial frames. Update the url fields with your hosted images.
export const FRAMES = [
  { id: 'none', name: 'Sin marco', cat: 'normal', url: '', size: 256 },
  // Mythic starters (add the URLs of the 4 images you shared)
  { id: 'mythic_skull', name: 'Cristal del Bosque', cat: 'mythic', url: 'https://raw.githubusercontent.com/WillZek/Storage-CB2/main/images/2381567a3147.jpg', size: 256 },
  { id: 'mythic_nature', name: 'Calavera oscura', cat: 'mythic', url: 'https://raw.githubusercontent.com/WillZek/Storage-CB2/main/images/dfe330666f4b.jpg', size: 256 },
  { id: 'mythic_angel', name: 'Ángel Dorado', cat: 'mythic', url: 'https://raw.githubusercontent.com/WillZek/Storage-CB2/main/images/434a565bab8e.jpg', size: 256 },
  { id: 'mythic_dragon', name: 'Dragón Arcano', cat: 'mythic', url: 'https://raw.githubusercontent.com/WillZek/Storage-CB2/main/images/a9b78f4b0364.jpg', size: 256 }
]

export function getFrameById(id) { return FRAMES.find(f => f.id === id) || FRAMES[0] }
export function listFramesByCategory() {
  const map = { normal: [], legendary: [], mythic: [] }
  for (const f of FRAMES) { if (map[f.cat]) map[f.cat].push(f) }
  return map
}

export function ensureUserFrames(user) {
  if (!user.frames || typeof user.frames !== 'object') user.frames = { owned: [], selected: 'none' }
  if (!Array.isArray(user.frames.owned)) user.frames.owned = []
  if (!user.frames.owned.includes('none')) user.frames.owned.push('none')
  if (!user.frames.selected || !getFrameById(user.frames.selected)) user.frames.selected = 'none'
  return user.frames
}

async function loadImageSmart(src) {
  if (!src) return null
  try {
    if (/^https?:\/\//i.test(src)) {
      const res = await fetch(src)
      if (!res.ok) throw new Error('fetch fail')
      const buf = Buffer.from(await res.arrayBuffer())
      return await loadImage(buf)
    }
    return await loadImage(src)
  } catch { return null }
}

function drawRoundedImage(ctx, img, x, y, w, h, r = 20) {
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(img, x, y, w, h)
  ctx.restore()
}

export async function makeProfileCard({
  userTag = '@usuario',
  name = 'Usuario',
  avatarUrl = '',
  level = 0,
  exp = 0,
  coin = 0,
  frameId = 'none'
}) {
  const width = 920, height = 360
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, width, height)
  grad.addColorStop(0, '#0f172a')
  grad.addColorStop(1, '#1e293b')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)

  // Panel
  const panelX = 24, panelY = 24, panelW = width - 48, panelH = height - 48
  const r = 22
  ctx.fillStyle = '#0b1220'
  ctx.globalAlpha = 0.85
  ctx.beginPath()
  ctx.moveTo(panelX + r, panelY)
  ctx.arcTo(panelX + panelW, panelY, panelX + panelW, panelY + panelH, r)
  ctx.arcTo(panelX + panelW, panelY + panelH, panelX, panelY + panelH, r)
  ctx.arcTo(panelX, panelY + panelH, panelX, panelY, r)
  ctx.arcTo(panelX, panelY, panelX + panelW, panelY, r)
  ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1

  // Left avatar block
  const avSize = 256
  const avX = panelX + 28
  const avY = panelY + (panelH - avSize) / 2
  try {
    const av = await loadImageSmart(avatarUrl)
    if (av) drawRoundedImage(ctx, av, avX, avY, avSize, avSize, 30)
    else { ctx.fillStyle = '#0f172a'; drawRoundedImage(ctx, { width: 1, height: 1 }, avX, avY, avSize, avSize, 30) }
  } catch {}

  // Frame overlay
  const frame = getFrameById(frameId)
  const catName = FRAME_CATEGORIES[frame.cat] || 'Normal'
  if (frame.url) {
    try {
      const overlay = await loadImageSmart(frame.url)
      if (overlay) ctx.drawImage(overlay, avX - 8, avY - 8, avSize + 16, avSize + 16)
    } catch {}
  } else {
    // Draw simple ornamental border if no overlay image
    ctx.save()
    ctx.lineWidth = 10
    ctx.strokeStyle = frame.cat === 'mythic' ? '#38bdf8' : frame.cat === 'legendary' ? '#f59e0b' : '#94a3b8'
    ctx.beginPath()
    const rr = 32
    ctx.moveTo(avX + rr, avY)
    ctx.arcTo(avX + avSize, avY, avX + avSize, avY + avSize, rr)
    ctx.arcTo(avX + avSize, avY + avSize, avX, avY + avSize, rr)
    ctx.arcTo(avX, avY + avSize, avX, avY, rr)
    ctx.arcTo(avX, avY, avX + avSize, avY, rr)
    ctx.closePath(); ctx.stroke(); ctx.restore()
  }

  // Right info block
  const infoX = avX + avSize + 40
  let y = panelY + 70
  ctx.fillStyle = '#e5e7eb'
  ctx.font = 'bold 36px Sans'
  ctx.fillText('Perfil de Usuario', infoX, y)
  y += 40
  ctx.font = 'bold 28px Sans'
  ctx.fillText(`${name} (${userTag})`, infoX, y)
  y += 34
  ctx.font = '24px Sans'
  ctx.fillStyle = '#cbd5e1'
  ctx.fillText(`Nivel: ${level}`, infoX, y); y += 30
  ctx.fillText(`Exp: ${exp}`, infoX, y); y += 30
  ctx.fillText(`Monedas: ${coin}`, infoX, y); y += 30
  ctx.fillText(`Marco: ${frame.name} • ${catName}`, infoX, y); y += 30

  return canvas.toBuffer('image/png')
}
