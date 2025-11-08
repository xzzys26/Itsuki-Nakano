import fetch from 'node-fetch'
import FormData from 'form-data'

let handler = async (m, { conn, usedPrefix, command }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})

  const quoted = m.quoted ? m.quoted : m
  const mime = quoted.mimetype || quoted.msg?.mimetype || ''

  if (!/image\/(jpe?g|png)/i.test(mime)) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return conn.reply(m.chat, `🎀 *Responde a una imagen*`, m, ctxErr)
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })
    conn.reply(m.chat, `♻️ *Procesando imagen...*`, m, ctxWarn)  

    const media = await quoted.download()
    
    const form = new FormData()
    form.append('reqtype', 'fileupload')
    form.append('fileToUpload', media, 'image.jpg')

    const catboxRes = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: form
    })
    const catboxUrl = await catboxRes.text()

    if (!catboxUrl || !catboxUrl.startsWith('https://')) throw new Error('No se pudo subir la imagen a Catbox')

    const res = await fetch(`https://api-adonix.ultraplus.click/canvas/hd?apikey=Adofreekey&url=${encodeURIComponent(catboxUrl)}`, {
      method: 'GET'
    })
    const json = await res.json()

    if (!json?.status || !json?.url) throw new Error(json?.message || 'API no respondió')

    const imageRes = await fetch(json.url, { method: 'GET' })
    const resultBuffer = await imageRes.arrayBuffer()

    await conn.sendMessage(m.chat, {
      image: Buffer.from(resultBuffer),
      caption: `✨ *Imagen Mejorada HD*\n💫 *Itsuki-Nakano*`
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    conn.reply(m.chat, `❎️ *Error:* ${err.message}`, m, ctxErr)
  }
}

handler.help = ["hd"]
handler.tags = ["imagen"] 
handler.command = ["hd", "remini", "mejorar"]

export default handler