import { readdirSync, readFileSync, existsSync } from 'fs'
import path from 'path'

let handler = async (m, { text, usedPrefix, command }) => {
  try {
    if (!text) {
      // Mostrar estructura de carpetas
      const folders = ['plugins', 'database', 'lib', 'src'].filter(folder => 
        existsSync('./' + folder)
      )
      
      let message = `> 📁 *ESTRUCTURA DE CARPETAS*\n\n`
      folders.forEach(folder => {
        const files = readdirSync('./' + folder, { withFileTypes: true })
          .filter(file => file.isFile())
          .map(file => `📄 ${file.name}`)
          .join('\n')
        message += `*${folder}/:*\n${files || '📁 Vacía'}\n\n`
      })
      
      return m.reply(message + `\n*Usa:* ${usedPrefix + command} [ruta]`)
    }

    const filePath = text.startsWith('./') ? text : './' + text
    
    if (!existsSync(filePath)) {
      return m.reply(`> ❌ ARCHIVO NO ENCONTRADO\n\`\`\`${filePath}\`\`\``)
    }

    const content = readFileSync(filePath, 'utf8')
    const stats = existsSync(filePath)

    await m.reply(`> 📄 *CONTENIDO DE:* ${text}\n\`\`\`${content.substring(0, 1000)}${content.length > 1000 ? '...' : ''}\`\`\``)

  } catch (error) {
    m.reply(`> ❌ ERROR\n\`\`\`${error.message}\`\`\``)
  }
}

handler.help = ['ver']
handler.tags = ['owner']
handler.command = ['verfil', 'viewfil', 'file']
handler.rowner = true

export default handler