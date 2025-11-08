import path from 'path'
import fs from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'

async function makeFkontak() {
  try {
    const res = await fetch('https://i.postimg.cc/rFfVL8Ps/image.jpg')
    const thumb2 = Buffer.from(await res.arrayBuffer())
    return {
      key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
      message: { locationMessage: { name: 'Owner Add', jpegThumbnail: thumb2 } },
      participant: '0@s.whatsapp.net'
    }
  } catch {
    return null
  }
}

const toNum = v => (v + '').replace(/[^0-9]/g, '')
const localPart = v => (v + '').split('@')[0].split(':')[0].split('/')[0].split(',')[0]
const normalizeCore = v => toNum(localPart(v))

function formatPretty(num) { const n = normalizeCore(num); return n ? '+' + n : '' }

async function resolveName(conn, jid) {
  try { const n = await conn.getName(jid); if (n && n.trim()) return n.trim() } catch {}
  return formatPretty(jid)
}

async function appendOwnerToConfig(configPath, number, name, isRoot = false) {
  try {
    const src = await fs.promises.readFile(configPath, 'utf8')
    const anchor = src.indexOf('global.owner')
    if (anchor === -1) throw new Error('No se encontró global.owner en config.js')
    const eqIdx = src.indexOf('=', anchor)
    if (eqIdx === -1) throw new Error('Asignación de owner no encontrada')
    const arrStart = src.indexOf('[', eqIdx)
    if (arrStart === -1) throw new Error('No se encontró inicio de array de owner')

    // Buscar el cierre correspondiente del array con conteo de corchetes, ignorando strings
    let i = arrStart
    let depth = 0
    let inS = false, inD = false, inB = false, esc = false
    let arrEnd = -1
    while (i < src.length) {
      const ch = src[i]
      if (esc) { esc = false; i++; continue }
      if (inS) { if (ch === "\\") esc = true; else if (ch === "'") inS = false; i++; continue }
      if (inD) { if (ch === "\\") esc = true; else if (ch === '"') inD = false; i++; continue }
      if (inB) { if (ch === "\\") esc = true; else if (ch === '`') inB = false; i++; continue }
      if (ch === "'") { inS = true; i++; continue }
      if (ch === '"') { inD = true; i++; continue }
      if (ch === '`') { inB = true; i++; continue }
      if (ch === '[') { depth++; i++; continue }
      if (ch === ']') { depth--; i++; if (depth === 0) { arrEnd = i - 1; break } else continue }
      i++
    }
    if (arrEnd === -1) throw new Error('No se encontró cierre del array de owner')

    const inside = src.slice(arrStart + 1, arrEnd)
    const hasItems = /[^\s]/.test(inside)

    // Buscar el último char no espacio antes de arrEnd para decidir coma previa
    let j = arrEnd - 1
    while (j > arrStart && /\s/.test(src[j])) j--
    const prevChar = src[j] || ''
    const needLeadingComma = hasItems && prevChar !== ','

    const nameEsc = name.replace(/'/g, "\\'")
    const indent = '  '
    const entry = `${indent}['${number}', '${nameEsc}', ${!!isRoot}]`
    const insertText = (needLeadingComma ? ',' : '') + '\n' + entry

    const updated = src.slice(0, arrEnd) + insertText + src.slice(arrEnd)
    await fs.promises.writeFile(configPath, updated, 'utf8')
    return true
  } catch (e) {
    console.error('[owner-add] persist error:', e.message)
    return false
  }
}

const handler = async (m, { conn, text, participants, parseUserTargets, getUserInfo }) => {
  const ctxOk = (typeof global.rcanalr === 'object') ? global.rcanalr : {}
  const ctxInfo = (typeof global.rcanalx === 'object') ? global.rcanalx : {}
  const ctxErr = (typeof global.rcanalden === 'object') ? global.rcanalden : {}

  try {
    if (!text?.trim() && !m.mentionedJid?.length && !m.quoted) {
      return conn.reply(m.chat, `
*👑 Agregar Owner*

• .addowner @usuario [nombre]
• .addowner <numero> [nombre]
• (responde a un mensaje) .addowner [nombre]

Nota: agrega como Root Owner (true).`, m, ctxInfo)
    }

    const targetsAll = await parseUserTargets(m, text, participants, conn)
    if (!targetsAll.length) return conn.reply(m.chat, '❌ No se encontró usuario válido.', m, ctxErr)
    const target = targetsAll[0]

    const info = await getUserInfo(target, participants, conn)
    const num = normalizeCore(info.jid)
    if (!num) return conn.reply(m.chat, '❌ Número inválido.', m, ctxErr)

    const already = (Array.isArray(global.owner) ? global.owner : []).some(v => {
      if (Array.isArray(v)) return normalizeCore(v[0]) === num
      return normalizeCore(v) === num
    })
    if (already) return conn.reply(m.chat, `⚠️ Ya es owner: @${num}`, m, { ...ctxInfo, mentions: [info.jid] })

    // Derivar nombre
    let providedName = ''
    if (text?.trim()) {
      // quitar menciones y números del texto para intentar extraer nombre
      const cleaned = text.replace(/@\d+/g, '').replace(/\+?\d{5,}/g, '').trim()
      providedName = cleaned
    }
    const name = (providedName && providedName.length > 1) ? providedName : (await resolveName(conn, info.jid))

  // Actualizar en memoria (como Root Owner)
    global.owner = Array.isArray(global.owner) ? global.owner : []
  global.owner.push([num, name, true])

    // Intentar persistir en config.js
    let persisted = false
    try {
      const __filename = fileURLToPath(import.meta.url)
      const __dirname = path.dirname(__filename)
      const configPath = path.join(__dirname, '..', 'config.js')
  persisted = await appendOwnerToConfig(configPath, num, name, true)
      if (persisted) {
        try { await import(pathToFileURL(configPath).href + `?update=${Date.now()}`) } catch {}
      }
    } catch {}

    const badge = persisted ? (global.done || '✅') : '⚠️'
    const msg = persisted
      ? `${global.done || '✅'} Agregado como Root Owner: @${num}\nNombre: ${name}`
      : `Root Owner agregado en memoria: @${num}\nNombre: ${name}\n${global.warning || '⚠️'} No se pudo guardar en config.js`

    const fkontak = await makeFkontak().catch(() => null)
    return conn.reply(m.chat, msg, fkontak || m, { ...ctxOk, mentions: [info.jid] })
  } catch (e) {
    console.error('[owner-add] error:', e)
    return conn.reply(m.chat, '❌ Error al agregar owner: ' + e.message, m, ctxErr)
  }
}

handler.help = ['addowner']
handler.tags = ['owner']
handler.command = /^(addowner|owneradd|addprop)$/i
handler.group = false
handler.admin = false
handler.botAdmin = false
handler.rowner = true

export default handler
