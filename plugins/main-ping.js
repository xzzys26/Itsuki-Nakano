let handler = async (m, { conn }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})
  const ctxOk = (global.rcanalr || {})
  const ctxht = (global.rcanal08 || {})

  try {
    // Tiempo inicial
    const start = Date.now()

    // Enviar mensaje de prueba
    await conn.reply(m.chat, '🍙🏓 *Calculando velocidad...* 📚✨', m, ctxOk)

    // Tiempo final
    const end = Date.now()

    // Calcular ping REAL (solo tiempo de respuesta del bot)
    const ping = end - start

    // Evaluación REALISTA del ping
    let speed, emoji, status;
    if (ping < 100) {
      speed = '*🚀 Extremadamente Rápido*'
      emoji = '🎯'
      status = 'Excelente'
    } else if (ping < 300) {
      speed = '*⚡ Muy Rápido*'
      emoji = '⚡'
      status = 'Óptimo'
    } else if (ping < 600) {
      speed = '🏓 Rápido'
      emoji = '🏓'
      status = 'Bueno'
    } else if (ping < 1000) {
      speed = '📶 Normal'
      emoji = '📶'
      status = 'Estable'
    } else {
      speed = '🐢 Lento'
      emoji = '🐢'
      status = 'Regular'
    }

    // Obtener uso de memoria REAL
    const used = process.memoryUsage()
    const memory = Math.round(used.rss / 1024 / 1024) + ' MB'

    // Obtener tiempo de actividad REAL
    const uptime = process.uptime()
    const hours = Math.floor(uptime / 3600)
    const minutes = Math.floor((uptime % 3600) / 60)
    const seconds = Math.floor(uptime % 60)
    const uptimeString = `${hours}h ${minutes}m ${seconds}s`

    // Información REAL del sistema
    const platform = process.platform
    const arch = process.arch
    const nodeVersion = process.version

    // Mensaje del ping REAL
    const pingMessage = `
${emoji} **Itsuki Nakano - Estado del Sistema** ✨️📊

🏓 *Velocidad REAL:* ${ping} ms
📊 *Conexión:* ${speed}
🟢 *Rendimiento:* ${status}

💾 *Memoria Usada:* ${memory}
⏱️ *Tiempo Activo:* ${uptimeString}
🖥️ *Plataforma:* ${platform}
🔧 *Arquitectura:* ${arch}
📦 *Node.js:* ${nodeVersion}

🍙 *"¡Sistema funcionando perfectamente!"* 📚✨
    `.trim()

    // Enviar resultado
    await conn.reply(m.chat, pingMessage, m, ctxOk)

  } catch (error) {
    console.error('Error en ping:', error)
    await conn.reply(m.chat, 
      `❌ *Error en el diagnóstico*\n\n` +
      `🍙 *"¡No pude calcular la velocidad!"*\n\n` +
      `🔧 *Error:* ${error.message}`,
      m, ctxErr
    )
  }
}

handler.help = ['ping']
handler.tags = ['main']
handler.command = ['p', 'ping']

export default handler