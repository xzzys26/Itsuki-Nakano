// owner-mantenimiento.js - Para Itsuki Nakano IA Adaptado 

let handler = async (m, { conn, text, usedPrefix, command, isOwner, args }) => {
  const ctxErr = global.rcanalx || {}
  const ctxWarn = global.rcanalw || {}
  const ctxOk = global.rcanalr || {}

  if (!isOwner) {
    return conn.reply(m.chat, 
      `🍙❌ *ITSUKI - Acceso Denegado* 🔒\n\n` +
      `⚠️ Este comando es exclusivo para el propietario\n\n` +
      `📚 "Lo siento, solo LeoXzz puede usar este comando" 🎀`,
      m, ctxErr
    )
  }

  const action = args[0]?.toLowerCase()
  let commandName = args[1]?.toLowerCase()

  if (!action || !commandName) {
    return conn.reply(m.chat, 
      `🍙🛠️ *ITSUKI - Sistema de Mantenimiento* ⚙️\n\n` +
      `📝 *Modos disponibles:*\n` +
      `• ${usedPrefix}${command} on <comando>\n` +
      `• ${usedPrefix}${command} off <comando>\n\n` +
      `💡 *Ejemplos:*\n` +
      `• ${usedPrefix}${command} on reportar\n` +
      `• ${usedPrefix}${command} off anime\n\n` +
      `📚 "Activa o desactiva comandos del sistema" 🎨`,
      m, ctxWarn
    )
  }

  // Inicializar array si no existe
  if (!global.maintenanceCommands) global.maintenanceCommands = []

  try {
    if (action === 'on') {
      if (global.maintenanceCommands.includes(commandName)) {
        return conn.reply(m.chat, 
          `🍙⚠️ *ITSUKI - Ya en Mantenimiento* 🚧\n\n` +
          `ℹ️ El comando "${commandName}" ya está en mantenimiento\n\n` +
          `📚 "No es necesario activarlo nuevamente" 🛠️`,
          m, ctxWarn
        )
      }
      global.maintenanceCommands.push(commandName)

      await conn.reply(m.chat, 
        `🍙✅ *ITSUKI - Mantenimiento Activado* ⚙️✨\n\n` +
        `🎉 Comando "${commandName}" puesto en mantenimiento\n\n` +
        `📚 "Este comando ha sido desactivado temporalmente"\n` +
        `🛠️ "Nadie podrá usarlo hasta que sea reactivado"\n` +
        `🔒 "Incluyendo al propietario"\n\n` +
        `✅ *Estado:* 🚧 En mantenimiento`,
        m, ctxOk
      )

    } else if (action === 'off') {
      if (!global.maintenanceCommands.includes(commandName)) {
        return conn.reply(m.chat, 
          `🍙⚠️ *ITSUKI - No en Mantenimiento* ✅\n\n` +
          `ℹ️ El comando "${commandName}" no está en mantenimiento\n\n` +
          `📚 "Este comando ya está activo" 🛠️`,
          m, ctxWarn
        )
      }
      global.maintenanceCommands = global.maintenanceCommands.filter(cmd => cmd !== commandName)

      await conn.reply(m.chat, 
        `🍙✅ *ITSUKI - Mantenimiento Desactivado* ⚙️✨\n\n` +
        `🎉 Comando "${commandName}" activado nuevamente\n\n` +
        `📚 "El comando ha sido reactivado exitosamente"\n` +
        `🛠️ "Los usuarios ya pueden usarlo normalmente"\n\n` +
        `✅ *Estado:* 🟢 Activo y funcionando`,
        m, ctxOk
      )
    } else {
      return conn.reply(m.chat, 
        `🍙❌ *ITSUKI - Acción Inválida* ❓\n\n` +
        `⚠️ Usa "on" o "off"\n\n` +
        `📚 "Solo puedo activar o desactivar mantenimiento" 📝`,
        m, ctxErr
      )
    }

  } catch (e) {
    console.error('Error en comando mantenimiento:', e)
    await conn.reply(m.chat, 
      `🍙❌ *ITSUKI - Error del Sistema* 💥\n\n` +
      `⚠️ Ocurrió un error al procesar la solicitud\n\n` +
      `📝 *Detalles:* ${e.message}\n\n` +
      `🔧 "Por favor, intenta nuevamente más tarde" 📚`,
      m, ctxErr
    )
  }
}

