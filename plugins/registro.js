import { saveDatabase } from '../lib/db.js'
import { buildUserRecord, sendRegisterCard, sendExistingIdCard } from '../lib/registry.js'
import { prepareWAMessageMedia, generateWAMessageFromContent, getDevice } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

const sessions = new Map()
const regRecent = new Map() // jid -> timestamp of recent successful registration

function toNum(jid = '') { return String(jid).split('@')[0].split(':')[0].replace(/[^0-9]/g, '') }

function mirrorUser(users, numKey, jidKey) {
  if (!users) return
  const a = users[numKey]
  const b = users[jidKey]
  const ref = a || b
  if (!ref) return
  users[numKey] = ref
  users[jidKey] = ref
}

async function askStep(m, conn, step) {
  const prompts = {
    name: '🍉 Escribe tu nombre para el registro:',
    age: '🍉 ¿Cuántos años tienes? (número entre 10 y 90):',
    bio: '🍉 Escribe una breve bio (máx 80 caracteres):'
  }
  await conn.reply(m.chat, prompts[step], m)
}

async function finalize(m, conn, state, userKey) {
  const num = toNum(m.sender)
  const jidKey = m.sender
  // Marcar registro en curso para evitar que otra ruta envíe la tarjeta de ID antes
  try { regRecent.set(m.sender, Date.now()) } catch {}
  global.db.data.users ||= {}
  global.db.data.users[num] ||= { exp: 0, coin: 10, level: 0, warns: 0, premium: false, spam: 0 }
  const base = global.db.data.users[num]
  const record = buildUserRecord(base, state)
  Object.assign(global.db.data.users[num], record, { registered: true })
  try { mirrorUser(global.db.data.users, num, jidKey) } catch {}
  try { global.db.data.users[jidKey].registered = true } catch {}
  try { await saveDatabase() } catch (e) { console.log('[DB] save error:', e?.message || e) }

  let avatarUrl = ''
  try { avatarUrl = await conn.profilePictureUrl(m.sender, 'image') } catch {}
  if (!avatarUrl) avatarUrl = 'https://files.catbox.moe/xr2m6u.jpg'

  const userTag = '@' + num
  let autoName = m?.pushName || ''
  try { autoName = (await Promise.resolve(conn.getName?.(m.sender))) || autoName } catch {}
  if (!autoName) autoName = 'Usuario'
  let quoted = null
  try {
    const res = await fetch('https://i.postimg.cc/QCzMhBR1/1757986334220.png')
    const thumb2 = Buffer.from(await res.arrayBuffer())
    quoted = {
      key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
      message: { locationMessage: { name: '✅Registro Exitoso', jpegThumbnail: thumb2 } },
      participant: '0@s.whatsapp.net'
    }
  } catch {}
  // Enviar solo la tarjeta de "Registro" al completar el registro
  await sendRegisterCard(conn, m.chat, { userTag, avatarUrl, info: record, participant: m.sender, userName: autoName, title: 'Registro', quoted })
  // Ya estaba marcado al inicio de finalize
}

