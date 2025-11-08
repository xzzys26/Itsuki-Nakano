// plugins/rpg-main.js - MENÚ PRINCIPAL RPG
let handler = async (m, { conn, text, usedPrefix, command }) => {
    const ctxErr = global.rcanalx || {}
    const ctxWarn = global.rcanalw || {}
    const ctxOk = global.rcanalr || {}

    // INICIALIZAR SISTEMA RPG SI NO EXISTE
    if (!global.nkRPG) {
        global.nkRPG = {
            users: {},
            batallas: {},
            misiones: {},
            recompensas: {},
            clans: {},
            eventos: {},
            jefes: {
                'Slime Rey': { vida: 500, ataque: 30, defensa: 15, recompensa: { coin: 200, exp: 100 }, emoji: '👑' },
                'Dragón Ancestral': { vida: 1000, ataque: 50, defensa: 25, recompensa: { coin: 500, exp: 300 }, emoji: '🐉' },
                'Itsuki Oscura': { vida: 1500, ataque: 70, defensa: 35, recompensa: { coin: 1000, exp: 500 }, emoji: '👻' }
            },
            razas: {
                'Humano': { 
                    vida: 10, ataque: 8, defensa: 7, energia: 6,
                    habilidad: 'Adaptabilidad - +10% EXP en todas las actividades',
                    emoji: '👨‍🚀',
                    descripcion: 'Versátil y adaptable, los humanos sobresalen en cualquier situación'
                },
                'Elfo': { 
                    vida: 7, ataque: 9, defensa: 6, energia: 9,
                    habilidad: 'Precisión Élfica - +15% de daño crítico',
                    emoji: '🧝‍♂️',
                    descripcion: 'Graceful y preciso, los elfos son maestros del arco y la magia'
                },
                'Mago': { 
                    vida: 6, ataque: 12, defensa: 5, energia: 10,
                    habilidad: 'Poder Arcano - +20% de daño mágico',
                    emoji: '🔮',
                    descripcion: 'Sabios y poderosos, los magos dominan las artes arcanas'
                },
                'Brujo': { 
                    vida: 8, ataque: 10, defensa: 8, energia: 8,
                    habilidad: 'Alquimia Oscura - +15% de vida al usar pociones',
                    emoji: '🧙‍♂️',
                    descripcion: 'Misteriosos y astutos, los brujos manipulan la alquimia oscura'
                },
                'Demonio': { 
                    vida: 12, ataque: 11, defensa: 9, energia: 7,
                    habilidad: 'Furia Infernal - +25% de daño cuando vida < 30%',
                    emoji: '😈',
                    descripcion: 'Poderosos y temibles, los demonios desatan furia infernal'
                }
            },
            objetos: {
                armas: {
                    'Espada Básica': { ataque: 15, precio: 100, tipo: 'fisica', emoji: '⚔️' },
                    'Bastón Mágico': { ataque: 25, precio: 300, tipo: 'magica', emoji: '🪄' },
                    'Arco de Itsuki': { ataque: 35, precio: 500, tipo: 'fisica', emoji: '🏹' },
                    'Grimorio Oscuro': { ataque: 40, precio: 700, tipo: 'magica', emoji: '📖' },
                    'Guadaña Demoníaca': { ataque: 45, precio: 900, tipo: 'demoníaca', emoji: '⚰️' },
                    'Espada Legendaria': { ataque: 60, precio: 1500, tipo: 'legendaria', emoji: '⚜️' }
                },
                armaduras: {
                    'Túnica Básica': { defensa: 10, precio: 80, emoji: '👕' },
                    'Armadura de Acero': { defensa: 20, precio: 250, emoji: '🛡️' },
                    'Manto de Itsuki': { defensa: 30, precio: 400, emoji: '🧥' },
                    'Túnica Élfica': { defensa: 25, precio: 350, emoji: '🎯' },
                    'Armadura Demoníaca': { defensa: 35, precio: 600, emoji: '🔥' },
                    'Armadura Divina': { defensa: 50, precio: 1200, emoji: '✨' }
                },
                consumibles: {
                    'Poción de Vida': { vida: 50, precio: 50, emoji: '❤️' },
                    'Poción de Energía': { energia: 30, precio: 40, emoji: '⚡' },
                    'Onigiri Mágico': { vida: 100, energia: 50, precio: 100, emoji: '🍙' },
                    'Elixir de Fuerza': { ataque: 10, duracion: 3, precio: 150, emoji: '💪' },
                    'Poción de Defensa': { defensa: 8, duracion: 3, precio: 120, emoji: '🛡️' },
                    'Fénix Resurgente': { vida: 200, energia: 100, precio: 300, emoji: '🔥' }
                }
            },
            mascotas: {
                'Dragón Pequeño': { ataque: 20, defensa: 15, precio: 1000, emoji: '🐲' },
                'Fénix': { ataque: 25, defensa: 10, precio: 1500, emoji: '🔥' },
                'Lobo Espiritual': { ataque: 15, defensa: 20, precio: 800, emoji: '🐺' }
            }
        }
    }

    // INICIALIZAR USUARIO
    if (!global.nkRPG.users[m.sender]) {
        global.nkRPG.users[m.sender] = {
            nivel: 1,
            exp: 0,
            expNecesaria: 100,
            puntos: 0,
            raza: 'Humano',
            clase: 'Novato',
            titulo: 'Estudiante Primerizo',
            stats: {
                vida: 100,
                vidaMax: 100,
                energia: 50,
                energiaMax: 50,
                ataque: 10,
                defensa: 10,
                velocidad: 5,
                suerte: 1
            },
            equipo: {
                arma: null,
                armadura: null,
                accesorio: null
            },
            inventario: {
                'Poción de Vida': 3,
                'Poción de Energía': 2
            },
            mascota: null,
            mascotaNivel: 0,
            clan: null,
            rangoClan: null,
            victorias: 0,
            derrotas: 0,
            misionesCompletadas: 0,
            jefesDerrotados: [],
            coin: 1000,
            gemas: 0,
            recompensasRecibidas: [],
            ultimaRecompensa: 0,
            ultimoEntrenamiento: 0,
            logros: [],
            tiempoJugado: 0
        }
    }

    const user = global.nkRPG.users[m.sender]
    const userName = conn.getName(m.sender) || 'Aventurero'
    const args = text ? text.split(' ') : []
    const subCommand = args[0]?.toLowerCase()

    if (!subCommand) {
        return mostrarMenuPrincipal()
    }

    // REDIRIGIR A SUB-COMANDOS
    const subCommands = {
        'perfil': 'rpg-profile.js',
        'profile': 'rpg-profile.js',
        'batalla': 'rpg-battle.js', 
        'battle': 'rpg-battle.js',
        'inventario': 'rpg-inventory.js',
        'inventory': 'rpg-inventory.js',
        'tienda': 'rpg-shop.js',
        'shop': 'rpg-shop.js',
        'misiones': 'rpg-quests.js',
        'quests': 'rpg-quests.js',
        'entrenar': 'rpg-train.js',
        'train': 'rpg-train.js',
        'razas': 'rpg-races.js',
        'races': 'rpg-races.js',
        'recompensa': 'rpg-reward.js',
        'reward': 'rpg-reward.js',
        'jefes': 'rpg-bosses.js',
        'boss': 'rpg-bosses.js',
        'clan': 'rpg-clan.js',
        'top': 'rpg-top.js',
        'ranking': 'rpg-top.js',
        'usar': 'rpg-use.js',
        'use': 'rpg-use.js',
        'mejorar': 'rpg-upgrade.js',
        'upgrade': 'rpg-upgrade.js',
        'mascotas': 'rpg-pets.js',
        'pets': 'rpg-pets.js'
    }

    if (subCommands[subCommand]) {
        return conn.reply(m.chat, 
`🔧 *Sistema modular activado*

📁 *Archivo:* ${subCommands[subCommand]}
🎯 *Comando:* ${usedPrefix}${subCommand}

💡 *Este comando ahora está en un archivo separado para mejor organización*`, m, ctxOk)
    }

    async function mostrarMenuPrincipal() {
        const progreso = Math.min((user.exp / user.expNecesaria) * 100, 100)
        const barra = '█'.repeat(Math.floor(progreso / 10)) + '░'.repeat(10 - Math.floor(progreso / 10))
        const razaInfo = global.nkRPG.razas[user.raza]

        const menu = 
`╭━━━〔 🏰 𝐌𝐄𝐍𝐔 𝐏𝐑𝐈𝐍𝐂𝐈𝐏𝐀𝐋 𝐑𝐏𝐆 〕━━━⬣
│ 👤 *Aventurero:* ${userName}
│ ${razaInfo.emoji} *Raza:* ${user.raza}
│ ⚔️ *Clase:* ${user.clase}
│ 🏷️ *Título:* ${user.titulo}
│ ⭐ *Nivel:* ${user.nivel}
│ 📊 *EXP:* [${barra}] ${progreso.toFixed(1)}%
│ 
│ ❤️ *Vida:* ${user.stats.vida}/${user.stats.vidaMax}
│ ⚡ *Energía:* ${user.stats.energia}/${user.stats.energiaMax}
│ 🗡️ *Ataque:* ${user.stats.ataque}
│ 🛡️ *Defensa:* ${user.stats.defensa}
│ 
│ ⚔️ *Batallas:* ${user.victorias}🏆 ${user.derrotas}💀
│ 📜 *Misiones:* ${user.misionesCompletadas}
│ 💰 *Yenes:* ${user.coin}
│ 💎 *Gemas:* ${user.gemas}
╰━━━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 🎮 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒 𝐃𝐈𝐒𝐏𝐎𝐍𝐈𝐁𝐋𝐄𝐒 〕━━━⬣
│ 
│ ⚔️ *Combate:*
│ • ${usedPrefix}nkrpg batalla @usuario
│ • ${usedPrefix}nkrpg jefes
│ 
│ 📊 *Información:*
│ • ${usedPrefix}nkrpg perfil
│ • ${usedPrefix}nkrpg inventario
│ • ${usedPrefix}nkrpg misiones
│ • ${usedPrefix}nkrpg top
│ 
│ 🏪 *Economía:*
│ • ${usedPrefix}nkrpg tienda
│ • ${usedPrefix}comprar <objeto>
│ • ${usedPrefix}nkrpg recompensa
│ 
│ 🧬 *Desarrollo:*
│ • ${usedPrefix}nkrpg razas
│ • ${usedPrefix}elegirraza <raza>
│ • ${usedPrefix}nkrpg entrenar
│ • ${usedPrefix}nkrpg mejorar <stat>
│ 
│ 🐲 *Mascotas:*
│ • ${usedPrefix}nkrpg mascotas
│ • ${usedPrefix}mascota <accion>
│ 
│ 🎯 *Utilidades:*
│ • ${usedPrefix}nkrpg usar <objeto>
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌠 *¡Sistema RPG Modular - Itsuki Nakano IA!* ✨`

        return conn.reply(m.chat, menu, m, ctxOk)
    }
}

handler.help = ['nkrpg']
handler.tags = ['rpgnk']
handler.command = ['nkrpg', 'rpgitsuki', 'nkia']
handler.register = true

export default handler
