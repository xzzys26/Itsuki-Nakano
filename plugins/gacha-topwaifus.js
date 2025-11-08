import { promises as fs } from 'fs'

const charactersFilePath = './src/database/characters[1].json'

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        throw new Error('No se pudo cargar el archivo characters.json.')
    }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const ctxErr = global.rcanalx || {}
    const ctxWarn = global.rcanalw || {}
    const ctxOk = global.rcanalr || {}

    try {
        const characters = await loadCharacters()
        const page = parseInt(args[0]) || 1
        const itemsPerPage = 10
        const sortedCharacters = characters.sort((a, b) => Number(b.value) - Number(a.value))

        const totalCharacters = sortedCharacters.length
        const totalPages = Math.ceil(totalCharacters / itemsPerPage)
        const startIndex = (page - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage

        if (page < 1 || page > totalPages) {
            return await conn.reply(m.chat, 
                `🍙❌ *ITSUKI - Página Inválida*\n\n` +
                `⚠️ Página no válida\n\n` +
                `📄 *Páginas disponibles:* 1 - ${totalPages}\n` +
                `💡 *Uso:* ${usedPrefix}${command} [página]\n\n` +
                `📚 "Elige una página válida"`,
                m, ctxErr
            )
        }

        const charactersToShow = sortedCharacters.slice(startIndex, endIndex)

        let message = `🍙🏆 *ITSUKI - Top Personajes por Valor* 📚✨\n\n`
        message += `💎 *Ranking de personajes más valiosos*\n`
        message += `📄 Página ${page} de ${totalPages}\n\n`
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`

        charactersToShow.forEach((character, index) => {
            const position = startIndex + index + 1
            const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '🎴'
            message += `${medal} *#${position}* - ${character.name}\n`
            message += `   💎 Valor: ${character.value}\n`
            message += `   🎬 Origen: ${character.source}\n\n`
        })

        message += `━━━━━━━━━━━━━━━━━━━━\n`
        message += `📖 Página ${page}/${totalPages}\n\n`
        
        if (page < totalPages) {
            message += `💡 Usa ${usedPrefix}${command} ${page + 1} para ver más\n`
        }
        
        message += `\n🍱 "Los personajes más valiosos del sistema" ✨`

        await conn.reply(m.chat, message, m, ctxOk)
    } catch (error) {
        await conn.reply(m.chat, 
            `🍙❌ *ITSUKI - Error al Cargar*\n\n` +
            `⚠️ No se pudo cargar el ranking\n\n` +
            `📝 *Error:* ${error.message}\n\n` +
            `💡 Verifica que el archivo de base de datos exista\n\n` +
            `📚 "Contacta al owner si el problema persiste"`,
            m, ctxErr
        )
    }
}

handler.help = ['topwaifus']
handler.tags = ['gacha']
handler.command = ['topwaifus', 'waifustop', 'waifusboard', 'topchars']
handler.group = true
handler.register = true

export default handler