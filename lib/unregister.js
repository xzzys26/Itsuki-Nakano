import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createCanvas, loadImage } from '@napi-rs/canvas'
import fetch from 'node-fetch'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function ensureDir(p) { try { fs.mkdirSync(p, { recursive: true }) } catch {} }

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

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const pickMany = (arr, n) => {
  const a = [...arr]
  const out = []
  n = Math.min(n, a.length)
  while (out.length < n) {
    const idx = Math.floor(Math.random() * a.length)
    out.push(a.splice(idx, 1)[0])
  }
  return out
}
const BG_IMAGES = [
  'https://iili.io/KIShsKx.md.jpg',
  'https://iili.io/KIShLcQ.md.jpg',
  'https://iili.io/KISwzI1.md.jpg',
  'https://iili.io/KIShPPj.md.jpg',
  'https://iili.io/KISwREJ.md.jpg',
  'https://iili.io/KISw5rv.md.jpg',
  'https://iili.io/KISwY2R.md.jpg',
  'https://iili.io/KISwa7p.md.jpg',
  'https://iili.io/KISwlpI.md.jpg',
  'https://iili.io/KISw1It.md.jpg',
  'https://iili.io/KISwEhX.md.jpg',
  'https://iili.io/KISwGQn.md.jpg',
  'https://iili.io/KISwVBs.md.jpg',
  'https://iili.io/KISwWEG.md.jpg',
  'https://iili.io/KISwX4f.md.jpg'
]

export async function makeUnregisterCard({ title = 'REGISTRO ELIMINADO', userTag = '@usuario', reason = 'El usuario ha sido dado de baja.', avatarUrl = '', bgUrl = '' }) {
  const DEFAULT_REASONS = [
    'Porque es Gay',
    'Porque Es un Pendejo',
    'Porque es un nino rata',
    'Porque ya no tiene cerebro',
    'Porque quiere volver con su ex',
    'Porque no le gusta el ambiente del bot ',
    'Porque fue un registro brutal'
  ]
  const width = 920, height = 360
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  const grad = ctx.createLinearGradient(0, 0, width, height)
  grad.addColorStop(0, '#b91c1c')
  grad.addColorStop(1, '#ef4444')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)

  try {
    const bg = await loadImageSmart(bgUrl || pick(BG_IMAGES))
    if (bg) {
      const pad = 10
      ctx.globalAlpha = 0.85
      ctx.drawImage(bg, pad, pad, width - pad * 2, height - pad * 2)
      ctx.globalAlpha = 1
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.fillRect(pad, pad, width - pad * 2, height - pad * 2)
    }
  } catch {}

  const panelX = 24, panelY = 24, panelW = width - 48, panelH = height - 48
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = 'rgba(0,0,0,0.22)'
  ctx.shadowBlur = 14
  ctx.shadowOffsetY = 3
  const r = 22
  ctx.beginPath()
  ctx.moveTo(panelX + r, panelY)
  ctx.arcTo(panelX + panelW, panelY, panelX + panelW, panelY + panelH, r)
  ctx.arcTo(panelX + panelW, panelY + panelH, panelX, panelY + panelH, r)
  ctx.arcTo(panelX, panelY + panelH, panelX, panelY, r)
  ctx.arcTo(panelX, panelY, panelX + panelW, panelY, r)
  ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0

  ctx.fillStyle = '#dc2626'
  const headerH = 72
  ctx.beginPath()
  ctx.moveTo(panelX + r, panelY)
  ctx.arcTo(panelX + panelW, panelY, panelX + panelW, panelY + headerH, r)
  ctx.lineTo(panelX + panelW, panelY + headerH)
  ctx.lineTo(panelX, panelY + headerH)
  ctx.arcTo(panelX, panelY, panelX + r, panelY, r)
  ctx.closePath(); ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 34px Sans'
  ctx.textAlign = 'center'
  ctx.fillText(String(title).toUpperCase(), panelX + panelW / 2, panelY + 48)

  ctx.textAlign = 'left'
  ctx.fillStyle = '#111827'
  ctx.font = 'bold 26px Sans'
  const leftPad = panelX + 22
  let y = panelY + headerH + 48
  const date = new Date()
  const fecha = date.toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: '2-digit' })
  const hora = date.toLocaleTimeString('es-PE', { hour12: false })

  const head = [
    `Usuario: ${userTag}`,
    `Estado: Registro eliminado`
  ]
  for (const line of head) { ctx.fillText(line, leftPad, y); y += 36 }

  // Motivo automático seleccionado por el bot (uno por usuario)
  const selectedReason = pick(DEFAULT_REASONS)
  const maxW = panelW - 44
  if (selectedReason) {
    const label = 'Motivo: '
    const words = selectedReason.split(/\s+/)
    let line = label
    ctx.font = 'bold 24px Sans'
    for (const w of words) {
      const test = line + (line === label ? '' : ' ') + w
      if (ctx.measureText(test).width <= maxW) line = test
      else { ctx.fillText(line, leftPad, y); y += 30; line = '  ' + w }
    }
    if (line.trim()) { ctx.fillText(line, leftPad, y); y += 30 }
    ctx.font = 'bold 26px Sans'
  }
  y += 6
  for (const tail of [`Fecha: ${fecha}`, `Hora: ${hora}`]) { ctx.fillText(tail, leftPad, y); y += 36 }

  const avSize = 120
  const avX = panelX + panelW - avSize - 22
  const avY = panelY + headerH + 18
  try {
    const av = await loadImageSmart(avatarUrl)
    ctx.save()
    const rr = 16
    ctx.beginPath()
    ctx.moveTo(avX + rr, avY)
    ctx.arcTo(avX + avSize, avY, avX + avSize, avY + avSize, rr)
    ctx.arcTo(avX + avSize, avY + avSize, avX, avY + avSize, rr)
    ctx.arcTo(avX, avY + avSize, avX, avY, rr)
    ctx.arcTo(avX, avY, avX + avSize, avY, rr)
    ctx.closePath(); ctx.clip()
    if (av) ctx.drawImage(av, avX, avY, avSize, avSize)
    else { ctx.fillStyle = '#f3f4f6'; ctx.fillRect(avX, avY, avSize, avSize) }
    ctx.restore()
    ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 10
    ctx.beginPath()
    ctx.moveTo(avX, avY + avSize)
    ctx.lineTo(avX + avSize, avY)
    ctx.stroke()
  } catch {}

  return canvas.toBuffer('image/png')
}

export async function sendUnregisterCard(conn, jid, { participant, userName = 'Usuario', title = 'Registro eliminado', bgUrl = '' }) {
  const tmp = path.join(__dirname, '../temp')
  ensureDir(tmp)
  const num = String(participant || '').split('@')[0].split(':')[0].replace(/[^0-9]/g, '')
  let avatarUrl = ''
  try { if (participant) avatarUrl = await conn.profilePictureUrl(participant, 'image') } catch {}
  if (!avatarUrl) avatarUrl = 'https://files.catbox.moe/xr2m6u.jpg'
  const userTag = participant ? `@${num}` : (userName ? `@${userName}` : '@usuario')
  const buf = await makeUnregisterCard({ userTag, avatarUrl, bgUrl })
  const file = path.join(tmp, `unreg-${Date.now()}.png`)
  fs.writeFileSync(file, buf)
  const mentionId = participant ? [participant] : []
  const handle = participant ? `@${String(participant).split('@')[0]}` : (userName || userTag)
  await conn.sendMessage(jid, { image: { url: file }, caption: `${title} ${handle}`, mentions: mentionId })
  return file
}

export default { makeUnregisterCard, sendUnregisterCard }
