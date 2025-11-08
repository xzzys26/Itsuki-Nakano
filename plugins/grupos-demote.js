/*
██████╗░██╗░░░██╗███████╗███████╗
██╔══██╗╚██╗░██╔╝╚════██║██╔════╝
██████╔╝░╚████╔╝░░░███╔═╝█████╗░░
██╔══██╗░░╚██╔╝░░██╔══╝░░██╔══╝░░
██║░░██║░░░██║░░░███████╗███████╗
╚═╝░░╚═╝░░░╚═╝░░░╚══════╝╚══════╝
Creado - By AyeitsRyze
Contacto - https://wa.me/+15614809253
Copyright 2025 - All rights reserved

Comando: Demote (quitar admin)
*/

async function makeFkontak() {
  try {
    const res = await fetch('https://i.postimg.cc/rFfVL8Ps/image.jpg')
    const thumb2 = Buffer.from(await res.arrayBuffer())
    return {
      key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
      message: { locationMessage: { name: 'Demote', jpegThumbnail: thumb2 } },
      participant: '0@s.whatsapp.net'
    }
  } catch {
    return null
  }
}

const handler = async (m, { conn, text, participants, parseUserTargets, getUserInfo, isAdmin, isBotAdmin }) => {
  try {
    if (!m.isGroup) throw new Error('Este comando solo funciona en grupos.')

    if (!m.mentionedJid?.length && !m.quoted && !text?.trim()) {
      const ctxInfo = (global.rcanal || {})
      return conn.reply(m.chat, `
🛠️ ǫᴜɪᴛᴀʀ ᴀᴅᴍɪɴ (ᴅᴇᴍᴏᴛᴇ)

ᴜsᴏ:
• ᴅᴇᴍᴏᴛᴇ @ᴜsᴜᴀʀɪᴏ – ᴍᴇɴᴄɪᴏɴᴀʀ ᴜsᴜᴀʀɪᴏ ᴏ 
• ᴅᴇᴍᴏᴛᴇ (ʀᴇsᴘᴏɴᴅᴇʀ ᴍᴇɴsᴀᴊᴇ) – ᴛᴀʀɢᴇᴛ ᴅᴇʟ ᴍᴇɴsᴀᴊᴇ ᴄɪᴛᴀᴅᴏ

      `, m, ctxInfo)
    }

  const ctxErr = (global.rcanalx || {})
  const ctxOk = (global.rcanalr || {})
  if (!isBotAdmin) return conn.reply(m.chat, '❌ Necesito admin para quitar admin.', m, ctxErr)
  if (!isAdmin) return conn.reply(m.chat, '❌ Debes ser admin para usar este comando.', m, ctxErr)

  let targets = await parseUserTargets(m, text, participants, conn)
  if (Array.isArray(targets) && targets.length > 1) targets = [targets[0]]
    if (!targets.length) {
      return conn.reply(m.chat, '❌ No se encontraron usuarios válidos para procesar.', m, ctxErr)
    }

    const results = []
    for (const t of targets) {
      const info = await getUserInfo(t, participants, conn)
      results.push(info)
    }

    const fkontak = await makeFkontak().catch(() => null)

    const lines = []
    const mentionJids = []

    for (const user of results) {
      const badges = []
      if (user.isSuperAdmin) badges.push('Creador')
      else if (user.isAdmin) badges.push('ADMIN')
      else if (user.exists) badges.push('MIEMBRO')
      if (!user.exists) badges.push('NO EN GRUPO')

      let status = '⏭️ Sin cambios'

      if (!user.exists) {
        status = '⚠️ No pertenece al grupo'
      } else if (user.isSuperAdmin) {
        status = '🚫 No puedo quitar admin al creador'
      } else if (!user.isAdmin) {
        status = 'ℹ️ Ya no es admin'
      } else {
        try {
          await conn.groupParticipantsUpdate(m.chat, [user.jid], 'demote')
          status = `${global.emoji2} Ahora es Miembro`
        } catch (e) {
          status = '❌ Error: ' + (e?.message || 'No se pudo')
        }
      }

      lines.push(`• ${user.name} (@${user.number})\n   🏷️ ${badges.join(', ') || '—'}\n   ${status}`)
      mentionJids.push(user.jid)
    }

    const summary = `*🧰 Demote ejecutado*\n\n${lines.join('\n\n')}`

    try {
      const optsOk = { ...(ctxOk || {}), mentions: mentionJids }
      await conn.reply(m.chat, summary, fkontak || m, optsOk)
    } catch {
      const optsErr = { ...(ctxErr || {}), mentions: mentionJids }
      await conn.reply(m.chat, summary, fkontak || m, optsErr)
    }

  } catch (error) {
    console.error('Error en admin-demote:', error)
    conn.reply(m.chat, '❌ Error al ejecutar demote: ' + error.message, m, (global.rcanalx || {}))
  }
}

handler.help = ['demote', 'degradar', 'quitaradmin']
handler.tags = ['group']
handler.command = /^(demote|degradar|quitaradmin)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler

