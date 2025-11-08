import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})
  const ctxOk = (global.rcanalr || {})

  // ID DEL GRUPO DE SOPORTE
  const supportGroupId = "120363403185670214@g.us"

  if (!text) {
    return conn.reply(m.chat, `
📋 **Sistema de Reportes**

📝 **Forma correcta de reportar:**
${usedPrefix + command} [descripción del error]

💡 **Ejemplos:**
• ${usedPrefix + command} El comando !menu no funciona
• ${usedPrefix + command} El bot no responde a !play
• ${usedPrefix + command} Error en el comando !sticker

⚡ **Los reportes se envían al grupo de soporte**
    `.trim(), m, ctxWarn)
  }

  // Información del usuario
  const userName = await conn.getName(m.sender) || 'No disponible'
  const userMention = `@${m.sender.split('@')[0]}`
  const chatType = m.isGroup ? `Grupo: ${await conn.getName(m.chat) || 'Sin nombre'}` : 'Chat privado'
  const commandUsed = m.text.split(' ')[0] || 'N/A'

  const fullReport = `📨 **NUEVO REPORTE RECIBIDO**

👤 **Usuario:** ${userMention}
🏷️ **Nombre:** ${userName}
💬 **Lugar:** ${chatType}
🔧 **Comando usado:** ${commandUsed}

🐛 **Error Reportado:**
${text}

⏰ **Fecha:** ${new Date().toLocaleString()}

📊 **Estado:** 🟡 Pendiente de revisión`

  try {
    // ENVIAR REPORTE AL GRUPO DE SOPORTE
    await conn.sendMessage(
      supportGroupId,  // ID del grupo de soporte
      {
        text: fullReport,
        contextInfo: {
          mentionedJid: [m.sender],
          externalAdReply: {
            title: '🐛 Nuevo Reporte',
            body: 'Sistema de Reportes',
            thumbnailUrl: 'https://files.catbox.moe/w491g3.jpg',
            sourceUrl: 'https://chat.whatsapp.com/CYKX0ZR6pWMHCXgBgVoTGA',
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }
    )

    // Notificar al usuario que reportó
    await conn.reply(m.chat, 
      `✅ *¡Reporte enviado con éxito!*\n\n` +
      `📋 *Tu reporte ha sido enviado al grupo de soporte.*\n\n` +
      `🎯 **Estado:** 📝 En revisión\n` +
      `👥 **Enviado a:** Grupo de soporte\n\n` +
      `⚡ *El equipo lo revisará pronto*`,
      m, ctxOk
    )

    // Log en consola
    console.log(`📨 REPORTE ENVIADO AL GRUPO DE SOPORTE:
👤 De: ${m.sender} (${userName})
📝 Error: ${text}
📍 Chat: ${m.chat}
📬 Grupo Soporte: ${supportGroupId}
    `)

  } catch (error) {
    console.error('❌ Error al enviar reporte:', error)
    await conn.reply(m.chat, 
      `❌ *¡Error al enviar el reporte!*\n\n` +
      `No pude enviar el reporte al grupo de soporte.\n\n` +
      `🔧 **Detalle:** ${error.message}\n` +
      `📝 **Intenta nuevamente en unos minutos**`,
      m, ctxErr
    )
  }
}

handler.help = ['reporte']
handler.tags = ['main']
handler.command = ['reporte', 'report', 'bug', 'error', 'reportar']
handler.private = false
handler.group = true

export default handler