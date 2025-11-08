import yts from 'yt-search'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})
  const ctxOk = (global.rcanalr || {})

  
  if (global.db?.data?.users?.[m.sender]) {
    global.db.data.users[m.sender].dolares = global.db.data.users[m.sender].dolares || 0
   
  }

  if (!text) {
    return conn.reply(m.chat, `
🍙📚 Itsuki Nakano - Buscador de Música 🎵✨

🌟 ¡Como tutora musical, puedo ayudarte a encontrar canciones!

📝 Forma de uso:
${usedPrefix + command} <nombre de la canción>

💡 Ejemplos:
• ${usedPrefix + command} unravel Tokyo ghoul
• ${usedPrefix + command} spy x family ending
• ${usedPrefix + command} LiSA crossing field

🍱 ¡Encuentra tu música favorita! 🎶📖
    `.trim(), m, ctxWarn)
  }

  try {
    const searchResults = await yts(text)
    if (!searchResults.videos.length) {
      return conn.reply(m.chat, '❌ No encontré esa canción 🎵\n\n🍙 ¡Por favor, verifica el nombre! 📖', m, ctxErr)
    }

    const video = searchResults.videos[0]

    const songInfo = `🎵📚 Itsuki Nakano - Música Encontrada 🍙✨

🎼 Título: ${video.title}
⏱️ Duración: ${video.timestamp}
👤 Artista/Canal: ${video.author.name}
📊 Vistas: ${video.views.toLocaleString()}
📅 Publicado: ${video.ago}
🔗 URL: ${video.url}

✅ ¡Búsqueda exitosa!
🍱 ¡Aquí tienes la información de tu canción! 🎶📖`

    await conn.sendMessage(m.chat, {
      image: { url: video.thumbnail },
      caption: songInfo
    })

  } catch (error) {
    console.error('Error en play:', error)
    await conn.reply(m.chat, 
      `❌ Error en la búsqueda\n\n` +
      `🍙 ¡Lo siento! No pude buscar esta canción.\n\n` +
      `🔧 Error: ${error.message}\n\n` +
      `📖 ¡Intenta con otro nombre o más tarde! 🍱✨`,
      m, ctxErr
    )
  }
}

handler.limit = false
handler.premium = false
handler.free = true 
handler.register = false

handler.help = ['buscar MSC']
handler.tags = ['buscador']
handler.command = ['buscar', 'song', 'musica', 'music', 'mp3']

export default handler
