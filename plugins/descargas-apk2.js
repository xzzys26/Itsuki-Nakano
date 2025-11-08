import { search, download } from 'aptoide-scraper'
import fetch from 'node-fetch'
import Jimp from 'jimp'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const ctxErr = global.rcanalx || { contextInfo: { externalAdReply: { title: '❌ Error', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://files.catbox.moe/zh5z6m.jpg', sourceUrl: global.canalOficial || '' }}}
  const ctxWarn = global.rcanalw || { contextInfo: { externalAdReply: { title: '⚠️ Advertencia', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://files.catbox.moe/zh5z6m.jpg', sourceUrl: global.canalOficial || '' }}}
  const ctxOk = global.rcanalr || { contextInfo: { externalAdReply: { title: '✅ Acción', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://qu.ax/QGAVS.jpg', sourceUrl: global.canalOficial || '' }}}

  if (!text) {
    return conn.reply(m.chat, `> ꒰⌢ ʚ˚₊‧ 🕸️ ꒱꒱ :: *DESCARGA APK* ıllı

> ੭੭ ﹙ ❌ ﹚:: *Nombre requerido*

\`\`\`Debes ingresar el nombre de la aplicación\`\`\`

*Ejemplo:*
> ${usedPrefix + command} WhatsApp
> ${usedPrefix + command} TikTok

*Nota:* Busca y descarga APKs desde Aptoide`, m, ctxWarn)
  }

  try {
    await m.react('🕒')

    let searchA = await search(text)
    if (!searchA.length) {
      await m.react('❌')
      return conn.reply(m.chat, `> ꒰⌢ ʚ˚₊‧ ⚠️ ꒱꒱ :: *SIN RESULTADOS* ıllı

> ੭੭ ﹙ 🔍 ﹚:: *Búsqueda sin resultados*

\`\`\`No se encontraron aplicaciones para: ${text}\`\`\`

*Sugerencias:*
• Verifica la ortografía
• Intenta con el nombre exacto
• Usa términos en inglés`, m, ctxErr)
    }

    let data5 = await download(searchA[0].id)

    let txt = `> ꒰⌢ ʚ˚₊‧ 📱 ꒱꒱ :: *INFORMACIÓN DE LA APK* ıllı

> ੭੭ ﹙ 🏷️ ﹚:: *Nombre*
\`\`\`${data5.name}\`\`\`

> ੭੭ ﹙ 📦 ﹚:: *Package*
\`\`\`${data5.package}\`\`\`

> ੭੭ ﹙ 📅 ﹚:: *Última actualización*
\`\`\`${data5.lastup}\`\`\`

> ੭੭ ﹙ 💾 ﹚:: *Tamaño*
\`\`\`${data5.size}\`\`\`

> ੭੭ ﹙ 📥 ﹚:: *Estado*
\`\`\`Preparando descarga...\`\`\`

‐ ダ *𝙄𝙩𝙨𝙪𝙠𝙞-𝙉𝙖𝙠𝙖𝙣𝙤 𝙋𝙧𝙚𝙢𝘽𝙤𝙩* ギ
‐ ダ *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʟᴇᴏ* ギ`

    await conn.sendFile(m.chat, data5.icon, 'thumbnail.jpg', txt, m, null, ctxOk)

    if (data5.size.includes('GB') || parseFloat(data5.size.replace(' MB', '')) > 999) {
      await m.react('❌')
      return conn.reply(m.chat, `> ꒰⌢ ʚ˚₊‧ ꕥ ꒱꒱ :: *ARCHIVO DEMASIADO GRANDE* ıllı

> ੭੭ ﹙ ⚠️ ﹚:: *Límite de tamaño excedido*

\`\`\`El archivo pesa: ${data5.size}\`\`\`

> ੭੭ ﹙ 📏 ﹚:: *Límite máximo permitido*
\`\`\`999 MB\`\`\`

*Solución:*
• Busca una versión más ligera
• Descarga desde otro sitio
• Verifica el tamaño antes de descargar`, m, ctxErr)
    }

    let thumbnail = null
    try {
      const img = await Jimp.read(data5.icon)
      img.resize(300, Jimp.AUTO)
      thumbnail = await img.getBufferAsync(Jimp.MIME_JPEG)
    } catch (err) {
      console.log('⚠️ Error al crear miniatura:', err)
    }

    await conn.sendMessage(
      m.chat,
      {
        document: { url: data5.dllink },
        mimetype: 'application/vnd.android.package-archive',
        fileName: `${data5.name}.apk`,
        caption: `> ꒰⌢ ʚ˚₊‧ ✅ ꒱꒱ :: *APK DESCARGADA* ıllı

> ੭੭ ﹙ 📱 ﹚:: *Aplicación*
\`\`\`${data5.name}\`\`\`

> ੭੭ ﹙ 📦 ﹚:: *Package*
\`\`\`${data5.package}\`\`\`

> ੭੭ ﹙ 💾 ﹚:: *Tamaño*
\`\`\`${data5.size}\`\`\`

‐ ダ *𝘐𝘵𝘴𝘶𝘬𝘪-𝘗𝘳𝘦𝘮𝘉𝘰𝘵* ギ
‐ ダ *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʟᴇᴏ* ギ`,
        ...(thumbnail ? { jpegThumbnail: thumbnail } : {}),
        contextInfo: {
          externalAdReply: {
            title: `${data5.name}`,
            body: `📱 ${data5.size} • Aptoide Download`,
            mediaType: 1,
            sourceUrl: data5.dllink
          }
        }
      },
      { quoted: m }
    )

    await m.react('✅')

  } catch (error) {
    console.error(error)
    await m.react('❌')
    return conn.reply(m.chat, `> ꒰⌢ ʚ˚₊‧ ✖️ ꒱꒱ :: *ERROR EN DESCARGA* ıllı

> ੭੭ ﹙ ⚠️ ﹚:: *Error detectado*

\`\`\`${error.message || 'Error al procesar la descarga'}\`\`\`

*Posibles causas:*
• Aplicación no disponible
• Problemas con Aptoide
• Error en la conexión

*Solución:*
• Verifica el nombre de la aplicación
• Intenta con otro término de búsqueda
• Usa *${usedPrefix}report* para informar el problema`, m, ctxErr)
  }
}

handler.tags = ['premium']
handler.help = ['modoapk']
handler.command = ['modapk', 'apk2']
handler.group = true
handler.premium = true

export default handler