import fetch from 'node-fetch'

/**
 * 🎀 CREADO POR: LeoXzzsy 
 * 📚 VERSIÓN: 3.5.1 Beta
 * 🏷️ DESCARGADOR DE INSTAGRAM
 */

let handler = async (m, { conn, usedPrefix, args }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})

  try {
    if (!args[0]) {
      return conn.reply(m.chat,
        `🎀 *Itsuki-Nakano IA - Descargador Instagram*\n\n` +
        `✦ *Uso correcto:*\n` +
        `*${usedPrefix}ig* <url_de_instagram>\n\n` +
        `✦ *Ejemplo:*\n` +
        `*${usedPrefix}ig* https://www.instagram.com/p/xxxxx\n\n` +
        `🌸 *Itsuki te ayudará a descargar el contenido...* (◕‿◕✿)`,
      m, ctxWarn)
    }

    const url = args[0]
    if (!url.match(/instagram\.com/)) {
      return conn.reply(m.chat,
        `🎀 *Itsuki-Nakano IA*\n\n` +
        `❌ *URL no válida*\n\n` +
        `✦ Por favor envía un enlace de Instagram válido\n` +
        `✦ Ejemplo: https://www.instagram.com/p/xxxxx\n\n` +
        `🌸 *Itsuki está confundida...* (´･ω･\`)`,
      m, ctxErr)
    }

    await m.react('📥')
    await conn.reply(m.chat,
      `🎀 *Itsuki-Nakano IA*\n\n` +
      `📥 *Procesando contenido de Instagram...*\n` +
      `✦ Analizando enlace...\n` +
      `✦ Preparando descarga...\n\n` +
      `🌸 *Por favor espera un momento...* (◕‿◕✿)`,
    m, ctxWarn)

    const api1 = `https://mayapi.ooguy.com/instagram?url=${encodeURIComponent(url)}&apikey=may-f53d1d49`
    const api2 = `https://apiadonix.kozow.com/download/instagram?apikey=${global.apikey}&url=${encodeURIComponent(url)}`

    let mediaUrl, mediaTitle, mediaType, apiUsada = 'May API'

    
    try {
      const res = await fetch(api1, { timeout: 30000 })
      if (!res.ok) throw new Error('Error en API principal')
      const data = await res.json()

      if (data.result?.url) {
        mediaUrl = data.result.url
        mediaTitle = data.result.title || 'Contenido de Instagram'
        mediaType = data.result.type || 'video'
      } else if (data.url) {
        mediaUrl = data.url
        mediaTitle = data.title || 'Contenido de Instagram'
        mediaType = data.type || 'video'
      } else if (data.data?.url) {
        mediaUrl = data.data.url
        mediaTitle = data.data.title || 'Contenido de Instagram'
        mediaType = data.data.type || 'video'
      }
    } catch {
      
      apiUsada = 'API Adonix'
      const res2 = await fetch(api2, { timeout: 30000 })
      if (!res2.ok) throw new Error('Error en API de respaldo')
      const data2 = await res2.json()

    
      const adonixData = Array.isArray(data2.data) ? data2.data[0] : data2.data
      mediaUrl = adonixData?.url
      mediaTitle = 'Contenido de Instagram'
      mediaType = mediaUrl?.includes('.mp4') ? 'video' : 'image'
    }

    if (!mediaUrl) throw new Error('No se encontró contenido válido')

    const isVideo = mediaType === 'video' || mediaUrl.includes('.mp4')

    if (isVideo) {
      await conn.sendMessage(m.chat, {
        video: { url: mediaUrl },
        caption: `🎀 *Itsuki-Nakano IA v3.5.1 Beta*\n` +
                 `╰ Creado por: LeoXzzsy 👑 (Erenz)\n\n` +
                 `📹 ${mediaTitle}\n` +
                 `⭐ Descargado desde Instagram\n` +
                 `🔧 *Servidor:* ${apiUsada}`
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        image: { url: mediaUrl },
        caption: `🎀 *Itsuki-Nakano IA v4.3.1 Oficial*\n` +
                 `╰ Creado por: LeoXzzsy 👑(Erenz)\n\n` +
                 `🖼️ ${mediaTitle}\n` +
                 `⭐ Descargado desde Instagram\n` +
                 `🔧 *Servidor:* ${apiUsada}`
      }, { quoted: m })
    }

    await m.react('✅')

  } catch (error) {
    console.error('❌ Error en descarga Instagram:', error)
    await conn.reply(m.chat,
      `🎀 *Itsuki-Nakano IA*\n\n` +
      `❌ *Error en la descarga*\n\n` +
      `✦ *Detalles:* ${error.message}\n\n` +
      `✦ *Posibles soluciones:*\n` +
      `• Enlace incorrecto o privado\n` +
      `• Contenido restringido o eliminado\n\n` +
      `🌸 *Itsuki lo intentará de nuevo...* (´；ω；\`)\n\n` +
      `🎀 *Itsuki-Nakano IA v3.5.1 Beta*`,
    m, ctxErr)
    await m.react('❌')
  }
}

handler.help = ['ig']
handler.tags = ['downloader']
handler.command = ['ig', 'instagram', 'igdl']
handler.register = true

export default handler
