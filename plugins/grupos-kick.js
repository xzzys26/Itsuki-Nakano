import fetch from 'node-fetch'

async function makeFkontak() {
  try {
    const res = await fetch('https://i.postimg.cc/rFfVL8Ps/image.jpg')
    const thumb2 = Buffer.from(await res.arrayBuffer())
    return {
      key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
      message: { locationMessage: { name: 'Expulsar', jpegThumbnail: thumb2 } },
      participant: '0@s.whatsapp.net'
    }
  } catch {
    return undefined
  }
}

let handler = async (m, { conn, text, participants, parseUserTargets, getUserInfo, isAdmin, isBotAdmin }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})
  const ctxOk = (global.rcanalr || {})

  if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m, ctxErr)
  if (!isAdmin) return conn.reply(m.chat, '⚠️ Necesitas ser administrador para usar este comando.', m, ctxErr)
  if (!isBotAdmin) return conn.reply(m.chat, '⚠️ Necesito permisos de administrador para expulsar.', m, ctxErr)

  if (!m.mentionedJid?.length && !m.quoted && !text?.trim()) {
    return conn.reply(m.chat, `
📝 **Uso del comando:**

• kick @usuario
• kick (respondiendo a un mensaje)
• kick 123456789 (número específico)
    `.trim(), m, ctxWarn)
  }

  let targets = []
  try {
    targets = await parseUserTargets(m, text, participants, conn)
  } catch {}

  if (Array.isArray(targets) && targets.length > 1) targets = [targets[0]]
  if (!targets.length) return conn.reply(m.chat, '❌ No pude identificar al usuario.', m, ctxErr)

  const target = targets[0]

  if (target === m.sender) return conn.reply(m.chat, '❌ No puedes expulsarte a ti mismo.', m, ctxErr)
  if (target === conn.user.jid) return conn.reply(m.chat, '❌ No puedo expulsarme a mí misma.', m, ctxErr)

  const info = await getUserInfo(target, participants, conn)
  if (!info.exists) return conn.reply(m.chat, '❌ Este usuario ya no está en el grupo.', m, ctxErr)
  if (info.isAdmin || info.isSuperAdmin) return conn.reply(m.chat, '❌ No puedo expulsar a otro administrador.', m, ctxErr)

  let newName = info.name || target.split('@')[0]

  await conn.reply(m.chat, '*⏳ Expulsando usuario...*', m, ctxWarn)

  try {
    await conn.groupParticipantsUpdate(m.chat, [target], 'remove')
    
    await conn.reply(m.chat, 
      `✅ *Usuario expulsado*\n\n` +
      `👤 *Usuario:* ${newName}\n` +
      `👑 *Expulsado por:* @${m.sender.split('@')[0]}`,
      m,
      { mentions: [m.sender, target] }
    )
  } catch (e) {
    return conn.reply(m.chat, 
      `❌ Error al expulsar: ${e?.message || e}`,
      m, ctxErr
    )
  }
}

handler.help = ['kick']
handler.tags = ['group']
handler.command = ['kick', 'ban', 'expulsar']
handler.group = true
handler.user = true
handler.botAdmin = true

export default handler