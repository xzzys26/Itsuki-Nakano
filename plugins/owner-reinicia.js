import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

function run(cmd, cwd = ROOT) {
  return new Promise((resolve, reject) => {
    const child = exec(cmd, { cwd, windowsHide: true, maxBuffer: 1024 * 1024 * 8 }, (err, stdout, stderr) => {
      if (err) return reject(Object.assign(err, { stdout, stderr }))
      resolve({ stdout, stderr })
    })
  })
}

async function hasGit() {
  try { await run('git --version'); return true } catch { return false }
}

function isGitRepo() {
  try { return fs.existsSync(path.join(ROOT, '.git')) } catch { return false }
}

// Quoted especial con mini-thumbnail
async function makeFkontak() {
  try {
    const res = await fetch('https://i.postimg.cc/rFfVL8Ps/image.jpg')
    const thumb2 = Buffer.from(await res.arrayBuffer())
    return {
      key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
      message: { locationMessage: { name: 'Reinicio del Bot', jpegThumbnail: thumb2 } },
      participant: '0@s.whatsapp.net'
    }
  } catch { return null }
}

let handler = async (m, { conn, usedPrefix, command, isOwner, isROwner }) => {
  // Solo owner/root owner
  if (!(isOwner || isROwner)) return

  const fq = (await makeFkontak()) || m
  try { await conn.reply(m.chat, '', fq, (typeof rcanalw === 'object' ? rcanalw : {})) } catch {}

  let logs = []
  const pushLog = (title, data) => {
    if (!data) return
    const body = [data.stdout, data.stderr].filter(Boolean).join('\n').trim()
    const trimmed = body.length > 1500 ? body.slice(-1500) : body
    logs.push(`• ${title}:\n${trimmed || '(sin salida)'}`)
  }

  // 1) git pull si aplica
  try {
    if (isGitRepo() && (await hasGit())) {
      const res = await run('git --no-pager pull --rebase --autostash')
      pushLog('git pull', res)
    } else {
      logs.push('• git pull: omitido (no es repo o no hay git)')
    }
  } catch (e) {
    pushLog('git pull (ERROR)', e)
  }

  // 2) npm install
  try {
    const res = await run('npm install --no-audit --no-fund')
    pushLog('npm install', res)
  } catch (e) {
    pushLog('npm install (ERROR)', e)
  }

  // Resumen al chat
  try {
    const q2 = (await makeFkontak()) || m
    await conn.reply(
      m.chat,
      `Reiniciando el bot...\n\n${logs.join('\n\n')}`.slice(0, 3500),
      q2,
      (typeof rcanalr === 'object' ? rcanalr : {})
    )
  } catch {}

  // Pequeño delay y salir (el proceso gestor debería relanzar)
  setTimeout(() => {
    try { process.exit(0) } catch {}
  }, 1000)
}

handler.help = ['reiniciar', 'restart']
handler.tags = ['owner']
handler.command = /^(reiniciar|reinicar|restart|reload|update(?:-?restart)?|actualizar)$/i
handler.rowner = true

export default handler
