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

// Fondo aleatorio para tarjetas de registro
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
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

function clampText(ctx, text, maxWidth) {
  const words = String(text || '').split(/\s+/)
  const lines = []
  let line = ''
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    const { width } = ctx.measureText(test)
    if (width <= maxWidth) line = test
    else { if (line) lines.push(line); line = w }
  }
  if (line) lines.push(line)
  return lines.slice(0, 3)
}

export function buildUserRecord(base = {}, extra = {}) {
  const now = new Date()
  const newSn = 'SN-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000)
  // Importante: no sobrescribir con base al final; priorizar datos nuevos
  return {
    ...base,
    registered: true,
    name: (extra.name ?? base.name ?? 'Usuario'),
    age: (extra.age ?? base.age ?? 18),
    bio: (extra.bio ?? base.bio ?? 'Sin bio'),
    sn: (base.sn ?? newSn),
    regDate: (base.regDate ?? now.toISOString()),
    tokens: (base.tokens ?? 20),
    coin: (base.coin ?? 40),
    exp: (base.exp ?? 300),
    bank: (base.bank ?? 0),
    level: (base.level ?? 0),
    premium: (base.premium ?? false),
  }
}

export async function makeRegisterCard({ title = 'Registro', avatarUrl = '', userTag = '@usuario', info = {}, bgUrl = '' }) {
  const width = 920, height = 420
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  const grad = ctx.createLinearGradient(0, 0, width, height)
  grad.addColorStop(0, '#5b21b6')
  grad.addColorStop(1, '#7c3aed')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)

  // Fondo con imagen si está disponible
  try {
    const bg = await loadImageSmart(bgUrl || pick(BG_IMAGES))
    if (bg) {
      const pad = 10
      ctx.globalAlpha = 0.9
      ctx.drawImage(bg, pad, pad, width - pad * 2, height - pad * 2)
      ctx.globalAlpha = 1
      ctx.fillStyle = 'rgba(0,0,0,0.28)'
      ctx.fillRect(pad, pad, width - pad * 2, height - pad * 2)
    }
  } catch {}

  const radius = 26
  ctx.fillStyle = 'rgba(255,255,255,0.14)'
  ctx.beginPath()
  ctx.moveTo(radius, 8)
  ctx.arcTo(width - 8, 8, width - 8, height - 8, radius)
  ctx.arcTo(width - 8, height - 8, 8, height - 8, radius)
  ctx.arcTo(8, height - 8, 8, 8, radius)
  ctx.arcTo(8, 8, width - 8, 8, radius)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 44px Sans'
  ctx.fillText(title, 46, 70)

  const avatarX = 120, avatarY = height / 2 + 6, avatarR = 80
  try {
    const av = await loadImageSmart(avatarUrl)
    ctx.save()
    ctx.beginPath(); ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2); ctx.closePath(); ctx.clip()
    if (av) ctx.drawImage(av, avatarX - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2)
    ctx.restore()
    ctx.lineWidth = 6
    ctx.strokeStyle = '#ffffff'
    ctx.beginPath(); ctx.arc(avatarX, avatarY, avatarR + 4, 0, Math.PI * 2); ctx.stroke()
  } catch {}

  const panelX = 250, panelY = 98, panelW = width - panelX - 40, panelH = height - panelY - 40
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = 'rgba(0,0,0,0.22)'
  ctx.shadowBlur = 12
  ctx.shadowOffsetY = 2
  ctx.beginPath()
  ctx.moveTo(panelX + 16, panelY)
  ctx.arcTo(panelX + panelW, panelY, panelX + panelW, panelY + panelH, 16)
  ctx.arcTo(panelX + panelW, panelY + panelH, panelX, panelY + panelH, 16)
  ctx.arcTo(panelX, panelY + panelH, panelX, panelY, 16)
  ctx.arcTo(panelX, panelY, panelX + panelW, panelY, 16)
  ctx.closePath()
  ctx.fill()
  ctx.shadowBlur = 0

  const lines = []
  const date = new Date()
  const fecha = date.toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: '2-digit' })
  const hora = date.toLocaleTimeString('es-PE', { hour12: false })
  lines.push(`Usuario: ${userTag}`)
  if (info.name) lines.push(`Nombre: ${info.name}`)
  if (typeof info.age === 'number' && info.age >= 10 && info.age <= 90) lines.push(`Edad: ${info.age} años`)
  if (info.bio) lines.push(`Bio: ${info.bio}`)
  if (info.sn) lines.push(`Clave SN: ${info.sn}`)
  lines.push(`Fecha: ${fecha}`)
  lines.push(`Hora: ${hora}`)
  if (info.coin != null) lines.push(`Monedas: ${info.coin}`)
  // Se eliminan EXPERIENCIA y TOKENS del texto como solicitado

  ctx.fillStyle = '#111827'
  ctx.font = 'bold 26px Sans'
  const startX = panelX + 20, startY = panelY + 38
  const maxW = panelW - 40
  let y = startY
  for (let i = 0; i < lines.length; i++) {
    const text = lines[i]
    const wrapped = clampText(ctx, text, maxW)
    for (const w of wrapped) { ctx.fillText(w, startX, y); y += 32 }
  }

  return canvas.toBuffer('image/png')
}

