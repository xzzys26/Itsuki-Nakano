let handler = async (m, { conn, text, usedPrefix, command }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})
  const ctxOk = (global.rcanalr || {})

  // ARRAY ESTRICTO - SOLO ESTOS IDs PUEDEN USAR EL BOT
  const strictOwnerNumbers = [
    '16503058299@s.whatsapp.net',
    '5216641784469@s.whatsapp.net'
  ]

  await conn.sendMessage(m.chat, { react: { text: ctxWarn?.react || '⏳', key: m.key } })

  // VERIFICACIÓN ESTRICTA - SOLO LOS IDs DEL ARRAY PUEDEN USAR ESTE COMANDO
  if (!strictOwnerNumbers.includes(m.sender)) {
    await conn.reply(m.chat,
      `╭━━━〔 🚫 𝐀𝐂𝐂𝐄𝐒𝐎 𝐃𝐄𝐍𝐄𝐆𝐀𝐃𝐎 〕━━━⬣
│ ❌ *¡Comando restringido!*
│ 🔒 Solo dueños autorizados pueden usar este comando
│ 👤 Usuario: @${m.sender.split('@')[0]}
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 *Este comando es solo para Itsuki-chan...* (´；ω；\`)`,
      m,
      { mentions: [m.sender] }
    )
    await conn.sendMessage(m.chat, { react: { text: ctxErr?.react || '❌', key: m.key } })
    return
  }

  let responseText = ''

  if (!text || text === 'estado') {
    const chatData = global.db.data.chats[m.chat] || {}
    const isSelfMode = chatData.selfMode || false

    responseText = `╭━━━〔 🔒 𝐌𝐎𝐃𝐎 𝐄𝐗𝐂𝐋𝐔𝐒𝐈𝐕𝐎 〕━━━⬣
│ 📊 *Estado:* ${isSelfMode ? '🟢 ACTIVADO' : '🔴 DESACTIVADO'}
│ 💬 *Grupo:* ${m.chat}
│ 👑 *Dueños autorizados:* ${strictOwnerNumbers.map(n => '@' + n.split('@')[0]).join(', ')}
╰━━━━━━━━━━━━━━━━━━━━━━⬣

*🍙 Comandos disponibles:*
• ${usedPrefix}self on - Activar modo exclusivo
• ${usedPrefix}self off - Desactivar modo exclusivo
• ${usedPrefix}self estado - Ver estado actual

${isSelfMode ? 
  '🔒 *MODO ACTIVADO:* Solo los dueños autorizados pueden usar comandos' : 
  '🔓 *MODO DESACTIVADO:* Todos pueden usar comandos'}`

  } else if (text === 'on' || text === 'activar') {
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    global.db.data.chats[m.chat].selfMode = true

    // ACTIVAR INTERCEPTOR GLOBAL para este chat
    activateGlobalInterceptor(conn, strictOwnerNumbers)

    responseText = `╭━━━〔 🔒 𝐌𝐎𝐃𝐎 𝐄𝐗𝐂𝐋𝐔𝐒𝐈𝐕𝐎 𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎 〕━━━⬣
│ ✅ *Modo exclusivo activado*
│ 🔐 Ahora SOLO dueños autorizados pueden usarme
│ 💬 *En este grupo:* ${m.chat}
│ 👑 Dueños: ${strictOwnerNumbers.map(n => '@' + n.split('@')[0]).join(', ')}
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 *Itsuki-chan ahora solo responde a sus dueños autorizados...* (⁄ ⁄•⁄ω⁄•⁄ ⁄)`

  } else if (text === 'off' || text === 'desactivar') {
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    global.db.data.chats[m.chat].selfMode = false

    responseText = `╭━━━〔 🔓 𝐌𝐎𝐃𝐎 𝐄𝐗𝐂𝐋𝐔𝐒𝐈𝐕𝐎 𝐃𝐄𝐒𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎 〕━━━⬣
│ ❌ *Modo exclusivo desactivado*
│ 🔓 Itsuki-chan responde a todos
│ 💬 *En este grupo:* ${m.chat}
│ 👑 Dueños: ${strictOwnerNumbers.map(n => '@' + n.split('@')[0]).join(', ')}
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🎀 *Itsuki-chan vuelve a responder a todos...* (´･ω･\`)`

  } else {
    responseText = `╭━━━〔 ❌ 𝐄𝐑𝐑𝐎𝐑 〕━━━⬣
│ 🚫 *Comando no reconocido*
╰━━━━━━━━━━━━━━━━━━━━━━⬣

*🍙 Uso correcto:*
• ${usedPrefix}self on - Activar modo exclusivo
• ${usedPrefix}self off - Desactivar modo exclusivo  
• ${usedPrefix}self estado - Ver estado actual`
  }

  await conn.reply(m.chat, responseText, m, {
    mentions: strictOwnerNumbers
  })

  await conn.sendMessage(m.chat, { react: { text: ctxOk?.react || '✅', key: m.key } })
}

// FUNCIÓN PARA ACTIVAR EL INTERCEPTOR GLOBAL
function activateGlobalInterceptor(conn, strictOwnerNumbers) {
  // Guardar referencia original del handler
  if (!global.originalHandler) {
    global.originalHandler = global.handler
  }

  // Sobrescribir el handler global
  global.handler = async (m, { conn: currentConn, usedPrefix, command, ...rest }) => {
    const chatData = global.db.data.chats[m.chat] || {}
    
    // Si el modo self está activado en este chat, verificar acceso
    if (chatData.selfMode && !strictOwnerNumbers.includes(m.sender)) {
      // Bloquear el comando silenciosamente
      await currentConn.sendMessage(m.chat, { 
        
      }).catch(() => {})
      
      // Responder ocasionalmente para no spammear
      if (Math.random() < 0.2) { // 20% de probabilidad
        await currentConn.reply(m.chat,
          `╭━━━〔 🚫 𝐌𝐎𝐃𝐎 𝐄𝐗𝐂𝐋𝐔𝐒𝐈𝐕𝐎 〕━━━⬣
│ ❌ *Comando bloqueado*
│ 🔒 Solo dueños autorizados pueden usarme
│ 👤 Usuario: @${m.sender.split('@')[0]}
╰━━━━━━━━━━━━━━━━━━━━━━⬣`,
          m,
          { mentions: [m.sender] }
        )
      }
      return // Detener ejecución del comando
    }

    // Si pasa la verificación, usar el handler original
    return global.originalHandler(m, { conn: currentConn, usedPrefix, command, ...rest })
  }
}

// INICIALIZAR EL INTERCEPTOR AL CARGAR EL SCRIPT
if (!global.interceptorActivated) {
  const strictOwnerNumbers = [
    '16503058299@s.whatsapp.net',
    '5216641784469@s.whatsapp.net'
  ]
  activateGlobalInterceptor(null, strictOwnerNumbers)
  global.interceptorActivated = true
}

handler.help = ['self']
handler.tags = ['owner']
handler.command = ['self', 'selfmode', 'modoprivado', 'modoitsuki']
handler.owner = true
handler.group = true

export default handler