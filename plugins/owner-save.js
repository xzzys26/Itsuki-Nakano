import { writeFileSync, mkdirSync, existsSync } from 'fs'
import path from 'path'

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`> ꒰⌢ ʚ˚₊‧ 💾 ꒱꒱ :: *GUARDAR ARCHIVO* ıllı

> ੭੭ ﹙ ❌ ﹚:: *Uso incorrecto*

\`\`\`Debes proporcionar la ruta y nombre del archivo\`\`\`

*Ejemplo:*
• ${usedPrefix + command} plugins/hola.js
• ${usedPrefix + command} database/config.json

*Nota:* Responde al mensaje con el código`)
  }

  try {
    if (!m.quoted || !m.quoted.text) {
      return m.reply(`> ꒰⌢ ʚ˚₊‧ 📝 ꒱꒱ :: *RESPONDE AL CÓDIGO* ıllı

Responde al mensaje que contiene el código que quieres guardar`)
    }

    await m.react('💾')

    let filePath = text.trim()
    
    // Asegurar ruta correcta
    if (!filePath.startsWith('./')) {
      filePath = './' + filePath
    }

    // Crear directorio si no existe
    const dir = path.dirname(filePath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

    // Guardar archivo
    writeFileSync(filePath, m.quoted.text, 'utf8')
    
    await m.react('✅')

    // Verificar que se guardó
    const stats = existsSync(filePath) 
    const fileContent = m.quoted.text

    return m.reply(`> ꒰⌢ ʚ˚₊‧ ✅ ꒱꒱ :: *ARCHIVO GUARDADO* ıllı

> ੭੭ ﹙ 📁 ﹚:: *Ubicación*
\`\`\`${filePath}\`\`\`

> ੭੭ ﹙ 📊﹚:: *Tamaño*
\`\`\`${fileContent.length} caracteres\`\`\`

> ੭੭ ﹙ 📍 ﹚:: *Ruta completa*
\`\`\`${path.resolve(filePath)}\`\`\`

*✅ Guardado correctamente en tu servidor/local*`)

  } catch (error) {
    await m.react('❌')
    console.error('Error:', error)
    return m.reply(`> ❌ ERROR\n\`\`\`${error.message}\`\`\``)
  }
}

handler.help = ['guardar']
handler.tags = ['owner']
handler.command = ['guardar', 'save']
handler.rowner = true

export default handler