let handler = async (m, { conn, args, command, usedPrefix }) => {
  const chatId = m.chat
  const userId = m.sender
  const key = chatId + ':' + userId
  const isCancel = /^cancel(ar)?$/i.test(args[0] || '')

  // Inicio con selector interactivo de edad
  if (/^reg(istro)?$/i.test(command)) {
    // Evitar re-registro: si ya está registrado, responder con su ID
    const num = toNum(m.sender)
    const jidKey = m.sender
  const users = (global.db && global.db.data && global.db.data.users) ? global.db.data.users : {}
    try { mirrorUser(users, num, jidKey) } catch {}
    const existing = users[num] || users[jidKey]
    if (existing && (existing.registered || existing.sn)) {
      const last = regRecent.get(m.sender) || 0
      if (Date.now() - last < 3000) return // evitar duplicado inmediato
      if (!existing.sn) {
        existing.sn = 'SN-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000)
        try { await saveDatabase() } catch {}
      }
    let displayName = m?.pushName || ''
    try { displayName = (await Promise.resolve(conn.getName?.(m.sender))) || displayName } catch {}
    if (!displayName) displayName = 'Usuario'
    await sendExistingIdCard(conn, m.chat, { participant: m.sender, userName: displayName, existing })
      return
    }
    // Tomar nombre automáticamente
    let autoName = m?.pushName || ''
    try { autoName = (await Promise.resolve(conn.getName?.(m.sender))) || autoName } catch {}
    if (!autoName) autoName = 'Usuario'

    // Intentar avatar para header
    let avatarUrl = ''
    try { avatarUrl = await conn.profilePictureUrl(m.sender, 'image') } catch {}
    if (!avatarUrl) avatarUrl = 'https://files.catbox.moe/xr2m6u.jpg'

    // fkontak con miniatura personalizada
    let fkontak = m
    try {
      const res = await fetch('https://i.postimg.cc/63HSmCvV/1757985995273.png')
      const thumb2 = Buffer.from(await res.arrayBuffer())
      fkontak = {
        key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
        message: { locationMessage: { name: 'Registro', jpegThumbnail: thumb2 } },
        participant: '0@s.whatsapp.net'
      }
    } catch {}

    // Generar opciones 17..30
    const minAge = 17, maxAge = 30
    const rows = []
    for (let i = minAge; i <= maxAge; i++) {
      rows.push({ header: `Edad ${i}`, title: autoName, description: 'Seleccionar esta edad', id: `${usedPrefix}regok ${i}` })
    }

    try {
      const device = await getDevice(m.key.id)
      if (device !== 'desktop' && device !== 'web') {
        const media = await prepareWAMessageMedia({ image: { url: avatarUrl } }, { upload: conn.waUploadToServer })
        const interactiveMessage = {
          body: { text: `Registro rápido\n\nNombre detectado: ${autoName}\nSelecciona tu edad:` },
          footer: { text: `${global.dev || ''}`.trim() },
          header: { title: '', hasMediaAttachment: true, imageMessage: media.imageMessage },
          nativeFlowMessage: {
            buttons: [
              {
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                  title: 'Elige tu edad',
                  sections: [ { title: 'Edades', rows } ]
                })
              }
            ],
            messageParamsJson: ''
          }
        }
        const msg = generateWAMessageFromContent(m.chat, { viewOnceMessage: { message: { interactiveMessage } } }, { userJid: conn.user.jid, quoted: fkontak })
        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
        return
      }
    } catch {}

    // Fallback para web/desktop
    const list = Array.from({ length: 30 - 17 + 1 }, (_, k) => 17 + k).map(n => `• ${usedPrefix}regok ${n}`).join('\n')
    await conn.sendMessage(m.chat, { text: `Registro rápido\n\nNombre detectado: ${autoName}\nElige tu edad enviando uno de estos comandos:\n\n${list}` }, { quoted: fkontak })
    return
  }

  if (isCancel) {
    if (sessions.has(key)) { sessions.delete(key); await conn.reply(m.chat, 'Registro cancelado.', m) }
    else await conn.reply(m.chat, 'No tienes registro en curso.', m)
    return
  }

  // Confirmación directa desde botón: .regok <edad>
  if (/^regok$/i.test(command)) {
    // Guardar intento duplicado
    const num = toNum(m.sender)
    const jidKey = m.sender
    const users = (global.db && global.db.data && global.db.data.users) ? global.db.data.users : {}
    try { mirrorUser(users, num, jidKey) } catch {}
    const existing = users[num] || users[jidKey]
    if (existing && (existing.registered || existing.sn)) {
      const last = regRecent.get(m.sender) || 0
      if (Date.now() - last < 3000) return
      if (!existing.sn) {
        existing.sn = 'SN-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000)
        try { await saveDatabase() } catch {}
      }
    let displayName = m?.pushName || ''
    try { displayName = (await Promise.resolve(conn.getName?.(m.sender))) || displayName } catch {}
    if (!displayName) displayName = 'Usuario'
    await sendExistingIdCard(conn, m.chat, { participant: m.sender, userName: displayName, existing })
      return
    }
    const age = parseInt(args[0])
    if (isNaN(age) || age < 10 || age > 90) {
      await conn.reply(m.chat, 'Edad inválida. Usa por ejemplo: .regok 20', m)
      return
    }
    // Nombre automático
    let autoName = m?.pushName || ''
    try { autoName = (await Promise.resolve(conn.getName?.(m.sender))) || autoName } catch {}
    if (!autoName) autoName = 'Usuario'
    const state = { name: autoName, age, bio: 'Sin bio' }
  // Marcar en progreso antes de finalizar para bloquear duplicados
  try { regRecent.set(m.sender, Date.now()) } catch {}
  sessions.delete(key)
    return finalize(m, conn, state, key)
  }

  // Flujo de pasos si hay sesión activa (modo antiguo opcional)
  const ses = sessions.get(key)
  if (!ses) return
  const text = (m.text || '').trim()

  if (ses.step === 'name') {
    if (!text || text.length < 2 || text.length > 30) {
      await conn.reply(m.chat, 'Nombre inválido. Debe tener entre 2 y 30 caracteres.', m)
      return askStep(m, conn, 'name')
    }
    ses.name = text
    ses.step = 'age'
    return askStep(m, conn, 'age')
  }

  if (ses.step === 'age') {
    const n = parseInt(text)
    if (isNaN(n) || n < 10 || n > 90) {
      await conn.reply(m.chat, 'Edad inválida. Ingresa un número entre 10 y 90.', m)
      return askStep(m, conn, 'age')
    }
    ses.age = n
    ses.step = 'bio'
    return askStep(m, conn, 'bio')
  }

  if (ses.step === 'bio') {
    if (!text || text.length > 80) {
      await conn.reply(m.chat, 'Bio inválida. Debe tener 1 a 80 caracteres.', m)
      return askStep(m, conn, 'bio')
    }
    ses.bio = text
    sessions.delete(key)
    return finalize(m, conn, ses, key)
  }
}

handler.help = ['registro', 'reg', 'regok <edad>', 'cancel']
handler.tags = ['user']
handler.command = /^(registro|reg|regok|cancel)$/i

