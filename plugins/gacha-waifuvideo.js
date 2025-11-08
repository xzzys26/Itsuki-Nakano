import { promises as fs } from 'fs'

const charactersFilePath = './src/database/characters[1].json'
const haremFilePath = './src/database/harem.json'

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        throw new Error('No se pudo cargar el archivo characters.json.')
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

let handler = async (m, { conn, command, args, usedPrefix }) => {
    const ctxErr = global.rcanalx || {}
    const ctxWarn = global.rcanalw || {}
    const ctxOk = global.rcanalr || {}

    if (args.length === 0) {
        await conn.reply(m.chat, 
            `🍙📚 *ITSUKI - Video de Personaje* 🎬\n\n` +
            `❌ Debes proporcionar el nombre del personaje\n\n` +
            `📝 *Uso:*\n${usedPrefix}${command} <nombre del personaje>\n\n` +
            `💡 *Ejemplo:*\n${usedPrefix}${command} Itsuki Nakano\n\n` +
            `📖 "Escribe el nombre del personaje para ver su video"`,
            m, ctxWarn
        )
        return
    }

    const characterName = args.join(' ').toLowerCase().trim()

    try {
        const characters = await loadCharacters()
        const character = characters.find(c => c.name.toLowerCase() === characterName)

        if (!character) {
            await conn.reply(m.chat, 
                `🍙❌ *ITSUKI - Personaje No Encontrado*\n\n` +
                `⚠️ No se encontró: *${characterName}*\n\n` +
                `💡 *Sugerencias:*\n` +
                `• Verifica la ortografía\n` +
                `• Usa el nombre completo\n` +
                `• Usa ${usedPrefix}topwaifus para ver personajes\n\n` +
                `📚 "Asegúrate de escribir el nombre correctamente"`,
                m, ctxErr
            )
            return
        }

        if (!character.vid || character.vid.length === 0) {
            await conn.reply(m.chat, 
                `🍙📹 *ITSUKI - Sin Video*\n\n` +
                `⚠️ No hay videos disponibles para *${character.name}*\n\n` +
                `📊 *Información del personaje:*\n` +
                `• Nombre: ${character.name}\n` +
                `• Género: ${character.gender}\n` +
                `• Fuente: ${character.source}\n\n` +
                `📚 "Este personaje aún no tiene videos"`,
                m, ctxWarn
            )
            return
        }

        const randomVideo = character.vid[Math.floor(Math.random() * character.vid.length)]
        const message = 
            `🍙🎬 *ITSUKI - Video de Personaje* 📚✨\n\n` +
            `📖 *Nombre:* ${character.name}\n` +
            `⚥ *Género:* ${character.gender}\n` +
            `🎬 *Fuente:* ${character.source}\n` +
            `💎 *Valor:* ${character.value}\n\n` +
            `🍱 "Disfruta del video" ✨`

        const sendAsGif = Math.random() < 0.5

        if (sendAsGif) {
            await conn.sendMessage(m.chat, { 
                video: { url: randomVideo }, 
                gifPlayback: true, 
                caption: message,
                contextInfo: ctxOk.contextInfo
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { 
                video: { url: randomVideo }, 
                caption: message,
                contextInfo: ctxOk.contextInfo
            }, { quoted: m })
        }
    } catch (error) {
        await conn.reply(m.chat, 
            `🍙❌ *ITSUKI - Error al Cargar Video*\n\n` +
            `⚠️ No se pudo cargar el video del personaje\n\n` +
            `📝 *Error:* ${error.message}\n\n` +
            `💡 El video puede estar caído o el enlace inválido\n\n` +
            `📚 "Intenta con otro personaje"`,
            m, ctxErr
        )
    }
}

handler.help = ['wvideo']
handler.tags = ['gacha']
handler.command = ['charvideo', 'wvideo', 'waifuvideo', 'video']
handler.group = true

export default handler