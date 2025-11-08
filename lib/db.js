import { Low } from 'lowdb'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const file = join(__dirname, '..', 'database.json')

export const DB_PATH = file

// ⭐ NUEVA CLASE ADAPTADORA PARA REEMPLAZAR JSONFile
class SimpleAdapter {
  constructor(filePath) {
    this.filePath = filePath
  }

  async read() {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8')
      return JSON.parse(data) // Retorna los datos JSON
    } catch (e) {
      if (e.code === 'ENOENT') {
        // Archivo no existe, retorna null (comportamiento similar a JSONFile)
        return null
      }
      throw e
    }
  }

  async write(data) {
    // Escribe los datos serializados a la ruta del archivo
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2)) 
  }
}

const adapter = new SimpleAdapter(file) // 👈 Usamos el adaptador simple
export const db = new Low(adapter, { users: {}, chats: {}, stats: {}, settings: {} })

export async function loadDatabase() {
  await db.read()
  db.data ||= { users: {}, chats: {}, stats: {}, settings: {} }

  // Bind global.db to lowdb instance for consistency
  if (!global.db) global.db = db
  if (!global.db.data) global.db.data = db.data

  // Expose helpers globally if needed
  global.loadDatabase = loadDatabase
  global.saveDatabase = saveDatabase
}

export async function saveDatabase() {
  try {
    if (global.db && global.db.data) db.data = global.db.data
  } catch (e) {
    console.log('[DB] sync error:', e?.message || e)
  }
  try {
    await db.write()
  } catch (e) {
    console.log('[DB] write error:', e?.message || e)
  }
}