// Tarjeta simple de ID para usuarios ya registrados
export async function makeUserIdCard({ title = 'TARJETA DE USUARIO', name = 'Usuario', age = null, sn = 'SN-XXXX-0000', coin = 0, avatarUrl = '' }) {
  const width = 940, height = 520
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // Fondo suave
  ctx.fillStyle = '#efefef'
  ctx.fillRect(0, 0, width, height)

  // Card principal
  const cardX = 40, cardY = 40, cardW = width - 80, cardH = height - 80, r = 24
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = 'rgba(0,0,0,0.10)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 4
  ctx.beginPath()
  ctx.moveTo(cardX + r, cardY)
  ctx.arcTo(cardX + cardW, cardY, cardX + cardW, cardY + cardH, r)
  ctx.arcTo(cardX + cardW, cardY + cardH, cardX, cardY + cardH, r)
  ctx.arcTo(cardX, cardY + cardH, cardX, cardY, r)
  ctx.arcTo(cardX, cardY, cardX + cardW, cardY, r)
  ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0

  // Header azul
  const headerH = 86
  ctx.fillStyle = '#2563eb'
  ctx.beginPath()
  ctx.moveTo(cardX + r, cardY)
  ctx.arcTo(cardX + cardW, cardY, cardX + cardW, cardY + headerH, r)
  ctx.lineTo(cardX + cardW, cardY + headerH)
  ctx.lineTo(cardX, cardY + headerH)
  ctx.arcTo(cardX, cardY, cardX + r, cardY, r)
  ctx.closePath(); ctx.fill()

  // Título
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 38px Sans'
  ctx.textAlign = 'center'
  ctx.fillText(String(title || '').toUpperCase(), cardX + cardW / 2, cardY + 56)

  // Contenido
  ctx.textAlign = 'left'
  ctx.fillStyle = '#111827'
  ctx.font = 'bold 30px Sans'
  const leftPad = cardX + 28
  let y = cardY + headerH + 50
  const date = new Date()
  const fecha = date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '').toUpperCase()

  const lines = [
    `Nombre: ${name || 'Usuario'}`,
    (typeof age === 'number' ? `Edad: ${age} años` : null),
    `SN: ${sn}`,
    `Fecha: ${fecha}`,
    `Monedas: ${coin ?? 0}`
  ].filter(Boolean)
  for (const line of lines) { ctx.fillText(line, leftPad, y); y += 48 }

  // Avatar a la derecha
  const avW = 250, avH = 250
  const avX = cardX + cardW - avW - 28
  const avY = cardY + headerH + 24
  try {
    const av = await loadImageSmart(avatarUrl)
    ctx.save()
    const rr = 22
    ctx.beginPath()
    ctx.moveTo(avX + rr, avY)
    ctx.arcTo(avX + avW, avY, avX + avW, avY + avH, rr)
    ctx.arcTo(avX + avW, avY + avH, avX, avY + avH, rr)
    ctx.arcTo(avX, avY + avH, avX, avY, rr)
    ctx.arcTo(avX, avY, avX + avW, avY, rr)
    ctx.closePath(); ctx.clip()
    if (av) ctx.drawImage(av, avX, avY, avW, avH)
    else { ctx.fillStyle = '#e5e7eb'; ctx.fillRect(avX, avY, avW, avH) }
    ctx.restore()
    // Borde
    ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(avX + rr, avY)
    ctx.arcTo(avX + avW, avY, avX + avW, avY + avH, rr)
    ctx.arcTo(avX + avW, avY + avH, avX, avY + avH, rr)
    ctx.arcTo(avX, avY + avH, avX, avY, rr)
    ctx.arcTo(avX, avY, avX + avW, avY, rr)
    ctx.closePath(); ctx.stroke()
  } catch {}

  // Pie inferior sutil
  ctx.fillStyle = '#e5e7eb'
  ctx.fillRect(cardX, cardY + cardH - 22, cardW, 22)

  return canvas.toBuffer('image/png')
}

export async function sendExistingIdCard(conn, jid, { participant, userName = 'Usuario', existing = {} }) {
  const tmp = path.join(__dirname, '../temp')
  ensureDir(tmp)
  const num = String(participant || '').split('@')[0].split(':')[0].replace(/[^0-9]/g, '')
  let avatarUrl = ''
  try { if (participant) avatarUrl = await conn.profilePictureUrl(participant, 'image') } catch {}
  if (!avatarUrl) avatarUrl = 'https://files.catbox.moe/xr2m6u.jpg'
  const name = existing.name || userName || 'Usuario'
  const age = (typeof existing.age === 'number' && existing.age >= 10 && existing.age <= 90) ? existing.age : null
  const coin = existing.coin ?? 0
  const sn = existing.sn || ('SN-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000))
  const buf = await makeUserIdCard({ name, age, sn, coin, avatarUrl })
  const file = path.join(tmp, `id-${Date.now()}.png`)
  fs.writeFileSync(file, buf)
  const mentionId = participant ? [participant] : []
  const handle = participant ? `@${String(participant).split('@')[0]}` : (userName || 'Usuario')
  await conn.sendMessage(jid, { image: { url: file }, caption: `Ya estás registrado ${handle}\nID: ${sn}`, mentions: mentionId })
  return file
}

export async function sendRegisterCard(conn, jid, { userTag, avatarUrl, info = {}, participant, userName = 'Usuario', title = 'Registro', bgUrl = '', quoted = null }) {
  const tmp = path.join(__dirname, '../temp')
  ensureDir(tmp)
  const bgPick = bgUrl || pick(BG_IMAGES)
  const buf = await makeRegisterCard({ title, userTag, avatarUrl, info, bgUrl: bgPick })
  const file = path.join(tmp, `reg-${Date.now()}.png`)
  fs.writeFileSync(file, buf)
  const mentionId = participant ? [participant] : []
  const handle = participant ? `@${String(participant).split('@')[0]}` : (userName || userTag)
  if (quoted) await conn.sendMessage(jid, { image: { url: file }, caption: `${title} ${handle}`, mentions: mentionId }, { quoted })
  else await conn.sendMessage(jid, { image: { url: file }, caption: `${title} ${handle}`, mentions: mentionId })
  return file
}

export default { buildUserRecord, makeRegisterCard, sendRegisterCard }
