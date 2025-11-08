
// Sistema de mensajería privada para owners
// Permite enviar mensajes a usuarios y recibir respuestas automáticamente

// Base de datos global para conversaciones activas
global.activeConversations = global.activeConversations || new Map()

export default async function (m, { conn, text, usedPrefix, command, isOwner, isROwner }) {
  // Solo owners pueden usar este comando
  if (!isOwner && !isROwner) return m.reply('❌ Solo los owners pueden usar este comando')
  
  if (!text) {
    return m.reply(`📝 *Uso del comando:*

${usedPrefix + command} <número> <mensaje>

*Ejemplos:*
• ${usedPrefix + command} 5959999999 Hola, ¿cómo estás?
• ${usedPrefix + command} +595999999 Mensaje de prueba

*Nota:* El usuario podrá responder sin comandos y sus mensajes te llegarán automáticamente.`)
  }

  // Parsear el texto para obtener número y mensaje
  const args = text.split(' ')
  if (args.length < 2) {
    return m.reply('❌ Debes especificar un número y un mensaje')
  }

  const targetNumber = args[0]
  const message = args.slice(1).join(' ')

  // Normalizar el número
  let targetJid
  try {
    let cleanNumber = targetNumber.replace(/[^0-9]/g, '')
    if (!cleanNumber.startsWith('595') && !cleanNumber.startsWith('1') && !cleanNumber.startsWith('51') && !cleanNumber.startsWith('52')) {
      // Si no tiene código de país, asumir Paraguay (+595)
      cleanNumber = '595' + cleanNumber
    }
    targetJid = cleanNumber + '@s.whatsapp.net'
  } catch (error) {
    return m.reply('❌ Número inválido')
  }

  try {
    // Verificar si el número existe en WhatsApp
    const [result] = await conn.onWhatsApp(targetJid)
    if (!result?.exists) {
      return m.reply('❌ Este número no está registrado en WhatsApp')
    }

    // Enviar el mensaje al usuario
    await conn.sendMessage(targetJid, { 
      text: `📩 *Mensaje del administrador:*\n\n${message}\n\n_Puedes responder a este mensaje normalmente_` 
    })

    // Registrar la conversación activa
    global.activeConversations.set(targetJid, {
      ownerJid: m.sender,
      startTime: Date.now(),
      lastActivity: Date.now()
    })

    // Confirmar al owner
    m.reply(`✅ *Mensaje enviado exitosamente*

👤 *Usuario:* ${targetNumber}
📝 *Mensaje:* ${message}
⏰ *Enviado:* ${new Date().toLocaleString()}

_La conversación está activa. Sus respuestas te llegarán automáticamente._`)

  } catch (error) {
    console.error('Error sending message:', error)
    m.reply('❌ Error al enviar el mensaje. Verifica que el número sea válido.')
  }
}

// Función para manejar respuestas automáticas (se ejecuta antes de otros comandos)
export async function before(m, { conn }) {
  // Solo procesar mensajes de usuarios (no grupos, no del bot)
  if (m.isGroup || m.fromMe || !m.sender) return
  
  // Verificar si hay una conversación activa con este usuario
  const conversation = global.activeConversations.get(m.sender)
  if (!conversation) return

  // Actualizar última actividad
  conversation.lastActivity = Date.now()

  // Verificar que el owner aún esté activo (conversación no muy antigua)
  const hoursSinceStart = (Date.now() - conversation.startTime) / (1000 * 60 * 60)
  if (hoursSinceStart > 24) {
    // Limpiar conversación antigua
    global.activeConversations.delete(m.sender)
    return
  }

  try {
    // Obtener info del usuario
    const userName = m.pushName || 'Usuario'
    const userNumber = m.sender.split('@')[0]
    
    // Preparar el mensaje para el owner
    let forwardMessage = `📨 *Respuesta de usuario*\n\n`
    forwardMessage += `👤 *De:* ${userName} (${userNumber})\n`
    forwardMessage += `⏰ *Hora:* ${new Date().toLocaleString()}\n\n`

    // Verificar el tipo de mensaje y preparar contenido
    if (m.mtype === 'conversation' || m.mtype === 'extendedTextMessage') {
      // Mensaje de texto
      forwardMessage += `💬 *Mensaje:*\n${m.text}`
      await conn.sendMessage(conversation.ownerJid, { text: forwardMessage })
    } 
    else if (m.mtype === 'imageMessage') {
      // Imagen
      forwardMessage += `🖼️ *Imagen enviada*`
      const media = await m.download()
      await conn.sendMessage(conversation.ownerJid, { 
        image: media, 
        caption: forwardMessage + (m.text ? `\n\n📝 *Texto:* ${m.text}` : '')
      })
    }
    else if (m.mtype === 'videoMessage') {
      // Video
      forwardMessage += `🎥 *Video enviado*`
      const media = await m.download()
      await conn.sendMessage(conversation.ownerJid, { 
        video: media, 
        caption: forwardMessage + (m.text ? `\n\n📝 *Texto:* ${m.text}` : '')
      })
    }
    else if (m.mtype === 'audioMessage' || m.mtype === 'pttMessage') {
      // Audio o nota de voz
      forwardMessage += `🎵 *Audio/Nota de voz enviada*`
      const media = await m.download()
      await conn.sendMessage(conversation.ownerJid, { 
        audio: media, 
        mimetype: 'audio/mpeg',
        caption: forwardMessage,
        ptt: m.mtype === 'pttMessage'
      })
    }
    else if (m.mtype === 'documentMessage') {
      // Documento
      forwardMessage += `📄 *Documento enviado*`
      const media = await m.download()
      await conn.sendMessage(conversation.ownerJid, { 
        document: media,
        caption: forwardMessage,
        mimetype: m.msg.mimetype || 'application/octet-stream',
        fileName: m.msg.fileName || 'documento'
      })
    }
    else if (m.mtype === 'stickerMessage') {
      // Sticker
      forwardMessage += `🏷️ *Sticker enviado*`
      const media = await m.download()
      await conn.sendMessage(conversation.ownerJid, { text: forwardMessage })
      await conn.sendMessage(conversation.ownerJid, { sticker: media })
    }
    else {
      // Otros tipos de mensaje
      forwardMessage += `📎 *Mensaje multimedia enviado*\nTipo: ${m.mtype}`
      await conn.sendMessage(conversation.ownerJid, { text: forwardMessage })
    }

  } catch (error) {
    console.error('Error forwarding message:', error)
  }

  // Evitar que el mensaje sea procesado por otros comandos
  return true
}

export const command = ['sendmsg', 'enviar', 'msg']
export const tags = ['owner']
export const help = ['sendmsg <número> <mensaje>']
export const rowner = true