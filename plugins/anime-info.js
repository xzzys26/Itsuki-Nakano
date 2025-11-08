import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})
  const ctxOk = (global.rcanalr || {})

  let user = global.db.data.users[m.sender];
  
  // Verificar si el usuario es premium
  if (!user.premium || user.premiumTime < Date.now()) {
    return conn.reply(m.chat, 
`╭━━━〔 💎 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 𝐑𝐄𝐐𝐔𝐄𝐑𝐈𝐃𝐎 💎 〕━━━⬣
│ 🔒 *Buscador Exclusivo Premium*
│ 
│ 🌟 Información detallada de manga
│ solo para miembros premium
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🎗️ *Obtén tu membresía:*
│ ${usedPrefix}premium dia
│ ${usedPrefix}premium semana  
│ ${usedPrefix}premium mes

💫 *¡Desbloquea búsquedas ilimitadas con Itsuki!* (◕‿◕✿)`, 
    m, ctxErr);
  }

  if (!text) {
    return conn.reply(m.chat,
`╭━━━〔 🎴 𝐁𝐔𝐒𝐂𝐀𝐃𝐎𝐑 𝐃𝐄 𝐌𝐀𝐍𝐆𝐀 🎴 〕━━━⬣
│ 🔍 *Falta el nombre del manga*
│ 
│ 📋 *Uso exclusivo premium:*
│ ${usedPrefix + command} <nombre_manga>
│ 
│ 🎯 *Ejemplo premium:*
│ ${usedPrefix + command} One Piece
╰━━━━━━━━━━━━━━━━━━━━━━⬣

💮 *Itsuki espera tu búsqueda premium...* 📚`, 
    m, ctxWarn)
  }

  await m.react('⏳')

  try {
    // Mensaje de búsqueda premium
    await conn.reply(m.chat,
`╭━━━〔 🎴 𝐁𝐔𝐒𝐂𝐀𝐍𝐃𝐎 𝐌𝐀𝐍𝐆𝐀 🎴 〕━━━⬣
│ 🔮 *Búsqueda premium activada*
│ 
│ 📥 Conectando con base de datos
│ ⚡ Procesando solicitud premium
│ 🎬 Obteniendo información exclusiva
│ 💫 Preparando resultados detallados
╰━━━━━━━━━━━━━━━━━━━━━━⬣

💮 *Itsuki está buscando información del manga...* 🌟`, 
    m, ctxWarn)

    let res = await fetch('https://api.jikan.moe/v4/manga?q=' + text)
    
    if (!res.ok) {
      return conn.reply(m.chat,
`╭━━━〔 💎 𝐄𝐑𝐑𝐎𝐑 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 💎 〕━━━⬣
│ ❌ *Servidor no disponible*
│ 
│ 📡 Error en conexión API premium
│ 🕒 Intenta nuevamente más tarde
╰━━━━━━━━━━━━━━━━━━━━━━⬣

💮 *Itsuki lamenta el inconveniente...* (´；ω；\`)`, 
      m, ctxErr)
    }

    let json = await res.json()
    
    if (!json.data || json.data.length === 0) {
      return conn.reply(m.chat,
`╭━━━〔 🎴 𝐒𝐈𝐍 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎𝐒 🎴 〕━━━⬣
│ 🔍 *Manga no encontrado*
│ 
│ 🎯 Término: ${text}
│ 📚 No se encontró en base de datos
╰━━━━━━━━━━━━━━━━━━━━━━⬣

💮 *Itsuki sugiere verificar el nombre...* 📖`, 
      m, ctxErr)
    }

    let manga = json.data[0]
    let { chapters, title_japanese, url, type, score, members, status, volumes, synopsis, favorites, published, genres, authors } = manga
    
    let author = authors?.[0]?.name || 'Desconocido'
    let title_english = manga.title_english || manga.title
    let title = manga.title
    let genreList = genres?.map(g => g.name).join(', ') || 'No especificado'

    let mangainfo = 
`╭━━━〔 💎 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂𝐈Ó𝐍 𝐃𝐄𝐋 𝐌𝐀𝐍𝐆𝐀 💎 〕━━━⬣
│ 🎴 *Título Japonés:* ${title_japanese}
│ 🏷️ *Título Inglés:* ${title_english}
│ 📖 *Título Principal:* ${title}
│ 
│ 📊 *Capítulos:* ${chapters || 'En publicación'}
│ 🎞️ *Tipo:* ${type}
│ 🗂️ *Estado:* ${status}
│ 📚 *Volúmenes:* ${volumes || 'En publicación'}
│ 
│ ⭐ *Favoritos:* ${favorites?.toLocaleString() || '0'}
│ 🎯 *Puntaje:* ${score || 'N/A'}
│ 👥 *Miembros:* ${members?.toLocaleString() || '0'}
│ 🎭 *Géneros:* ${genreList}
│ 
│ 👨‍🔬 *Autor:* ${author}
│ 📅 *Publicación:* ${published?.string || 'N/A'}
│ 
│ 🔗 *URL:* ${url}
╰━━━━━━━━━━━━━━━━━━━━━━⬣

📝 *Sinopsis:*
${synopsis ? synopsis.substring(0, 400) + (synopsis.length > 400 ? '...' : '') : 'Sinopsis no disponible'}

💫 *Beneficio exclusivo para miembros premium*
🎀 *Itsuki te presenta información detallada del manga* 🌟`

    // Enviar imagen con información premium
    await conn.sendFile(m.chat, manga.images.jpg.image_url, 'premium_manga.jpg', mangainfo, m)
    
    await m.react('✅')

  } catch (error) {
    console.error(error)
    await m.react('❌')
    
    await conn.reply(m.chat,
`╭━━━〔 💎 𝐄𝐑𝐑𝐎𝐑 𝐂𝐑𝐈𝐓𝐈𝐂𝐎 💎 〕━━━⬣
│ ❌ *Error en la búsqueda*
│ 
│ 📝 Detalles: ${error.message}
╰━━━━━━━━━━━━━━━━━━━━━━⬣

💮 *Itsuki no pudo completar la búsqueda...* (´；ω；\`)`, 
    m, ctxErr)
  }
}

handler.help = ['infomanga'] 
handler.tags = ['premium'] 
handler.group = true;
handler.register = true
handler.premium = true
handler.command = ['infomanga','mangainfo', 'buscarManga'] 

export default handler