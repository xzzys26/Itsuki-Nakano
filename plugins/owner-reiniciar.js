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
  let changedFiles = []
  const pushLog = (title, data) => {
    if (!data) return
    const body = [data.stdout, data.stderr].filter(Boolean).join('\n').trim()
    const trimmed = body.length > 1500 ? body.slice(-1500) : body
    logs.push(`• ${title}:\n${trimmed || '(sin salida)'}`)
    const lines = (body || '').split(/\r?\n/)
    for (const ln of lines) {
      const m = ln.match(/^\s*([A-Za-z0-9_\-./]+)\s*\|\s*\d+/)
      if (m && m[1] && !changedFiles.includes(m[1])) changedFiles.push(m[1])
    }
  }

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

  try {
    const q2 = (await makeFkontak()) || m
    const banner = [

      'Reiniciando La bot...',
    ]
  const shown = changedFiles.slice(0, 10) // mostrar hasta 10
  const filesList = shown.length ? shown.map(f => ` ${f}`).join('\n') : ''
    const msg = `${banner.join('\n')}\n${filesList}`
    await conn.reply(m.chat, msg.slice(0, 3500), q2, (typeof rcanalr === 'object' ? rcanalr : {}) )
  } catch {}

  setTimeout(() => {
    try { process.exit(0) } catch {}
  }, 1000)
}

handler.help = ['reiniciar', 'restart']
handler.tags = ['owner']
handler.command = /^(reiniciar|reinicar)$/i
handler.rowner = true

export default handler
