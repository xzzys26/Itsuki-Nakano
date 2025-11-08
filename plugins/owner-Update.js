import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import fetch from 'node-fetch'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

async function makeFkontak() {
  try {
    const res = await fetch('https://raw.githubusercontent.com/WillZek/Storage-CB2/main/images/d110942e81b3.jpg')
    const thumb2 = Buffer.from(await res.arrayBuffer())
    return {
      key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
      message: { locationMessage: { name: 'Update', jpegThumbnail: thumb2 } },
      participant: '0@s.whatsapp.net'
    }
  } catch {
    return null
  }
}

let handler = async (m, { conn, args }) => {
  try {
    await conn.reply(m.chat, 'Actualizando itsuki 🌟', m, rcanalw)

    const cmd = 'git --no-pager pull --rebase --autostash' + (args?.length ? ' ' + args.join(' ') : '')
    const output = execSync(cmd, { cwd: ROOT, encoding: 'utf8' })

    const lower = output.toLowerCase()
    const isUpToDate = lower.includes('already up to date') || lower.includes('up to date')
    let response
    if (isUpToDate) {
      response = ' La bot ya está actualizada ✔️'
    } else {
      const changed = []
      const lines = output.split(/\r?\n/)
      for (const ln of lines) {
        const m = ln.match(/^\s*([A-Za-z0-9_\-./]+)\s*\|\s*\d+/)
        if (m && m[1] && !changed.includes(m[1])) changed.push(m[1])
      }
      const banner = [
        '╭┄┄┄┄┄┄┄┄• • • ┄┄┄┄┄┄┄┄',
        '       Se han aplicados',
        '╰┄┄┄┄┄┄┄┄┄• • • ┄┄┄┄┄┄',
        '',
        'Actualizados'
      ]
      const list = changed.slice(0, 10).map(f => `✅ ${f}`).join('\n') || '✅'
      response = `${banner.join('\n')}\n${list}`
    }

    const fq = await makeFkontak().catch(() => null)
  await conn.reply(m.chat, response, fq || m, (typeof rcanalw === 'object' ? rcanalw : {}))
  } catch (error) {
    // Intentar detectar archivos con cambios locales o conflictos
    try {
      const status = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf8' }).trim()
      if (status) {
        const conflictedFiles = status
          .split('\n')
          .filter(Boolean)
          .filter(line => !(
            line.includes('node_modules') ||
            line.includes('sessions') ||
            line.includes('sessions-qr') ||
            line.includes('botSession') ||
            line.includes('.cache') ||
            line.includes('tmp/') ||
            line.includes('temp/') ||
            line.includes('.npm') ||
            line.includes('package-lock.json') ||
            line.includes('database.json')
          ))

        if (conflictedFiles.length > 0) {
          const conflictMsg = '⚠️ Conflictos o cambios locales detectados en los siguientes archivos:\n\n'
            + conflictedFiles.map(f => '• ' + f.slice(3)).join('\n')
            + '\n\n🔹 Para solucionarlo, haga backup y reinstale el bot o actualice manualmente.'
          return await conn.reply(m.chat, conflictMsg, m, rcanalw)
        }
      }
    } catch {}

    const msg = /not a git repository/i.test(error?.message || '')
      ? '❌ Este directorio no es un repositorio Git. Inicializa con `git init` y agrega el remoto antes de usar update.'
      : `❌ Error al actualizar: ${error?.message || 'Error desconocido.'}`
    await conn.reply(m.chat, msg, m, rcanalw)
  }
}

handler.help = ['update', 'actualizar']
handler.command = /^(update|actualizar|up)$/i
handler.tags = ['owner']
handler.rowner = true

export default handler
