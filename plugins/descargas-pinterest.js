import axios from 'axios';
import baileys from '@whiskeysockets/baileys';

async function sendAlbumMessage(conn, jid, medias, options = {}) {
  if (typeof jid !== "string") {
    throw new TypeError(`jid must be string, received: ${jid} (${jid?.constructor?.name})`);
  }

  for (const media of medias) {
    if (!media.type || (media.type !== "image" && media.type !== "video")) {
      throw new TypeError(`media.type must be "image" or "video", received: ${media.type} (${media.type?.constructor?.name})`);
    }
    if (!media.data || (!media.data.url && !Buffer.isBuffer(media.data))) {
      throw new TypeError(`media.data must be object with url or buffer, received: ${media.data} (${media.data?.constructor?.name})`);
    }
  }

  if (medias.length < 2) {
    throw new RangeError("Minimum 2 media");
  }

  const caption = options.text || options.caption || "";
  const delay = !isNaN(options.delay) ? options.delay : 500;
  delete options.text;
  delete options.caption;
  delete options.delay;

  const album = baileys.generateWAMessageFromContent(
    jid,
    {
      messageContextInfo: {},
      albumMessage: {
        expectedImageCount: medias.filter(media => media.type === "image").length,
        expectedVideoCount: medias.filter(media => media.type === "video").length,
        ...(options.quoted
          ? {
              contextInfo: {
                remoteJid: options.quoted.key.remoteJid,
                fromMe: options.quoted.key.fromMe,
                stanzaId: options.quoted.key.id,
                participant: options.quoted.key.participant || options.quoted.key.remoteJid,
                quotedMessage: options.quoted.message,
              },
            }
          : {}),
      },
    },
    {}
  );

  await conn.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id });

  for (let i = 0; i < medias.length; i++) {
    const { type, data } = medias[i];
    const img = await baileys.generateWAMessage(
      album.key.remoteJid,
      { [type]: data, ...(i === 0 ? { caption } : {}) },
      { upload: conn.waUploadToServer }
    );
    img.message.messageContextInfo = {
      messageAssociation: { associationType: 1, parentMessageKey: album.key },
    };
    await conn.relayMessage(img.key.remoteJid, img.message, { messageId: img.key.id });
    await baileys.delay(delay);
  }

  return album;
}

const pins = async (judul) => {
  try {
    const res = await axios.get(`https://api.kirito.my/api/pinterest?q=${encodeURIComponent(judul)}&apikey=by_deylin`);
    if (Array.isArray(res.data.images)) {
      return res.data.images.map(url => ({
        image_large_url: url,
        image_medium_url: url,
        image_small_url: url
      }));
    }
    return [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // ✅ CORREGIDO: Definir las variables que faltaban
  const ctxErr = global.rcanalx || { contextInfo: { externalAdReply: { title: '❌ Error', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://files.catbox.moe/zh5z6m.jpg', sourceUrl: global.canalOficial || '' }}}
  const ctxWarn = global.rcanalw || { contextInfo: { externalAdReply: { title: '⚠️ Advertencia', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://files.catbox.moe/zh5z6m.jpg', sourceUrl: global.canalOficial || '' }}}
  const ctxOk = global.rcanalr || { contextInfo: { externalAdReply: { title: '✅ Acción', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://qu.ax/QGAVS.jpg', sourceUrl: global.canalOficial || '' }}}
  
  const botname = conn.getName(conn.user.jid) || 'Bot'
  const emojis = '🎀'

  if (!text) return conn.reply(m.chat, `${emojis} Ingresa un texto. Ejemplo: ${usedPrefix + command} ${botname}`, m, ctxWarn);

  try {
    const res2 = await fetch('https://files.catbox.moe/875ido.png');
    const thumb2 = Buffer.from(await res2.arrayBuffer());

    const userJid = m.sender;
    const fkontak = {
      key: { fromMe: false, participant: userJid },
      message: {
        documentMessage: {
          title: botname,
          fileName: `𝗛𝗢𝗟𝗔, 𝗘𝗦𝗧𝗘 𝗘𝗦 𝗘𝗟 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗧𝗦 𝗠𝗔𝗦 𝗣𝗢𝗧𝗘𝗡𝗧𝗘`,
          jpegThumbnail: thumb2
        }
      }
    };

    m.react('🕒');

    const results = await pins(text);
    if (!results || results.length === 0) return conn.reply(m.chat, `No se encontraron resultados para "${text}".`, m, ctxErr);

    const maxImages = Math.min(results.length, 15);
    const medias = [];

    for (let i = 0; i < maxImages; i++) {
      medias.push({
        type: 'image',
        data: { url: results[i].image_large_url || results[i].image_medium_url || results[i].image_small_url }
      });
    }

    await sendAlbumMessage(conn, m.chat, medias, {
      caption: `𝗥𝗲𝘀𝘂𝗹𝘁𝗮𝗱𝗼𝘀 𝗱𝗲: ${text}\n𝗖𝗮𝗻𝘁𝗶𝗱𝗮𝗱 𝗱𝗲 𝗿𝗲𝘀𝘂𝗹𝘁𝗮𝗱𝗼𝘀: ${maxImages}`,
      quoted: fkontak
    });

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error(error);
    conn.reply(m.chat, 'Error al obtener imágenes de Pinterest.', m, ctxErr);
  }
};

handler.help = ['pinterest'];
handler.command = ['pinterest', 'pin'];
handler.tags = ['buscador'];

export default handler;