import fetch from 'node-fetch'

const thumbnailUrl = 'https://qu.ax/Asbfq.jpg'

const contextInfo = {
  externalAdReply: {
    title: '📺 𝙔𝙤𝙪𝙏𝙪𝙗𝙚 𝙑𝙞𝙙𝙚𝙤',
    body: '𝙄𝙩𝙨𝙪𝙠𝙞 𝙉𝙖𝙠𝙖𝙣𝙤 𝙄𝘼',
    mediaType: 1,
    previewType: 0,
    mediaUrl: 'https://youtube.com',
    sourceUrl: 'https://youtube.com',
    thumbnailUrl: 'https://files.catbox.moe/zh5z6m.jpg'
  }
}

const handler = async (m, { conn, args, command, usedPrefix }) => {
  // Contextos decorativos (fallbacks incluidos)
  const ctxErr = global.rcanalx || {
    contextInfo: {
      externalAdReply: {
        title: '❌ 𝙀𝙧𝙧𝙤𝙧',
        body: '𝙄𝙩𝙨𝙪𝙠𝙞 𝙉𝙖𝙠𝙖𝙣𝙤 𝙄𝘼',
        thumbnailUrl: 'https://files.catbox.moe/zh5z6m.jpg',
        sourceUrl: global.canalOficial || ''
      }
    }
  }
  const ctxWarn = global.rcanalw || {
    contextInfo: {
      externalAdReply: {
        title: '⚠️ 𝘼𝙙𝙫𝙚𝙧𝙩𝙚𝙣𝙘𝙞𝙖',
        body: '𝙄𝙩𝙨𝙪𝙠𝙞 𝙉𝙖𝙠𝙖𝙣𝙤 𝙄𝘼',
        thumbnailUrl: 'https://files.catbox.moe/zh5z6m.jpg',
        sourceUrl: global.canalOficial || ''
      }
    }
  }
  const ctxOk = global.rcanalr || {
    contextInfo: {
      externalAdReply: {
        title: '✅ 𝘼𝙘𝙘𝙞ó𝙣',
        body: '𝙄𝙩𝙨𝙪𝙠𝙞 𝙉𝙖𝙠𝙖𝙣𝙤 𝙄𝘼',
        thumbnailUrl: 'https://qu.ax/QGAVS.jpg',
        sourceUrl: global.canalOficial || ''
      }
    }
  }

  const input = args.join(' ').trim()
  if (!input) {
    // reacción y mensaje instructivo con decoración Itsuki
    await conn.sendMessage(m.chat, { react: { text: '🌀', key: m.key } })
    return conn.sendMessage(
      m.chat,
      {
        text: `> ꒰⌢ ʚ˚₊‧ 🔍 ꒱꒱ :: *BÚSQUEDA DE VIDEO* ıllı

> ੭੭ ﹙ ⚠️ ﹚:: *Parámetro requerido*

\`\`\`Debes ingresar el nombre o enlace del video de YouTube.\`\`\`

*Ejemplo:*
> ${usedPrefix + command} DJ Malam Pagi
> ${usedPrefix + command} Naruto Opening

‐ ダ *ɪᴛsᴜᴋɪ ɴᴀᴋᴀɴᴏ ᴀɪ* ギ`,
        ...ctxWarn
      },
      { quoted: m }
    )
  }

  await conn.sendMessage(m.chat, { react: { text: '🔎', key: m.key } })

  try {
    // Llamada a la API
    const res = await fetch(
      `https://api.vreden.my.id/api/v1/download/play/video?query=${encodeURIComponent(input)}`
    )
    if (!res.ok) throw new Error(`Código HTTP ${res.status}`)

    const json = await res.json()
    if (!json.status || !json.result?.download?.url) {
      throw new Error(
        'No se pudo obtener el video. Verifica el nombre o intenta con otro término.'
      )
    }

    const { metadata, download } = json.result

    await conn.sendMessage(m.chat, { react: { text: '🎶', key: m.key } })

    const msgInfo = `
> ꒰⌢ ʚ˚₊‧ 📺 ꒱꒱ :: *INFORMACIÓN DEL VIDEO* ıllı

> ੭੭ ﹙ 🎵 ﹚:: *Título*
\`\`\`${metadata.title}\`\`\`

> ੭੭ ﹙ ⏱️ ﹚:: *Duración*
\`\`\`${metadata.duration.timestamp}\`\`\`

> ੭੭ ﹙ 👀 ﹚:: *Vistas*
\`\`\`${metadata.views.toLocaleString()}\`\`\`

> ੭੭ ﹙ 🧑‍🎤 ﹚:: *Autor*
\`\`\`${metadata.author.name}\`\`\`

> ੭੭ ﹙ 💽 ﹚:: *Calidad*
\`\`\`${download.quality}\`\`\`

> ੭੭ ﹙ 🔗 ﹚:: *Enlace Original*
${metadata.url}

‐ ダ *ɪᴛsᴜᴋɪ ɴᴀᴋᴀɴᴏ ᴀɪ* ギ
`.trim()

    // Enviar mini tarjeta + thumbnail (con contextInfo estilo Itsuki)
    await conn.sendMessage(
      m.chat,
      {
        image: { url: metadata.thumbnail || thumbnailUrl },
        caption: msgInfo,
        ...ctxOk
      },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } })

    // Descargar video (buffer) y enviar como archivo
    const videoRes = await fetch(download.url)
    if (!videoRes.ok) throw new Error(`Código HTTP ${videoRes.status}`)
    const buffer = await videoRes.buffer()

    await conn.sendMessage(
      m.chat,
      {
        video: buffer,
        mimetype: 'video/mp4',
        fileName: download.filename || 'video.mp4',
        caption: `> ꒰⌢ ʚ˚₊‧ ✅ ꒱꒱ :: *VIDEO DESCARGADO* ıllı

> ੭੭ ﹙ 🎬 ﹚:: *Título*
\`\`\`${metadata.title}\`\`\`

> ੭੭ ﹙ 📁 ﹚:: *Calidad*
\`\`\`${download.quality}\`\`\`

‐ ダ *ɪᴛsᴜᴋɪ ɴᴀᴋᴀɴᴏ ᴀɪ* ギ`,
        ...ctxOk
      },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (error) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    console.error('Error en el comando play5:', error)

    return conn.reply(
      m.chat,
      `> ꒰⌢ ʚ˚₊‧ ❌ ꒱꒱ :: *ERROR EN DESCARGA* ıllı

> ੭੭ ﹙ ⚠️ ﹚:: *Error detectado*

\`\`\`${error.message || 'Error desconocido'}\`\`\`

*Posibles causas:*
• Video no disponible
• API temporalmente caída
• Enlace incorrecto

*Solución:*
• Intenta con otro nombre o enlace
• Espera unos minutos y vuelve a intentar

‐ ダ *ɪᴛsᴜᴋɪ ɴᴀᴋᴀɴᴏ ᴀɪ* ギ`,
      m,
      ctxErr
    )
  }
}

handler.command = ['play5']
handler.tags = ['downloader']
handler.help = ['play5']
handler.group = true

export default handler