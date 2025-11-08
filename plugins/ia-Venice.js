import axios from "axios";

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const ctxErr = (global.rcanalx || {})
    const ctxWarn = (global.rcanalw || {})
    const ctxOk = (global.rcanalr || {})
    
    const query = text || (m.quoted && m.quoted.text);

    if (!query) {
        await conn.sendMessage(m.chat, {
            react: {
                text: '❌',
                key: m.key
            }
        });
        return conn.reply(m.chat, "❌ Ingresa una pregunta.\nEjemplo: .venice ¿Qué es la inteligencia artificial?", m, ctxWarn);
    }

    try {
        await conn.sendMessage(m.chat, {
            react: {
                text: '⏳',
                key: m.key
            }
        });

        const { data } = await axios.request({
            method: "POST",
            url: "https://outerface.venice.ai/api/inference/chat",
            headers: {
                accept: "*/*",
                "content-type": "application/json",
                origin: "https://venice.ai",
                referer: "https://venice.ai/",
                "user-agent": "Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0",
                "x-venice-version": "interface@20250523.214528+393d253",
            },
            data: JSON.stringify({
                requestId: "mifinfinity",
                modelId: "dolphin-3.0-mistral-24b",
                prompt: [{ content: query, role: "user" }],
                systemPrompt: "",
                conversationType: "text",
                temperature: 0.8,
                webEnabled: true,
                topP: 0.9,
                isCharacter: false,
                clientProcessingTime: 15,
            }),
        });

        const chunks = data
            .split("\n")
            .filter((chunk) => chunk.trim() !== "")
            .map((chunk) => JSON.parse(chunk));

        const result = chunks.map((chunk) => chunk.content).join("");

        if (!result) {
            throw new Error("No hubo respuesta de Venice AI");
        }

        await conn.reply(m.chat, `🧠 *Venice AI:*\n${result}`, m, ctxOk);

        await conn.sendMessage(m.chat, {
            react: {
                text: '✅',
                key: m.key
            }
        });

    } catch (err) {
        console.error("Error Venice:", err.message);
        
        await conn.sendMessage(m.chat, {
            react: {
                text: '❎',
                key: m.key
            }
        });
        
        await conn.reply(m.chat, `❌ Error: ${err.message}`, m, ctxErr);
    }
};

handler.help = ['venice'];
handler.tags = ['ia'];
handler.command = ['venice', 'veniceai'];
handler.group = true;

export default handler;