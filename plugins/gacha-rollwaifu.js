import { promises as fs } from 'fs'

const charactersFilePath = './src/database/characters[1].json'
const haremFilePath = './src/database/harem.json'

const cooldowns = {}

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        throw new Error('🧧 No se pudo cargar el archivo characters.json.')
    }
}

async function loadHarem() {
    try {
        const data = await fs.readFile(haremFilePath, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        return []
    }
}

let handler = async (m, { conn }) => {
    const userId = m.sender
    const now = Date.now()

    // Reaccionar al mensaje del usuario inmediatamente
    await conn.sendMessage(m.chat, {
        react: {
            text: '⏳',
            key: m.key
        }
    })

    // Tiempo reducido de 15 minutos a 3 minutos
    if (cooldowns[userId] && now < cooldowns[userId]) {
        const remainingTime = Math.ceil((cooldowns[userId] - now) / 1000)
        const minutes = Math.floor(remainingTime / 60)
        const seconds = remainingTime % 60
        await conn.reply(m.chat, 
            `╭━━━〔 🎀 𝐂𝐎𝐎𝐋𝐃𝐎𝐖𝐍 🎀 〕━━━⬣\n│ ⏰ *Tiempo de espera:*\n│ ${minutes} minutos y ${seconds} segundos\n╰━━━━━━━━━━━━━━━━━━━━━━⬣\n\n🌸 *Itsuki te pide paciencia...* (´･ω･\`)`, 
        m)

        await conn.sendMessage(m.chat, {
            react: {
                text: '❎',
                key: m.key
            }
        })
        return
    }

    try {
        const characters = await loadCharacters()
        const harem = await loadHarem()

        const randomCharacter = characters[Math.floor(Math.random() * characters.length)]
        const randomImage = randomCharacter.img[Math.floor(Math.random() * randomCharacter.img.length)]

        // Verificar si el personaje ya está reclamado
        const userHarem = harem.find(entry => entry.characterId === randomCharacter.id)
        const statusMessage = userHarem 
            ? '🔴 Ya este personaje ha sido reclamado' 
            : '🟢 Disponible para reclamar'

        const message = 
`╭━━━〔 🌸 𝐏𝐄𝐑𝐒𝐎𝐍𝐀𝐉𝐄 𝐀𝐋𝐄𝐀𝐓𝐎𝐑𝐈𝐎 🌸 〕━━━⬣
│ 🎴 Nombre ➪ *${randomCharacter.name}*
│ ⚧️ Género ➪ *${randomCharacter.gender}*
│ 💎 Valor ➪ *${randomCharacter.value}*
│ 🎯 Estado ➪ ${statusMessage}
│ 📚 Fuente ➪ *${randomCharacter.source}*
│ 🪪 ID: *${randomCharacter.id}*
╰━━━━━━━━━━━━━━━━━━━━━━⬣

${!userHarem ? `🍜 *¡Personaje disponible!*\n📖 *Responde con .c para reclamarlo* 🎀` : `📚 *Este personaje ya tiene dueño*\n🌸 *Sigue intentando para encontrar uno disponible*`}`

        const mentions = userHarem ? [userHarem.userId] : []

        // Enviar el mensaje con el personaje
        await conn.sendFile(m.chat, randomImage, `${randomCharacter.name}.jpg`, message, m, { 
            mentions,
            contextInfo: {
                mentionedJid: mentions
            }
        })

        // Reacción de éxito
        await conn.sendMessage(m.chat, {
            react: {
                text: '✅',
                key: m.key
            }
        })

        // Cooldown reducido de 15 minutos a 3 minutos (180 segundos)
        cooldowns[userId] = now + 3 * 60 * 1000

    } catch (error) {
        await conn.reply(m.chat, 
            `╭━━━〔 🎀 𝐄𝐑𝐑𝐎𝐑 🎀 〕━━━⬣\n│ ❌ *Error:* ${error.message}\n╰━━━━━━━━━━━━━━━━━━━━━━⬣\n\n🌸 *Itsuki lo intentará de nuevo...* (´；ω；\`)`, 
        m)

        await conn.sendMessage(m.chat, {
            react: {
                text: '❎',
                key: m.key
            }
        })
    }
}

handler.help = ['ver', 'rw', 'rollwaifu']
handler.tags = ['gacha']
handler.command = ['ver', 'rw', 'rollwaifu']
handler.group = true

export default handler