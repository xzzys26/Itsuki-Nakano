let handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})
  const ctxOk = (global.rcanalr || {})

  if (!m.isGroup) {
    return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m, ctxErr)
  }

  if (!isAdmin && !isBotAdmin) {
    return conn.reply(m.chat, '⚠️ Necesito ser administradora para generar el enlace.', m, ctxErr)
  }

  try {
    await conn.reply(m.chat, '🔗 Generando enlace del grupo...', m, ctxOk)

    // Obtener información del grupo
    const groupMetadata = await conn.groupMetadata(m.chat)
    const groupCode = await conn.groupInviteCode(m.chat)
    const inviteLink = `https://chat.whatsapp.com/${groupCode}`
    const groupName = groupMetadata.subject || 'Sin nombre'
    const participantsCount = groupMetadata.participants.length
    const groupDescription = groupMetadata.desc || 'Sin descripción'

    // Crear mensaje con el enlace y botones
    const linkMessage = `
🔗 *ENLACE DEL GRUPO*

📝 *Nombre:* ${groupName}
👥 *Miembros:* ${participantsCount} participantes
📋 *Descripción:* ${groupDescription}

🔗 *Enlace de invitación:*
${inviteLink}

💡 *Para invitar:*
• Comparte este enlace con quien quieras invitar
• El enlace es válido permanentemente
• Puedes revocarlo creando uno nuevo

⚠️ *Nota:* Solo comparte este enlace con personas de confianza.
    `.trim()

    // Enviar el mensaje con botones
    await conn.sendMessage(m.chat, {
      text: linkMessage,
      templateButtons: [
        {
          index: 1,
          urlButton: {
            displayText: '📱 ABRIR GRUPO',
            url: inviteLink
          }
        },
        {
          index: 2,
          quickReplyButton: {
            displayText: '📋 COPIAR ENLACE',
            id: `.copiar ${inviteLink}`
          }
        },
        {
          index: 3,
          quickReplyButton: {
            displayText: '🔄 RENOVAR ENLACE',
            id: '.renewlink'
          }
        }
      ]
    }, { quoted: m })

    // También enviar el enlace como texto simple por si fallan los botones
    await conn.sendMessage(m.chat, {
      text: `📲 *Enlace directo para copiar:*\n\`\`\`${inviteLink}\`\`\``
    }, { quoted: m })

    // Log en consola
    console.log(`🔗 ENLACE GENERADO:
🏷️ Grupo: ${groupName}
👥 Miembros: ${participantsCount}
🔗 Enlace: ${inviteLink}
👤 Solicitado por: ${m.sender}
🕒 Hora: ${new Date().toLocaleString()}
    `)

  } catch (error) {
    console.error('❌ Error generando enlace:', error)

    let errorMessage = '❌ Error al generar el enlace\n\n'

    if (error.message.includes('not authorized')) {
      errorMessage += 'No tengo permisos para generar el enlace.\n'
      errorMessage += 'Asegúrate de que soy administradora del grupo.'
    } else if (error.message.includes('group invite')) {
      errorMessage += 'Error al crear el código de invitación.\n'
      errorMessage += 'Intenta nuevamente en unos minutos.'
    } else {
      errorMessage += `Detalle: ${error.message}`
    }

    await conn.reply(m.chat, errorMessage, m, ctxErr)
  }
}

// Comando para copiar el enlace (cuando se presiona el botón)
let copyHandler = async (m, { conn, text }) => {
  const ctxOk = (global.rcanalr || {})

  const linkToCopy = text.trim()

  if (!linkToCopy) {
    return conn.reply(m.chat, '❌ No se proporcionó ningún enlace para copiar.', m)
  }

  await conn.reply(m.chat, 
    `📋 *ENLACE COPIADO*
    
🔗 *Enlace:*
\`\`\`${linkToCopy}\`\`\`

✅ *Ahora puedes pegarlo donde quieras compartirlo*

💡 *Consejo:* Mantén presionado el texto para copiarlo`,
    m, ctxOk
  )
}

// Comando adicional para renovar el enlace
let renewHandler = async (m, { conn, isAdmin, isBotAdmin }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})
  const ctxOk = (global.rcanalr || {})

  if (!m.isGroup) {
    return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m, ctxErr)
  }

  if (!isAdmin && !isBotAdmin) {
    return conn.reply(m.chat, '⚠️ Necesito ser administradora para renovar el enlace.', m, ctxErr)
  }

  try {
    await conn.reply(m.chat, '🔄 Renovando enlace del grupo...', m, ctxOk)

    // Revocar el enlace antiguo y crear uno nuevo
    await conn.groupRevokeInvite(m.chat)
    const newCode = await conn.groupInviteCode(m.chat)
    const newInviteLink = `https://chat.whatsapp.com/${newCode}`
    const groupName = (await conn.groupMetadata(m.chat)).subject || 'Sin nombre'

    // Enviar mensaje con botones para el nuevo enlace
    await conn.sendMessage(m.chat, {
      text: `🔄 *ENLACE RENOVADO*

✅ Se ha generado un nuevo enlace para el grupo.
🔗 El enlace anterior ha sido revocado.

📝 *Grupo:* ${groupName}
🔗 *Nuevo enlace:*
${newInviteLink}

⚠️ *Importante:*
• El enlace anterior ya no funcionará
• Debes compartir este nuevo enlace
• Los miembros actuales no se verán afectados`,
      templateButtons: [
        {
          index: 1,
          urlButton: {
            displayText: '📱 ABRIR NUEVO GRUPO',
            url: newInviteLink
          }
        },
        {
          index: 2,
          quickReplyButton: {
            displayText: '📋 COPIAR NUEVO ENLACE',
            id: `.copiar ${newInviteLink}`
          }
        }
      ]
    }, { quoted: m })

    console.log(`🔄 ENLACE RENOVADO:
🏷️ Grupo: ${groupName}
🔗 Nuevo enlace: ${newInviteLink}
👤 Solicitado por: ${m.sender}
    `)

  } catch (error) {
    console.error('❌ Error renovando enlace:', error)
    await conn.reply(m.chat, 
      `❌ Error al renovar el enlace: ${error.message}`,
      m, ctxErr
    )
  }
}

// Configurar los handlers principales
handler.help = ['link', 'enlace', 'invitelink']
handler.tags = ['group']
handler.command = ['link', 'enlace', 'invitelink', 'grupolink']
handler.group = true
handler.admin = false
handler.botAdmin = true

// Configurar handler para copiar
copyHandler.help = ['copiar']
copyHandler.tags = ['tools']
copyHandler.command = ['copiar', 'copy']
copyHandler.private = true

// Configurar handler para renovar
renewHandler.help = ['renewlink', 'renovarlink']
renewHandler.tags = ['group']
renewHandler.command = ['renewlink', 'renovarlink', 'nuevolink']
renewHandler.group = true
renewHandler.admin = false
renewHandler.botAdmin = true

// Exportar todos los comandos
export {
  renewHandler as renewlink,
  copyHandler as copiar
}

export default handler
