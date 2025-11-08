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
        await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2))
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

let cooldowns = new Map()
let characterVotes = new Map()

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const ctxErr = global.rcanalx || {}
    const ctxWarn = global.rcanalw || {}
    const ctxOk = global.rcanalr || {}

    try {
        const userId = m.sender
        const cooldownTime = 1 * 60 * 60 * 1000

        if (cooldowns.has(userId)) {
            const expirationTime = cooldowns.get(userId) + cooldownTime
            const now = Date.now()
            if (now < expirationTime) {
                const timeLeft = expirationTime - now
                const minutes = Math.floor((timeLeft / 1000 / 60) % 60)
                const seconds = Math.floor((timeLeft / 1000) % 60)
                await conn.reply(m.chat, 
                    `🍙⏰ *ITSUKI - Tiempo de Espera* 📚\n\n` +
                    `⚠️ Debes esperar para votar nuevamente\n\n` +
                    `⏱️ *Tiempo restante:* ${Math.floor(minutes)} minuto${minutes !== 1 ? 's' : ''} y ${seconds} segundo${seconds !== 1 ? 's' : ''}\n\n` +
                    `📖 "Cada voto cuenta, pero debes esperar"`,
                    m, ctxWarn
                )
                return
            }
        }

        const characters = await loadCharacters()
        const characterName = args.join(' ')

        if (!characterName) {
            await conn.reply(m.chat, 
                `🍙📚 *ITSUKI - Votar por Personaje* 🗳️\n\n` +
                `❌ Debes especificar el nombre del personaje\n\n` +
                `📝 *Uso:*\n${usedPrefix}${command} <nombre del personaje>\n\n` +
                `💡 *Ejemplo:*\n${usedPrefix}${command} Itsuki Nakano\n\n` +
                `📖 "Escribe el nombre del personaje que quieres votar"`,
                m, ctxWarn
            )
            return
        }

        const character = characters.find(c => c.name.toLowerCase() === characterName.toLowerCase())

        if (!character) {
            await conn.reply(m.chat, 
                `🍙❌ *ITSUKI - Personaje No Encontrado*\n\n` +
                `⚠️ No se encontró el personaje: *${characterName}*\n\n` +
                `💡 *Sugerencias:*\n` +
                `• Verifica la ortografía\n` +
                `• Usa el nombre completo\n` +
                `• Usa ${usedPrefix}topwaifus para ver personajes\n\n` +
                `📚 "Asegúrate de escribir el nombre correctamente"`,
                m, ctxErr
            )
            return
        }

        if (characterVotes.has(character.name) && Date.now() < characterVotes.get(character.name)) {
            const expirationTime = characterVotes.get(character.name)
            const timeLeft = expirationTime - Date.now()
            const minutes = Math.floor((timeLeft / 1000 / 60) % 60)
            const seconds = Math.floor((timeLeft / 1000) % 60)
            await conn.reply(m.chat, 
                `🍙⚠️ *ITSUKI - Personaje Votado Recientemente*\n\n` +
                `❌ *${character.name}* ya fue votado recientemente\n\n` +
                `⏱️ *Tiempo de espera:* ${Math.floor(minutes)} minuto${minutes !== 1 ? 's' : ''} y ${seconds} segundo${seconds !== 1 ? 's' : ''}\n\n` +
                `📚 "Espera un poco antes de votar por este personaje nuevamente"`,
                m, ctxWarn
            )
            return
        }

        const incrementValue = Math.floor(Math.random() * 10) + 1
        character.value = String(Number(character.value) + incrementValue)
        character.votes = (character.votes || 0) + 1
        await saveCharacters(characters)

        const harem = await loadHarem()
        const userEntry = harem.find(entry => entry.userId === userId && entry.characterId === character.id)

        if (!userEntry) {
            harem.push({
                userId: userId,
                characterId: character.id,
                lastVoteTime: Date.now(),
                voteCooldown: Date.now() + cooldownTime
            })
        } else {
            userEntry.lastVoteTime = Date.now()
            userEntry.voteCooldown = Date.now() + cooldownTime
        }
        await saveHarem(harem)

        cooldowns.set(userId, Date.now())
        characterVotes.set(character.name, Date.now() + cooldownTime)

        await conn.reply(m.chat, 
            `🍙🗳️ *ITSUKI - Voto Registrado* 📚✨\n\n` +
            `✅ Has votado por *${character.name}* exitosamente\n\n` +
            `📊 *Resultados:*\n` +
            `💎 Valor anterior: ${Number(character.value) - incrementValue}\n` +
            `✨ Incremento: +${incrementValue}\n` +
            `💰 Valor nuevo: ${character.value}\n` +
            `🗳️ Total de votos: ${character.votes}\n\n` +
            `⏰ *Cooldown:* 1 hora\n\n` +
            `🍱 "¡Tu voto ha aumentado el valor de este personaje!" ✨`,
            m, ctxOk
        )
    } catch (e) {
        await conn.reply(m.chat, 
            `🍙❌ *ITSUKI - Error al Votar*\n\n` +
            `⚠️ No se pudo registrar el voto\n\n` +
            `📝 *Error:* ${e.message}\n\n` +
            `💡 Intenta nuevamente o contacta al owner\n\n` +
            `📚 "Algo salió mal en el proceso"`,
            m, ctxErr
        )
    }
}

handler.help = ['vote']
handler.tags = ['gacha']
handler.command = ['vote', 'votar', 'voto']
handler.group = true
handler.register = true

export default handler