import fsp from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const TEMP = path.join(ROOT, 'temp')

const ALWAYS_EXCLUDE = new Set(['node_modules', '.git', '.vscode', 'temp', '.npm'])
const EXCLUDE_FILES = new Set(['database.json', 'package-lock.json'])
const SESSION_DIRS = new Set(['sessions', 'sessions-qr', 'botSession'])

function stamp() {
  const d = new Date()
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

async function copyTree(src, dst, includeSessions) {
  await fsp.mkdir(dst, { recursive: true })
  const entries = await fsp.readdir(src, { withFileTypes: true })
  for (const e of entries) {
    const name = e.name
    if (ALWAYS_EXCLUDE.has(name)) continue
    if (!includeSessions && SESSION_DIRS.has(name)) continue
    const sp = path.join(src, name)
    const dp = path.join(dst, name)
    if (e.isDirectory()) {
      await copyTree(sp, dp, includeSessions)
    } else if (e.isFile()) {
      if (EXCLUDE_FILES.has(name)) continue
      await fsp.mkdir(path.dirname(dp), { recursive: true })
      try { await fsp.copyFile(sp, dp) } catch {}
    }
  }
}

async function zipFolderWin(sourceDir, zipPath) {
  const destPS = zipPath.replace(/'/g, "''")
  const script = `$ErrorActionPreference='Stop'; $dest='${destPS}'; if (Test-Path -LiteralPath $dest) { Remove-Item -LiteralPath $dest -Force }; $items = Get-ChildItem -Force | Select-Object -ExpandProperty FullName; Compress-Archive -Path $items -DestinationPath $dest -Force`
  const cmd = `powershell -NoProfile -Command "${script.replace(/"/g, '`"')}"`
  execSync(cmd, { cwd: sourceDir, stdio: 'inherit' })
}

async function zipFolderUnix(sourceDir, zipPath) {
  try {
    execSync('zip -v', { stdio: 'ignore' })
    execSync(`zip -r "${zipPath}" .`, { cwd: sourceDir, stdio: 'inherit' })
    return zipPath
  } catch {
    const gzPath = zipPath.replace(/\.zip$/i, '.tar.gz')
    execSync(`tar -czf "${gzPath}" .`, { cwd: sourceDir, stdio: 'inherit' })
    return gzPath
  }
}

function parseArgs(args) {
  const opts = { includeSessions: false, name: '' }
  for (const a of args || []) {
    const s = String(a)
    if (/^--with-?sessions$/i.test(s)) opts.includeSessions = true
    const m = s.match(/^--name=(.+)$/i)
    if (m) opts.name = m[1]
  }
  return opts
}

// Quoted especial con mini-thumbnail de respaldo exitoso
async function makeFkontak() {
  try {
    const res = await fetch('https://i.postimg.cc/rFfVL8Ps/image.jpg')
    const thumb2 = Buffer.from(await res.arrayBuffer())
    return {
      key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
      message: { locationMessage: { name: 'Backup Exito', jpegThumbnail: thumb2 } },
      participant: '0@s.whatsapp.net'
    }
  } catch {
    return undefined
  }
}

let handler = async (m, { conn, args }) => {
  const opts = parseArgs(args)
  const includeSessions = !!opts.includeSessions
  const sanitize = (s = '') => String(s).replace(/\s+/g, '-').replace(/[^a-z0-9._-]/ig, '')
  const baseName = opts.name ? sanitize(opts.name) : sanitize(global.namebot || 'bot-backup')
  const base = opts.name ? baseName : `${baseName}-${stamp()}`
  const exportDir = path.join(TEMP, base)
  const zipPath = path.join(TEMP, `${base}.zip`)

  await conn.reply(m.chat, '', m, rcanalw)
  await fsp.mkdir(TEMP, { recursive: true }).catch(() => {})

  try {
    await copyTree(ROOT, exportDir, includeSessions)
  } catch (e) {
    return conn.reply(m.chat, `❌ Error copiando archivos: ${e?.message || e}`, m, rcanalx)
  }

  let artifact = zipPath
  try {
    if (process.platform === 'win32') {
      await zipFolderWin(exportDir, zipPath)
    } else {
      artifact = await zipFolderUnix(exportDir, zipPath)
    }

    const stat = await fsp.stat(artifact)
    const maxSend = 95 * 1024 * 1024
    if (stat.size > maxSend) {
      await conn.reply(
        m.chat,
        `⚠️ El archivo pesa ${(stat.size / 1024 / 1024).toFixed(1)}MB. Guardado en: ${artifact}. Súbelo manualmente.`,
        m,
        rcanalx
      )
      return
    }

    const buffer = await fsp.readFile(artifact)
    const fileName = path.basename(artifact)
    const mt = artifact.endsWith('.zip')
      ? 'application/zip'
      : (artifact.endsWith('.tar.gz') ? 'application/gzip' : 'application/octet-stream')
    const fancyQuoted = await makeFkontak()
    await conn.sendMessage(
      m.chat,
      { document: buffer, mimetype: mt, fileName, ...(typeof rcanalr === 'object' ? rcanalr : {}) },
      { quoted: fancyQuoted || m }
    )
  } catch (e) {
    await conn.reply(m.chat, `❌ Error comprimiendo/enviando: ${e?.message || e}`, m, rcanalx)
  } finally {
    try { await fsp.rm(exportDir, { recursive: true, force: true }) } catch {}
    try { await fsp.rm(artifact, { force: true }) } catch {}
  }
}

handler.help = ['backupbot']
handler.tags = ['owner']
handler.command = ['backup', 'backupbot', 'export', 'respaldo']
handler.rowner = true

export default handler

