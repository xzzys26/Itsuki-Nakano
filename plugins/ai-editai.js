import axios from 'axios'
import FormData from 'form-data'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})
  const ctxOk = (global.rcanalr || {})

  // Verificar si el usuario es premium
  let user = global.db.data.users[m.sender];
  if (!user.premium || user.premiumTime < Date.now()) {
    return conn.reply(m.chat,
`╭━━━〔 🎀 𝐀𝐂𝐂𝐄𝐒𝐎 𝐃𝐄𝐍𝐄𝐆𝐀𝐃𝐎 🎀 〕━━━⬣
│ ❌ *Comando Exclusivo Premium*
│ 
│ 💎 Edición de imágenes con IA
│ solo para miembros premium
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌟 *Obtén tu membresía:*
│ ${usedPrefix}premium dia
│ ${usedPrefix}premium semana  
│ ${usedPrefix}premium mes

🌸 *¡Únete al club exclusivo de Itsuki!* (◕‿◕✿)`, 
    m, ctxErr);
  }

  // Verificación CORREGIDA de la cita
  if (!m.quoted) {
    return conn.reply(m.chat,
`╭━━━〔 🎀 𝐄𝐃𝐈𝐓𝐎𝐑 𝐀𝐈 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 🎀 〕━━━⬣
│ ❌ *Debes responder a una imagen*
│ 
│ 📌 *Uso correcto:*
│ 1. Responde a una imagen con:
│ ${usedPrefix + command} <prompt>
│ 
│ 🎯 *Ejemplos:*
│ ${usedPrefix + command} hacerla estilo anime
│ ${usedPrefix + command} cambiar fondo a playa
│ ${usedPrefix + command} agregar efectos mágicos
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 *Itsuki necesita una imagen para editar...* 🖼️`, 
    m, ctxWarn);
  }

  // Verificación CORREGIDA del tipo de archivo
  if (!m.quoted.mimetype || !m.quoted.mimetype.startsWith('image/')) {
    return conn.reply(m.chat,
`╭━━━〔 🎀 𝐄𝐃𝐈𝐓𝐎𝐑 𝐀𝐈 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 🎀 〕━━━⬣
│ ❌ *Archivo no compatible*
│ 
│ 📌 *Solo se aceptan:*
│ • Imágenes (JPG, PNG, etc.)
│ • Debes responder a una imagen
│ • No videos ni documentos
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 *Itsuki solo puede editar imágenes...* 📸`, 
    m, ctxWarn);
  }

  if (!text) {
    return conn.reply(m.chat,
`╭━━━〔 🎀 𝐄𝐃𝐈𝐓𝐎𝐑 𝐀𝐈 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 🎀 〕━━━⬣
│ ❌ *Debes escribir un prompt*
│ 
│ 📌 *Uso correcto:*
│ ${usedPrefix + command} <texto_de_edición>
│ 
│ 🎨 *Ejemplos creativos:*
│ • "hacerla estilo anime"
│ • "cambiar fondo a playa" 
│ • "agregar efectos mágicos"
│ • "convertir en pintura al óleo"
│ • "hacer estilo cyberpunk"
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 *Itsuki necesita instrucciones para editar...* ✨`, 
    m, ctxWarn);
  }

  try {
    // Mensaje de procesamiento
    await conn.reply(m.chat,
`╭━━━〔 🎀 𝐏𝐑𝐎𝐂𝐄𝐒𝐀𝐍𝐃𝐎 🎀 〕━━━⬣
│ 🔮 *Editando imagen con IA*
│ 
│ 📥 Paso 1: Subiendo imagen
│ ⚡ Paso 2: Procesando prompt
│ 🎨 Paso 3: Aplicando edición
│ 💫 Paso 4: Generando resultado
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 *Itsuki está trabajando en tu edición...* 🖌️`, 
    m, ctxWarn);

    // DESCARGAR LA IMAGEN - CORREGIDO
    let buffer;
    try {
      buffer = await m.quoted.download();
    } catch (downloadError) {
      throw new Error('No se pudo descargar la imagen');
    }

    // Verificar que el buffer no esté vacío
    if (!buffer || buffer.length === 0) {
      throw new Error('La imagen está vacía o corrupta');
    }

    const form = new FormData()
    form.append('reqtype', 'fileupload')
    form.append('fileToUpload', buffer, { 
      filename: 'image.jpg',
      contentType: m.quoted.mimetype
    })

    // Subir imagen a catbox
    let url;
    try {
      const { data } = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders(),
        timeout: 30000
      })
      url = data?.trim()
    } catch (uploadError) {
      throw new Error('Error al subir la imagen al servidor');
    }

    if (!url || !url.startsWith('http')) {
      throw new Error('No se obtuvo un enlace válido para la imagen');
    }

    // Procesar con IA
    const apiUrl = `https://mayapi.ooguy.com/photoeditor?image=${encodeURIComponent(url)}&q=${encodeURIComponent(text)}&apikey=may-f53d1d49`
    
    let res;
    try {
      res = await axios.get(apiUrl, { timeout: 45000 })
    } catch (apiError) {
      throw new Error('El servidor de IA no responde');
    }

    const finalImg = res?.data?.result?.url
    
    if (!finalImg) {
      throw new Error('La IA no pudo generar la edición solicitada');
    }

    // Mensaje de éxito
    await conn.reply(m.chat,
`╭━━━〔 🎀 𝐄𝐃𝐈𝐂𝐈𝐎𝐍 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀𝐃𝐀 🎀 〕━━━⬣
│ ✅ *¡Imagen editada con éxito!*
│ 
│ 🎨 *Prompt usado:* ${text}
│ 💎 *Calidad:* IA Premium
│ ⚡ *Estado:* Procesado
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 *Itsuki ha terminado tu edición...* 🎨`, 
    m, ctxOk);

    // Descargar y enviar imagen editada
    let imgBuffer;
    try {
      imgBuffer = await axios.get(finalImg, { 
        responseType: 'arraybuffer',
        timeout: 30000 
      }).then(res => res.data)
    } catch (finalError) {
      throw new Error('Error al obtener la imagen editada');
    }

    await conn.sendFile(m.chat, imgBuffer, 'edit-premium.jpg', 
`╭━━━〔 🎀 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 🎀 〕━━━⬣
│ ✅ *Edición IA completada*
│ 
│ 🎨 *Prompt:* ${text}
│ 💎 *Tipo:* Edición con IA
│ ⚡ *Calidad:* Premium
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 *¡Disfruta tu imagen editada!* (◕‿◕✿)
🎀 *Beneficio exclusivo para miembros premium* 💫`, m)

    await m.react('✅')

  } catch (error) {
    console.error('❌ Error en edición AI:', error)
    await m.react('❌')

    await conn.reply(m.chat,
`╭━━━〔 🎀 𝐄𝐑𝐑𝐎𝐑 𝐃𝐄 𝐄𝐃𝐈𝐂𝐈𝐎𝐍 🎀 〕━━━⬣
│ ❌ *Error en el proceso*
│ 
│ 📝 *Detalles:* ${error.message}
│ 
│ 🔍 *Posibles causas:*
│ • ${error.message.includes('descargar') ? 'Error al obtener la imagen' : 
       error.message.includes('subir') ? 'Error al subir la imagen' :
       error.message.includes('IA') ? 'Servicio de IA no disponible' :
       error.message.includes('vacía') ? 'Imagen corrupta o muy pesada' :
       'Problema técnico temporal'}
│ • Imagen muy pesada
│ • Servicio ocupado
│ • Intenta con otra imagen
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 *Itsuki lo sentirá mucho...* (´；ω；\`)
🎀 *Por favor, intenta de nuevo*`, 
    m, ctxErr);
  }
}

handler.help = ['editai']
handler.tags = ['premium']
handler.command = ['editai', 'iaedit', 'editia', 'aiimage']
handler.register = true
handler.premium = true

export default handler