// Captura respuestas sin comandos mientras la sesión esté activa
handler.before = async function (m, { conn }) {
  const key = m.chat + ':' + m.sender
  const ses = sessions.get(key)
  // 1) Captura respuestas de botones/listas (nativeFlow / list)
  try {
    const msg = m.message || {}
    let selectedId = null
    // Respuesta del flujo nativo (botones tipo single_select)
    const irm = msg.interactiveResponseMessage
    if (!selectedId && irm && irm.nativeFlowResponseMessage) {
      try {
        const params = JSON.parse(irm.nativeFlowResponseMessage.paramsJson || '{}')
        // Enviamos filas con propiedad `id`, aquí la recuperamos
        if (params && typeof params.id === 'string') selectedId = params.id
        // Algunos clientes envían `selectedId` o `rowId`
        if (!selectedId && typeof params.selectedId === 'string') selectedId = params.selectedId
        if (!selectedId && typeof params.rowId === 'string') selectedId = params.rowId
      } catch {}
    }
    // Respuesta de listas clásicas
    const lrm = msg.listResponseMessage
    if (!selectedId && lrm && lrm.singleSelectReply && lrm.singleSelectReply.selectedRowId) {
      selectedId = lrm.singleSelectReply.selectedRowId
    }
    // Respuesta de botones clásicos (hydrated template)
    const brm = msg.buttonsResponseMessage
    if (!selectedId && brm && typeof brm.selectedButtonId === 'string') {
      selectedId = brm.selectedButtonId
    }
    // Si el id contiene el comando de confirmación, procesar aquí mismo
    if (selectedId && /\bregok\b/i.test(selectedId)) {
      // extraer edad
      let age = NaN
      let m1 = selectedId.match(/regok\s+(\d{1,2})/i)
      if (m1) age = parseInt(m1[1])
      if (isNaN(age)) {
        const m2 = selectedId.match(/(\d{1,2})\b/)
        if (m2) age = parseInt(m2[1])
      }
      if (!isNaN(age) && age >= 10 && age <= 90) {
        // Evitar re-registro
        const num = toNum(m.sender)
        const jidKey = m.sender
        const users = (global.db && global.db.data && global.db.data.users) ? global.db.data.users : {}
        try { mirrorUser(users, num, jidKey) } catch {}
        const existing = users[num] || users[jidKey]
        if (existing && (existing.registered || existing.sn)) {
          const last = regRecent.get(m.sender) || 0
          if (Date.now() - last < 3000) return true
          if (!existing.sn) {
            existing.sn = 'SN-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000)
            try { await saveDatabase() } catch {}
          }
          let displayName = m?.pushName || ''
          try { displayName = (await Promise.resolve(conn.getName?.(m.sender))) || displayName } catch {}
          if (!displayName) displayName = 'Usuario'
          await sendExistingIdCard(conn, m.chat, { participant: m.sender, userName: displayName, existing })
          return true
        }
  // Nombre automático y finalizar
        let autoName = m?.pushName || ''
        try { autoName = (await Promise.resolve(conn.getName?.(m.sender))) || autoName } catch {}
        if (!autoName) autoName = 'Usuario'
        const state = { name: autoName, age, bio: 'Sin bio' }
  // Marcar en progreso para evitar que el handler .regok paralelo envíe la tarjeta de ID
  try { regRecent.set(m.sender, Date.now()) } catch {}
  sessions.delete(key)
        await finalize(m, conn, state, key)
        return true
      }
    }
  } catch {}

  if (!ses) return false
  const text = (m.text || '').trim()
  // Evitar interferir con otros comandos, salvo 'cancel'
  const prefixes = Array.isArray(global.prefixes) && global.prefixes.length ? global.prefixes : ['.', '!', '/']
  const startsWithPrefix = prefixes.some(p => text.startsWith(p))
  if (startsWithPrefix && !/^\.?cancel(ar)?$/i.test(text)) return false

  // Reusar la lógica de pasos
  if (ses.step === 'name') {
    if (!text || text.length < 2 || text.length > 30) {
      await this.reply(m.chat, 'Nombre inválido. Debe tener entre 2 y 30 caracteres.', m)
      return askStep(m, this, 'name'), true
    }
    ses.name = text
    ses.step = 'age'
    return askStep(m, this, 'age'), true
  }
  if (ses.step === 'age') {
    const n = parseInt(text)
    if (isNaN(n) || n < 10 || n > 90) {
      await this.reply(m.chat, 'Edad inválida. Ingresa un número entre 10 y 90.', m)
      return askStep(m, this, 'age'), true
    }
    ses.age = n
    ses.step = 'bio'
    return askStep(m, this, 'bio'), true
  }
  if (ses.step === 'bio') {
    if (!text || text.length > 80) {
      await this.reply(m.chat, 'Bio inválida. Debe tener 1 a 80 caracteres.', m)
      return askStep(m, this, 'bio'), true
    }
    ses.bio = text
    sessions.delete(key)
    await finalize(m, this, ses, key)
    return true
  }
  return false
}

export default handler
