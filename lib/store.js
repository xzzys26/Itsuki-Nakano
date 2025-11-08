import { readFileSync, writeFileSync, existsSync } from 'fs'

const _bx = await import('@whiskeysockets/baileys')
const initAuthCreds = _bx.initAuthCreds || _bx.default?.initAuthCreds
const BufferJSON = _bx.BufferJSON || _bx.default?.BufferJSON
const proto = _bx.proto || _bx.default?.proto

const NIL = () => {}
const log = { error: NIL, warn: NIL, info: NIL, trace: NIL }

function delay(ms) { return new Promise(r => setTimeout(r, ms)) }
class Semaphore { constructor(max) { this.max = max; this.used = 0; this.q = [] } async acquire() { if (this.used < this.max) { this.used++; return } await new Promise(res => this.q.push(res)); this.used++ } release() { this.used--; const n = this.q.shift(); if (n) n() } }
class FastQueue { constructor({ concurrency = 64, timeoutMs = 12000 }) { this.sem = new Semaphore(concurrency); this.timeoutMs = timeoutMs } async run(fn) { await this.sem.acquire(); try { const to = new Promise((_, rej) => setTimeout(() => rej(new Error('PluginTimeoutError')), this.timeoutMs)); return await Promise.race([fn(), to]) } finally { this.sem.release() } } }

const _jidMemo = new Map()
const DIGITS = /\d+/g
const SNUM = /[^\d]/g
const DEVICE = /:(\d+)(?=@)/
const LID = /@lid/g
const NONSTD = /[\s()+\-._]/g

function _onlyDigits(s = '') { return (s.match(DIGITS) || []).join('') }

function _baseJid(s) { let x = String(s || '').trim(); if (!x) return ''; if (x === 'status@broadcast' || x === 'broadcast@status') return 'status@broadcast'; x = x.replace(LID, '@s.whatsapp.net'); if (x.includes('@g.us')) return x.endsWith('@g.us') ? x : `${x.split('@')[0]}@g.us`; x = x.replace(DEVICE, ''); if (x.includes('@s.whatsapp.net')) return `${x.split('@')[0]}@s.whatsapp.net`; if (x.includes('@')) return x }
function _asUserJid(s) { const d = _onlyDigits(String(s || '').replace(NONSTD, '')); if (d.length >= 8 && d.length <= 20) return `${d}@s.whatsapp.net` }
function _asGroupJid(s) { const d = _onlyDigits(String(s || '').replace(SNUM, '')); if (d.length >= 8 && d.length <= 30) return `${d}@g.us` }

function makeNormalizeJid(conn) {
  return function normalizeJid(input) {
    if (!input) return null
    const raw = typeof input === 'string' ? input : (input?.id || input?.jid || input?.participant || input?.remoteJid || '')
    if (!raw) return null
    if (_jidMemo.has(raw)) return _jidMemo.get(raw)
    let jid = _baseJid(raw)
    if (!jid) {
      if (String(raw).includes('@g.us')) jid = _asGroupJid(raw)
      else jid = _asUserJid(raw)
    }
    try { jid = conn?.decodeJid?.(jid || raw) || jid || raw } catch {}
    if (jid === 'broadcast@status') jid = 'status@broadcast'
    _jidMemo.set(raw, jid)
    return jid
  }
}

