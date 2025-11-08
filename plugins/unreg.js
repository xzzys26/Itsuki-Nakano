import { saveDatabase } from '../lib/db.js'
import { sendUnregisterCard } from '../lib/unregister.js'

function toNum(jid = '') { return String(jid).split('@')[0].split(':')[0].replace(/[^0-9]/g, '') }

function mirrorUser(users, numKey, jidKey) {
  if (!users) return
  const a = users[numKey]
  const b = users[jidKey]
  if (a && !b) users[jidKey] = a
  else if (b && !a) users[numKey] = b
}

let handler = async (m, { conn, args, command, usedPrefix }) => {
  const num = toNum(m.sender)
  const jidKey = m.sender
  const users = (global.db && global.db.data && global.db.data.users) ? global.db.data.users : {}
  // Sincroniza claves numéricas y JID si alguna existe
  try { mirrorUser(users, num, jidKey) } catch {}
  const recNum = users[num]
  const recJid = users[jidKey]
  const existing = (recNum && (recNum.registered || recNum.sn)) ? recNum
    : (recJid && (recJid.registered || recJid.sn)) ? recJid
    : (recNum || recJid)

  if (/^unreg$/i.test(command)) {
    if (!existing || !(existing.registered || existing.sn)) {
      // No está registrado: responder texto simple
      await conn.reply(m.chat, 'No estás registrado.', m)
      return
    }

    // Eliminar marca de registro y datos claves
    const clearKeys = ['registered', 'name', 'age', 'bio', 'sn', 'regDate']
  const targets = [users[num], users[jidKey]].filter(Boolean)
  if (!targets.length) targets.push(existing)
  for (const obj of targets) { for (const k of clearKeys) delete obj[k] }

    // Mantener progreso y economía si existen; si se desea limpiar todo, añadir más claves aquí
  users[num] = existing
  users[jidKey] = existing
    try { await saveDatabase() } catch {}

    let displayName = m?.pushName || ''
    try { displayName = (await Promise.resolve(conn.getName?.(m.sender))) || displayName } catch {}
    if (!displayName) displayName = 'Usuario'

  await sendUnregisterCard(conn, m.chat, { participant: m.sender, userName: displayName })
    return
  }
}

handler.help = ['unreg']
handler.tags = ['user']
handler.command = /^unreg$/i

export default handler
