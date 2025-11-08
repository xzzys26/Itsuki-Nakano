import { WAMessageStubType } from '@whiskeysockets/baileys'
import PhoneNumber from 'awesome-phonenumber'
import chalk from 'chalk'
import boxen from 'boxen'
import gradient from 'gradient-string'
import { watchFile } from 'fs'
import { fileURLToPath } from 'url'
import '../config.js'

async function safeGetName(conn, jid) {
  if (!jid || !conn) return jid ? jid.split('@')[0] : ''
  try {
    if (typeof conn.getName === 'function') {
      try {
        const n = conn.getName(jid)
        return typeof n?.then === 'function' ? await n : n
      } catch (e) {
        console.error('Error en conn.getName:', e)
      }
    }
    if (conn.contacts && typeof conn.contacts === 'object' && jid in conn.contacts) {
      const c = conn.contacts[jid]
      if (c) return c.name || c.notify || c.vname || c.short || c.verifiedName || ''
    }
    if (jid.endsWith('@g.us') && typeof conn.groupMetadata === 'function') {
      try {
        const md = await conn.groupMetadata(jid)
        if (md?.subject) return md.subject
      } catch (e) {
        console.error('Error obteniendo metadata del grupo:', e)
      }
    }
    return jid.split('@')[0]
  } catch (e) {
    console.error('Error en safeGetName:', e)
    return jid.split('@')[0]
  }
}

const terminalImage = global.opts?.img ? (await import('terminal-image')).default : null
const urlRegex = (await import('url-regex-safe')).default({ strict: false })
const mid = { idioma_code: 'es' }

