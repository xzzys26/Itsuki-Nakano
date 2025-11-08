const handler = async (m, { conn, text, usedPrefix, command, isOwner, mentionedJid }) => {
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

    // VERIFICAR SI ES OWNER
    if (!isOwner) {
        if (command === 'regalarpremium') {
            return conn.reply(m.chat,
`╭━━━〔 🎀 𝐀𝐂𝐂𝐄𝐒𝐎 𝐃𝐄𝐍𝐄𝐆𝐀𝐃𝐎 🎀 〕━━━⬣
│ ❌ *Comando exclusivo*
│ 👑 Solo para el creador del bot
╰━━━━━━━━━━━━━━━━━━━━━━⬣`, m, ctxErr);
        }
        return;
    }

    // OPCIÓN REGALAR PREMIUM (Solo owner) - VERSIÓN SEGURA
    if ((command === 'regalarpremium' || (command === 'premium' && text?.includes('@'))) && isOwner) {
        const mentioned = m.mentionedJid?.[0] || mentionedJid?.[0];

        if (!mentioned) {
            return conn.reply(m.chat,
`╭━━━〔 🎀 𝐑𝐄𝐆𝐀𝐋𝐀𝐑 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 🎀 〕━━━⬣
│ ❌ *Menciona a un usuario*
│ 📝 *Uso:* ${usedPrefix}regalarpremium @usuario <plan>
│ 💡 *Planes:* dia, semana, mes, año, infinito
╰━━━━━━━━━━━━━━━━━━━━━━⬣`, m, ctxWarn);
        }

        const planText = text.replace(/@\d+/g, '').trim() || 'mes';
        const selectedPlan = plans[planText] || plans['mes'];

        // **MÉTODO SEGURO - Sin modificar global.db directamente**
        try {
            // Verificar si el usuario existe en la base de datos
            let targetUser = global.db.data.users[mentioned];
            
            if (!targetUser) {
                // **CREAR USUARIO DE FORMA SEGURA** 
                global.db.data.users[mentioned] = {
                    premium: true,
                    premiumTime: Date.now() + (selectedPlan.duration * 24 * 60 * 60 * 1000),
                    coin: 0,
                    limit: 50, // valores por defecto seguros
                    // NO agregar campos que puedan corromper la sesión
                };
            } else {
                // **MODIFICAR USUARIO EXISTENTE DE FORMA SEGURA**
                targetUser.premium = true;
                targetUser.premiumTime = Date.now() + (selectedPlan.duration * 24 * 60 * 60 * 1000);
            }

            // **GUARDADO SEGURO - Sin await para evitar bloqueos**
            if (typeof global.db.write === 'function') {
                global.db.write().catch(err => {
                    console.error('Error de guardado (no crítico):', err);
                });
            }

        } catch (error) {
            console.error('Error seguro al regalar premium:', error);
            return conn.reply(m.chat, 
`╭━━━〔 🎀 𝐄𝐑𝐑𝐎𝐑 𝐒𝐄𝐆𝐔𝐑𝐎 🎀 〕━━━⬣
│ ❌ *Error al regalar premium*
│ 📝 *El premium se activó pero no se guardó*
│ 💡 *La sesión del bot está protegida*
╰━━━━━━━━━━━━━━━━━━━━━━⬣`, m, ctxErr);
        }

        // Obtener nombre del usuario
        let targetName = 'Usuario';
        try {
            targetName = await conn.getName(mentioned) || 'Usuario';
        } catch (e) {}

        const remainingTime = selectedPlan.duration * 24 * 60 * 60 * 1000;
        const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));

        await conn.reply(m.chat,
`╭━━━〔 🎀 𝐑𝐄𝐆𝐀𝐋𝐎 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 🎀 〕━━━⬣
│ 🎁 *¡Premium Regalado!*
│ 👤 *Para:* ${targetName}
│ 💎 *Plan:* ${planText.toUpperCase()}
│ ⏰ *Duración:* ${days} días
│ 💰 *Costo:* ¥0 (Regalo)
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 *¡Regalo especial de Itsuki!* 🎀`, m, ctxOk);

        await m.react('🎁');
        return;
    }

    // MODO OWNER - Activación para sí mismo (segura)
    if (isOwner && text && !text.includes('@')) {
        const selectedPlan = plans[text] || plans['mes'];

        user.premium = true;
        user.premiumTime = Date.now() + (selectedPlan.duration * 24 * 60 * 60 * 1000);

        // Guardado seguro para owner
        if (typeof global.db.write === 'function') {
            global.db.write().catch(err => {
                console.error('Error de guardado owner:', err);
            });
        }

        await conn.reply(m.chat, 
`╭━━━〔 🎀 𝐌𝐎𝐃𝐎 𝐂𝐑𝐄𝐀𝐃𝐎𝐑 🎀 〕━━━⬣
│ 👑 *¡Premium Activado!*
│ 💎 *Plan:* ${text.toUpperCase()}
│ ⏰ *Duración:* ${selectedPlan.duration} días
╰━━━━━━━━━━━━━━━━━━━━━━⬣`, m, ctxOk);

        await m.react('👑');
        return;
    }

    // MOSTRAR PLANES (para todos)
    if (!text || !plans[text]) {
        let response = 
`╭━━━〔 🎀 𝐏𝐋𝐀𝐍𝐄𝐒 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 🎀 〕━━━⬣
│ 🌸 *Sistema Premium - Itsuki*
╰━━━━━━━━━━━━━━━━━━━━━━⬣

💎 *Planes Disponibles:*
${Object.entries(plans).map(([plan, data]) => 
    `│ ${data.emoji} *${plan.toUpperCase()}* - ${data.duration}d - ¥${data.cost.toLocaleString()}`
).join('\n')}

📝 *Uso:* ${usedPrefix + command} <plan>
👑 *Owner:* ${usedPrefix}regalarpremium @usuario <plan>`;

        return conn.reply(m.chat, response, m, ctxWarn);
    }

    // COMPRA NORMAL DE USUARIOS
    const selectedPlan = plans[text];
    
    if (user.coin < selectedPlan.cost) {
        return conn.reply(m.chat, 
`╭━━━〔 🎀 𝐅𝐎𝐍𝐃𝐎𝐒 𝐈𝐍𝐒𝐔𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄𝐒 🎀 〕━━━⬣
│ ❌ *Necesitas:* ¥${selectedPlan.cost.toLocaleString()}
│ 💵 *Tienes:* ¥${user.coin.toLocaleString()}
╰━━━━━━━━━━━━━━━━━━━━━━⬣`, m, ctxErr);
    }

    user.coin -= selectedPlan.cost;
    user.premium = true;
    user.premiumTime = (user.premiumTime > 0 ? user.premiumTime : Date.now()) + (selectedPlan.duration * 24 * 60 * 60 * 1000);

    // Guardado seguro para usuario normal
    if (typeof global.db.write === 'function') {
        global.db.write().catch(err => {
            console.error('Error de guardado usuario:', err);
        });
    }

    await conn.reply(m.chat, 
`╭━━━〔 🎀 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 𝐀𝐃𝐐𝐔𝐈𝐑𝐈𝐃𝐎 🎀 〕━━━⬣
│ ✅ *¡Plan Activado!*
│ 💎 *Plan:* ${text.toUpperCase()}
│ 💰 *Costo:* ¥${selectedPlan.cost.toLocaleString()}
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 *¡Bienvenido al club premium!* 🎀`, m, ctxOk);

    await m.react('💎');
};

handler.help = ['premium', 'vip', 'regalarprem'];
handler.tags = ['premium'];
handler.command = ['premium', 'vip', 'regalarpremium'];
handler.register = false; // Importante: no registrar para evitar conflictos

export default handler;