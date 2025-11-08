import yts from 'yt-search'    
import fetch from 'node-fetch'    

async function apiAdonix(url) {    
  const apiURL = `https://api-adonix.ultraplus.click/download/ytmp4?apikey=${global.apikey}&url=${encodeURIComponent(url)}`    
  const res = await fetch(apiURL)    
  const data = await res.json()    

  if (!data.status || !data.data?.url) throw new Error('API Adonix no devolvió datos válidos')    
  return { url: data.data.url, title: data.data.title || 'Video sin título XD', fuente: 'Adonix' }    
}    

async function apiMayAPI(url) {
  const apiURL = `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(url)}&type=mp4&apikey=${global.APIKeys['https://mayapi.ooguy.com']}`
  const res = await fetch(apiURL)
  const data = await res.json()

  if (!data.status || !data.result?.url) throw new Error('API MayAPI no devolvió datos válidos')
  return { url: data.result.url, title: data.result.title || 'Video sin título XD', fuente: 'MayAPI' }
}

async function ytdl(url) {    
  try {    
    console.log('🎬 Intentando con API Adonix...')    
    return await apiAdonix(url)    
  } catch (e1) {    
    console.warn('⚠️ Falló Adonix:', e1.message)    
    console.log('🎞️ Intentando con API MayAPI de respaldo...')    
    return await apiMayAPI(url)    
  }    
}    

let handler = async (m, { conn, text, usedPrefix }) => {    
  const ctxErr = (global.rcanalx || {})    
  const ctxWarn = (global.rcanalw || {})    
  const ctxOk = (global.rcanalr || {})    

  if (!text) {    
    return conn.reply(m.chat, `    
🌸📹 Itsuki Nakano - Descargar Video    

📝 Uso:    
• ${usedPrefix}play2 <nombre de la canción>    

💡 Ejemplo:    
• ${usedPrefix}play2 spy x family opening    

🎯 Formato:    
🎥 Video MP4 de alta calidad    

🍱 ¡Disfruta tus videos con Itsuki Nakano! 🌸    
    `.trim(), m, ctxWarn)    
  }    

  try {    
    await conn.reply(m.chat, '*🔎🎬 Itsuki está buscando tu video*', m, ctxOk)    

    const searchResults = await yts(text)    
    if (!searchResults.videos.length) throw new Error('No se encontraron resultados')    

    const video = searchResults.videos[0]    
    const { url, title, fuente } = await ytdl(video.url)    

    const caption = `    
🌸✨ ¡Itsuki Nakano trae tu video! ✨🌸    
💖 *Título:* ${title}    
⏱ *Duración:* ${video.timestamp}    
👤 *Autor:* ${video.author.name}    
🔗 *URL:* ${video.url}    

🌐 *API:* ${fuente}    
🌷 ¡Disfruta y no olvides sonreír! 🌷    
> 🍱 Gracias por elegirme para tus descargas     
`.trim()    

    const buffer = await fetch(url).then(res => res.buffer())    

    await conn.sendMessage(    
      m.chat,    
      {    
        video: buffer,    
        mimetype: 'video/mp4',    
        fileName: `${title}.mp4`,    
        caption    
      },    
      { quoted: m }    
    )    

  } catch (e) {    
    console.error('❌ Error en play2:', e)    
    await conn.reply(m.chat, `❌ Error: ${e.message}`, m, ctxErr)    
  }    
}    

handler.help = ['play2']    
handler.tags = ['downloader']    
handler.command = ['play2']
handler.group = true    

export default handler
