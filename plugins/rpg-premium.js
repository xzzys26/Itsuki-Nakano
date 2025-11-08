const handler = async (m, { conn, text, usedPrefix, command, isOwner }) => {
    const ctxErr = (global.rcanalx || {})
    const ctxWarn = (global.rcanalw || {})
    const ctxOk = (global.rcanalr || {})

    let user = global.db.data.users[m.sender];
    text = text ? text.toLowerCase().trim() : '';

    const plans = {
        'dia': { duration: 1, cost: 50000, emoji: '🌅' },
        'semana': { duration: 7, cost: 250000, emoji: '📅' },
        'mes': { duration: 30, cost: 750000, emoji: '🗓️' },
        'año': { duration: 365, cost: 5000000, emoji: '🎉' },
        'infinito': { duration: 9999, cost: 999999999, emoji: '♾️' }
    };

    // MODO OWNER - Activación gratuita para sí mismo
    if (isOwner && text && !text.includes('@')) {
        const selectedPlan = plans[text] || plans['mes'];

        user.premium = true;
        const newPremiumTime = Date.now() + (selectedPlan.duration * 24 * 60 * 60 * 1000);
        user.premiumTime = newPremiumTime;

        // **GUARDAR CAMBIOS DEL OWNER**
        try {
            if (typeof global.db.write === 'function') {
                await global.db.write();
            }
        } catch (saveError) {
            console.error('Error al guardar:', saveError);
        }

        const remainingTime = newPremiumTime - Date.now();
        const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        await conn.reply(m.chat, 
`╭━━━〔 🎀 𝐌𝐎𝐃𝐎 𝐂𝐑𝐄𝐀𝐃𝐎𝐑 🎀 〕━━━⬣
│ 👑 *¡Premium Activado Gratis!*
│ 
│ 💎 *Plan:* ${text.charAt(0).toUpperCase() + text.slice(1)}
│ ⏰ *Duración:* ${selectedPlan.duration} día(s)
│ 💰 *Costo:* ¥0 (Gratis)
│ 
│ ⏳ *Tiempo restante:*
│ ${days} días y ${hours} horas
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌟 *Beneficios Activados:*
• Comandos exclusivos ✅
• Prioridad máxima ✅
• Sin límites ✅
• Acceso total ✅

🌸 *¡Poder de creador activado!* 👑
🎀 *Disfruta de tus privilegios* 💫`, 
        m, ctxOk);

        await m.react('👑');
        return;
    }

    // MODO NORMAL PARA USUARIOS
    if (!text || !plans[text]) {
        let response = 
`╭━━━〔 🎀 𝐏𝐋𝐀𝐍𝐄𝐒 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 🎀 〕━━━⬣
│ 🌸 *Itsuki-Nakano IA - Sistema Premium*
╰━━━━━━━━━━━━━━━━━━━━━━⬣

💎 *Planes Disponibles:*

${Object.entries(plans).map(([plan, data]) => 
    `│ ${data.emoji} *${plan.charAt(0).toUpperCase() + plan.slice(1)}*\n` +
    `│ ⏰ Duración: ${data.duration} día(s)\n` +
    `│ 💰 Costo: ¥${data.cost.toLocaleString()}\n` +
    `│ ────────────────────`
).join('\n')}

📝 *Cómo usar:*
│ ${usedPrefix + command} <plan>
│ 
│ *Ejemplo:*
│ ${usedPrefix + command} semana

👑 *Modo Creador:*
│ ${usedPrefix}premium <plan> (Gratis)

🌸 *Itsuki te ofrece beneficios exclusivos...* (◕‿◕✿)`;

        return conn.reply(m.chat, response, m, ctxWarn);
    }

    const selectedPlan = plans[text];

    if (user.coin < selectedPlan.cost) {
        return conn.reply(m.chat, 
`╭━━━〔 🎀 𝐄𝐑𝐑𝐎𝐑 🎀 〕━━━⬣
│ ❌ *Fondos insuficientes*
│ 
│ 💰 *Necesitas:* ¥${selectedPlan.cost.toLocaleString()}
│ 💵 *Tienes:* ¥${user.coin.toLocaleString()}
│ 📉 *Faltan:* ¥${(selectedPlan.cost - user.coin).toLocaleString()}
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 *Itsuki sugiere que consigas más monedas...* (´･ω･\`)`, 
        m, ctxErr);
    }

    user.coin -= selectedPlan.cost;
    user.premium = true;

    const newPremiumTime = (user.premiumTime > 0 ? user.premiumTime : Date.now()) + (selectedPlan.duration * 24 * 60 * 60 * 1000);
    user.premiumTime = newPremiumTime;

    // **GUARDAR CAMBIOS DE USUARIO NORMAL**
    try {
        if (typeof global.db.write === 'function') {
            await global.db.write();
        }
    } catch (saveError) {
        console.error('Error al guardar:', saveError);
    }

    const remainingTime = newPremiumTime - Date.now();
    const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    await conn.reply(m.chat, 
`╭━━━〔 🎀 𝐅𝐄𝐋𝐈𝐂𝐈𝐃𝐀𝐃𝐄𝐒 🎀 〕━━━⬣
│ ✅ *¡Plan Premium Adquirido!*
│ 
│ 💎 *Plan:* ${text.charAt(0).toUpperCase() + text.slice(1)}
│ ⏰ *Duración:* ${selectedPlan.duration} día(s)
│ 💰 *Costo:* ¥${selectedPlan.cost.toLocaleString()}
│ 
│ ⏳ *Tiempo restante:*
│ ${days} días y ${hours} horas
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌟 *Beneficios Premium:*
• Acceso a comandos exclusivos
• Prioridad en respuestas
• Funciones especiales desbloqueadas
• Sin límites de uso

🌸 *¡Itsuki te da la bienvenida al club premium!* (◕‿◕✿)
🎀 *Disfruta de tus nuevos beneficios* 💫`, 
    m, ctxOk);

    await m.react('💎');
};

handler.help = ['premium', 'vip'];
handler.tags = ['premium'];
handler.command = ['premium', 'vip'];
handler.register = true;

export default handler;