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

async function saveCharacters(characters) {
    try {
        await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2), 'utf-8')
    } catch (error) {
        throw new Error('No se pudo guardar el archivo characters.json.')
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

async function saveHarem(harem) {
    try {
        await fs.writeFile(haremFilePath, JSON.stringify(harem, null, 2))
    } catch (error) {
        throw new Error('No se pudo guardar el archivo harem.json.')
    }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const ctxErr = global.rcanalx || {}
    const ctxWarn = global.rcanalw || {}
    const ctxOk = global.rcanalr || {}

    const userId = m.sender

    if (args.length < 2) {
        await conn.reply(m.chat, 
            `🍙📚 *ITSUKI - Regalar Personaje* 🎁\n\n` +
            `❌ Faltan datos para el regalo\n\n` +
            `📝 *Uso correcto:*\n` +
            `${usedPrefix}${command} <nombre del personaje> @usuario\n\n` +
            `💡 *Ejemplo:*\n` +
            `${usedPrefix}${command} Itsuki Nakano @usuario\n\n` +
            `📖 "Especifica el personaje y menciona a quien se lo regalarás"`,
            m, ctxWarn
        )
        return
    }

    const characterName = args.slice(0, -1).join(' ').toLowerCase().trim()
    let who = m.mentionedJid[0]

    if (!who) {
        await conn.reply(m.chat, 
            `🍙❌ *ITSUKI - Usuario No Mencionado*\n\n` +
            `⚠️ Debes mencionar a un usuario válido\n\n` +
            `📝 *Formato:*\n` +
            `${usedPrefix}${command} ${characterName} @usuario\n\n` +
            `📚 "No olvides mencionar al destinatario"`,
            m, ctxErr
        )
        return
    }

    if (who === userId) {
        await conn.reply(m.chat, 
            `🍙😅 *ITSUKI - Regalo Inválido*\n\n` +
            `❌ No puedes regalarte un personaje a ti mismo\n\n` +
            `📚 "Regala tus personajes a otros usuarios"`,
            m, ctxWarn
        )
        return
    }

    try {
        const characters = await loadCharacters()
        const character = characters.find(c => c.name.toLowerCase() === characterName && c.user === userId)

        if (!character) {
            await conn.reply(m.chat, 
                `🍙❌ *ITSUKI - Personaje No Encontrado*\n\n` +
                `⚠️ *${characterName}* no está en tu harem\n\n` +
                `📝 *Posibles causas:*\n` +
                `• No tienes este personaje\n` +
                `• El nombre está mal escrito\n` +
                `• Ya lo regalaste\n\n` +
                `💡 Usa ${usedPrefix}harem para ver tus personajes\n\n` +
                `📚 "Verifica el nombre del personaje"`,
                m, ctxErr
            )
            return
        }

        character.user = who
        await saveCharacters(characters)

        const harem = await loadHarem()
        const userEntryIndex = harem.findIndex(entry => entry.userId === who)

        if (userEntryIndex !== -1) {
            harem[userEntryIndex].characterId = character.id
            harem[userEntryIndex].lastClaimTime = Date.now()
        } else {
            const userEntry = {
                userId: who,
                characterId: character.id,
                lastClaimTime: Date.now()
            }
            harem.push(userEntry)
        }

        await saveHarem(harem)

        await conn.reply(m.chat, 
            `🍙🎁 *ITSUKI - Regalo Entregado* 📚✨\n\n` +
            `🎉 Has regalado a *${character.name}* exitosamente\n\n` +
            `📊 *Detalles del regalo:*\n` +
            `🎴 Personaje: ${character.name}\n` +
            `👤 De: @${userId.split('@')[0]}\n` +
            `👤 Para: @${who.split('@')[0]}\n` +
            `💎 Valor: ${character.value}\n\n` +
            `🍱 "¡Qué gesto tan generoso!" ✨\n` +
            `📚 "@${who.split('@')[0]} ahora es el nuevo propietario"`,
            m, 
            { ...ctxOk, mentions: [userId, who] }
        )
    } catch (error) {
        await conn.reply(m.chat, 
            `🍙❌ *ITSUKI - Error al Regalar*\n\n` +
            `⚠️ No se pudo completar el regalo\n\n` +
            `📝 *Error:* ${error.message}\n\n` +
            `💡 Intenta nuevamente o contacta al owner\n\n` +
            `📚 "Algo salió mal en el proceso"`,
            m, ctxErr
        )
    }
}

handler.help = ['regalar prs']
handler.tags = ['gacha']
handler.command = ['regalar', 'givewaifu', 'givechar', 'gift']
handler.group = true

export default handler