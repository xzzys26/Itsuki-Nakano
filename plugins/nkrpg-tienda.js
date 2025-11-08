// plugins/rpg-shop.js - SISTEMA DE TIENDA RPG
let handler = async (m, { conn, text, usedPrefix, command }) => {
    const ctxErr = global.rcanalx || {}
    const ctxWarn = global.rcanalw || {}
    const ctxOk = global.rcanalr || {}

    if (!global.nkRPG || !global.nkRPG.users[m.sender]) {
        return conn.reply(m.chat, '❌ *Primero usa .nkrpg para iniciar el sistema RPG*', m, ctxErr)
    }

    const user = global.nkRPG.users[m.sender]
    const userName = conn.getName(m.sender) || 'Aventurero'

    const tienda = 
`╭━━━〔 🏪 𝐓𝐈𝐄𝐍𝐃𝐀 𝐌𝐀𝐆𝐈𝐂𝐀 〕━━━⬣
│ 👤 *Jugador:* ${userName}
│ ${global.nkRPG.razas[user.raza].emoji} *Raza:* ${user.raza}
│ 💰 *Yenes:* ${user.coin}
│ 💎 *Gemas:* ${user.gemas}
│ 
│ ${global.nkRPG.objetos.armas['Espada Básica'].emoji} *ARMAS*
${Object.entries(global.nkRPG.objetos.armas).map(([nombre, stats]) => 
    `│ ${stats.emoji} *${nombre}*
│ 🗡️ Ataque: +${stats.ataque} | 🎯 Tipo: ${stats.tipo}
│ 💰 Precio: ${stats.precio}¥
│`
).join('\n')}
│ 
│ ${global.nkRPG.objetos.armaduras['Armadura de Acero'].emoji} *ARMADURAS*
${Object.entries(global.nkRPG.objetos.armaduras).map(([nombre, stats]) => 
    `│ ${stats.emoji} *${nombre}*
│ 🛡️ Defensa: +${stats.defensa}
│ 💰 Precio: ${stats.precio}¥
│`
).join('\n')}
│ 
│ ${global.nkRPG.objetos.consumibles['Poción de Vida'].emoji} *CONSUMIBLES*
${Object.entries(global.nkRPG.objetos.consumibles).map(([nombre, stats]) => 
    `│ ${stats.emoji} *${nombre}*
│ ❤️ Vida: +${stats.vida || 0} | ⚡ Energía: +${stats.energia || 0}
│ 🗡️ Ataque: +${stats.ataque || 0} | 🛡️ Defensa: +${stats.defensa || 0}
│ 💰 Precio: ${stats.precio}¥
│`
).join('\n')}
│ 
│ ${global.nkRPG.mascotas['Dragón Pequeño'].emoji} *MASCOTAS*
${Object.entries(global.nkRPG.mascotas).map(([nombre, stats]) => 
    `│ ${stats.emoji} *${nombre}*
│ 🗡️ Ataque: +${stats.ataque} | 🛡️ Defensa: +${stats.defensa}
│ 💰 Precio: ${stats.precio}¥
│`
).join('\n')}
╰━━━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 🛍️ 𝐂𝐎𝐌𝐏𝐑𝐀𝐑 〕━━━⬣
│ 
│ 📝 *Usa:* ${usedPrefix}comprar <objeto>
│ 
│ 🎯 *Ejemplos:*
│ • ${usedPrefix}comprar espada basica
│ • ${usedPrefix}comprar pocion vida
│ • ${usedPrefix}comprar dragon pequeño
│ 
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🏰 *¡Que encuentres lo que buscas!* ✨`

    return conn.reply(m.chat, tienda, m, ctxOk)
}

handler.help = ['nkrpg tienda']
handler.tags = ['rpgnk']
handler.command = ['tiendarpg', 'rpgshop'] 
handler.register = true

export default handler