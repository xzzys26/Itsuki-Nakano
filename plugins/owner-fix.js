import fs from 'fs'
import path from 'path'

var handler = async (m, { conn, usedPrefix, command }) => {
  const ctxErr = global.rcanalx || { contextInfo: { externalAdReply: { title: '❌ Error', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://qu.ax/QGAVS.jpg', sourceUrl: global.canalOficial || '' }}}
  const ctxWarn = global.rcanalw || { contextInfo: { externalAdReply: { title: '⚠️ Sintaxis', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://qu.ax/QGAVS.jpg', sourceUrl: global.canalOficial || '' }}}
  const ctxOk = global.rcanalr || { contextInfo: { externalAdReply: { title: '✅ Revisión', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://qu.ax/QGAVS.jpg', sourceUrl: global.canalOficial || '' }}}

  try {
    await m.react('🍙')
    conn.sendPresenceUpdate('composing', m.chat)

    const pluginsDir = './plugins'
    const files = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'))

    let response = `🍙📚 *ITSUKI - Revisión de Sintaxis* 🔍✨\n\n`
    response += `📂 *Archivos analizados:* ${files.length}\n`
    response += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`

    let hasErrors = false
    let errorCount = 0
    let errorDetails = []

    for (const file of files) {
      try {
        await import(path.resolve(pluginsDir, file))
      } catch (error) {
        hasErrors = true
        errorCount++
        errorDetails.push({
          archivo: file,
          mensaje: error.message,
          linea: error.stack?.match(/at.*:(\d+):\d+/)?.[1] || 'Desconocida'
        })
      }
    }

    if (!hasErrors) {
      response += `✅ *Estado:* Sistema limpio\n\n`
      response += `🎉 ¡Excelente! No se detectaron errores de sintaxis\n\n`
      response += `📊 *Resultados:*\n`
      response += `• Archivos revisados: ${files.length}\n`
      response += `• Errores encontrados: 0\n`
      response += `• Estado: 🟢 Operativo\n\n`
      response += `📚 "¡Todo está en perfecto orden! El código es impecable"\n`
      response += `🍱✨ "¡Buen trabajo manteniendo el sistema limpio!"`

      await conn.reply(m.chat, response, m, ctxOk)
      await m.react('✅')
    } else {
      response += `❌ *Estado:* Errores detectados\n\n`
      response += `⚠️ Se encontraron ${errorCount} error${errorCount > 1 ? 'es' : ''} de sintaxis\n\n`
      response += `📋 *Detalles de los errores:*\n\n`

      errorDetails.forEach((error, index) => {
        response += `━━━━━━━━━━━━━━━━━━━━━━━━\n`
        response += `🔴 *Error #${index + 1}*\n\n`
        response += `📄 *Archivo:* ${error.archivo}\n`
        response += `📍 *Línea:* ${error.linea}\n`
        response += `❌ *Mensaje:*\n${error.mensaje.substring(0, 200)}${error.mensaje.length > 200 ? '...' : ''}\n\n`
      })

      response += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
      response += `💡 *Recomendación:*\n`
      response += `Revisa y corrige estos archivos para que el bot funcione correctamente\n\n`
      response += `📚 "Los errores son oportunidades de aprendizaje"\n`
      response += `🍱✨ "¡Corrige estos problemas y el sistema volverá a funcionar!"`

      await conn.reply(m.chat, response, m, ctxWarn)
      await m.react('⚠️')
    }

  } catch (err) {
    await m.react('❌')
    await conn.reply(m.chat, 
      `🍙❌ *ITSUKI - Error Crítico* 📚\n\n` +
      `⚠️ Se produjo un problema al analizar los archivos\n\n` +
      `📝 *Error:* ${err.message}\n\n` +
      `💡 Usa *${usedPrefix}report* para reportar este problema\n\n` +
      `📖 "Este es un error inesperado, notifica al desarrollador"`, 
      m, ctxErr
    )
  }
}

handler.command = ['syntax', 'detectar', 'errores', 'checksyntax', 'nk','revsall']
handler.help = ['syntax']
handler.tags = ['tools']
handler.rowner = true

export default handler