// Comando para ver comandos en mantenimiento
let listHandler = async (m, { conn, usedPrefix, command, isOwner }) => {
  if (!isOwner) {
    return conn.reply(m.chat, 
      `🍙❌ *ITSUKI - Acceso Denegado* 🔒\n\n` +
      `⚠️ Este comando es exclusivo para el propietario\n\n` +
      `📚 "Lo siento, solo LeoXzz puede usar este comando" 🎀`,
      m, ctxErr
    )
  }

  if (!global.maintenanceCommands || global.maintenanceCommands.length === 0) {
    return conn.reply(m.chat, 
      `🍙✅ *ITSUKI - Estado de Mantenimiento* ⚙️\n\n` +
      `📊 No hay comandos en mantenimiento\n\n` +
      `🎉 "Todos los comandos están activos y funcionando"\n` +
      `✨ "¡El sistema está operando al 100%!" 🎀`,
      m, ctxOk
    )
  }

  let maintenanceText = `🍙🛠️ *ITSUKI - Comandos en Mantenimiento* 🚧\n\n`
  maintenanceText += `📊 *Total de comandos:* ${global.maintenanceCommands.length}\n\n`
  maintenanceText += `📋 *Lista:*\n`

  global.maintenanceCommands.forEach((cmd, index) => {
    maintenanceText += `${index + 1}. ${cmd} 🚧\n`
  })

  maintenanceText += `\n📝 *Para quitar mantenimiento:*\n`
  maintenanceText += `${usedPrefix}mantenimiento off <comando>\n\n`
  maintenanceText += `📚 "Estos comandos están desactivados para todos" 🔒`

  await conn.reply(m.chat, maintenanceText, m, ctxWarn)
}

// Comando para limpiar todo el mantenimiento
let clearHandler = async (m, { conn, usedPrefix, command, isOwner }) => {
  if (!isOwner) {
    return conn.reply(m.chat, 
      `🍙❌ *ITSUKI - Acceso Denegado* 🔒\n\n` +
      `⚠️ Este comando es exclusivo para el propietario\n\n` +
      `📚 "Lo siento, solo LeoXzz puede usar este comando" 🎀`,
      m, ctxErr
    )
  }

  if (!global.maintenanceCommands || global.maintenanceCommands.length === 0) {
    return conn.reply(m.chat, 
      `🍙✅ *ITSUKI - Limpieza de Mantenimiento* 🧹\n\n` +
      `📊 No hay comandos en mantenimiento para limpiar\n\n` +
      `🎉 "El sistema ya está completamente activo" ✨`,
      m, ctxOk
    )
  }

  const count = global.maintenanceCommands.length
  global.maintenanceCommands = []

  await conn.reply(m.chat, 
    `🍙✅ *ITSUKI - Mantenimiento Limpiado* 🧹✨\n\n` +
    `🎉 Se removieron ${count} comandos del mantenimiento\n\n` +
    `📚 "Todos los comandos han sido reactivados"\n` +
    `🛠️ "El sistema está completamente operativo"\n\n` +
    `✅ *Estado:* 🟢 Todo activo y funcionando`,
    m, ctxOk
  )
}

// Handler principal
handler.command = ['maintenance', 'mant']
handler.tags = ['owner']
handler.help = ['mante']
handler.owner = true
handler.group = false
handler.rowner = true

// Handler de lista
listHandler.command = ['mantenimientos', 'listamantenimiento', 'maintenances']
listHandler.tags = ['owner']
listHandler.help = ['mante']
listHandler.owner = true
listHandler.group = false

// Handler de limpieza
clearHandler.command = ['limpiarmantenimiento', 'clearmaintenance', 'mantclear']
clearHandler.tags = ['owner']
clearHandler.help = ['limpiarmante']
clearHandler.owner = true
clearHandler.group = false

export { handler as default, listHandler, clearHandler }