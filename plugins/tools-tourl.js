// Tourl Creado Por DavidXzsy Adaptado Para Itsuki Nakano IA v2

import fetch, { FormData, Blob } from 'node-fetch'
import crypto from 'crypto'
import { fileTypeFromBuffer } from 'file-type'
import { prepareWAMessageMedia, generateWAMessageFromContent, getDevice } from '@whiskeysockets/baileys'

// GitHub configuration - Use environment variables for security
const GITHUB_HARDCODED_TOKEN = process.env.GITHUB_TOKEN || ''
const GITHUB_HARDCODED_REPO = process.env.GITHUB_REPO || 'WillZek/Storage-CB2'

async function makeFkontak() {
  try {
    const res = await fetch('https://files.catbox.moe/jem7nf.jpg')
    const thumb2 = Buffer.from(await res.arrayBuffer())
    return {
      key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
      message: { locationMessage: { name: 'Tourl', jpegThumbnail: thumb2 } },
      participant: '0@s.whatsapp.net'
    }
  } catch {
    return null
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / (1024 ** i)).toFixed(2)} ${sizes[i]}`
}

async function uploadGitHub(filename, base64Content) {
  const token = process.env.GITHUB_TOKEN || global.GITHUB_TOKEN || GITHUB_HARDCODED_TOKEN
  const repo = process.env.GITHUB_REPO || global.GITHUB_REPO || GITHUB_HARDCODED_REPO
  if (!token) throw new Error('Falta GITHUB_TOKEN')
  const path = `images/${filename}`
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'upload-bot' },
    body: JSON.stringify({ message: `upload ${filename}`, content: base64Content })
  })
  const data = await res.json()
  if (data?.content?.download_url) return data.content.download_url
  throw new Error(data?.message || 'Fallo al subir a GitHub')
}

async function uploadCatbox(buffer, ext, mime) {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  const randomBytes = crypto.randomBytes(5).toString('hex')
  form.append('fileToUpload', new Blob([buffer], { type: mime || 'application/octet-stream' }), `${randomBytes}.${ext || 'bin'}`)
  const res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form })
  return (await res.text()).trim()
}

async function uploadPostImages(buffer, ext, mime) {
  const form = new FormData()
  form.append('optsize', '0')
  form.append('expire', '0')
  form.append('numfiles', '1')
  form.append('upload_session', String(Math.random()))
  form.append('file', new Blob([buffer], { type: mime || 'image/jpeg' }), `${Date.now()}.${ext || 'jpg'}`)
  const res = await fetch('https://postimages.org/json/rr', { method: 'POST', body: form })
  const json = await res.json().catch(async () => ({ raw: await res.text() }))
  return json?.url || json?.images?.[0]?.url || null
}

async function uploadLitterbox(buffer, ext, mime) {
  const form = new FormData()
  form.append('file', new Blob([buffer], { type: mime || 'application/octet-stream' }), `upload.${ext || 'bin'}`)
  form.append('time', '24h')
  const res = await fetch('https://api.alvianuxio.eu.org/uploader/litterbox', { method: 'POST', body: form })
  const text = await res.text()
  try { const j = JSON.parse(text); return j.url || j.data?.url || null } catch { return /https?:\/\/[\w./-]+/i.test(text) ? text.trim() : null }
}

async function uploadTmpFiles(buffer, ext, mime) {
  const form = new FormData()
  form.append('file', new Blob([buffer], { type: mime || 'application/octet-stream' }), `upload.${ext || 'bin'}`)
  const res = await fetch('https://api.alvianuxio.eu.org/uploader/tmpfiles', { method: 'POST', body: form })
  const text = await res.text()
  try { const j = JSON.parse(text); return j.url || j.data?.url || j.link || null } catch { return /https?:\/\/[\w./-]+/i.test(text) ? text.trim() : null }
}

async function uploadFreeImageHost(buffer, ext, mime) {
  const form = new FormData()
  form.append('key', '6d207e02198a847aa98d0a2a901485a5')
  form.append('action', 'upload')
  form.append('source', new Blob([buffer], { type: mime || 'image/jpeg' }), `upload.${ext || 'jpg'}`)
  const res = await fetch('https://freeimage.host/api/1/upload', { method: 'POST', body: form })
  const j = await res.json().catch(async () => ({ raw: await res.text() }))
  return j?.image?.url || j?.data?.image?.url || null
}

async function uploadServiceByName(name, buffer, ext, mime) {
  switch ((name || '').toLowerCase()) {
    case 'github': {
      const fname = `${crypto.randomBytes(6).toString('hex')}.${ext || 'bin'}`
      const content = Buffer.from(buffer).toString('base64')
      return await uploadGitHub(fname, content)
    }
    case 'catbox': return await uploadCatbox(buffer, ext, mime)
    case 'postimages': return await uploadPostImages(buffer, ext, mime)
    case 'litterbox': return await uploadLitterbox(buffer, ext, mime)
    case 'tmpfiles': return await uploadTmpFiles(buffer, ext, mime)
    case 'freeimagehost': return await uploadFreeImageHost(buffer, ext, mime)
    default: throw new Error('Servicio no soportado')
  }
}

const SERVICE_LIST = [
  { key: 'github', label: 'GitHub' },
  { key: 'catbox', label: 'Catbox' },
  { key: 'postimages', label: 'PostImages' },
  { key: 'litterbox', label: 'Litterbox (24h)' },
  { key: 'tmpfiles', label: 'TmpFiles' },
  { key: 'freeimagehost', label: 'FreeImageHost' },
  { key: 'all', label: 'Todos los servicios' }
]

async function sendChooser(m, conn, usedPrefix) {
  let fkontak = await makeFkontak()
  if (!fkontak) fkontak = m
  try {
    const avatarUrl = 'https://files.catbox.moe/jem7nf.jpg'
    const device = await getDevice(m.key.id)
    if (device !== 'desktop' && device !== 'web') {
      const media = await prepareWAMessageMedia({ image: { url: avatarUrl } }, { upload: conn.waUploadToServer })
      const rows = SERVICE_LIST.map(s => ({ header: s.label, title: 'Tourl', description: 'Seleccionar servicio', id: `${usedPrefix}tourl ${s.key}` }))
      const interactiveMessage = {
        body: { text: 'Elige el servicio de subida:' },
        footer: { text: `${global.dev || ''}`.trim() },
        header: { title: 'Tourl', hasMediaAttachment: true, imageMessage: media.imageMessage },
        nativeFlowMessage: { buttons: [ { name: 'single_select', buttonParamsJson: JSON.stringify({ title: 'Servicios', sections: [ { title: 'Opciones', rows } ] }) } ], messageParamsJson: '' }
      }
      const msg = generateWAMessageFromContent(m.chat, { viewOnceMessage: { message: { interactiveMessage } } }, { userJid: conn.user.jid, quoted: fkontak })
      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
      return true
    }
  } catch {}
  const list = SERVICE_LIST.map(s => `• ${usedPrefix}tourl ${s.key}`).join('\n')
  await conn.sendMessage(m.chat, { text: `Elige el servicio de subida:\n\n${list}` }, { quoted: fkontak })
  return true
}

const tourSessions = new Map()

async function doUpload(m, conn, serviceKey) {
  const sessKey = m.chat + ':' + m.sender
  let fromCache = tourSessions.get(sessKey)
  let buffer, mime
  if (fromCache && fromCache.buffer) {
    buffer = fromCache.buffer
    mime = fromCache.mime || ''
  } else {
    const q = m.quoted ? (m.quoted.msg || m.quoted) : m
    mime = (q.mimetype || q.mediaType || q.mtype || '').toString().toLowerCase()
    if (!/image|video|audio|sticker|document/.test(mime)) {
      await conn.reply(m.chat, 'Responde a una imagen / video / audio / documento', m)
      return true
    }
    buffer = await q.download()
  }
  if (!buffer || !buffer.length) { await conn.reply(m.chat, 'No se pudo descargar el archivo', m); return true }
  const sizeBytes = buffer.length
  if (sizeBytes > 1024 * 1024 * 1024) { await conn.reply(m.chat, 'El archivo supera 1GB', m); return true }
  const humanSize = formatBytes(sizeBytes)
  const typeInfo = await fileTypeFromBuffer(buffer) || {}
  const { ext, mime: realMime } = typeInfo

  let results = []
  if ((serviceKey || '').toLowerCase() === 'all') {
    for (const svc of SERVICE_LIST.filter(s => s.key !== 'all')) {
      try {
        const url = await uploadServiceByName(svc.key, buffer, ext, realMime)
        if (url) results.push({ name: svc.label, url, size: humanSize })
      } catch {}
    }
  } else {
    const pick = SERVICE_LIST.find(s => s.key === (serviceKey || '').toLowerCase())
    if (!pick) { await conn.reply(m.chat, 'Servicio inválido', m); return true }
    try {
      const url = await uploadServiceByName(pick.key, buffer, ext, realMime)
      if (url) results.push({ name: pick.label, url, size: humanSize })
    } catch (e) { await conn.reply(m.chat, `Error: ${e.message}`, m); return true }
  }

  if (!results.length) { await conn.reply(m.chat, 'No se obtuvo ninguna URL', m); return true }

  let txt = '💫  L I N K S - E N L A C E S 💫\n\n'
  for (const r of results) {
    txt += `*${r.name}*\n• Enlace: ${r.url}\n• Tamaño: ${r.size}\n\n`
  }

  let fkontak = await makeFkontak()
  if (!fkontak) fkontak = m

  let mediaHeader = null
  try {
    if (/image/.test(mime)) mediaHeader = await prepareWAMessageMedia({ image: buffer }, { upload: conn.waUploadToServer })
  } catch {}

  const buttons = results.map(r => ({ name: 'cta_copy', buttonParamsJson: JSON.stringify({ display_text: `Copiar ${r.name}`, copy_code: r.url }) }))
  const interactiveMessage = {
    body: { text: txt },
    footer: { text: 'Toca un botón para copiar.' },
    header: { title: 'Enlaces generados', hasMediaAttachment: !!mediaHeader?.imageMessage, imageMessage: mediaHeader?.imageMessage },
    nativeFlowMessage: { buttons, messageParamsJson: '' }
  }
  const msg = generateWAMessageFromContent(m.chat, { viewOnceMessage: { message: { interactiveMessage } } }, { userJid: conn.user.jid, quoted: fkontak })
  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  try { tourSessions.delete(sessKey) } catch {}
  return true
}

let handler = async (m, { conn, args, usedPrefix }) => {
  const service = (args[0] || '').toLowerCase()
  if (!service) {
    // Capturar y cachear el medio antes de mostrar el selector
    const q = m.quoted ? (m.quoted.msg || m.quoted) : m
    const mime = (q.mimetype || q.mediaType || q.mtype || '').toString().toLowerCase()
    if (!/image|video|audio|sticker|document/.test(mime)) {
      await conn.reply(m.chat, '*Responde a una imagen / video / audio / documento*', m)
      return true
    }
    const buffer = await q.download()
    if (!buffer || !buffer.length) { await conn.reply(m.chat, 'No se pudo descargar el archivo', m); return true }
    const sessKey = m.chat + ':' + m.sender
    tourSessions.set(sessKey, { buffer, mime, ts: Date.now() })
    return sendChooser(m, conn, usedPrefix)
  }
  return doUpload(m, conn, service)
}

handler.help = ['tourl']
handler.tags = ['tools']
handler.command = /^(tourl|upload)$/i

handler.before = async function (m, { conn, usedPrefix }) {
  try {
    const msg = m.message || {}
    let selectedId = null
    const irm = msg.interactiveResponseMessage
    if (!selectedId && irm?.nativeFlowResponseMessage) {
      try {
        const params = JSON.parse(irm.nativeFlowResponseMessage.paramsJson || '{}')
        if (typeof params.id === 'string') selectedId = params.id
        if (!selectedId && typeof params.selectedId === 'string') selectedId = params.selectedId
        if (!selectedId && typeof params.rowId === 'string') selectedId = params.rowId
      } catch {}
    }
    const lrm = msg.listResponseMessage
    if (!selectedId && lrm?.singleSelectReply?.selectedRowId) selectedId = lrm.singleSelectReply.selectedRowId
    const brm = msg.buttonsResponseMessage
    if (!selectedId && brm?.selectedButtonId) selectedId = brm.selectedButtonId
    if (!selectedId) return false

    const mTourl = /\btourl\b\s+(github|catbox|postimages|litterbox|tmpfiles|freeimagehost|all)/i.exec(selectedId)
    if (mTourl) {
      return await doUpload(m, conn, mTourl[1].toLowerCase())
    }
    return false
  } catch { return false }
}

export default handler
