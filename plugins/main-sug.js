let handler = async (m, { conn, text, usedPrefix, command, isOwner }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})
  const ctxOk = (global.rcanalr || {})

  // COMANDO PARA OBTENER ID DEL GRUPO
  if (text === 'obtenerid' && isOwner) {
    if (!m.isGroup) {
      return conn.reply(m.chat, '❌ Este comando solo funciona en grupos', m, ctxErr)
    }
    return conn.reply(m.chat, 
      `📱 *ID DEL GRUPO*\n\n` +
      `🔍 *ID:* ${m.chat}\n\n` +
      `💡 **Para usar en sugerencias:**\n` +
      `Copia este ID y reemplázalo en el código`,
      m, ctxOk
    )
  }

  // ID DEL GRUPO DE SOPORTE (cambia por tu ID real)
  const supportGroupId = "120363403185670214@g.us" // <- REEMPLAZA CON TU ID

  if (!text) {
    return conn.reply(m.chat, `
📋 **Sistema de Sugerencias**

📝 **Forma correcta de sugerir:**
${usedPrefix + command} [tu sugerencia]

💡 **Ejemplos de sugerencias:**
• ${usedPrefix + command} Podrían agregar más juegos
• ${usedPrefix + command} Sería útil un comando de recordatorios
• ${usedPrefix + command} Me gustaría que tuviera más stickers

🌟 **Tipos de sugerencias:**
✨ Nuevos comandos
🎮 Juegos interactivos
🔧 Mejoras técnicas
📚 Funciones educativas

⚡ **Las sugerencias se envían al grupo de soporte**

👑 *Para creadores:*
${usedPrefix + command} obtenerid
    `.trim(), m, ctxWarn)
  }

  // Información del usuario
  const userName = await conn.getName(m.sender) || 'No disponible'
  const userMention = `@${m.sender.split('@')[0]}`
  const chatType = m.isGroup ? `Grupo: ${await conn.getName(m.chat) || 'Sin nombre'}` : 'Chat privado'

  const suggestionReport = `💡 **NUEVA SUGERENCIA RECIBIDA**

👤 **Usuario:** ${userMention}
🏷️ **Nombre:** ${userName}
💬 **Lugar:** ${chatType}
⭐ **Tipo:** Sugerencia de mejora

📝 **Sugerencia:**
"${text}"

📊 **Estado:** 🟡 Pendiente de revisión
⏰ **Fecha:** ${new Date().toLocaleString()}`

  try {
    // VERIFICAR SI EL BOT ESTÁ EN EL GRUPO DE SOPORTE
    let groupExists = true
    try {
      await conn.groupMetadata(supportGroupId)
    } catch (e) {
      groupExists = false
    }

    if (!groupExists) {
      // Si el bot no está en el grupo, enviar al creador
      const ownerId = "18292605400@s.whatsapp.net" // <- Tu número
      
      await conn.reply(ownerId, 
        `💡 *SUGERENCIA (FALLBACK)*\n\n` +
        `👤 De: ${userName} (${m.sender})\n` +
        `💬 Lugar: ${chatType}\n\n` +
        `📝 Sugerencia:\n"${text}"\n\n` +
        `⚠️ *El bot no está en el grupo de soporte*`,
        null
      )
    } else {
      // ENVIAR SUGERENCIA AL GRUPO DE SOPORTE
      await conn.sendMessage(
        supportGroupId,
        {
          text: suggestionReport,
          contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
              title: '💡 Nueva Sugerencia',
              body: 'Sistema de Mejoras',
              thumbnailUrl: 'https://files.catbox.moe/w491g3.jpg',
              sourceUrl: 'https://whatsapp.com/channel/0029Va9aR1aC6Df52y6yH11y',
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }
      )
    }

    // Notificar al usuario que sugirió
    await conn.reply(m.chat, 
      `✅ *¡Sugerencia enviada con éxito!*\n\n` +
      `📋 *Tu sugerencia ha sido registrada.*\n\n` +
      `💡 **Sugerencia:**\n"${text}"\n\n` +
      `📊 **Estado:** 🟡 En revisión\n` +
      `👥 **Destino:** ${groupExists ? 'Grupo de soporte' : 'Creador directo'}\n\n` +
      `⚡ *Gracias por tu aporte*`,
      m, ctxOk
    )

    // Log en consola
    console.log(`💡 NUEVA SUGERENCIA:
👤 De: ${m.sender} (${userName})
💡 Sugerencia: ${text}
📍 Chat: ${m.chat}
🕒 Hora: ${new Date().toLocaleString()}
📬 Enviado a: ${groupExists ? supportGroupId : 'Creador directo'}
    `)

  } catch (error) {
    console.error('❌ Error al enviar sugerencia:', error)
    
    // ENVIAR DIRECTAMENTE AL CREADOR COMO FALLBACK
    try {
      const ownerId = "51972945994@s.whatsapp.net" // <- Tu número
      await conn.reply(ownerId,
        `💡 *SUGERENCIA (ERROR FALLBACK)*\n\n` +
        `👤 De: ${userName} (${m.sender})\n` +
        `💬 Lugar: ${chatType}\n\n` +
        `📝 Sugerencia:\n"${text}"\n\n` +
        `❌ Error original: ${error.message}`,
        null
      )
      
      await conn.reply(m.chat,
        `✅ *¡Sugerencia enviada!*\n\n` +
        `📋 *Se envió directamente al creador.*\n\n` +
        `💡 **Sugerencia:**\n"${text}"\n\n` +
        `⚠️ *Nota: Hubo un problema con el grupo de soporte*`,
        m, ctxOk
      )
    } catch (fallbackError) {
      await conn.reply(m.chat,
        `❌ *Error crítico*\n\n` +
        `No se pudo enviar tu sugerencia.\n\n` +
        `📝 **Guarda tu sugerencia:**\n"${text}"\n\n` +
        `💡 **Contacta manualmente al creador**`,
        m, ctxErr
      )
    }
  }
}

handler.help = ['sugerir']
handler.tags = ['main']
handler.command = ['sugerencia', 'sugerir', 'idea', 'suggestion', 'propuesta']
handler.private = false
handler.group = true

export default handler