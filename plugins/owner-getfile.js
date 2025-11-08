import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

const MAX_FILE_BYTES = 45 * 1024 * 1024 // ~45MB safety cap

const guessMime = (filePath) => {
  const ext = (path.extname(filePath) || '').toLowerCase()
  switch (ext) {
    case '.js': return 'application/javascript'
    case '.json': return 'application/json'
    case '.txt': return 'text/plain'
    case '.md': return 'text/markdown'
    case '.png': return 'image/png'
    case '.jpg':
    case '.jpeg': return 'image/jpeg'
    case '.gif': return 'image/gif'
    case '.webp': return 'image/webp'
    case '.mp4': return 'video/mp4'
    case '.mp3': return 'audio/mpeg'
    case '.ogg': return 'audio/ogg'
    case '.zip': return 'application/zip'
    default: return 'application/octet-stream'
  }
}

const withinRoot = (p) => {
  try {
    const abs = path.resolve(ROOT, p)
    return abs === ROOT || abs.startsWith(ROOT + path.sep)
  } catch {
    return false
  }
}

const listPlugins = () => {
  try {
    const dir = path.join(ROOT, 'plugins')
    const files = fs.existsSync(dir) ? fs.readdirSync(dir) : []
    return files.filter(f => f.endsWith('.js')).map(f => f.replace(/\.js$/i, ''))
  } catch { return [] }
}

const resolveTarget = (input) => {
  // Allow shorthand for plugins: "foo" -> plugins/foo.js if exists
  const clean = input.replace(/^\s+|\s+$/g, '').replace(/^\.*[\/]+/, '')
  if (!clean) return null
  const candidateDirect = path.resolve(ROOT, clean)
  const candidatePlugin = path.resolve(ROOT, 'plugins', clean.endsWith('.js') ? clean : clean + '.js')
  if (fs.existsSync(candidateDirect) && fs.statSync(candidateDirect).isFile()) return candidateDirect
  if (fs.existsSync(candidatePlugin) && fs.statSync(candidatePlugin).isFile()) return candidatePlugin
  return candidateDirect // fallback (may not exist)
}

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const hintList = listPlugins().slice(0, 30)
  if (!text) {
    const usage = [
      'Envia cualquier archivo del bot (solo owner).',
      '',
      `Uso: ${usedPrefix + command} <ruta|plugin>`,
      `Ejemplos:`,
      `- ${usedPrefix + command} plugins/anime-kiss.js`,
      `- ${usedPrefix + command} anime-kiss`,
      `- ${usedPrefix + command} lib/simple.js`,
      `- ${usedPrefix + command} config.js`,
      '',
      hintList.length ? `Plugins disponibles (parcial):\n• ${hintList.join('\n• ')}` : ''
    ].filter(Boolean).join('\n')
    return conn.reply(m.chat, usage, m)
  }

  const target = resolveTarget(text)
  if (!withinRoot(path.relative(ROOT, target))) {
    return conn.reply(m.chat, 'Ruta inválida.', m)
  }

  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
    return conn.reply(m.chat, `No se encontró el archivo: ${path.relative(ROOT, target)}`, m)
  }

  const stat = fs.statSync(target)
  if (stat.size > MAX_FILE_BYTES) {
    return conn.reply(m.chat, `El archivo supera el límite (${(MAX_FILE_BYTES/1024/1024)|0}MB). Tamaño: ${(stat.size/1024/1024).toFixed(1)}MB`, m)
  }

  const fileName = path.basename(target)
  const mimetype = guessMime(target)
  try {
    const buffer = fs.readFileSync(target)
    await conn.sendMessage(m.chat, { document: buffer, mimetype, fileName }, { quoted: m })
  } catch (e) {
    await conn.reply(m.chat, `Error al enviar archivo: ${e?.message || e}`, m)
  }
}

handler.help = ['getfile']
handler.tags = ['owner']
handler.command = /^(getfile|sendfile|file)$/i


export default handler
