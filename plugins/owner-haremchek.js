import { promises as fs } from 'fs';

const charactersFilePath = './src/database/characters[1].json';
const haremFilePath = './src/database/harem.json';

let handler = async (m, { conn }) => {
    try {
        const characters = await loadCharacters();
        const harem = await loadHarem();
        
        // Si el harem está vacío, mostrar instrucciones
        if (harem.length === 0) {
            await conn.reply(m.chat, 
                `📝 *Harem está vacío*\n\n` +
                `El archivo harem.json está vacío ([]). Para que el sistema funcione:\n\n` +
                `1. Usa *#rw* para obtener personajes\n` +
                `2. Luego usa *#c* para reclamarlos\n` +
                `3. El sistema creará automáticamente las entradas en el harem\n\n` +
                `¿Quieres que inicialice el harem con algunos datos de ejemplo? Responde con *#si* o *#no*`,
            m);
            
            // Esperar respuesta
            global.haremInit = { userId: m.sender, characters };
            return;
        }
        
        await conn.reply(m.chat, `✅ Harem tiene ${harem.length} personajes reclamados.`, m);
        
    } catch (error) {
        await conn.reply(m.chat, `Error: ${error.message}`, m);
    }
};

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error('No se pudo cargar characters.json');
    }
}

async function loadHarem() {
    try {
        const data = await fs.readFile(haremFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

handler.help = ['checkharem'];
handler.tags = ['admin'];
handler.command = ['checkharem', 'verificarharem'];
handler.group = true;

export default handler;