function bind(conn) {
  if (!conn.chats) conn.chats = {}
  if (!conn._caches) conn._caches = { groups: new Map(), contacts: new Map() }
  const normalizeJid = makeNormalizeJid(conn)

  async function safeGroupMetadata(id) {
    try {
      const jid = normalizeJid(id)
      if (!jid?.endsWith('@g.us')) return null
      if (conn._caches.groups.has(jid)) return conn._caches.groups.get(jid)
      const meta = await conn.groupMetadata(jid).catch(() => null)
      if (meta) conn._caches.groups.set(jid, meta)
      return meta
    } catch { return null }
  }

  function upContacts(contacts) {
    try {
      contacts = contacts?.contacts || contacts
      if (!contacts) return
      for (const contact of contacts) {
        const id = normalizeJid(contact?.id)
        if (!id || id === 'status@broadcast') continue
        const isGroup = id.endsWith('@g.us')
        let row = conn.chats[id] || { id }
        row = { ...row, ...contact, id, ...(isGroup ? { subject: contact.subject || contact.name || row.subject || '' } : { name: contact.notify || contact.name || row.name || row.notify || '' }) }
        conn.chats[id] = row
        if (!isGroup) conn._caches.contacts.set(id, row)
      }
    } catch (e) { log.error(e) }
  }

  conn.ev.on?.('contacts.upsert', upContacts)
  conn.ev.on?.('groups.update', upContacts)
  conn.ev.on?.('contacts.set', upContacts)

  conn.ev.on?.('chats.set', async ({ chats }) => {
    try {
      for (let { id, name, readOnly } of chats) {
        id = normalizeJid(id)
        if (!id || id === 'status@broadcast') continue
        const isGroup = id.endsWith('@g.us')
        let row = conn.chats[id] || { id }
        row.isChats = !readOnly
        if (name) row[isGroup ? 'subject' : 'name'] = name
        if (isGroup) {
          const m = await safeGroupMetadata(id)
          if (name || m?.subject) row.subject = name || m.subject
          if (m) row.metadata = m
        }
        conn.chats[id] = row
      }
    } catch (e) { log.error(e) }
  })

  conn.ev.on?.('group-participants.update', async ({ id }) => {
    try {
      id = normalizeJid(id)
      if (!id || id === 'status@broadcast' || !id.endsWith('@g.us')) return
      let row = conn.chats[id] || { id, isChats: true }
      const m = await safeGroupMetadata(id)
      if (m) { row.subject = m.subject; row.metadata = m }
      conn.chats[id] = row
    } catch (e) { log.error(e) }
  })

  conn.ev.on?.('chats.upsert', (ch) => {
    try {
      const id = normalizeJid(ch?.id)
      if (!id || id === 'status@broadcast') return
      conn.chats[id] = { ...(conn.chats[id] || {}), ...ch, id, isChats: true }
    } catch (e) { log.error(e) }
  })

  conn.ev.on?.('presence.update', ({ id, presences }) => {
    try {
      const sender = Object.keys(presences || {})[0] || id
      const _s = normalizeJid(sender)
      let row = conn.chats[_s] || { id: _s }
      row.presences = presences?.[sender]?.lastKnownPresence || 'composing'
      conn.chats[_s] = row
    } catch (e) { log.error(e) }
  })

  conn.normalizeJid = normalizeJid
  conn.safeGroupMetadata = safeGroupMetadata
}

const KEY_MAP = { 'pre-key': 'preKeys', session: 'sessions', 'sender-key': 'senderKeys', 'app-state-sync-key': 'appStateSyncKeys', 'app-state-sync-version': 'appStateVersions', 'sender-key-memory': 'senderKeyMemory' }

function useSingleFileAuthState(filename, logger) {
  let creds; let keys = {}; let saveCount = 0
  const saveState = (forceSave = false) => { logger?.trace?.('saving auth state'); saveCount++; if (forceSave || saveCount > 4) { writeFileSync(filename, JSON.stringify({ creds, keys }, BufferJSON.replacer, 2)); saveCount = 0 } }
  if (existsSync(filename)) { const result = JSON.parse(readFileSync(filename, { encoding: 'utf-8' }), BufferJSON.reviver); creds = result.creds; keys = result.keys || {} } else { creds = initAuthCreds(); keys = {} }
  for (const v of Object.values(KEY_MAP)) keys[v] = keys[v] || {}
  return { state: { creds, keys: { get: (type, ids) => { const key = KEY_MAP[type]; return ids.reduce((d, id) => { let v = keys[key]?.[id]; if (v && type === 'app-state-sync-key') v = proto.AppStateSyncKeyData.fromObject(v); if (v) d[id] = v; return d }, {}) }, set: (data) => { for (const _k in data) { const key = KEY_MAP[_k]; keys[key] = keys[key] || {}; Object.assign(keys[key], data[_k]) } saveState(false) } } }, saveState }
}

function loadMessage(jid, id = null) {
  let message = null
  if (jid && !id) {
    id = jid
    const filter = m => m.key?.id === id
    const messages = {}
    const found = Object.entries(messages).find(([, msgs]) => msgs.find(filter))
    message = found?.[1].find(filter)
  } else {
    jid = jid?.decodeJid?.()
    const messages = {}
    if (!(jid in messages)) return null
    message = messages[jid].find(m => m.key.id === id)
  }
  return message ?? null
}

function classifyBaileysError(err = {}) {
  const msg = String(err?.message || '')
  const code = err?.data || err?.status || err?.output?.statusCode || err?.statusCode
  const boom = !!err?.isBoom
  if (msg.includes('Bad MAC') || msg.includes('badmac') || msg.includes('bad-mac')) return { type: 'BAD_MAC', retry: true }
  if (msg.includes('No sessions') || msg.includes('SessionError')) return { type: 'NO_SESSIONS', retry: true }
  if (msg.includes('not-acceptable') || code === 406) return { type: 'NOT_ACCEPTABLE', retry: true }
  if (msg.includes('timed out') || msg.includes('Timeout')) return { type: 'TIMEOUT', retry: true }
  if (msg.includes('Connection Closed') || msg.includes('closed')) return { type: 'CONN_CLOSED', retry: true }
  if (msg.includes('Stream Errored') || code === 410) return { type: 'STREAM_ERROR', retry: true }
  if (msg.includes('conflict') || code === 409) return { type: 'CONFLICT', retry: true }
  if (boom && (code === 500 || code === 502 || code === 503 || code === 504)) return { type: 'BOOM_5XX', retry: true }
  if (msg.includes('PluginTimeoutError')) return { type: 'PLUGIN_TIMEOUT', retry: false }
  return { type: 'UNKNOWN', retry: false }
}

