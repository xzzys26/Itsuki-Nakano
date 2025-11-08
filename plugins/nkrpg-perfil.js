// plugins/rpg-profile.js - SISTEMA DE PERFIL RPG
let handler = async (m, { conn, text, usedPrefix, command }) => {
    const ctxErr = global.rcanalx || {}
    const ctxWarn = global.rcanalw || {}
    const ctxOk = global.rcanalr || {}

    if (!global.nkRPG || !global.nkRPG.users[m.sender]) {
        return conn.reply(m.chat, '❌ *Primero usa .nkrpg para iniciar el sistema RPG*', m, ctxErr)
    }

    const user = global.nkRPG.users[m.sender]
    const userName = conn.getName(m.sender) || 'Aventurero'

    const armamento = user.equipo.arma ? `🗡️ ${user.equipo.arma}` : '⚔️ Sin arma'
    const proteccion = user.equipo.armadura ? `🛡️ ${user.equipo.armadura}` : '👕 Sin armadura'
    const mascotaInfo = user.mascota ? `🐲 ${user.mascota} (Nvl ${user.mascotaNivel})` : '❌ Sin mascota'
    const clanInfo = user.clan ? `👥 ${user.clan} - ${user.rangoClan}` : '❌ Sin clan'
    const razaInfo = global.nkRPG.razas[user.raza]
    const progreso = Math.min((user.exp / user.expNecesaria) * 100, 100)
    const barra = '█'.repeat(Math.floor(progreso / 10)) + '░'.repeat(10 - Math.floor(progreso / 10))

    const perfil = 
`╭━━━〔 📋 𝐏𝐄𝐑𝐅𝐈𝐋 𝐃𝐄𝐋 𝐇𝐄𝐑𝐎𝐄 〕━━━⬣
│ 👤 *Aventurero:* ${userName}
│ ${razaInfo.emoji} *Raza:* ${user.raza}
│ ⭐ *Nivel:* ${user.nivel}
│ 📊 *EXP:* [${barra}] ${user.exp}/${user.expNecesaria}
│ ⚔️ *Clase:* ${user.clase}
│ 🏷️ *Título:* ${user.titulo}
│ 
│ 💫 *Habilidad Especial:*
│ ${razaInfo.habilidad}
│ 
│ ⚔️ *Equipamiento:*
│ ${armamento}
│ ${proteccion}
│ ${mascotaInfo}
│ ${clanInfo}
│ 
│ ❤️ *Estadísticas:*
│ ❤️ Vida: ${user.stats.vida}/${user.stats.vidaMax}
│ ⚡ Energía: ${user.stats.energia}/${user.stats.energiaMax}
│ 🗡️ Ataque: ${user.stats.ataque}
│ 🛡️ Defensa: ${user.stats.defensa}
│ 🏃 Velocidad: ${user.stats.velocidad}
│ 🍀 Suerte: ${user.stats.suerte}
│ 
│ 📈 *Puntos Disponibles:* ${user.puntos}
│ 💰 *Yenes:* ${user.coin}
│ 💎 *Gemas:* ${user.gemas}
│ 
│ ⚔️ *Récord:* ${user.victorias}🏆 ${user.derrotas}💀
│ 📜 *Misiones:* ${user.misionesCompletadas}
│ 🐉 *Jefes:* ${user.jefesDerrotados.length}
╰━━━━━━━━━━━━━━━━━━━━━━⬣

${razaInfo.descripcion}

⚡ *Usa ${usedPrefix}nkrpg entrenar para mejorar tus stats*`

    return conn.reply(m.chat, perfil, m, ctxOk)
}

handler.help = ['nkrpg perfil']
handler.tags = ['rpgnk'] 
handler.command = ['perfilrpg', 'rpgprofile']
handler.register = true

export default handler