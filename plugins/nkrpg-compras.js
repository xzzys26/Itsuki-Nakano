// plugins/rpg-buy.js - SISTEMA DE COMPRAS RPG
let handler = async (m, { conn, text, usedPrefix, command }) => {
    const ctxErr = global.rcanalx || {}
    const ctxWarn = global.rcanalw || {}
    const ctxOk = global.rcanalr || {}

    if (!global.nkRPG || !global.nkRPG.users[m.sender]) {
        return conn.reply(m.chat, '❌ *Primero usa .nkrpg para iniciar el sistema RPG*', m, ctxErr)
    }

    const user = global.nkRPG.users[m.sender]
    const args = text ? text.split(' ') : []
    const objetoTexto = args.join(' ')

    if (!objetoTexto) {
        return conn.reply(m.chat,
`╭━━━〔 🛍️ 𝐂𝐎𝐌𝐏𝐑𝐀𝐑 𝐎𝐁𝐉𝐄𝐓𝐎𝐒 〕━━━⬣
│ ❌ *Debes especificar un objeto*
│ 
│ 📝 *Uso:*
│ ${usedPrefix}comprar <objeto>
│ 
│ 🎯 *Objetos disponibles:*
│ 
│ ⚔️ *Armas:*
│ • espada basica, baston magico
│ • arco itsuki, grimorio oscuro
│ • guadaña demoniaca, espada legendaria
│ 
│ 🛡️ *Armaduras:*
│ • tunica basica, armadura acero
│ • manto itsuki, tunica elfica
│ • armadura demonio, armadura divina
│ 
│ 🧪 *Consumibles:*
│ • pocion vida, pocion energia
│ • onigiri magico, elixir fuerza
│ • pocion defensa, fenix resurgente
│ 
│ 🐲 *Mascotas:*
│ • dragon pequeño, fenix, lobo espiritual
│ 
│ 💡 *Usa:* ${usedPrefix}nkrpg tienda
│ *Para ver precios*
╰━━━━━━━━━━━━━━━━━━━━━━⬣`, m, ctxWarn)
    }

    const objeto = objetoTexto.toLowerCase()
    const objetosDisponibles = {
        // Armas
        'espada': 'Espada Básica',
        'espada basica': 'Espada Básica',
        'baston': 'Bastón Mágico',
        'baston magico': 'Bastón Mágico',
        'arco': 'Arco de Itsuki',
        'arco itsuki': 'Arco de Itsuki',
        'grimorio': 'Grimorio Oscuro',
        'grimorio oscuro': 'Grimorio Oscuro',
        'guadaña': 'Guadaña Demoníaca',
        'guadaña demoniaca': 'Guadaña Demoníaca',
        'espada legendaria': 'Espada Legendaria',

        // Armaduras
        'tunica': 'Túnica Básica',
        'tunica basica': 'Túnica Básica',
        'armadura': 'Armadura de Acero',
        'armadura acero': 'Armadura de Acero',
        'manto': 'Manto de Itsuki',
        'manto itsuki': 'Manto de Itsuki',
        'tunicaelfica': 'Túnica Élfica',
        'tunica elfica': 'Túnica Élfica',
        'armadurademonio': 'Armadura Demoníaca',
        'armadura demonio': 'Armadura Demoníaca',
        'armadura divina': 'Armadura Divina',

        // Consumibles
        'pocionvida': 'Poción de Vida',
        'pocion vida': 'Poción de Vida',
        'pocionenergia': 'Poción de Energía',
        'pocion energia': 'Poción de Energía',
        'onigiri': 'Onigiri Mágico',
        'onigiri magico': 'Onigiri Mágico',
        'elixir': 'Elixir de Fuerza',
        'elixir fuerza': 'Elixir de Fuerza',
        'pociondefensa': 'Poción de Defensa',
        'pocion defensa': 'Poción de Defensa',
        'fenix': 'Fénix Resurgente',
        'fenix resurgente': 'Fénix Resurgente',

        // Mascotas
        'dragon': 'Dragón Pequeño',
        'dragon pequeño': 'Dragón Pequeño',
        'fenix mascota': 'Fénix',
        'lobo': 'Lobo Espiritual',
        'lobo espiritual': 'Lobo Espiritual'
    }

    const nombreObjeto = objetosDisponibles[objeto]
    
    if (!nombreObjeto) {
        return conn.reply(m.chat, 
`❌ *Objeto no encontrado*

💡 *Objetos disponibles:*
• espada, baston, arco, grimorio, guadaña
• tunica, armadura, manto, tunicaelfica, armadurademonio  
• pocionvida, pocionenergia, onigiri, elixir, pociondefensa
• dragon, fenix, lobo (mascotas)

🎯 *Usa:* ${usedPrefix}nkrpg tienda
*para ver todos los objetos y precios*`, m, ctxErr)
    }

    let statsObjeto = null
    let tipo = ''

    // Buscar en armas
    if (global.nkRPG.objetos.armas[nombreObjeto]) {
        statsObjeto = global.nkRPG.objetos.armas[nombreObjeto]
        tipo = 'arma'
    }
    // Buscar en armaduras
    else if (global.nkRPG.objetos.armaduras[nombreObjeto]) {
        statsObjeto = global.nkRPG.objetos.armaduras[nombreObjeto]
        tipo = 'armadura'
    }
    // Buscar en consumibles
    else if (global.nkRPG.objetos.consumibles[nombreObjeto]) {
        statsObjeto = global.nkRPG.objetos.consumibles[nombreObjeto]
        tipo = 'consumible'
    }
    // Buscar en mascotas
    else if (global.nkRPG.mascotas[nombreObjeto]) {
        statsObjeto = global.nkRPG.mascotas[nombreObjeto]
        tipo = 'mascota'
    }

    if (!statsObjeto) {
        return conn.reply(m.chat, '❌ *Error al encontrar el objeto*', m, ctxErr)
    }

    // Verificar si tiene suficiente dinero
    if (user.coin < statsObjeto.precio) {
        return conn.reply(m.chat, 
`❌ *Fondos insuficientes*

💰 *Necesitas:* ${statsObjeto.precio}¥
💵 *Tienes:* ${user.coin}¥
📉 *Te faltan:* ${statsObjeto.precio - user.coin}¥

💡 *Gana más yenes:*
• ${usedPrefix}nkrpg batalla @usuario
• ${usedPrefix}nkrpg recompensa
• ${usedPrefix}nkrpg entrenar
• ${usedPrefix}nkrpg jefes`, m, ctxErr)
    }

    // Comprar objeto
    user.coin -= statsObjeto.precio

    if (tipo === 'consumible') {
        // Agregar al inventario
        if (!user.inventario[nombreObjeto]) {
            user.inventario[nombreObjeto] = 0
        }
        user.inventario[nombreObjeto] += 1
    } else if (tipo === 'mascota') {
        // Asignar mascota
        if (user.mascota) {
            return conn.reply(m.chat, '❌ *Ya tienes una mascota. Usa primero .mascota liberar*', m, ctxErr)
        }
        user.mascota = nombreObjeto
        user.mascotaNivel = 1
    } else {
        // Equipar automáticamente
        if (tipo === 'arma') {
            user.equipo.arma = nombreObjeto
            user.stats.ataque += statsObjeto.ataque
        } else if (tipo === 'armadura') {
            user.equipo.armadura = nombreObjeto
            user.stats.defensa += statsObjeto.defensa
        }
    }

    let mensajeObjeto = ''
    if (tipo === 'arma') {
        mensajeObjeto = `🗡️ *Arma equipada:* ${nombreObjeto} (+${statsObjeto.ataque} ataque)`
    } else if (tipo === 'armadura') {
        mensajeObjeto = `🛡️ *Armadura equipada:* ${nombreObjeto} (+${statsObjeto.defensa} defensa)`
    } else if (tipo === 'mascota') {
        mensajeObjeto = `🐲 *Mascota obtenida:* ${nombreObjeto}`
    } else {
        mensajeObjeto = `🎒 *Objeto agregado:* ${nombreObjeto} x1`
    }

    return conn.reply(m.chat,
`╭━━━〔 🛍️ 𝐂𝐎𝐌𝐏𝐑𝐀 𝐄𝐗𝐈𝐓𝐎𝐒𝐀 〕━━━⬣
│ 🎉 *¡Compra realizada!*
│ ${mensajeObjeto}
│ 
│ 💰 *Transacción:*
│ Precio: ${statsObjeto.precio}¥
│ Saldo anterior: ${user.coin + statsObjeto.precio}¥
│ Saldo actual: ${user.coin}¥
│ 
│ 🎯 *¡Disfruta tu compra!*
╰━━━━━━━━━━━━━━━━━━━━━━⬣`, m, ctxOk)
}

handler.help = ['comprar']
handler.tags = ['rpgnk']
handler.command = ['comprar', 'buy']
handler.register = true

export default handler