async function tryRehydrateSession(conn, jid) { try { await conn.presenceSubscribe(jid).catch(() => {}); await delay(60); await conn.sendReceipt?.(jid, [], 'read').catch(() => {}); await delay(60) } catch {} }
async function recoverBadMac(conn, jid) { try { await conn.presenceSubscribe(jid).catch(() => {}); await delay(120); await conn.sendReceipt?.(jid, [], 'read').catch(() => {}); await delay(120) } catch {} }

async function safeSendMessage(conn, jidInput, content, options = {}) {
  const jid = conn.normalizeJid?.(jidInput) || jidInput
  let attempt = 0; let lastErr = null; const maxAttempts = 5
  while (attempt < maxAttempts) {
    attempt++
    try {
      if (attempt === 1) await tryRehydrateSession(conn, jid)
      return await conn.sendMessage(jid, content, options)
    } catch (err) {
      lastErr = err
      const cls = classifyBaileysError(err)
      if (cls.type === 'BAD_MAC') await recoverBadMac(conn, jid)
      if (cls.type === 'NO_SESSIONS' || cls.type === 'NOT_ACCEPTABLE' || cls.type === 'BOOM_5XX' || cls.type === 'TIMEOUT' || cls.type === 'CONN_CLOSED' || cls.type === 'STREAM_ERROR' || cls.type === 'CONFLICT') await tryRehydrateSession(conn, jid)
      if (!cls.retry || attempt >= maxAttempts) break
      await delay(80 * attempt)
    }
  }
  throw lastErr
}

function createPluginRunner({ conn, concurrency = 128, timeoutMs = 12000 }) {
  const queue = new FastQueue({ concurrency, timeoutMs })
  const lanes = new Map()
  function laneId(ctx) { return ctx?.chat || 'global' }
  async function run(task, ctx) { const id = laneId(ctx); if (!lanes.has(id)) lanes.set(id, Promise.resolve()); const prev = lanes.get(id); const p = prev.then(() => queue.run(() => task())); lanes.set(id, p.catch(NIL)); return p }
  return { run }
}

function withHandler(conn, runner, { pluginName, command }) {
  return function wrap(handlerFn) {
    return async function wrappedHandler(ctx) {
      const normalizeJid = conn.normalizeJid || makeNormalizeJid(conn)
      const sender = normalizeJid(ctx?.sender || ctx?.m?.key?.participant || ctx?.m?.key?.remoteJid)
      const chat = normalizeJid(ctx?.chat || ctx?.m?.key?.remoteJid)
      const safeCtx = { ...ctx, sender, chat, normalizeJid: (x) => normalizeJid(x), send: (c, o) => safeSendMessage(conn, chat, c, o), reply: (c, o) => safeSendMessage(conn, chat, c, { quoted: ctx?.m, ...(o || {}) }) }
      try {
        return await runner.run(() => handlerFn(safeCtx), safeCtx)
      } catch (err) {
        const cls = classifyBaileysError(err)
        let userMsg = '⚠️ Ocurrió un problema.'
        if (cls.type === 'NO_SESSIONS') userMsg = '⚠️ Llaves no listas, reintentando…'
        else if (cls.type === 'NOT_ACCEPTABLE') userMsg = '⚠️ Entrega rechazada temporalmente, reintentando…'
        else if (cls.type === 'BOOM_5XX') userMsg = '⚠️ Servicio ocupado, reintentando…'
        else if (cls.type === 'PLUGIN_TIMEOUT') userMsg = '⏳ El plugin tardó demasiado.'
        else if (cls.type === 'BAD_MAC') userMsg = '⚠️ Sesión desincronizada, reintentando…'
        else if (cls.type === 'TIMEOUT' || cls.type === 'CONN_CLOSED' || cls.type === 'STREAM_ERROR' || cls.type === 'CONFLICT') userMsg = '⚠️ Conexión inestable, reintentando…'
        try { await safeCtx.reply(userMsg) } catch {}
        throw err
      }
    }
  }
}

export default { bind, useSingleFileAuthState, loadMessage, createPluginRunner, withHandler, makeNormalizeJid, safeSendMessage }
