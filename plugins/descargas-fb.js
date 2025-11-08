import fetch from 'node-fetch'

/**
 * 🎀 CREADO POR: LeoXzzsy
 * 🌸 ADAPTADO PARA: Itsuki-Nakano IA
 * 📚 VERSIÓN: 3.4.0 Beta
 * 🏷️ DESCARGADOR FACEBOOK
 */

let handler = async (m, { conn, usedPrefix, command, args }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})
  const ctxOk = (global.rcanalr || {})

  try {
    if (!args[0]) {
      return conn.reply(m.chat,
        `🎀 *Itsuki-Nakano IA - Descargador Facebook*\n\n` +
        `✦ *Uso correcto:*\n` +
        `*${usedPrefix}fb* <url_de_facebook>\n\n` +
        `✦ *Ejemplo:*\n` +
        `*${usedPrefix}fb* https://fb.watch/xxxxx\n\n` +
        `🌸 *Itsuki te ayudará a descargar el video...* (◕‿◕✿)`,
      m, ctxWarn)
    }

    const url = args[0]
    if (!url.match(/facebook\.com|fb\.watch/)) {
      return conn.reply(m.chat,
        `🎀 *Itsuki-Nakano IA*\n\n` +
        `❌ *URL no válida*\n\n` +
        `✦ Por favor envía un enlace de Facebook válido\n` +
        `✦ Ejemplo: https://fb.watch/xxxxx\n\n` +
        `🌸 *Itsuki está confundida...* (´･ω･\`)`,
      m, ctxErr)
    }

    await m.react('📥')
    
    // Mensaje de espera
    await conn.reply(m.chat,
      `🎀 *Itsuki-Nakano IA*\n\n` +
      `📥 *Procesando video de Facebook...*\n` +
      `✦ Analizando enlace...\n` +
      `✦ Preparando descarga...\n\n` +
      `🌸 *Por favor espera un momento...* (◕‿◕✿)`,
    m, ctxWarn)

    // API de mayapi
    const apiUrl = `https://mayapi.ooguy.com/facebook?url=${encodeURIComponent(url)}&apikey=may-f53d1d49`
    console.log('🔗 Solicitando a API:', apiUrl)

    const response = await fetch(apiUrl, {
      timeout: 30000
    })

    if (!response.ok) {
      throw new Error(`Error en la API: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()
    console.log('📦 Respuesta de API:', data)

    // Verificar diferentes estructuras de respuesta
    if (!data.status) {
      throw new Error('La API no respondió correctamente')
    }

    let videoUrl, videoTitle

    // Buscar en diferentes estructuras posibles
    if (data.result && data.result.url) {
      videoUrl = data.result.url
      videoTitle = data.result.title || 'Video de Facebook'
    } else if (data.url) {
      videoUrl = data.url
      videoTitle = data.title || 'Video de Facebook'
    } else if (data.data && data.data.url) {
      videoUrl = data.data.url
      videoTitle = data.data.title || 'Video de Facebook'
    } else {
      throw new Error('No se encontró URL del video en la respuesta')
    }

    console.log('🎬 URL del video encontrada:', videoUrl)
    console.log('📝 Título:', videoTitle)

    // Enviar el video directamente desde la URL
    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: `🎀 *Itsuki-Nakano IA v4.3.1 Oficial*\n` +
              `╰ Creado por: LeoXzzsy 👑\n\n` +
              `📹 ${videoTitle}\n` +
              `⭐ Descargado desde Facebook`
    }, { quoted: m })

    await m.react('✅')

  } catch (error) {
    console.error('❌ Error en descarga Facebook:', error)

    await conn.reply(m.chat,
      `🎀 *Itsuki-Nakano IA*\n\n` +
      `❌ *Error en la descarga*\n\n` +
      `✦ *Detalles:* ${error.message}\n\n` +
      `✦ *Posibles soluciones:*\n` +
      `• Verifica que el enlace sea correcto\n` +
      `• El video podría ser privado\n` +
      `• Intenta con otro enlace\n` +
      `• Espera un momento y vuelve a intentar\n\n` +
      `🌸 *Itsuki lo intentará de nuevo...* (´；ω；\`)\n\n` +
      `🎀 *Itsuki-Nakano IA v3.4.0 Beta*\n` +
      `╰ Creado por: LeoXzzsy 👑`,
    m, ctxErr)

    await m.react('❌')
  }
}

handler.help = ['fb']
handler.tags = ['downloader']
handler.command = ['fb', 'facebook', 'fbd', 'fbdl']
handler.register = true

export default handler