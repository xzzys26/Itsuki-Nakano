import moment from 'moment-timezone';

let handler = async (m, { conn, usedPrefix }) => {
    // Sistema rcanal
    const ctxErr = (global.rcanalx || {})
    const ctxWarn = (global.rcanalw || {})
    const ctxOk = (global.rcanalr || {})
    
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;

    if (!(who in global.db.data.users)) {
        // Usando ctxErr si está disponible
        if (ctxErr.inventario) {
            return conn.reply(m.chat, ctxErr.inventario, m);
        }
        return conn.reply(m.chat, '❌ El usuario no se encuentra en mi base de Datos.', m);
    }

    let user = global.db.data.users[who];
    let name = conn.getName(who);
    let premium = user.premium ? '✅' : '❌';
    let moneda = '¥';

    let text = `╭━〔 Inventario de ${name} 〕⬣\n` +
               `┋ 💸 *${moneda} en Cartera:* ${user.coin || 0}\n` +  
               `┋ 🏦 *${moneda} en Banco:* ${user.bank || 0}\n` + 
               `┋ ♦️ *Esmeraldas:* ${user.emerald || 0}\n` + 
               `┋ 🔩 *Hierro:* ${user.iron || 0}\n` +  
               `┋ 🏅 *Oro:* ${user.gold || 0}\n` + 
               `┋ 🕋 *Carbón:* ${user.coal || 0}\n` +  
               `┋ 🪨 *Piedra:* ${user.stone || 0}\n` +  
               `┋ ✨ *Experiencia:* ${user.exp || 0}\n` + 
               `┋ ❤️ *Salud:* ${user.health || 100}\n` + 
               `┋ 💎 *Diamantes:* ${user.diamond || 0}\n` +   
               `┋ 🍬 *Dulces:* ${user.candies || 0}\n` + 
               `┋ 🎁 *Regalos:* ${user.gifts || 0}\n` + 
               `┋ 🎟️ *Tokens:* ${user.joincount || 0}\n` +  
               `┋ ✨️ *Premium:* ${premium}\n` + 
               `┋ ⏳ *Última Aventura:* ${user.lastAdventure ? moment(user.lastAdventure).fromNow() : 'Nunca'}\n` + 
               `┋ 📅 *Fecha:* ${new Date().toLocaleString('es-ES')}\n` +
               `╰━━━━━━━━━━━━⬣`;

    // Usando ctxOk si está disponible para mensajes de éxito
    if (ctxOk.inventario) {
        text = ctxOk.inventario + '\n\n' + text;
    }

    conn.reply(m.chat, text, m);
}

handler.help = ['inventario', 'inv'];
handler.tags = ['rpgnk'];
handler.command = ['inventario', 'inv']; 
handler.group = true;
handler.register = true;

export default handler;