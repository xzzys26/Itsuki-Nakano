let handler = async (m, { conn, usedPrefix }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})
  const ctxOk = (global.rcanalr || {})

  try {
    let totalCommands = 0
    let uniqueCommands = new Set()

    // Buscar comandos en global.plugins
    if (global.plugins) {
      Object.values(global.plugins).forEach(plugin => {
        if (plugin.command && Array.isArray(plugin.command)) {
          plugin.command.forEach(cmd => {
            uniqueCommands.add(cmd)
          })
        }
      })
      totalCommands = uniqueCommands.size
    }

    // Si no se encontraron comandos, buscar en otras estructuras
    if (totalCommands === 0) {
      // Intentar contar de otros lugares donde puedan estar los comandos
      if (global.handler && global.handler.commands) {
        totalCommands = Object.keys(global.handler.commands).length
      } else {
        // Estimación por defecto si no se puede contar
        totalCommands = "varios"
      }
    }

    const message = `
🤖 **TOTAL DE COMANDOS** 📊

✅ **Comandos disponibles:** ${totalCommands}

📚 **El bot cuenta con ${totalCommands} comandos organizados en diferentes categorías para todas tus necesidades.**

💡 **Usa ${usedPrefix}menu para ver la lista completa de comandos organizados por categorías.**

⚡ **¡Todo un arsenal de ${totalCommands} comandos a tu disposición!**
  `.trim()

    await conn.reply(m.chat, message, m, ctxOk)

  } catch (error) {
    console.error('Error en comando total:', error)
    await conn.reply(m.chat, 
      `🤖 **TOTAL DE COMANDOS** 📊\n\n✅ **Comandos disponibles:** Múltiples\n\n📚 **El bot cuenta con una amplia variedad de comandos para todas tus necesidades.**\n\n💡 **Usa ${usedPrefix}menu para ver todos los comandos disponibles.**`,
      m, ctxOk
    )
  }
}

handler.help = ['total', 'comandos']
handler.tags = ['info']
handler.command = ['total', 'comandos', 'totalcomandos']

export default handler