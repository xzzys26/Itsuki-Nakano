import axios from 'axios'    
import FormData from 'form-data'    
    
let handler = async (m, { conn, text, usedPrefix, command }) => {    
  const ctxErr = (global.rcanalx || {})    
  const ctxWarn = (global.rcanalw || {})    
  const ctxOk = (global.rcanalr || {})    
    
  let user = global.db.data.users[m.sender];    
  if (!user.premium || user.premiumTime < Date.now()) {    
    return conn.reply(m.chat,    
`╭━━━〔 🎀 𝐀𝐂𝐂𝐄𝐒𝐎 𝐃𝐄𝐍𝐄𝐆𝐀𝐃𝐎 🎀 〕━━━⬣    
│ ❌ *Comando Exclusivo Premium*    
│     
│ 💎 Generación de videos con IA    
│ solo para miembros premium    
╰━━━━━━━━━━━━━━━━━━━━━━⬣    
    
🌟 *Obtén tu membresía:*    
│ ${usedPrefix}premium dia    
│ ${usedPrefix}premium semana      
│ ${usedPrefix}premium mes    
    
🌸 *¡Únete al club exclusivo de Itsuki!* (◕‿◕✿)`,     
    m, ctxErr);    
  }    
    
  if (!text) {    
    return conn.reply(m.chat,    
`╭━━━〔 🎀 𝐒𝐎𝐑𝐀 1 🎀 〕━━━⬣    
│ ❌ *Debes escribir un prompt*    
│     
│ 📌 *Uso correcto:*    
│ ${usedPrefix + command} <texto_del_video>    
│     
│ 🎬 *Ejemplos creativos:*    
│ • "Haz un video de un gato"    
│ • "Crea un video de un dragón volando"    
│ • "Haz un video estilo anime de una chica bailando"    
╰━━━━━━━━━━━━━━━━━━━━━━⬣    
    
🌸 *Sora necesita instrucciones para crear tu video...* 🎥`,     
    m, ctxWarn);    
  }    
    
  try {    
    await conn.reply(m.chat,    
`╭━━━〔 🎀 𝐏𝐑𝐎𝐂𝐄𝐒𝐀𝐍𝐃𝐎 🎀 〕━━━⬣    
│ 🔮 *Creando video con Sora 1*    
│     
│ ⚡ Paso 1: Procesando prompt    
│ 🎬 Paso 2: Generando escenas    
│ 💫 Paso 3: Renderizando video    
╰━━━━━━━━━━━━━━━━━━━━━━⬣    
    
🌸 *Sora está trabajando en tu video...* 🎞️`,     
    m, ctxWarn);    
    
    const apiUrl = `https://mayapi.ooguy.com/ai-sora?q=${encodeURIComponent(text)}&apikey=may-f53d1d49`    
        
    let res;    
    try {    
      res = await axios.get(apiUrl, { timeout: 60000 })    
    } catch (apiError) {    
      throw new Error('El servidor de IA no responde');    
    }    
    
    const videoUrl = res?.data?.video    
        
    if (!videoUrl) {    
      throw new Error('La IA no pudo generar el video solicitado');    
    }    
    
    await conn.reply(m.chat,    
`╭━━━〔 🎀 𝐕𝐈𝐃𝐄𝐎 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀𝐃𝐎 🎀 〕━━━⬣    
│ ✅ *¡Video generado con éxito!*    
│     
│ 🎬 *Prompt usado:* ${text}        
│ ⚡ *Estado:* Renderizado    
╰━━━━━━━━━━━━━━━━━━━━━━⬣    
    
🌸 *Sora ha terminado tu creación...* 🎥`,     
    m, ctxOk);    
    
    await conn.sendFile(m.chat, videoUrl, 'sora-video.mp4',     
`╭━━━〔 🎀 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎 𝐒𝐎𝐑𝐀 1 🎀 〕━━━⬣    
│ ✅ *Video IA completado*    
│     
│ 🎬 *Prompt:* ${text}    
│ 💎 *Tipo:* Generación con IA    
│ ⚡ *Calidad:* Premium    
╰━━━━━━━━━━━━━━━━━━━━━━⬣    
    
🌸 *¡Disfruta tu video generado por Sora!* (◕‿◕✿)    
🎀 *Beneficio exclusivo para miembros premium* 💫`, m)    
    
    await m.react('✅')    
    
  } catch (error) {    
    console.error('❌ Error en video AI Sora:', error)    
    await m.react('❌')    
    
    await conn.reply(m.chat,    
`╭━━━〔 🎀 𝐄𝐑𝐑𝐎𝐑 𝐃𝐄 𝐕𝐈𝐃𝐄𝐎 🎀 〕━━━⬣    
│ ❌ *Error en el proceso*    
│     
│ 📝 *Detalles:* ${error.message}    
│     
│ 🔍 *Posibles causas:*    
│ • Servicio de IA no disponible    
│ • Prompt no válido    
│ • Problema técnico temporal    
╰━━━━━━━━━━━━━━━━━━━━━━⬣    
    
🌸 *Sora lo sentirá mucho...* (´；ω；\`)    
🎀 *Por favor, intenta de nuevo*`,     
    m, ctxErr);    
  }    
}    
    
handler.help = ['sora1']    
handler.tags = ['premium']    
handler.command = ['sora1']    
handler.register = true    
handler.premium = true    
    
export default handler
