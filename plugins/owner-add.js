let handler = async (m, { conn, text, isBotAdmin, isAdmin }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})
  const ctxOk = (global.rcanalr || {})

  if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m, ctxErr)
  if (!isAdmin) return conn.reply(m.chat, '⚠️ Necesitas ser administrador.', m, ctxErr)
  if (!isBotAdmin) return conn.reply(m.chat, '⚠️ Necesito ser administradora.', m, ctxErr)

  if (!text) {
    return conn.reply(m.chat, `
📝 **Uso del comando:**

• !add <número>
• !add @usuario
• !add (respondiendo a un mensaje)

💡 **Ejemplos:**
• !add 51987654321
• !add @usuario
• !add 51999999999,51888888888

🎯 **Funciones:**
✅ Agregar contactos directamente
📨 Enviar enlace a no contactos
✅ Múltiples números separados por coma
    `.trim(), m, ctxWarn)
  }

  try {
    // Obtener enlace del grupo
    let groupCode = await conn.groupInviteCode(m.chat)
    let inviteLink = `https://chat.whatsapp.com/${groupCode}`
    let groupName = (await conn.groupMetadata(m.chat)).subject || 'el grupo'

    let numbers = []

    // Caso 1: Si hay menciones en el mensaje
    if (m.mentionedJid && m.mentionedJid.length > 0) {
      numbers = m.mentionedJid
    }
    // Caso 2: Si es responder a un mensaje
    else if (m.quoted) {
      numbers = [m.quoted.sender]
    }
    // Caso 3: Si es texto con números
    else if (text) {
      numbers = text.split(',').map(num => {
        let number = num.trim().replace(/[^0-9]/g, '')

        // Formatear número correctamente
        if (number.startsWith('0')) number = number.substring(1)
        if (!number.startsWith('51') && number.length === 9) number = '51' + number
        if (number.length === 8) number = '51' + number

        return number.includes('@s.whatsapp.net') ? number : number + '@s.whatsapp.net'
      }).filter(num => {
        let cleanNum = num.replace('@s.whatsapp.net', '')
        return cleanNum.length >= 10 && cleanNum.length <= 15
      })
    }

    if (numbers.length === 0) {
      return conn.reply(m.chat, '❌ No se encontraron números válidos.', m, ctxErr)
    }

    await conn.reply(m.chat, `📱 Procesando ${numbers.length} persona(s)...`, m, ctxOk)

    let addedCount = 0
    let invitedCount = 0
    let failedCount = 0
    let results = []

    // URL de imagen para invitaciones
    const invitationImage = 'https://files.catbox.moe/w491g3.jpg' // Puedes cambiar esta URL

    // Procesar cada número/usuario
    for (let number of numbers) {
      try {
        console.log('Procesando:', number)

        // Verificar si el número existe en WhatsApp
        const contact = await conn.onWhatsApp(number)

        if (contact && contact.length > 0 && contact[0].exists) {
          // Verificar si es contacto del bot (está en la lista de contactos)
          let isContact = false
          try {
            // Intentar obtener información del contacto
            const contactInfo = await conn.getContact(number)
            isContact = contactInfo && contactInfo.id
          } catch (e) {
            isContact = false
          }

          if (isContact) {
            // INTENTO 1: Es contacto - agregar directamente
            try {
              await conn.groupParticipantsUpdate(m.chat, [number], 'add')
              addedCount++
              results.push(`✅ ${number.split('@')[0]} (Contacto - Agregado)`)
              console.log('Contacto agregado exitosamente')

            } catch (addError) {
              console.log('Error al agregar contacto:', addError)
              failedCount++
              results.push(`❌ ${number.split('@')[0]} (Contacto - No se pudo agregar)`)
            }
          } else {
            // INTENTO 2: No es contacto - enviar enlace por privado con imagen
            try {
              const inviteMessage = `🎉 *¡INVITACIÓN AL GRUPO!* 🎉\n\n` +
                `🔹 *Grupo:* ${groupName}\n` +
                `👤 *Invitado por:* ${conn.getName(m.sender) || 'Un administrador'}\n\n` +
                `📌 *Para unirte al grupo, haz clic en el siguiente enlace:*\n` +
                `🔗 ${inviteLink}\n\n` +
                `¡Te esperamos! 👋`

              // Enviar mensaje con imagen
              await conn.sendMessage(number, { 
                image: { url: invitationImage },
                caption: inviteMessage
              })
              
              invitedCount++
              results.push(`📨 ${number.split('@')[0]} (Invitación con imagen enviada)`)
              console.log('Invitación con imagen enviada exitosamente')

            } catch (inviteError) {
              console.log('Error enviando invitación:', inviteError)
              
              // Intentar sin imagen como respaldo
              try {
                const backupMessage = `🎉 *Invitación al Grupo*\n\n` +
                  `*${groupName}*\n\n` +
                  `👤 Invitado por: ${conn.getName(m.sender) || 'Administrador'}\n\n` +
                  `🔗 Enlace: ${inviteLink}\n\n` +
                  `¡Haz clic para unirte!`
                  
                await conn.sendMessage(number, { text: backupMessage })
                invitedCount++
                results.push(`📨 ${number.split('@')[0]} (Invitación enviada)`)
                console.log('Invitación de respaldo enviada')
                
              } catch (backupError) {
                failedCount++
                results.push(`❌ ${number.split('@')[0]} (No se pudo enviar invitación)`)
              }
            }
          }

        } else {
          console.log('Número no existe en WhatsApp')
          failedCount++
          results.push(`❌ ${number.split('@')[0]} (No tiene WhatsApp)`)
        }

        // Esperar entre procesamientos para evitar límites
        await new Promise(resolve => setTimeout(resolve, 2000))

      } catch (error) {
        console.log('Error general:', error)
        failedCount++
        results.push(`❌ ${number.split('@')[0]} (Error)`)
      }
    }

    // Mostrar resultados
    let resultMessage = `📊 **Resultado de Invitaciones**\n\n`

    if (addedCount > 0) {
      resultMessage += `✅ **Agregados directamente:** ${addedCount}\n`
    }
    if (invitedCount > 0) {
      resultMessage += `📨 **Invitaciones enviadas:** ${invitedCount}\n`
    }
    if (failedCount > 0) {
      resultMessage += `❌ **Fallidos:** ${failedCount}\n`
    }

    resultMessage += `\n`

    // Mostrar detalles de los resultados
    if (results.length > 0) {
      resultMessage += `📋 **Detalles:**\n${results.join('\n')}\n\n`
    }

    // Mostrar el enlace del grupo
    resultMessage += `🔗 **Enlace del grupo:**\n${inviteLink}\n\n`

    if (addedCount > 0 || invitedCount > 0) {
      resultMessage += `🎉 **¡Proceso completado exitosamente!**`
    } else {
      resultMessage += `📝 **Usa el enlace para invitar manualmente**`
    }

    await conn.reply(m.chat, resultMessage, m, ctxOk)

  } catch (error) {
    console.error('Error general en add:', error)

    // Obtener enlace como respaldo
    let inviteLink = 'Error obteniendo enlace'
    try {
      const code = await conn.groupInviteCode(m.chat)
      inviteLink = `https://chat.whatsapp.com/${code}`
    } catch {}

    await conn.reply(m.chat, 
      `❌ **Error al procesar**\n\n` +
      `🔗 **Usa este enlace para invitar manualmente:**\n${inviteLink}`,
      m, ctxErr
    )
  }
}

handler.help = ['add']
handler.tags = ['owner']
handler.command = ['add', 'invitar', 'invite', 'agregar']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler