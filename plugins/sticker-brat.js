import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    const ctxErr = global.rcanalx || { contextInfo: { externalAdReply: { title: '❌ Error', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://files.catbox.moe/zh5z6m.jpg', sourceUrl: global.canalOficial || '' }}}
    const ctxWarn = global.rcanalw || { contextInfo: { externalAdReply: { title: '⚠️ Advertencia', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://files.catbox.moe/zh5z6m.jpg', sourceUrl: global.canalOficial || '' }}}
    const ctxOk = global.rcanalr || { contextInfo: { externalAdReply: { title: '✅ Éxito', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://qu.ax/QGAVS.jpg', sourceUrl: global.canalOficial || '' }}}

    try {
        if (!args[0]) {
            return conn.reply(m.chat, 
                `> 🌸 𝙋𝙤𝙧 𝙛𝙖𝙫𝙤𝙧 𝙞𝙣𝙜𝙧𝙚𝙨𝙖 𝙚𝙡 𝙩𝙚𝙭𝙩𝙤 𝙦𝙪𝙚 𝙙𝙚𝙨𝙚𝙖𝙨 𝙘𝙤𝙣𝙫𝙚𝙧𝙩𝙞𝙧 𝙚𝙣 𝙨𝙩𝙞𝙘𝙠𝙚𝙧.\n\n> 𝗘𝗷𝗲𝗺𝗽𝗹𝗼: ${usedPrefix}𝗕𝗿𝗮𝘁 𝗟𝗲𝗼 𝗘𝘀 𝗘𝗹 𝗠𝗲𝗷𝗼𝗿`, 
                m, ctxWarn);
        }

        const text = encodeURIComponent(args.join(" "));
        const apiUrl = `https://api.siputzx.my.id/api/m/brat?text=${text}`;

        // Reacción de espera
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        // Obtener el sticker
        const stickerResponse = await fetch(apiUrl);
        if (!stickerResponse.ok) throw new Error('error al generar el sticker');

        // Enviar el sticker de forma limpia
        await conn.sendMessage(m.chat, {
            sticker: { url: apiUrl },
            packname: 'ᴍʏ ʀᴜʙʏ 💗',
            author: 'ᴘʀᴇᴍ'
        }, { quoted: m });

        // Reacción de éxito
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
        console.error(err);
        // Reacción de error
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await conn.reply(m.chat, 
            `> 𝙊𝙘𝙪𝙧𝙧𝙞ó 𝙪𝙣 𝙚𝙧𝙧𝙤𝙧 𝙖𝙡 𝙜𝙚𝙣𝙚𝙧𝙖𝙧 𝙚𝙡 𝙨𝙩𝙞𝙘𝙠𝙚𝙧.\n\n𝙋𝙤𝙧 𝙛𝙖𝙫𝙤𝙧 𝙞𝙣𝙩𝙚𝙣𝙩𝙖 𝙙𝙚 𝙣𝙪𝙚𝙫𝙤.`, 
            m, ctxErr);
    }
};

handler.help = ['brat <texto>'];
handler.tags = ['sticker'];
handler.command = /^brat(icker)?$/i;

export default handler;