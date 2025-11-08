// 🌸 Itsuki Nakano IA - Sistema Antilink Ultra Fuerte (versión corregida)

let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isBotAdmin }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})
  const ctxOk = (global.rcanalr || {})

  if (!m.isGroup) return conn.reply(m.chat, '❌ Solo puedo usarse en grupos.', m, ctxErr)
  if (!isAdmin) return conn.reply(m.chat, '⚠️ Solo los administradores pueden usar este comando.', m, ctxErr)

  const action = args[0]?.toLowerCase()
  if (!global.antilinkStatus) global.antilinkStatus = {}

  if (!action) {
    return conn.reply(m.chat, `
╭━━━〔 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊-𝐍𝐊 🖇️🚫 〕━━━⬣
┃ ➡️ ${usedPrefix}antilink on      → Activar
┃ ➡️ ${usedPrefix}antilink off     → Desactivar
┃ ➡️ ${usedPrefix}antilink status  → Estado
╰━━━━━━━━━━━━━━⬣

> ⚡ *Versión v2 Actualizada* – Protección inteligente con detección avanzada.
    `.trim(), m, ctxWarn)
  }

  switch (action) {
    case 'on':
    case 'activar':
      global.antilinkStatus[m.chat] = true
      await conn.reply(m.chat, '🛡️ 𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊 𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎 ✅️', m, ctxOk)
      break

    case 'off':
    case 'desactivar':
      // Eliminar la entrada para evitar confusiones (asi el before la considerará desactivada)
      if (global.antilinkStatus && typeof global.antilinkStatus[m.chat] !== 'undefined') {
        delete global.antilinkStatus[m.chat]
      }
      await conn.reply(m.chat, '🔓 𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊 𝐃𝐄𝐒𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎 ❌', m, ctxWarn)
      break

    case 'status':
    case 'estado':
      const status = (global.antilinkStatus && global.antilinkStatus[m.chat]) ? '🟢 𝐀𝐂𝐓𝐈𝐕𝐎' : '🔴 𝐃𝐄𝐒𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎'
      await conn.reply(m.chat, `🔰 Estado del Antilink: ${status}`, m, ctxOk)
      break

    default:
      await conn.reply(m.chat, '❌ Opción no válida.', m, ctxErr)
  }
}

// 🌸 Detector Antilink Activo (antes del handler)
handler.before = async (m, { conn, isAdmin, isBotAdmin }) => {
  try {
    if (m.isBaileys || !m.isGroup) return
    if (!global.antilinkStatus || !global.antilinkStatus[m.chat]) return

    const messageText = m.text || m.caption || ''
    if (!messageText) return

    // PATRONES MÁS FUERTES Y COMPLETOS (restaurados)
    const linkPatterns = [
      /https?:\/\/[^\s]*/gi,
      /www\.[^\s]*/gi,
      /[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?/gi,
      /wa\.me\/[0-9]+/gi,
      /chat\.whatsapp\.com\/[A-Za-z0-9]+/gi,
      /t\.me\/[^\s]*/gi,
      /instagram\.com\/[^\s]*/gi,
      /facebook\.com\/[^\s]*/gi,
      /youtube\.com\/[^\s]*/gi,
      /youtu\.be\/[^\s]*/gi,
      /twitter\.com\/[^\s]*/gi,
      /x\.com\/[^\s]*/gi,
      /discord\.gg\/[^\s]*/gi,
      /tiktok\.com\/[^\s]*/gi,
      /bit\.ly\/[^\s]*/gi,
      /tinyurl\.com\/[^\s]*/gi,
      /goo\.gl\/[^\s]*/gi,
      /ow\.ly\/[^\s]*/gi,
      /buff\.ly\/[^\s]*/gi,
      /adf\.ly\/[^\s]*/gi,
      /shorte\.st\/[^\s]*/gi,
      /snip\.ly\/[^\s]*/gi,
      /cutt\.ly\/[^\s]*/gi,
      /is\.gd\/[^\s]*/gi,
      /v\.gd\/[^\s]*/gi,
      /cli\.gs\/[^\s]*/gi,
      /bc\.vc\/[^\s]*/gi,
      /tr\.im\/[^\s]*/gi,
      /prettylink\.pro\/[^\s]*/gi,
      /[a-zA-Z0-9-]+\.blogspot\.[^\s]*/gi,
      /[a-zA-Z0-9-]+\.wordpress\.[^\s]*/gi,
      /[a-zA-Z0-9-]+\.weebly\.[^\s]*/gi,
      /[a-zA-Z0-9-]+\.wixsite\.[^\s]*/gi,
      /[a-zA-Z0-9-]+\.webnode\.[^\s]*/gi,
      /[a-zA-Z0-9-]+\.000webhostapp\.[^\s]*/gi,
      /[a-zA-Z0-9-]+\.github\.io\/[^\s]*/gi,
      /[a-zA-Z0-9-]+\.netlify\.app\/[^\s]*/gi,
      /[a-zA-Z0-9-]+\.herokuapp\.com\/[^\s]*/gi,
      /[a-zA-Z0-9-]+\.glitch\.me\/[^\s]*/gi,
      /[a-zA-Z0-9-]+\.repl\.co\/[^\s]*/gi,
      /[a-zA-Z0-9-]+\.vercel\.app\/[^\s]*/gi,
      /[a-zA-Z0-9-]+\.surge\.sh\/[^\s]*/gi,
      /[a-zA-Z0-9-]+\.pages\.dev\/[^\s]*/gi,
      /[a-zA-Z0-9-]+\.onrender\.com\/[^\s]*/gi,
      /[a-zA-Z0-9-]+\.railway\.app\/[^\s]*/gi,
      /[a-zA-Z0-9-]+\.fly\.dev\/[^\s]*/gi
    ]

    let hasLink = false
    let detectedLink = ''

    for (const pattern of linkPatterns) {
      const matches = messageText.match(pattern)
      if (matches && matches.length > 0) {
        hasLink = true
        detectedLink = matches[0]
        break
      }
    }

    // Detectar IPs también
    const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/gi
    if (!hasLink && ipPattern.test(messageText)) {
      hasLink = true
      detectedLink = 'Dirección IP detectada'
    }

    if (!hasLink) return
    if (isAdmin) return
    if (m.sender === conn.user.jid) return

    // Envío de alerta (formato Itsuki)
    await conn.sendMessage(m.chat, { 
      text: `> 💢 𝐄𝐍𝐋𝐀𝐂𝐄 𝐃𝐄𝐓𝐄𝐂𝐓𝐀𝐃𝐎 @${m.sender.split('@')[0]} ⚠️ 𝐄𝐗𝐏𝐔𝐋𝐒𝐈𝐎́𝐍 𝐈𝐍𝐌𝐄𝐃𝐈𝐀𝐓𝐀`,
      mentions: [m.sender]
    })

    // Borrar mensaje (si tiene permisos)
    if (isBotAdmin && m.key) {
      try {
        await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: m.sender } })
      } catch (e) { /* no bloquear si falla */ }
    }

    // Expulsar (si tiene permisos)
    if (isBotAdmin) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      } catch (e) { /* log en consola */ console.error('Expulsión fallida:', e) }
    }

  } catch (err) {
    console.error('Error en antilink.before:', err)
  }
}

handler.help = ['antilink']
handler.tags = ['group']
handler.command = ['antilink', 'antienlace']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler