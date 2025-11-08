/*
██████╗░██╗░░░██╗███████╗███████╗
██╔══██╗╚██╗░██╔╝╚════██║██╔════╝
██████╔╝░╚████╔╝░░░███╔═╝█████╗░░
██╔══██╗░░╚██╔╝░░██╔══╝░░██╔══╝░░
██║░░██║░░░██║░░░███████╗███████╗
╚═╝░░╚═╝░░░╚═╝░░░╚══════╝╚══════╝
🎀 CREADO POR: LeoXzzsy
🌸 ADAPTADO PARA: Itsuki-Nakano IA
📚 VERSIÓN: 3.4.0 Beta
*/

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createCanvas, loadImage } from '@napi-rs/canvas'
import { jidNormalizedUser } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Sistema de estado para welcome
const WELCOME_STATE_FILE = path.join(__dirname, '../temp/welcome_state.json')

function loadWelcomeState() {
  try {
    if (fs.existsSync(WELCOME_STATE_FILE)) {
      return JSON.parse(fs.readFileSync(WELCOME_STATE_FILE, 'utf8'))
    }
  } catch (error) {
    console.error('Error loading welcome state:', error)
  }
  return {}
}

function saveWelcomeState(state) {
  try {
    const tempDir = path.dirname(WELCOME_STATE_FILE)
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }
    fs.writeFileSync(WELCOME_STATE_FILE, JSON.stringify(state, null, 2))
  } catch (error) {
    console.error('Error saving welcome state:', error)
  }
}

// Función para verificar si el welcome está activado
export function isWelcomeEnabled(jid) {
  const state = loadWelcomeState()
  return state[jid] !== false // Por defecto está activado
}

// Función para cambiar el estado del welcome
export function setWelcomeState(jid, enabled) {
  const state = loadWelcomeState()
  state[jid] = enabled
  saveWelcomeState(state)
  return enabled
}

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

export async function makeCard({ title = 'Bienvenida', subtitle = '', avatarUrl = '', bgUrl = '', badgeUrl = '' }) {
  const width = 900, height = 380
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  const radius = 30
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#06141f')
  gradient.addColorStop(1, '#0b2a3b')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.lineWidth = 12
  ctx.strokeStyle = '#19c3ff'
  ctx.strokeRect(6, 6, width - 12, height - 12)

  if (bgUrl) {
    try {
      const bg = await loadImageSmart(bgUrl)
      const pad = 18
      ctx.globalAlpha = 0.9
      if (bg) ctx.drawImage(bg, pad, pad, width - pad * 2, height - pad * 2)
      ctx.globalAlpha = 1
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.fillRect(pad, pad, width - pad * 2, height - pad * 2)
    } catch {}
  }

  let avatarUsedInCenter = false
  let centerR = 54
  let centerCX = Math.round(width / 2)
  let centerCY = 86
  try {
    const useCenterAvatar = !badgeUrl && !!avatarUrl
    centerR = useCenterAvatar ? 80 : 54
    centerCY = useCenterAvatar ? Math.round(height / 2) : 86
    const centerSrc = (badgeUrl && badgeUrl.trim()) ? badgeUrl : (avatarUrl || '')
    if (centerSrc) {
      const badge = await loadImageSmart(centerSrc)
      ctx.save()
      ctx.beginPath(); ctx.arc(centerCX, centerCY, centerR, 0, Math.PI * 2); ctx.closePath(); ctx.clip()
      if (badge) ctx.drawImage(badge, centerCX - centerR, centerCY - centerR, centerR * 2, centerR * 2)
      ctx.restore()
      ctx.lineWidth = 6
      ctx.strokeStyle = '#19c3ff'
      ctx.beginPath(); ctx.arc(centerCX, centerCY, centerR + 4, 0, Math.PI * 2); ctx.stroke()
      avatarUsedInCenter = useCenterAvatar
    }
  } catch {}

  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = '#000000'
  ctx.shadowBlur = 8
  ctx.font = 'bold 48px Sans'
  const titleY = avatarUsedInCenter ? 70 : 178
  ctx.fillText(title, width / 2, titleY)
  ctx.shadowBlur = 0

  ctx.fillStyle = '#d8e1e8'
  ctx.font = '28px Sans'
  const lines = Array.isArray(subtitle) ? subtitle : [subtitle]
  const subBaseY = avatarUsedInCenter ? (centerCY + centerR + 28) : 218
  lines.forEach((t, i) => ctx.fillText(String(t || ''), width / 2, subBaseY + i * 34))

  if (avatarUrl && !avatarUsedInCenter) {
    try {
      const av = await loadImageSmart(avatarUrl)
      const r = 64
      const x = width - 120, y = height - 120
      ctx.save()
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.closePath(); ctx.clip()
      if (av) ctx.drawImage(av, x - r, y - r, r * 2, r * 2)
      ctx.restore()
      ctx.lineWidth = 5
      ctx.strokeStyle = '#19c3ff'
      ctx.beginPath(); ctx.arc(x, y, r + 3, 0, Math.PI * 2); ctx.stroke()
    } catch {}
  }

  return canvas.toBuffer('image/png')
}

export async function sendWelcomeOrBye(conn, { jid, userName = 'Usuario', type = 'welcome', groupName = '', participant }) {
  // VERIFICAR SI EL WELCOME ESTÁ ACTIVADO PARA ESTE GRUPO
  if (!isWelcomeEnabled(jid)) {
    console.log(`🎀 Welcome/Bye desactivado para el grupo: ${jid}`)
    return null
  }

  const tmp = path.join(__dirname, '../temp')
  ensureDir(tmp)
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
  const normalizeNumberFromJid = (jidOrNum = '') => {
    const raw = String(jidOrNum || '')
    const justJid = raw.includes('@') ? raw.split('@')[0] : raw
    const justNoSuffix = justJid.split(':')[0]
    const onlyDigits = justNoSuffix.replace(/\D+/g, '')
    return onlyDigits
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
  const WELCOME_TITLES = ['Bienvenido', 'Bienvenida', '¡Bienvenid@!', 'Saludos', '¡Hola!', 'Llegada', 'Nuevo miembro', 'Bienvenid@ al grupo', 'Que gusto verte', 'Bienvenido/a']
  const WELCOME_SUBS = [
    'Un placer tenerte aquí',
    'Que la pases bien con nosotros',
    'Esperamos que disfrutes el grupo',
    'Pásala bien y participa',
    'Aquí encontrarás buena onda',
    'Prepárate para la diversión',
    'Bienvenido, esperamos tus aportes',
    'Diviértete y sé respetuos@',
    'Gracias por unirte',
    'La comunidad te da la bienvenida'
  ]
  const BYE_TITLES = ['Adiós', 'Despedida', 'Hasta luego', 'Nos vemos', 'Salida', 'Bye', 'Chao', 'Nos vemos pronto', 'Que te vaya bien', 'Sayonara']
  const BYE_SUBS = [
    'Adiós, nadie te quiso',
    'No vuelvas más, eres feo',
    'Se fue sin dejar rastro',
    'Buena suerte en lo que siga',
    'Hasta nunca',
    'Que te vaya mejor (o no)',
    'Te extrañaremos (no tanto)',
    'Nos veremos en otra vida',
    'Adiós y cuídate',
    'Chao, fue un placer... quizá'
  ]
  const title = type === 'welcome' ? pick(WELCOME_TITLES) : pick(BYE_TITLES)
  const subtitle = type === 'welcome' ? [pick(WELCOME_SUBS)] : [pick(BYE_SUBS)]
  const badgeUrl = ''
  const bgUrl = pick(BG_IMAGES)
  let avatarUrl = ''
  try {
    if (participant) avatarUrl = await conn.profilePictureUrl(participant, 'image')
  } catch {}
  if (!avatarUrl) avatarUrl = 'https://files.catbox.moe/xr2m6u.jpg'
  const buff = await makeCard({ title, subtitle, avatarUrl, bgUrl, badgeUrl })
  const file = path.join(tmp, `${type}-${Date.now()}.png`)
  fs.writeFileSync(file, buff)
  const who = participant || ''
  let realJid = who
  try { if (typeof conn?.decodeJid === 'function') realJid = conn.decodeJid(realJid) } catch {}
  try { realJid = jidNormalizedUser(realJid) } catch {}
  const number = normalizeNumberFromJid(realJid)
  const taguser = number ? `@${number}` : (userName || 'Usuario')
  let meta = null
  try { meta = await conn.groupMetadata(jid) } catch {}
  const totalMembers = Array.isArray(meta?.participants) ? meta.participants.length : 0
  const groupSubject = meta?.subject || groupName || ''
  const tipo = type === 'welcome' ? 'Bienvenid@' : 'Despedida'
  const date = new Date().toLocaleString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit', hour12: false, hour: '2-digit', minute: '2-digit' })

  let fkontak = null
  try {
    const res = await fetch('https://i.postimg.cc/rFfVL8Ps/image.jpg')
    const thumb2 = Buffer.from(await res.arrayBuffer())
    fkontak = { key: { participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' }, message: { locationMessage: { name: `${tipo}`, jpegThumbnail: thumb2 } }, participant: '0@s.whatsapp.net' }
  } catch {}

  const productMessage = {
    product: {
      productImage: { url: file },
      productId: '24529689176623820',
      title: `${tipo}, ᴀʜᴏʀᴀ sᴏᴍᴏs ${totalMembers}`,
      description: '',
      currencyCode: 'USD',
      priceAmount1000: '100000',
      retailerId: 1677,
      url: `https://wa.me/${number}`,
      productImageCount: 1
    },
    businessOwnerJid: who || '0@s.whatsapp.net',
    caption: `*👤ᴜsᴜᴀʀɪᴏ*: ${taguser}\n*📚 ɢʀᴜᴘᴏ*: ${groupSubject}\n*👥️ ᴍɪᴇᴍʙʀᴏs*: ${totalMembers}\n*📆 ғᴇᴄʜᴀ*: ${date}`.trim(),
    title: '',
    subtitle: '',
    footer: groupSubject || '',
    interactiveButtons: [
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: '🌷 ᴍᴇɴᴜ-ɴᴀᴋᴀɴᴏ 🌷',
          id: '.menu' 
        })
      }
    ],
    mentions: who ? [who] : []
  }

  const mentionId = who ? [who] : []
  await conn.sendMessage(jid, productMessage, { quoted: fkontak || undefined, contextInfo: { mentionedJid: mentionId } })
  return file
}

export default { makeCard, sendWelcomeOrBye, isWelcomeEnabled, setWelcomeState }