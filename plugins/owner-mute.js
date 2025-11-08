let mutedUsers = new Set();

let handler = async (m, { conn, usedPrefix, command, isAdmin, isBotAdmin }) => {
  const ctxErr = global.rcanalx || { contextInfo: { externalAdReply: { title: '❌ Error', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://files.catbox.moe/zh5z6m.jpg', sourceUrl: global.canalOficial || '' }}}
  const ctxWarn = global.rcanalw || { contextInfo: { externalAdReply: { title: '⚠️ Advertencia', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://files.catbox.moe/zh5z6m.jpg', sourceUrl: global.canalOficial || '' }}}
  const ctxOk = global.rcanalr || { contextInfo: { externalAdReply: { title: '✅ Acción', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://qu.ax/QGAVS.jpg', sourceUrl: global.canalOficial || '' }}}

    if (!isBotAdmin) return conn.reply(m.chat, '⭐ El bot necesita ser administrador.', m, ctxErr);
    if (!isAdmin) return conn.reply(m.chat, '⭐ Solo los administradores pueden usar este comando.', m, ctxErr);

    let user;
    if (m.quoted) {
        user = m.quoted.sender;
    } else {
        return conn.reply(m.chat, '> *‼️Responde al mensaje del usuario que quieres mutear.*', m, ctxWarn);
    }

    if (command === "mute") {
        mutedUsers.add(user);
        conn.reply(m.chat, `> ✅ *Usuario muteado:* @${user.split('@')[0]}`, m, { mentions: [user] }, ctxOk);
    } else if (command === "unmute") {
        mutedUsers.delete(user);
        conn.reply(m.chat, `> ✅ *Usuario desmuteado:* @${user.split('@')[0]}`, m, { mentions: [user] }, ctxOk);
    }
};

handler.before = async (m, { conn }) => {
    if (mutedUsers.has(m.sender) && m.mtype !== 'stickerMessage') {
        try {
            await conn.sendMessage(m.chat, { delete: m.key });
        } catch (e) {
            console.error(e);
        }
    }
};

handler.help = ['mute', 'unmute'];
handler.tags = ['owner'];
handler.command = ['mute','unmute'];
handler.group = true;
handler.rowner = true;
handler.botAdmin = true;

export default handler;