export default async function (m, conn = { user: {} }) {
  if (!m) {
    console.error('Mensaje indefinido')
    return
  }
  const now = new Date()
  const dateStr = now.toLocaleDateString('es-ES')
  const timeStr = now.toLocaleTimeString('it-IT', { hour12: false }).slice(0, 8)
  const hour = now.getHours()
  const dayIcon = hour < 6 ? '🌙' : hour < 12 ? '☀️' : hour < 18 ? '🌤️' : '🌙'
  const senderJid = m?.sender || m?.key?.participant || m?.participant || m?.key?.remoteJid || ''
  const chatId = m?.chat || m?.key?.remoteJid || senderJid
  const _name = (await safeGetName(conn, senderJid)) || m?.pushName || 'Anónimo'
  let senderNum = ''
  try {
    senderNum = PhoneNumber('+' + senderJid.replace(/:@.+/, '').replace('@s.whatsapp.net', '')).getNumber('international')
  } catch {
    senderNum = senderJid.split('@')[0]
  }
  const sender = (senderNum || senderJid || 'desconocido') + (_name ? ` ~${_name}` : '')
  const chat = await safeGetName(conn, chatId)
  const user = (global.db?.data?.users && senderJid) ? global.db.data.users[senderJid] : undefined
  let me = ''
  try {
    if (conn?.user?.jid) {
      me = PhoneNumber('+' + conn.user.jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }
  } catch {
    me = conn?.user?.jid?.split?.('@')[0] || 'Bot'
  }
  const grad = gradient(['#FF69B4', '#FFB6C1', '#FFC0CB'])
  const stamp = grad(`🌸 ${dayIcon} ${dateStr} • ${timeStr} 🌸`)
  let filesize = 0
  if (m.msg) {
    if (m.msg.vcard) filesize = m.msg.vcard.length || 0
    else if (m.msg.fileLength) filesize = m.msg.fileLength.low || m.msg.fileLength || 0
    else if (m.msg.axolotlSenderKeyDistributionMessage)
      filesize = m.msg.axolotlSenderKeyDistributionMessage.length || 0
  } else if (m.text) filesize = m.text.length || 0
  const lines = [
    chalk.hex('#FF69B4').bold('╭━━〔 Información del Mensaje 〕━━⬣'),
    `${chalk.hex('#FF69B4').bold('│')} 🤖 ${chalk.white.bold('Bot:')} ${chalk.hex('#FFB6C1')(me + (conn.user.name ? ` ~${conn.user.name}` : ''))}`,
    `${chalk.hex('#FF69B4').bold('│')} 👤 ${chalk.white.bold('Usuario:')} ${chalk.hex('#98FB98')(sender)}`,
    `${chalk.hex('#FF69B4').bold('│')} 💎 ${chalk.white.bold('Premium:')} ${user?.premiumTime > 0 ? chalk.hex('#FFD700')('✅ Sí') : chalk.hex('#FF6B6B')('❌ No')}`,
    `${chalk.hex('#FF69B4').bold('│')} 💬 ${chalk.white.bold('Chat:')} ${chat.includes('@g.us') ? '👥 Grupo' : '📩 Privado'}`,
    `${chalk.hex('#FF69B4').bold('│')} 📄 ${chalk.white.bold('Tipo:')} ${chalk.hex('#DDA0DD')(await formatMessageTypes(m.mtype))}`,
    `${chalk.hex('#FF69B4').bold('│')} 📦 ${chalk.white.bold('Tamaño:')} ${chalk.hex('#FFD700')(filesize + ' Bytes')}`,
    chalk.hex('#FF69B4').bold('╰━━━━━━━━━━━━━━━━━━━━━━⬣')
  ]
  console.log(
    boxen(lines.join('\n'), {
      title: stamp,
      titleAlignment: 'center',
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: '#FF69B4',
    })
  )
  let img
  try {
    if (global.opts?.img && terminalImage && /sticker|image/gi.test(m.mtype)) {
      img = await terminalImage.buffer(await m.download())
    }
  } catch (e) {
    console.error('Error mostrando imagen:', e)
  }
  if (img) console.log(img.trimEnd())
  if (typeof m.text === 'string' && m.text) {
    let log = m.text.replace(/\u200e+/g, '')
    log = log.split('\n').map(line => line.trim().startsWith('>') ? chalk.bgHex('#FFB6C1').dim.black(line.replace(/^>/, '  ›')) : line).join('\n')
    if (log.length < 1024) {
      try {
        log = log.replace(urlRegex, (url) => chalk.hex('#87CEEB').underline(url))
      } catch (e) {
        console.error('Error procesando URLs:', e)
      }
    }
    if (Array.isArray(m.mentionedJid)) {
      for (let jid of m.mentionedJid.filter(Boolean)) {
        try {
          const display = await safeGetName(conn, jid)
          const bare = jid.split('@')[0]
          log = log.replace('@' + bare, chalk.hex('#DDA0DD').bold('@' + (display || bare)))
        } catch (e) {
          console.error('Error procesando mención:', e)
        }
      }
    }
    const messageBox = boxen(log, {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      margin: { top: 0, bottom: 1, left: 2, right: 0 },
      borderStyle: 'round',
      borderColor: m.error != null ? '#FF6B6B' : m.isCommand ? '#FFD700' : '#98FB98',
      dimBorder: true
    })
    console.log(messageBox)
  }
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => { 
  console.log(chalk.hex('#FF69B4').bold('╭────────────────────────────────···'))
  console.log(chalk.hex('#FF69B4').bold('│') + chalk.hex('#FFB6C1')(' 🌸 Update ') + chalk.white.bold("'lib/print.js'") + chalk.hex('#FFB6C1')(' - Itsuki Nakano IA 🌸'))
  console.log(chalk.hex('#FF69B4').bold('╰───────────────────···'))
})

async function formatMessageTypes(messageStubType) {
  switch (messageStubType) {
    case 'conversation': return '💬 Conversación'
    case 'imageMessage': return '🖼️ Imagen'
    case 'contactMessage': return '👤 Contacto'
    case 'locationMessage': return '📍 Ubicación'
    case 'extendedTextMessage': return '📄 Texto'
    case 'documentMessage': return '📎 Documento'
    case 'audioMessage': return '🎵 Audio'
    case 'videoMessage': return '🎥 Video'
    case 'call': return '📞 Llamada'
    case 'chat': return '💭 Chat'
    case 'protocolMessage': return '🔒 Cifrado'
    case 'stickerMessage': return '🎭 Sticker'
    case 'interactiveMessage': return '🎮 Interactivo'
    case 'reactionMessage': return '❤️ Reacción'
    case 'viewOnceMessage': return '👀 Mensaje de una sola vez'
    case 'ephemeralMessage': return '⏳ Efímero'
    case 'editedMessage': return '✏️ Editado'
    case 'buttonsMessage': return '🔘 Botones'
    case 'listMessage': return '📜 Lista'
    case 'pollCreationMessage': return '📊 Encuesta'
    case 'viewOnceMessageV2': return '👁️ Una sola vista v2'
    default: return messageStubType ? `📄 ${messageStubType}` : '❓ No especificado'
  }
}