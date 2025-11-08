import axios from 'axios';
const { generateWAMessageContent, generateWAMessageFromContent, proto } = (await import('@whiskeysockets/baileys')).default;

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})
  const ctxOk = (global.rcanalr || {})

  let user = global.db.data.users[m.sender];

  // Verificar si el usuario es premium
  if (!user.premium || user.premiumTime < Date.now()) {
    return conn.reply(m.chat, 
`╭━━━〔 🎀 𝐀𝐂𝐂𝐄𝐒𝐎 𝐃𝐄𝐍𝐄𝐆𝐀𝐃𝐎 🎀 〕━━━⬣
│ ❌ *Comando Exclusivo Premium*
│ 
│ 💎 Descargas de Pinterest
│ solo para miembros premium
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌟 *Obtén tu membresía:*
│ ${usedPrefix}premium dia
│ ${usedPrefix}premium semana  
│ ${usedPrefix}premium mes

🌸 *¡Únete al club exclusivo de Itsuki!* (◕‿◕✿)`, 
    m, ctxErr);
  }

  if (!args[0]) {
    return conn.reply(m.chat,
`╭━━━〔 🎀 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐃𝐎𝐑 𝐏𝐈𝐍𝐓𝐄𝐑𝐄𝐒𝐓 🎀 〕━━━⬣
│ 📌 *Uso correcto:*
│ ${usedPrefix + command} <url_pinterest>
│ 
│ 🎯 *Ejemplos válidos:*
│ ${usedPrefix + command} https://pin.it/1k5jWF7m1
│ ${usedPrefix + command} https://pinterest.com/pin/123456789
│ ${usedPrefix + command} https://www.pinterest.com/pin/123456789
│ ${usedPrefix + command} https://pinterest.es/pin/123456789
│ ${usedPrefix + command} https://pinterest.mx/pin/123456789
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 *Itsuki necesita un enlace válido...* 📥`, 
    m, ctxWarn);
  }

  await m.react('⏳');

  try {
    let url = args[0];

    // Convertir enlaces de la app a formato web
    if (url.includes('pin.it/')) {
      // Extraer el ID del enlace corto
      const pinId = url.split('pin.it/')[1];
      url = `https://pinterest.com/pin/${pinId}`;
    }

    // Validar que sea un enlace de Pinterest
    if (!url.match(/https?:\/\/(www\.)?pinterest\.(com|es|mx|fr|de|it|jp|co\.uk|ca|au|br)\/pin\/[a-zA-Z0-9]+/)) {
      return conn.reply(m.chat,
`╭━━━〔 🎀 𝐄𝐍𝐋𝐀𝐂𝐄 𝐈𝐍𝐕Á𝐋𝐈𝐃𝐎 🎀 〕━━━⬣
│ ❌ *Formato no reconocido*
│ 
│ 📝 *Enlaces aceptados:*
│ • https://pin.it/XXXXXXX (App)
│ • https://pinterest.com/pin/XXXXXXX
│ • https://pinterest.es/pin/XXXXXXX
│ • https://pinterest.mx/pin/XXXXXXX
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 *Itsuki solo acepta enlaces de Pinterest...* 📌`, 
    m, ctxErr);
    }

    // Mensaje de procesamiento
    await conn.reply(m.chat,
`╭━━━〔 🎀 𝐏𝐑𝐎𝐂𝐄𝐒𝐀𝐍𝐃𝐎 🎀 〕━━━⬣
│ 🔮 *Analizando enlace de Pinterest*
│ 
│ 📥 Paso 1: Verificando enlace
│ ⚡ Paso 2: Conectando API
│ 🎬 Paso 3: Extrayendo video
│ 💫 Paso 4: Preparando descarga
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 *Itsuki está trabajando en tu descarga...* 📌`, 
    m, ctxWarn);

    // Probar múltiples APIs
    let videoUrl = null;
    let errorCount = 0;

    // API 1
    try {
      const res1 = await axios.get(`https://api.siputzx.my.id/api/d/pinterest?url=${encodeURIComponent(url)}`, { timeout: 30000 });
      if (res1.data.status && res1.data.data?.url) {
        videoUrl = res1.data.data.url;
      }
    } catch (e) {
      errorCount++;
    }

    // API 2 (backup)
    if (!videoUrl) {
      try {
        const res2 = await axios.get(`https://api.lolhuman.xyz/api/pinterest?apikey=${global.lolkey}&url=${encodeURIComponent(url)}`, { timeout: 30000 });
        if (res2.data.status === 200 && res2.data.result) {
          videoUrl = res2.data.result;
        }
      } catch (e) {
        errorCount++;
      }
    }

    // API 3 (backup adicional)
    if (!videoUrl) {
      try {
        const res3 = await axios.get(`https://api.erdwpe.com/api/download/pinterest?url=${encodeURIComponent(url)}`, { timeout: 30000 });
        if (res3.data.status && res3.data.result) {
          videoUrl = res3.data.result;
        }
      } catch (e) {
        errorCount++;
      }
    }

    if (!videoUrl) {
      return conn.reply(m.chat,
`╭━━━〔 🎀 𝐄𝐑𝐑𝐎𝐑 𝐃𝐄 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀 🎀 〕━━━⬣
│ ❌ *No se pudo obtener el video*
│ 
│ 📝 *Posibles causas:*
│ • El enlace no contiene video
│ • El contenido fue eliminado
│ • Límite de la API alcanzado
│ • Error temporal del servidor
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 *Itsuki intentó ${errorCount} APIs diferentes...* (´･ω･\`)
🎀 *Prueba con otro enlace o intenta más tarde*`, 
    m, ctxErr);
    }

    // Enviar video con estilo premium
    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: 
`╭━━━〔 🎀 𝐕𝐈𝐃𝐄𝐎 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐃𝐎 🎀 〕━━━⬣
│ ✅ *¡Descarga completada!*
│ 
│ 📌 *Plataforma:* Pinterest
│ 🔗 *Tipo:* Video/Imagen
│ 💎 *Calidad:* Alta
│ ⚡ *Estado:* Premium
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 *¡Contenido descargado con éxito!* (◕‿◕✿)
🎀 *Beneficio exclusivo para miembros premium* 💫`
    }, { quoted: m });

    await m.react('✅');

  } catch (e) {
    console.error(e);
    await m.react('❌');

    await conn.reply(m.chat,
`╭━━━〔 🎀 𝐄𝐑𝐑𝐎𝐑 𝐂𝐑𝐈𝐓𝐈𝐂𝐎 🎀 〕━━━⬣
│ ❌ *Error en el proceso*
│ 
│ 📝 *Detalles técnicos:*
│ ${e.message}
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 *Itsuki lo sentirá mucho...* (´；ω；\`)
🎀 *Por favor, intenta con otro enlace*`, 
    m, ctxErr);
  }
};

handler.command = ['pinvideo', 'pindl', 'pinterestdl', 'pindescargar', 'pinmedia'];
handler.register = true;
handler.help = ['pinvideo'];
handler.tags = ['premium'];
handler.premium = true;

export default handler;