import path from 'path';
import { toAudio } from './converter.js';
import chalk from 'chalk';
import fetch from 'node-fetch';
import PhoneNumber from 'awesome-phonenumber';
import fs from 'fs';
import util from 'util';
import { fileTypeFromBuffer } from 'file-type';
import { format } from 'util';
import { fileURLToPath } from 'url';
import store from './store.js';
import * as Jimp from 'jimp'; // <- CORREGIDO
import pino from 'pino';
import * as baileys from '@whiskeysockets/baileys';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const {
  makeWASocket: _makeWaSocket, 
  proto,
  downloadContentFromMessage,
  jidDecode,
  areJidsSameUser,
  generateWAMessage,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  WAMessageStubType,
  extractMessageContent,
  makeInMemoryStore,
  getAggregateVotesInPollMessage,
  prepareWAMessageMedia,
  WA_DEFAULT_EPHEMERAL
} = baileys;

// El resto del código se mantiene igual...
export function makeWASocket(connectionOptions, options = {}) {
    let conn = _makeWaSocket(connectionOptions);
    // ... (todo el resto del código igual)

    let sock = Object.defineProperties(conn, {
        chats: {
            value: { ...(options.chats || {}) },
            writable: true
        },
        decodeJid: {
    value(jid) {
        if (!jid || typeof jid !== 'string') return (!nullish(jid) && jid) || null;
        return jid.decodeJid();
    },
    writable: true,
    configurable: true,
    enumerable: true
},

normalizeJid: {
    value(jid) {
        if (!jid) return jid;
        jid = conn.decodeJid(jid);
        return jid && jid.endsWith('@s.whatsapp.net') ? jid : jid;
    },
    writable: true,
    configurable: true,
    enumerable: true
},
        logger: {
            get() {
                return {
                    info(...args) {
                        console.log(
                            chalk.bold.bgRgb(51, 204, 51)('INFO '),
                            `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                            chalk.cyan(format(...args))
                        );
                    },
                    error(...args) {
                        console.log(
                            chalk.bold.bgRgb(247, 38, 33)('ERROR '),
                            `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                            chalk.rgb(255, 38, 0)(format(...args))
                        );
                    },
                    warn(...args) {
                        console.log(
                            chalk.bold.bgRgb(255, 153, 0)('WARNING '),
                            `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                            chalk.redBright(format(...args))
                        );
                    },
                    trace(...args) {
                        console.log(
                            chalk.grey('TRACE '),
                            `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                            chalk.white(format(...args))
                        );
                    },
                    debug(...args) {
                        console.log(
                            chalk.bold.bgRgb(66, 167, 245)('DEBUG '),
                            `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                            chalk.white(format(...args))
                        );
                    }
                };
            },
            enumerable: true
        },
        sendSylph: {
            async value(jid, text = '', buffer, title, body, url, quoted, options) {
                jid = conn.normalizeJid(jid);
                if (buffer) try {
                    let type = await conn.getFile(buffer);
                    buffer = type.data;
                } catch {
                    buffer = buffer;
                }
                const mentionedJid = await conn.parseMention(text);
                const normalizedMentions = mentionedJid.map(jid => conn.normalizeJid(jid));
                let prep = generateWAMessageFromContent(conn.normalizeJid(jid), {
                    extendedTextMessage: {
                        text: text,
                        contextInfo: {
                            externalAdReply: {
                                title: title,
                                body: body,
                                thumbnail: buffer,
                                sourceUrl: url
                            },
                            mentionedJid: normalizedMentions
                        }
                    }
                }, { quoted: quoted });
                return conn.relayMessage(conn.normalizeJid(jid), prep.message, { messageId: prep.key.id });
            }
        },
        sendSylphy: {
            async value(jid, medias, options = {}) {
                jid = conn.normalizeJid(jid);
                if (typeof jid !== "string") {
                    throw new TypeError(`jid must be string, received: ${jid} (${jid?.constructor?.name})`);
                }
                if (!Array.isArray(medias)) {
                    throw new TypeError(`medias must be array, received: ${medias} (${medias?.constructor?.name})`);
                }
                for (const media of medias) {
                    if (!media || typeof media !== 'object') {
                        throw new TypeError(`media must be object, received: ${media} (${media?.constructor?.name})`);
                    }
                    if (!media.type || (media.type !== "image" && media.type !== "video")) {
                        throw new TypeError(`media.type must be "image" or "video", received: ${media.type} (${media.type?.constructor?.name})`);
                    }
                    if (!media.data || (!media.data.url && !Buffer.isBuffer(media.data))) {
                        throw new TypeError(`media.data must be object with url or buffer, received: ${media.data} (${media.data?.constructor?.name})`);
                    }
                }
                if (medias.length < 2) {
                    throw new RangeError("Minimum 2 media");
                }
                const delay = !isNaN(options.delay) ? options.delay : 500;
                delete options.delay;
                const album = baileys.generateWAMessageFromContent(
                    jid,
                    {
                        messageContextInfo: {},
                        albumMessage: {
                            expectedImageCount: medias.filter(media => media.type === "image").length,
                            expectedVideoCount: medias.filter(media => media.type === "video").length,
                            ...(options.quoted ? {
                                contextInfo: {
                                    remoteJid: conn.normalizeJid(options.quoted.key.remoteJid),
                                    fromMe: options.quoted.key.fromMe,
                                    stanzaId: options.quoted.key.id,
                                    participant: conn.normalizeJid(options.quoted.key.participant || options.quoted.key.remoteJid),
                                    quotedMessage: options.quoted.message,
                                },
                            } : {}),
                        },
                    },
                    {}
                );
                await conn.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id });
                for (let i = 0; i < medias.length; i++) {
                    const { type, data, caption } = medias[i];
                    const message = await baileys.generateWAMessage(
                        album.key.remoteJid,
                        { [type]: data, caption: caption || "" },
                        { upload: conn.waUploadToServer }
                    );
                    message.message.messageContextInfo = {
                        messageAssociation: { associationType: 1, parentMessageKey: album.key },
                    };
                    await conn.relayMessage(message.key.remoteJid, message.message, { messageId: message.key.id });
                    await baileys.delay(delay);
                }
                return album;
            }
        },
        sendListB: {
            async value(jid, title, text, buttonText, buffer, listSections, quoted, options = {}) {
                jid = conn.normalizeJid(jid);
                let img, video;

                if (buffer) {
                    if (/^https?:\/\//i.test(buffer)) {
                        try {
                            const response = await fetch(buffer);
                            const contentType = response.headers.get('content-type');
                            if (/^image\//i.test(contentType)) {
                                img = await prepareWAMessageMedia({ image: { url: buffer } }, { upload: conn.waUploadToServer });
                            } else if (/^video\//i.test(contentType)) {
                                video = await prepareWAMessageMedia({ video: { url: buffer } }, { upload: conn.waUploadToServer });
                            } else {
                                console.error("Tipo MIME no compatible:", contentType);
                            }
                        } catch (error) {
                            console.error("Error al obtener el tipo MIME:", error);
                        }
                    } else {
                        try {
                            const type = await conn.getFile(buffer);
                            if (/^image\//i.test(type.mime)) {
                                img = await prepareWAMessageMedia({ image: { url: buffer } }, { upload: conn.waUploadToServer });
                            } else if (/^video\//i.test(type.mime)) {
                                video = await prepareWAMessageMedia({ video: { url: buffer } }, { upload: conn.waUploadToServer });
                            }
                        } catch (error) {
                            console.error("Error al obtener el tipo de archivo:", error);
                        }
                    }
                }

                const sections = [...listSections];

                const message = {
                    interactiveMessage: {
                        header: {
                            title: title,
                            hasMediaAttachment: false,
                            imageMessage: img ? img.imageMessage : null,
                            videoMessage: video ? video.videoMessage : null
                        },
                        body: { text: text },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: 'single_select',
                                    buttonParamsJson: JSON.stringify({
                                        title: buttonText,
                                        sections
                                    })
                                }
                            ],
                            messageParamsJson: ''
                        }
                    }
                };

                let msgL = generateWAMessageFromContent(jid, {
                    viewOnceMessage: {
                        message
                    }
                }, { userJid: conn.user.jid, quoted });

                conn.relayMessage(jid, msgL.message, { messageId: msgL.key.id, ...options });
            }
        },
        sendBot: {
            async value(jid, text = '', buffer, title, body, url, quoted, options) {
                jid = conn.normalizeJid(jid);
                if (buffer) try {
                    let type = await conn.getFile(buffer);
                    buffer = type.data;
                } catch {
                    buffer = buffer;
                }
                const mentionedJid = await conn.parseMention(text);
                const normalizedMentions = mentionedJid.map(jid => conn.normalizeJid(jid));
                let prep = generateWAMessageFromContent(jid, {
                    extendedTextMessage: {
                        text: text,
                        contextInfo: {
                            externalAdReply: {
                                title: title,
                                body: body,
                                thumbnail: buffer,
                                sourceUrl: url
                            },
                            mentionedJid: normalizedMentions
                        }
                    }
                }, { quoted: quoted });
                return conn.relayMessage(jid, prep.message, { messageId: prep.key.id });
            }
        },
        sendPayment: {
            async value(jid, amount, text, quoted, options) {
                jid = conn.normalizeJid(jid);
                const mentionedJid = await conn.parseMention(text);
                const normalizedMentions = mentionedJid.map(jid => conn.normalizeJid(jid));
                conn.relayMessage(jid, {
                    requestPaymentMessage: {
                        currencyCodeIso4217: 'PEN',
                        amount1000: amount,
                        requestFrom: null,
                        noteMessage: {
                            extendedTextMessage: {
                                text: text,
                                contextInfo: {
                                    externalAdReply: {
                                        showAdAttribution: true
                                    },
                                    mentionedJid: normalizedMentions
                                }
                            }
                        }
                    }
                }, {});
            }
        },
        getFile: {
            async value(PATH, saveToFile = false) {
                let res, filename;
                const data = Buffer.isBuffer(PATH) ? PATH : PATH instanceof ArrayBuffer ? Buffer.from(PATH) : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await fetch(PATH)).buffer() : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0);
                if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer');
                const type = await fileTypeFromBuffer(data) || {
                    mime: 'application/octet-stream',
                    ext: '.bin'
                };
                if (data && saveToFile && !filename) (filename = path.join(__dirname, '../tmp/' + new Date * 1 + '.' + type.ext), await fs.promises.writeFile(filename, data));
                return {
                    res,
                    filename,
                    ...type,
                    data,
                    deleteFile() {
                        return filename && fs.promises.unlink(filename);
                    }
                };
            },
            enumerable: true
        },
        waitEvent: {
            value(eventName, is = () => true, maxTries = 25) {
                return new Promise((resolve, reject) => {
                    let tries = 0;
                    let on = (...args) => {
                        if (++tries > maxTries) reject('Max tries reached');
                        else if (is()) {
                            conn.ev.off(eventName, on);
                            resolve(...args);
                        }
                    };
                    conn.ev.on(eventName, on);
                });
            }
        },
        sendContact: {
            async value(jid, data, quoted, options) {
                jid = conn.normalizeJid(jid);
                if (!Array.isArray(data)) data = [data];
                if (!Array.isArray(data[0]) && typeof data[0] === 'string') data = [data];
                let contacts = [];
                for (let [number, name] of data) {
                    number = number.replace(/[^0-9]/g, '');
                    let njid = number + '@s.whatsapp.net';
                    let biz = await conn.getBusinessProfile(njid).catch(_ => null) || {};
                    let vcard = `
BEGIN:VCARD
VERSION:3.0
N:;${name.replace(/\n/g, '\\n')};;;
FN:${name.replace(/\n/g, '\\n')}
TEL;type=CELL;type=VOICE;waid=${number}:${PhoneNumber('+' + number).getNumber('international')}${biz.description ? `
X-WA-BIZ-NAME:${(conn.chats[njid]?.vname || conn.getName(njid) || name).replace(/\n/, '\\n')}
X-WA-BIZ-DESCRIPTION:${biz.description.replace(/\n/g, '\\n')}
`.trim() : ''}
END:VCARD
        `.trim();
                    contacts.push({ vcard, displayName: name });
                }
                return await conn.sendMessage(jid, {
                    ...options,
                    contacts: {
                        ...options,
                        displayName: (contacts.length >= 2 ? `${contacts.length} kontak` : contacts[0].displayName) || null,
                        contacts,
                    }
                }, { quoted, ...options });
            },
            enumerable: true
        },
        resize: {
            value(buffer, ukur1, ukur2) {
                return new Promise(async (resolve, reject) => {
                    try {
                        var baper = await Jimp.read(buffer);
                        var ab = await baper.resize(ukur1, ukur2).getBufferAsync(Jimp.MIME_JPEG);
                        resolve(ab);
                    } catch (error) {
                        reject(error);
                    }
                });
            }
        },
        relayWAMessage: {
            async value(pesanfull) {
                const remoteJid = conn.normalizeJid(pesanfull.key.remoteJid);
                if (pesanfull.message.audioMessage) {
                    await conn.sendPresenceUpdate('recording', remoteJid);
                } else {
                    await conn.sendPresenceUpdate('composing', remoteJid);
                }
                var mekirim = await conn.relayMessage(remoteJid, pesanfull.message, { messageId: pesanfull.key.id });
                conn.ev.emit('messages.upsert', { messages: [pesanfull], type: 'append' });
                return mekirim;
            }
        },
        sendListM: {
            async value(jid, button, rows, quoted, options = {}) {
                jid = conn.normalizeJid(jid);
                let fsizedoc = '1'.repeat(10);
                const sections = [
                    {
                        title: button.title,
                        rows: [...rows]
                    }
                ];
                const mentionedJid = await conn.parseMention(button.description);
                const normalizedMentions = mentionedJid.map(jid => conn.normalizeJid(jid));
                const listMessage = {
                    text: button.description,
                    footer: button.footerText,
                    mentions: normalizedMentions,
                    ephemeralExpiration: '86400',
                    title: '',
                    buttonText: button.buttonText,
                    sections
                };
                conn.sendMessage(jid, listMessage, {
                    quoted,
                    ephemeralExpiration: fsizedoc,
                    contextInfo: {
                        forwardingScore: fsizedoc,
                        isForwarded: true,
                        mentions: normalizedMentions,
                        ...options
                    }
                });
            }
        },
        sendList: {
            async value(jid, title, text, footer, buttonText, buffer, listSections, quoted, options) {
                jid = conn.normalizeJid(jid);
                if (buffer) try {
                    let type = await conn.getFile(buffer);
                    buffer = type.data;
                } catch {
                    buffer = buffer;
                }
                if (buffer && !Buffer.isBuffer(buffer) && (typeof buffer === 'string' || Array.isArray(buffer))) (options = quoted, quoted = listSections, listSections = buffer, buffer = null);
                if (!options) options = {};
                const sections = listSections.map(([title, rows]) => ({
                    title: !nullish(title) && title || !nullish(rowTitle) && rowTitle || '',
                    rows: rows.map(([rowTitle, rowId, description]) => ({
                        title: !nullish(rowTitle) && rowTitle || !nullish(rowId) && rowId || '',
                        rowId: !nullish(rowId) && rowId || !nullish(rowTitle) && rowTitle || '',
                        description: !nullish(description) && description || ''
                    }))
                }));

                const mentionedJid = await conn.parseMention(text);
                const normalizedMentions = mentionedJid.map(jid => conn.normalizeJid(jid));
                const listMessage = {
                    text,
                    footer,
                    title,
                    buttonText,
                    sections
                };
                return await conn.sendMessage(jid, listMessage, {
                    quoted,
                    upload: conn.waUploadToServer,
                    contextInfo: {
                        mentionedJid: normalizedMentions,
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363377833048768@newsletter',
                            newsletterName: '᠈❀ ɴɪɴᴏ ɴᴀᴋᴀɴᴏ ᴀɪ - ᴄʜᴀɴɴᴇʟᬵ᠀',
                            serverMessageId: ''
                        },
                        ...options
                    }
                });
            }
        },
        sendContactArray: {
            async value(jid, data, quoted, options) {
                jid = conn.normalizeJid(jid);
                if (!Array.isArray(data)) data = [data];
                if (!Array.isArray(data[0]) && typeof data[0] === 'string') data = [data];
                let contacts = [];
                let buttons = [];
                for (let [number, name, isi, isi1, isi2, isi3, isi4, isi5, ...extraLinks] of data) {
                    number = number.replace(/[^0-9]/g, '');
                    let njid = number + '@s.whatsapp.net';
                    let biz = await conn.getBusinessProfile(njid).catch(_ => null) || {};
                    let vcard = `
BEGIN:VCARD
VERSION:3.0
N:Sy;Bot;;;
FN:${name.replace(/\n/g, '\\n')}
item.ORG:${isi}
item1.TEL;waid=${number}:${PhoneNumber('+' + number).getNumber('international')}
item1.X-ABLabel:${isi1}
${isi2 ? `item2.EMAIL;type=INTERNET:${isi2}\nitem2.X-ABLabel:📧 Email` : ''}
${isi3 ? `item3.ADR:;;${isi3};;;;\nitem3.X-ABADR:ac \nitem3.X-ABLabel:📍 Region` : ''}
${isi4 ? `item4.URL;type=pref:${isi4}\nitem4.X-ABLabel:Website` : ''}
${extraLinks.map((link, index) => link ? `item${index + 5}.URL;type=pref:${link}\nitem${index + 5}.X-ABLabel:Extra Link ${index + 1}` : '').join('\n')}
${isi5 ? `${extraLinks.length > 0 ? `item${extraLinks.length + 5}` : 'item5'}.X-ABLabel:${isi5}` : ''}
END:VCARD`.trim();

                    let newButtons = extraLinks.map((link, index) => ({
                        buttonId: `extra-link-${index + 1}`,
                        buttonText: { displayText: `Extra Link ${index + 1}` },
                        type: 1,
                        url: `http://${link}`
                    }));
                    buttons.push(...newButtons);

                    contacts.push({ vcard, displayName: name });
                }

                let displayName = null;
                if (contacts.length === 1) {
                    displayName = contacts[0].displayName;
                } else if (contacts.length > 1) {
                    displayName = `${contacts.length} kontak`;
                }

                let contactsWithButtons = [];
                for (let i = 0; i < contacts.length; i++) {
                    let contact = contacts[i];
                    let contactButtons = buttons.filter(button => button.buttonId.startsWith(`extra-link-${i + 1}`));
                    contactsWithButtons.push({ ...contact, ...{ buttons: contactButtons } });
                }

                return await conn.sendMessage(jid, {
                    contacts: {
                        displayName,
                        contacts: contactsWithButtons
                    }
                }, {
                    quoted,
                    ...options
                });
            }
        },
        sendFile: {
            async value(jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) {
                jid = conn.normalizeJid(jid);
                let type = await conn.getFile(path, true);
                let { res, data: file, filename: pathFile } = type;
                if (res && res.status !== 200 || file.length <= 65536) {
                    try { throw { json: JSON.parse(file.toString()) } }
                    catch (e) { if (e.json) throw e.json }
                }
                let opt = {};
                if (quoted) opt.quoted = quoted;
                if (!type) options.asDocument = true;
                let mtype = '', mimetype = options.mimetype || type.mime, convert;
                if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker';
                else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image';
                else if (/video/.test(type.mime)) mtype = 'video';
                else if (/audio/.test(type.mime)) (
                    convert = await toAudio(file, type.ext),
                    file = convert.data,
                    pathFile = convert.filename,
                    mtype = 'audio',
                    mimetype = options.mimetype || 'audio/ogg; codecs=opus'
                );
                else mtype = 'document';
                if (options.asDocument) mtype = 'document';

                delete options.asSticker;
                delete options.asLocation;
                delete options.asVideo;
                delete options.asDocument;
                delete options.asImage;

                let message = {
                    ...options,
                    caption,
                    ptt,
                    [mtype]: { url: pathFile },
                    mimetype,
                    fileName: filename || pathFile.split('/').pop()
                };
                let m;
                try {
                    m = await conn.sendMessage(jid, message, { ...opt, ...options });
                } catch (e) {
                    console.error(e);
                    m = null;
                } finally {
                    if (!m) m = await conn.sendMessage(jid, { ...message, [mtype]: file }, { ...opt, ...options });
                    file = null;
                    return m;
                }
            },
            enumerable: true
        },
        reply: {
            value(jid, text = '', quoted, options) {
                jid = conn.normalizeJid(jid);
                return Buffer.isBuffer(text) ? conn.sendFile(jid, text, 'file', '', quoted, false, options) : conn.sendMessage(jid, { ...options, text }, { quoted, ...options });
            }
        },
        generateProfilePicture: {
            async value(buffer) {
                const jimp_1 = await Jimp.read(buffer);
                const resz = jimp_1.getWidth() > jimp_1.getHeight() ? jimp_1.resize(550, Jimp.AUTO) : jimp_1.resize(Jimp.AUTO, 650);
                const jimp_2 = await Jimp.read(await resz.getBufferAsync(Jimp.MIME_JPEG));
                return {
                    img: await resz.getBufferAsync(Jimp.MIME_JPEG)
                };
            }
        },
        sendButtonImg: {
            async value(jid, buffer, contentText, footerText, button1, id1, quoted, options) {
                jid = conn.normalizeJid(jid);
                let type = await conn.getFile(buffer);
                let { res, data: file } = type;
                if (res && res.status !== 200 || file.length <= 65536) {
                    try { throw { json: JSON.parse(file.toString()) } }
                    catch (e) { if (e.json) throw e.json }
                }
                const buttons = [
                    { buttonId: id1, buttonText: { displayText: button1 }, type: 1 }
                ];

                const mentionedJid = await conn.parseMention(contentText + footerText);
                const normalizedMentions = mentionedJid.map(jid => conn.normalizeJid(jid));
                const buttonMessage = {
                    image: file,
                    fileLength: 800000000000000,
                    caption: contentText,
                    footer: footerText,
                    mentions: normalizedMentions,
                    ...options,
                    buttons: buttons,
                    headerType: 4
                };

                return conn.sendMessage(jid, buttonMessage, { quoted, ephemeralExpiration: 86400, contextInfo: { mentionedJid: normalizedMentions }, ...options });
            }
        },
        sendMini: {
            async value(jid, title, body, text = '', thumbnailUrl, thumbnail, sourceUrl, quoted, LargerThumbnail = true) {
                jid = conn.normalizeJid(jid);
                const mentionedJid = await conn.parseMention(text);
                const normalizedMentions = mentionedJid.map(jid => conn.normalizeJid(jid));
                return conn.sendMessage(jid, {
                    ...{
                        contextInfo: {
                            mentionedJid: normalizedMentions,
                            externalAdReply: {
                                title: title,
                                body: body,
                                mediaType: 1,
                                previewType: 0,
                                renderLargerThumbnail: LargerThumbnail,
                                thumbnailUrl: thumbnailUrl,
                                thumbnail: thumbnailUrl,
                                sourceUrl: sourceUrl
                            },
                        },
                    }, text
                }, { quoted });
            },
            enumerable: true,
            writable: true,
        },
        send1ButtonVid: {
            async value(jid, buffer, contentText, footerText, button1, id1, quoted, options) {
                jid = conn.normalizeJid(jid);
                let type = await conn.getFile(buffer);
                let { res, data: file } = type;
                if (res && res.status !== 200 || file.length <= 65536) {
                    try { throw { json: JSON.parse(file.toString()) } }
                    catch (e) { if (e.json) throw e.json }
                }
                let buttons = [
                    { buttonId: id1, buttonText: { displayText: button1 }, type: 1 }
                ];
                const mentionedJid = await conn.parseMention(contentText);
                const normalizedMentions = mentionedJid.map(jid => conn.normalizeJid(jid));
                const buttonMessage = {
                    video: file,
                    fileLength: 800000000000000,
                    caption: contentText,
                    footer: footerText,
                    mentions: normalizedMentions,
                    ...options,
                    buttons: buttons,
                    headerType: 4
                };
                return conn.sendMessage(jid, buttonMessage, {
                    quoted,
                    ephemeralExpiration: 86400,
                    ...options
                });
            }
        },
        send2ButtonVid: {
            async value(jid, buffer, contentText, footerText, button1, id1, button2, id2, quoted, options) {
                jid = conn.normalizeJid(jid);
                let type = await conn.getFile(buffer);
                let { res, data: file } = type;
                if (res && res.status !== 200 || file.length <= 65536) {
                    try { throw { json: JSON.parse(file.toString()) } }
                    catch (e) { if (e.json) throw e.json }
                }
                let buttons = [
                    { buttonId: id1, buttonText: { displayText: button1 }, type: 1 },
                    { buttonId: id2, buttonText: { displayText: button2 }, type: 1 }
                ];
                const mentionedJid = await conn.parseMention(contentText + footerText);
                const normalizedMentions = mentionedJid.map(jid => conn.normalizeJid(jid));
                const buttonMessage = {
                    video: file,
                    fileLength: 800000000000000,
                    caption: contentText,
                    footer: footerText,
                    mentions: normalizedMentions,
                    ...options,
                    buttons: buttons,
                    headerType: 4
                };
                return conn.sendMessage(jid, buttonMessage, {
                    quoted,
                    ephemeralExpiration: 86400,
                    ...options
                });
            }
        },
        sendButtonLoc: {
            async value(jid, buffer, content, footer, button1, row1, quoted, options = {}) {
                jid = conn.normalizeJid(jid);
                let type = await conn.getFile(buffer);
                let { res, data: file } = type;
                if (res && res.status !== 200 || file.length <= 65536) {
                    try { throw { json: JSON.parse(file.toString()) } }
                    catch (e) { if (e.json) throw e.json }
                }
                let buttons = [
                    { buttonId: row1, buttonText: { displayText: button1 }, type: 1 }
                ];

                const mentionedJid = await conn.parseMention(content + footer);
                const normalizedMentions = mentionedJid.map(jid => conn.normalizeJid(jid));
                let buttonMessage = {
                    location: { jpegThumbnail: file },
                    caption: content,
                    footer: footer,
                    mentions: normalizedMentions,
                    ...options,
                    buttons: buttons,
                    headerType: 6
                };
                return await conn.sendMessage(jid, buttonMessage, {
                    quoted,
                    upload: conn.waUploadToServer,
                    ephemeralExpiration: global.ephemeral,
                    mentions: normalizedMentions,
                    ...options
                });
            }
        },
        sendButtonVid: {
            async value(jid, buffer, contentText, footerText, button1, id1, button2, id2, button3, id3, quoted, options) {
                jid = conn.normalizeJid(jid);
                let type = await conn.getFile(buffer);
                let { res, data: file } = type;
                if (res && res.status !== 200 || file.length <= 65536) {
                    try { throw { json: JSON.parse(file.toString()) } }
                    catch (e) { if (e.json) throw e.json }
                }
                let buttons = [
                    { buttonId: id1, buttonText: { displayText: button1 }, type: 1 },
                    { buttonId: id2, buttonText: { displayText: button2 }, type: 1 },
                    { buttonId: id3, buttonText: { displayText: button3 }, type: 1 },
                ];
                const mentionedJid = await conn.parseMention(contentText + footerText);
                const normalizedMentions = mentionedJid.map(jid => conn.normalizeJid(jid));
                const buttonMessage = {
                    video: file,
                    fileLength: 800000000000000,
                    caption: contentText,
                    footer: footerText,
                    mentions: normalizedMentions,
                    ...options,
                    buttons: buttons,
                    headerType: 4
                };
                return conn.sendMessage(jid, buttonMessage, {
                    quoted,
                    ephemeralExpiration: 86400,
                    ...options
                });
            }
        },
        sendTemplateButtonLoc: {
            async value(jid, buffer, contentText, footer, buttons1, row1, quoted, options) {
                jid = conn.normalizeJid(jid);
                let file = await conn.resize(buffer, 300, 150);
                const mentionedJid = await conn.parseMention(contentText + footer);
                const normalizedMentions = mentionedJid.map(jid => conn.normalizeJid(jid));
                const template = generateWAMessageFromContent(jid, proto.Message.fromObject({
                    templateMessage: {
                        hydratedTemplate: {
                            locationMessage: { jpegThumbnail: file },
                            hydratedContentText: contentText,
                            hydratedFooterText: footer,
                            ...options,
                            hydratedButtons: [{
                                urlButton: {
                                    displayText: global.author,
                                    url: global.md
                                }
                            },
                            {
                                quickReplyButton: {
                                    displayText: buttons1,
                                    id: row1
                                }
                            }]
                        }
                    }
                }), { userJid: conn.user.jid, quoted: quoted, contextInfo: { mentionedJid: normalizedMentions }, ephemeralExpiration: "86400", ...options });
                return conn.relayMessage(
                    jid,
                    template.message,
                    { messageId: template.key.id }
                );
            }
        },
        sendGroupV4Invite: {
            async value(jid, participant, inviteCode, inviteExpiration, groupName = 'unknown subject', caption = 'Invitation to join my WhatsApp group', jpegThumbnail, options = {}) {
                jid = conn.normalizeJid(jid);
                participant = conn.normalizeJid(participant);
                const msg = proto.Message.fromObject({
                    groupInviteMessage: proto.GroupInviteMessage.fromObject({
                        inviteCode,
                        inviteExpiration: parseInt(inviteExpiration) || +new Date(new Date + (3 * 86400000)),
                        groupJid: jid,
                        groupName: (groupName ? groupName : await conn.getName(jid)) || null,
                        jpegThumbnail: Buffer.isBuffer(jpegThumbnail) ? jpegThumbnail : null,
                        caption
                    })
                });
                const message = generateWAMessageFromContent(participant, msg, options);
                await conn.relayMessage(participant, message.message, { messageId: message.key.id, additionalAttributes: { ...options } });
                return message;
            },
            enumerable: true
        },
        sendButtonMessages: {
            async value(jid, messages, quoted, options) {
                jid = conn.normalizeJid(jid);
                messages.length > 1 ? await conn.sendCarousel(jid, messages, quoted, options) : await conn.sendNCarousel(
                    jid, ...messages[0], quoted, options);
            }
        },
        sendNCarousel: {
            async value(jid, text = '', footer = '', buffer, buttons, copy, urls, list, quoted, options) {
                jid = conn.normalizeJid(jid);
                let img, video;
                if (buffer) {
                    if (/^https?:\/\//i.test(buffer)) {
                        try {
                            const response = await fetch(buffer);
                            const contentType = response.headers.get('content-type');
                            if (/^image\//i.test(contentType)) {
                                img = await prepareWAMessageMedia({
                                    image: {
                                        url: buffer
                                    }
                                }, {
                                    upload: conn.waUploadToServer,
                                    ...options
                                });
                            } else if (/^video\//i.test(contentType)) {
                                video = await prepareWAMessageMedia({
                                    video: {
                                        url: buffer
                                    }
                                }, {
                                    upload: conn.waUploadToServer,
                                    ...options
                                });
                            } else {
                                console.error("Incompatible MIME type:", contentType);
                            }
                        } catch (error) {
                            console.error("Failed to get MIME type:", error);
                        }
                    } else {
                        try {
                            const type = await conn.getFile(buffer);
                            if (/^image\//i.test(type.mime)) {
                                img = await prepareWAMessageMedia({
                                    image: (/^https?:\/\//i.test(buffer)) ? {
                                        url: buffer
                                    } : (type && type?.data)
                                }, {
                                    upload: conn.waUploadToServer,
                                    ...options
                                });
                            } else if (/^video\//i.test(type.mime)) {
                                video = await prepareWAMessageMedia({
                                    video: (/^https?:\/\//i.test(buffer)) ? {
                                        url: buffer
                                    } : (type && type?.data)
                                }, {
                                    upload: conn.waUploadToServer,
                                    ...options
                                });
                            }
                        } catch (error) {
                            console.error("Failed to get file type:", error);
                        }
                    }
                }
                const dynamicButtons = buttons.map(btn => ({
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: btn[0],
                        id: btn[1]
                    }),
                }));
                if (copy && (typeof copy === 'string' || typeof copy === 'number')) {
                    dynamicButtons.push({
                        name: 'cta_copy',
                        buttonParamsJson: JSON.stringify({
                            display_text: 'Copy',
                            copy_code: copy
                        })
                    });
                }
                if (urls && Array.isArray(urls)) {
                    urls.forEach(url => {
                        dynamicButtons.push({
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: url[0],
                                url: url[1],
                                merchant_url: url[1]
                            })
                        });
                    });
                }
                if (list && Array.isArray(list)) {
                    list.forEach(lister => {
                        dynamicButtons.push({
                            name: 'single_select',
                            buttonParamsJson: JSON.stringify({
                                title: lister[0],
                                sections: lister[1]
                            })
                        });
                    });
                }
                const mentionedJid = await conn.parseMention(text || '@0');
                const normalizedMentions = mentionedJid.map(jid => conn.normalizeJid(jid));
                const interactiveMessage = {
                    body: {
                        text: text || ''
                    },
                    footer: {
                        text: footer || ''
                    },
                    header: {
                        hasMediaAttachment: img?.imageMessage || video?.videoMessage ? true : false,
                        imageMessage: img?.imageMessage || null,
                        videoMessage: video?.videoMessage || null
                    },
                    nativeFlowMessage: {
                        buttons: dynamicButtons.filter(Boolean),
                        messageParamsJson: ''
                    },
                    ...Object.assign({
                        mentions: normalizedMentions,
                        contextInfo: {
                            mentionedJid: normalizedMentions,
                        }
                    }, {
                        ...(options || {}),
                        ...(conn.temareply?.contextInfo && {
                            contextInfo: {
                                ...(options?.contextInfo || {}),
                                ...conn.temareply?.contextInfo,
                                externalAdReply: {
                                    ...(options?.contextInfo?.externalAdReply || {}),
                                    ...conn.temareply?.contextInfo?.externalAdReply,
                                },
                            },
                        })
                    })
                };
                const messageContent = proto.Message.fromObject({
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadata: {},
                                deviceListMetadataVersion: 2
                            },
                            interactiveMessage
                        }
                    }
                });
                const msgs = await generateWAMessageFromContent(jid, messageContent, {
                    userJid: conn.user.jid,
                    quoted: quoted,
                    upload: conn.waUploadToServer,
                    ephemeralExpiration: WA_DEFAULT_EPHEMERAL
                });
                await conn.relayMessage(jid, msgs.message, {
                    messageId: msgs.key.id
                });
            }
        },
        sendCarousel: {
            async value(jid, text = '', footer = '', text2 = '', messages, quoted, options) {
                jid = conn.normalizeJid(jid);
                if (messages.length > 1) {
                    const cards = await Promise.all(messages.map(async ([text = '', footer = '', buffer, buttons, copy,
                        urls, list
                    ]) => {
                        let img, video;
                        if (/^https?:\/\//i.test(buffer)) {
                            try {
                                const response = await fetch(buffer);
                                const contentType = response.headers.get('content-type');
                                if (/^image\//i.test(contentType)) {
                                    img = await prepareWAMessageMedia({
                                        image: {
                                            url: buffer
                                        }
                                }, {
                                        upload: conn.waUploadToServer,
                                        ...options
                                    });
                                } else if (/^video\//i.test(contentType)) {
                                    video = await prepareWAMessageMedia({
                                        video: {
                                            url: buffer
                                        }
                                }, {
                                        upload: conn.waUploadToServer,
                                        ...options
                                    });
                                } else {
                                    console.error("Incompatible MIME types:", contentType);
                                }
                            } catch (error) {
                                console.error("Failed to get MIME type:", error);
                            }
                        } else {
                            try {
                                const type = await conn.getFile(buffer);
                                if (/^image\//i.test(type.mime)) {
                                    img = await prepareWAMessageMedia({
                                        image: (/^https?:\/\//i.test(buffer)) ? {
                                            url: buffer
                                        } : (type && type?.data)
                                }, {
                                        upload: conn.waUploadToServer,
                                        ...options
                                    });
                                } else if (/^video\//i.test(type.mime)) {
                                    video = await prepareWAMessageMedia({
                                        video: (/^https?:\/\//i.test(buffer)) ? {
                                            url: buffer
                                        } : (type && type?.data)
                                }, {
                                        upload: conn.waUploadToServer,
                                        ...options
                                    });
                                }
                            } catch (error) {
                                console.error("Failed to get file type:", error);
                            }
                        }
                        const dynamicButtons = buttons.map(btn => ({
                            name: 'quick_reply',
                            buttonParamsJson: JSON.stringify({
                                display_text: btn[0],
                                id: btn[1]
                            }),
                        }));
                        copy = Array.isArray(copy) ? copy : [copy];
                        copy.map(copy => {
                            dynamicButtons.push({
                                name: 'cta_copy',
                                buttonParamsJson: JSON.stringify({
                                    display_text: 'Copy',
                                    copy_code: copy[0]
                                })
                            });
                        });
                        if (urls && Array.isArray(urls)) {
                            urls.forEach(url => {
                                dynamicButtons.push({
                                    name: 'cta_url',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: url[0],
                                        url: url[1],
                                        merchant_url: url[1]
                                    })
                                });
                            });
                        }

                        if (list && Array.isArray(list)) {
                            list.forEach(lister => {
                                dynamicButtons.push({
                                    name: 'single_select',
                                    buttonParamsJson: JSON.stringify({
                                        title: lister[0],
                                        sections: lister[1]
                                    })
                                });
                            });
                        }

                        const mentionedJid = await conn.parseMention(text || '@0');
                        const normalizedMentions = mentionedJid.map(jid => conn.normalizeJid(jid));
                        return {
                            body: proto.Message.InteractiveMessage.Body.fromObject({
                                text: text || ''
                            }),
                            footer: proto.Message.InteractiveMessage.Footer.fromObject({
                                text: footer || ''
                            }),
                            header: proto.Message.InteractiveMessage.Header.fromObject({
                                title: text2,
                                subtitle: text || '',
                                hasMediaAttachment: img?.imageMessage || video?.videoMessage ? true : false,
                                imageMessage: img?.imageMessage || null,
                                videoMessage: video?.videoMessage || null
                            }),
                            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                                buttons: dynamicButtons.filter(Boolean),
                                messageParamsJson: ''
                            }),
                            ...Object.assign({
                                mentions: normalizedMentions,
                                contextInfo: {
                                    mentionedJid: normalizedMentions,
                                }
                            }, {
                                ...(options || {}),
                                ...(conn.temareply?.contextInfo && {
                                    contextInfo: {
                                        ...(options?.contextInfo || {}),
                                        ...conn.temareply?.contextInfo,
                                        externalAdReply: {
                                            ...(options?.contextInfo?.externalAdReply || {}),
                                            ...conn.temareply?.contextInfo?.externalAdReply,
                                        },
                                    },
                                })
                            })
                        };
                    }));
                    const mentionedJid = await conn.parseMention(text || '@0');
                    const normalizedMentions = mentionedJid.map(jid => conn.normalizeJid(jid));
                    const interactiveMessage = proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.fromObject({
                            text: text || ''
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.fromObject({
                            text: footer || ''
                        }),
                        header: proto.Message.InteractiveMessage.Header.fromObject({
                            title: text || '',
                            subtitle: text || '',
                            hasMediaAttachment: false
                        }),
                        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                            cards,
                        }),
                        ...Object.assign({
                            mentions: normalizedMentions,
                            contextInfo: {
                                mentionedJid: normalizedMentions,
                            }
                        }, {
                            ...(options || {}),
                            ...(conn.temareply?.contextInfo && {
                                contextInfo: {
                                    ...(options?.contextInfo || {}),
                                    ...conn.temareply?.contextInfo,
                                    externalAdReply: {
                                        ...(options?.contextInfo?.externalAdReply || {}),
                                        ...conn.temareply?.contextInfo?.externalAdReply,
                                    },
                                },
                            })
                        })
                    });
                    const messageContent = proto.Message.fromObject({
                        viewOnceMessage: {
                            message: {
                                messageContextInfo: {
                                    deviceListMetadata: {},
                                    deviceListMetadataVersion: 2
                                },
                                interactiveMessage
                            }
                        }
                    });
                    const msgs = await generateWAMessageFromContent(jid, messageContent, {
                        userJid: conn.user.jid,
                        quoted: quoted,
                        upload: conn.waUploadToServer,
                        ephemeralExpiration: WA_DEFAULT_EPHEMERAL
                    });
                    await conn.relayMessage(jid, msgs.message, {
                        messageId: msgs.key.id
                    });
                } else {
                    await conn.sendNCarousel(jid, ...messages[0], quoted, options);
                }
            }
        },
        sendButton: {
            async value(jid, text = '', footer = '', buffer, buttons, copy, urls, quoted, options) {
                jid = conn.normalizeJid(jid);
                let img, video;

                if (buffer) {
                    if (/^https?:\/\//i.test(buffer)) {
                        try {
                            const response = await fetch(buffer);
                            const contentType = response.headers.get('content-type');
                            if (/^image\//i.test(contentType)) {
                                img = await prepareWAMessageMedia({ image: { url: buffer } }, { upload: conn.waUploadToServer });
                            } else if (/^video\//i.test(contentType)) {
                                video = await prepareWAMessageMedia({ video: { url: buffer } }, { upload: conn.waUploadToServer });
                            } else {
                                console.error("Tipo MIME no compatible:", contentType);
                            }
                        } catch (error) {
                            console.error("Error al obtener el tipo MIME:", error);
                        }
                    } else {
                        try {
                            const type = await conn.getFile(buffer);
                            if (/^image\//i.test(type.mime)) {
                                img = await prepareWAMessageMedia({ image: { url: buffer } }, { upload: conn.waUploadToServer });
                            } else if (/^video\//i.test(type.mime)) {
                                video = await prepareWAMessageMedia({ video: { url: buffer } }, { upload: conn.waUploadToServer });
                            }
                        } catch (error) {
                            console.error("Error al obtener el tipo de archivo:", error);
                        }
                    }
                }

                const dynamicButtons = buttons.map(btn => ({
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: btn[0],
                        id: btn[1]
                    }),
                }));

                if (copy && (typeof copy === 'string' || typeof copy === 'number')) {
                    dynamicButtons.push({
                        name: 'cta_copy',
                        buttonParamsJson: JSON.stringify({
                            display_text: 'Copy',
                            copy_code: copy
                        })
                    });
                }

                if (urls && Array.isArray(urls)) {
                    urls.forEach(url => {
                        dynamicButtons.push({
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: url[0],
                                url: url[1],
                                merchant_url: url[1]
                            })
                        });
                    });
                }

                const interactiveMessage = {
                    body: { text: text },
                    footer: { text: footer },
                    header: {
                        hasMediaAttachment: false,
                        imageMessage: img ? img.imageMessage : null,
                        videoMessage: video ? video.videoMessage : null
                    },
                    nativeFlowMessage: {
                        buttons: dynamicButtons,
                        messageParamsJson: ''
                    }
                };

                let msgL = generateWAMessageFromContent(jid, {
                    viewOnceMessage: {
                        message: {
                            interactiveMessage
                        }
                    }
                }, { userJid: conn.user.jid, quoted });

                conn.relayMessage(jid, msgL.message, { messageId: msgL.key.id, ...options });
            }
        },
        sendPoll: {
            async value(jid, name = '', values = [], selectableCount = 1) {
                jid = conn.normalizeJid(jid);
                return conn.sendMessage(jid, { poll: { name, values, selectableCount } });
            }
        },
        sendButtonGif: {
            async value(jid, text = '', footer = '', gif, but = [], buff, options = {}) {
                jid = conn.normalizeJid(jid);
                let file = await conn.resize(buff, 300, 150);
                let a = [1, 2];
                let b = a[Math.floor(Math.random() * a.length)];
                conn.sendMessage(jid, { video: gif, gifPlayback: true, gifAttribution: b, caption: text, footer: footer, jpegThumbnail: file, templateButtons: but, ...options });
            }
        },
        sendHydrated: {
            async value(jid, text = '', footer = '', buffer, url, urlText, call, callText, buttons, quoted, options) {
                jid = conn.normalizeJid(jid);
                let type;
                if (buffer) try {
                    type = await conn.getFile(buffer);
                    buffer = type.data;
                } catch {
                    buffer = buffer;
                }
                if (buffer && !Buffer.isBuffer(buffer) && (typeof buffer === 'string' || Array.isArray(buffer))) (options = quoted, quoted = buttons, buttons = callText, callText = call, call = urlText, urlText = url, url = buffer, buffer = null);
                if (!options) options = {};
                let templateButtons = [];
                if (url || urlText) {
                    if (!Array.isArray(url)) url = [url];
                    if (!Array.isArray(urlText)) urlText = [urlText];
                    templateButtons.push(...(
                        url.map((v, i) => [v, urlText[i]])
                            .map(([url, urlText], i) => ({
                                index: templateButtons.length + i + 1,
                                urlButton: {
                                    displayText: !nullish(urlText) && urlText || !nullish(url) && url || '',
                                    url: !nullish(url) && url || !nullish(urlText) && urlText || ''
                                }
                            })) || []
                    ));
                }
                if (call || callText) {
                    if (!Array.isArray(call)) call = [call];
                    if (!Array.isArray(callText)) callText = [callText];
                    templateButtons.push(...(
                        call.map((v, i) => [v, callText[i]])
                            .map(([call, callText], i) => ({
                                index: templateButtons.length + i + 1,
                                callButton: {
                                    displayText: !nullish(callText) && callText || !nullish(call) && call || '',
                                    phoneNumber: !nullish(call) && call || !nullish(callText) && callText || ''
                                }
                            })) || []
                    ));
                }
                if (buttons && buttons.length) {
                    if (!Array.isArray(buttons[0])) buttons = [buttons];
                    templateButtons.push(...(
                        buttons.map(([text, id], index) => ({
                            index: templateButtons.length + index + 1,
                            quickReplyButton: {
                                displayText: !nullish(text) && text || !nullish(id) && id || '',
                                id: !nullish(id) && id || !nullish(text) && text || ''
                            }
                        })) || []
                    ));
                }
                let message = {
                    ...options,
                    [buffer ? 'caption' : 'text']: text || '',
                    footer,
                    templateButtons,
                    ...(buffer ?
                        options.asLocation && /image/.test(type.mime) ? {
                            location: {
                                ...options,
                                jpegThumbnail: buffer
                            }
                        } : {
                            [/video/.test(type.mime) ? 'video' : /image/.test(type.mime) ? 'image' : 'document']: buffer
                        } : {})
                };
                return await conn.sendMessage(jid, message, {
                    quoted,
                    upload: conn.waUploadToServer,
                    ...options
                });
            },
            enumerable: true
        },
        sendHydrated2: {
            async value(jid, text = '', footer = '', buffer, url, urlText, url2, urlText2, buttons, quoted, options) {
                jid = conn.normalizeJid(jid);
                let type;
                if (buffer) try {
                    type = await conn.getFile(buffer);
                    buffer = type.data;
                } catch {
                    buffer = buffer;
                }
                if (buffer && !Buffer.isBuffer(buffer) && (typeof buffer === 'string' || Array.isArray(buffer))) (options = quoted, quoted = buttons, buttons = callText, callText = call, call = urlText, urlText = url, url = buffer, buffer = null);
                if (!options) options = {};
                let templateButtons = [];
                if (url || urlText) {
                    if (!Array.isArray(url)) url = [url];
                    if (!Array.isArray(urlText)) urlText = [urlText];
                    templateButtons.push(...(
                        url.map((v, i) => [v, urlText[i]])
                            .map(([url, urlText], i) => ({
                                index: templateButtons.length + i + 1,
                                urlButton: {
                                    displayText: !nullish(urlText) && urlText || !nullish(url) && url || '',
                                    url: !nullish(url) && url || !nullish(urlText) && urlText || ''
                                }
                            })) || []
                    ));
                }
                if (url2 || urlText2) {
                    if (!Array.isArray(url2)) url2 = [url2];
                    if (!Array.isArray(urlText2)) urlText2 = [urlText2];
                    templateButtons.push(...(
                        url2.map((v, i) => [v, urlText2[i]])
                            .map(([url2, urlText2], i) => ({
                                index: templateButtons.length + i + 1,
                                urlButton: {
                                    displayText: !nullish(urlText2) && urlText2 || !nullish(url2) && url2 || '',
                                    url: !nullish(url2) && url2 || !nullish(urlText2) && urlText2 || ''
                                }
                            })) || []
                    ));
                }
                if (buttons && buttons.length) {
                    if (!Array.isArray(buttons[0])) buttons = [buttons];
                    templateButtons.push(...(
                        buttons.map(([text, id], index) => ({
                            index: templateButtons.length + index + 1,
                            quickReplyButton: {
                                displayText: !nullish(text) && text || !nullish(id) && id || '',
                                id: !nullish(id) && id || !nullish(text) && text || ''
                            }
                        })) || []
                    ));
                }
                let message = {
                    ...options,
                    [buffer ? 'caption' : 'text']: text || '',
                    footer,
                    templateButtons,
                    ...(buffer ?
                        options.asLocation && /image/.test(type.mime) ? {
                            location: {
                                ...options,
                                jpegThumbnail: buffer
                            }
                        } : {
                            [/video/.test(type.mime) ? 'video' : /image/.test(type.mime) ? 'image' : 'document']: buffer
                        } : {})
                };
                return await conn.sendMessage(jid, message, {
                    quoted,
                    upload: conn.waUploadToServer,
                    ...options
                });
            },
            enumerable: true
        },
        cMod: {
            value(jid, message, text = '', sender = conn.user.jid, options = {}) {
                jid = conn.normalizeJid(jid);
                sender = conn.normalizeJid(sender);
                if (options.mentions && !Array.isArray(options.mentions)) options.mentions = [options.mentions];
                let copy = message.toJSON();
                delete copy.message.messageContextInfo;
                delete copy.message.senderKeyDistributionMessage;
                let mtype = Object.keys(copy.message)[0];
                let msg = copy.message;
                let content = msg[mtype];
                if (typeof content === 'string') msg[mtype] = text || content;
                else if (content.caption) content.caption = text || content.caption;
                else if (content.text) content.text = text || content.text;
                if (typeof content !== 'string') {
                    msg[mtype] = { ...content, ...options };
                    msg[mtype].contextInfo = {
                        ...(content.contextInfo || {}),
                        mentionedJid: options.mentions || content.contextInfo?.mentionedJid || []
                    };
                }
                if (copy.participant) sender = copy.participant = sender || copy.participant;
                else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
                if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid;
                else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid;
                copy.key.remoteJid = jid;
                copy.key.fromMe = areJidsSameUser(sender, conn.user.id) || false;
                return proto.WebMessageInfo.fromObject(copy);
            },
            enumerable: true
        },
        copyNForward: {
            async value(jid, message, forwardingScore = true, options = {}) {
                jid = conn.normalizeJid(jid);
                let vtype;
                if (options.readViewOnce && message.message.viewOnceMessage?.message) {
                    vtype = Object.keys(message.message.viewOnceMessage.message)[0];
                    delete message.message.viewOnceMessage.message[vtype].viewOnce;
                    message.message = proto.Message.fromObject(
                        JSON.parse(JSON.stringify(message.message.viewOnceMessage.message))
                    );
                    message.message[vtype].contextInfo = message.message.viewOnceMessage.contextInfo;
                }
                let mtype = Object.keys(message.message)[0];
                let m = generateForwardMessageContent(message, !!forwardingScore);
                let ctype = Object.keys(m)[0];
                if (forwardingScore && typeof forwardingScore === 'number' && forwardingScore > 1) m[ctype].contextInfo.forwardingScore += forwardingScore;
                m[ctype].contextInfo = {
                    ...(message.message[mtype].contextInfo || {}),
                    ...(m[ctype].contextInfo || {})
                };
                m = generateWAMessageFromContent(jid, m, {
                    ...options,
                    userJid: conn.user.jid
                });
                await conn.relayMessage(jid, m.message, { messageId: m.key.id, additionalAttributes: { ...options } });
                return m;
            },
            enumerable: true
        },
        fakeReply: {
            value(jid, text = '', fakeJid = this.user.jid, fakeText = '', fakeGroupJid, options) {
                jid = conn.normalizeJid(jid);
                fakeJid = conn.normalizeJid(fakeJid);
                if (fakeGroupJid) fakeGroupJid = conn.normalizeJid(fakeGroupJid);
                return conn.reply(jid, text, { key: { fromMe: areJidsSameUser(fakeJid, conn.user.id), participant: fakeJid, ...(fakeGroupJid ? { remoteJid: fakeGroupJid } : {}) }, message: { conversation: fakeText }, ...options });
            }
        },
        downloadM: {
            async value(m, type, saveToFile) {
                if (!m || !(m.url || m.directPath)) return Buffer.alloc(0);
                const stream = await downloadContentFromMessage(m, type);
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                if (saveToFile) {
                    let filename;
                    const fileType = await fileTypeFromBuffer(buffer) || { ext: '.bin' };
                    filename = path.join(__dirname, '../tmp/' + new Date * 1 + '.' + fileType.ext);
                    await fs.promises.writeFile(filename, buffer);
                    return filename;
                }
                return buffer;
            },
            enumerable: true
        },
        parseMention: {
            value(text = '') {
                const mentions = [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net');
                return mentions.map(jid => conn.normalizeJid(jid));
            },
            enumerable: true
        },
        getName: {
            value(jid = '', withoutContact = false) {
                jid = conn.normalizeJid(jid);
                withoutContact = conn.withoutContact || withoutContact;
                let v;
                if (jid.endsWith('@g.us')) return new Promise(async (resolve) => {
                    v = conn.chats[jid] || {};
                    if (!(v.name || v.subject)) v = await conn.groupMetadata(jid) || {};
                    resolve(v.name || v.subject || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international'));
                });
                else v = jid === '0@s.whatsapp.net' ? {
                    jid,
                    vname: 'WhatsApp'
                } : areJidsSameUser(jid, conn.user.id) ?
                    conn.user :
                    (conn.chats[jid] || {});
                let userName = global.db.data.users[jid.replace('@s.whatsapp.net', '')]?.name;
                if (!userName) {
                    userName = PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international');
                }
                return (withoutContact ? '' : v.name) || v.subject || v.vname || v.notify || v.verifiedName || userName;
            },
            enumerable: true
        },
        loadMessage: {
            value(messageID) {
                return Object.entries(conn.chats)
                    .filter(([_, { messages }]) => typeof messages === 'object')
                    .find(([_, { messages }]) => Object.entries(messages)
                        .find(([k, v]) => (k === messageID || v.key?.id === messageID)))
                    ?.[1].messages?.[messageID];
            },
            enumerable: true
        },
        processMessageStubType: {
            async value(m) {
                if (!m.messageStubType) return;
                const chat = conn.normalizeJid(m.key.remoteJid || m.message?.senderKeyDistributionMessage?.groupId || '');
                if (!chat || chat === 'status@broadcast') return;
                const emitGroupUpdate = (update) => {
                    conn.ev.emit('groups.update', [{ id: chat, ...update }]);
                };
                switch (m.messageStubType) {
                    case WAMessageStubType.REVOKE:
                    case WAMessageStubType.GROUP_CHANGE_INVITE_LINK:
                        emitGroupUpdate({ revoke: m.messageStubParameters[0] });
                        break;
                    case WAMessageStubType.GROUP_CHANGE_ICON:
                        emitGroupUpdate({ icon: m.messageStubParameters[0] });
                        break;
                    default: {
                        break;
                    }
                }
                const isGroup = chat.endsWith('@g.us');
                if (!isGroup) return;
                let chats = conn.chats[chat];
                if (!chats) chats = conn.chats[chat] = { id: chat };
                chats.isChats = true;
                const metadata = await conn.groupMetadata(chat).catch(_ => null);
                if (!metadata) return;
                chats.subject = metadata.subject;
                chats.metadata = metadata;
            }
        },
        insertAllGroup: {
            async value() {
                const groups = await conn.groupFetchAllParticipating().catch(_ => null) || {};
                for (const group in groups) conn.chats[group] = { ...(conn.chats[group] || {}), id: group, subject: groups[group].subject, isChats: true, metadata: groups[group] };
                return conn.chats;
            },
        },
        pushMessage: {
            async value(m) {
                if (!m) return;
                if (!Array.isArray(m)) m = [m];
                for (const message of m) {
                    try {
                        if (!message) continue;
                        if (message.messageStubType && message.messageStubType != WAMessageStubType.CIPHERTEXT) conn.processMessageStubType(message).catch(console.error);
                        const _mtype = Object.keys(message.message || {});
                        const mtype = (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(_mtype[0]) && _mtype[0]) ||
                            (_mtype.length >= 3 && _mtype[1] !== 'messageContextInfo' && _mtype[1]) ||
                            _mtype[_mtype.length - 1];
                        const chat = conn.normalizeJid(message.key.remoteJid || message.message?.senderKeyDistributionMessage?.groupId || '');
                        if (message.message?.[mtype]?.contextInfo?.quotedMessage) {
                            let context = message.message[mtype].contextInfo;
                            let participant = conn.normalizeJid(context.participant);
                            const remoteJid = conn.normalizeJid(context.remoteJid || participant);
                            let quoted = message.message[mtype].contextInfo.quotedMessage;
                            if ((remoteJid && remoteJid !== 'status@broadcast') && quoted) {
                                let qMtype = Object.keys(quoted)[0];
                                if (qMtype == 'conversation') {
                                    quoted.extendedTextMessage = { text: quoted[qMtype] };
                                    delete quoted.conversation;
                                    qMtype = 'extendedTextMessage';
                                }
                                if (!quoted[qMtype].contextInfo) quoted[qMtype].contextInfo = {};
                                quoted[qMtype].contextInfo.mentionedJid = context.mentionedJid || quoted[qMtype].contextInfo.mentionedJid || [];
                                const isGroup = remoteJid.endsWith('g.us');
                                if (isGroup && !participant) participant = remoteJid;
                                const qM = {
                                    key: {
                                        remoteJid,
                                        fromMe: areJidsSameUser(conn.user.jid, remoteJid),
                                        id: context.stanzaId,
                                        participant,
                                    },
                                    message: JSON.parse(JSON.stringify(quoted)),
                                    ...(isGroup ? { participant } : {})
                                };
                                let qChats = conn.chats[participant];
                                if (!qChats) qChats = conn.chats[participant] = { id: participant, isChats: !isGroup };
                                if (!qChats.messages) qChats.messages = {};
                                if (!qChats.messages[context.stanzaId] && !qM.key.fromMe) qChats.messages[context.stanzaId] = qM;
                                let qChatsMessages;
                                if ((qChatsMessages = Object.entries(qChats.messages)).length > 40) qChats.messages = Object.fromEntries(qChatsMessages.slice(30, qChatsMessages.length));
                            }
                        }
                        if (!chat || chat === 'status@broadcast') continue;
                        const isGroup = chat.endsWith('@g.us');
                        let chats = conn.chats[chat];
                        if (!chats) {
                            if (isGroup) await conn.insertAllGroup().catch(console.error);
                            chats = conn.chats[chat] = { id: chat, isChats: true, ...(conn.chats[chat] || {}) };
                        }
                        let metadata, sender;
                        if (isGroup) {
                            if (!chats.subject || !chats.metadata) {
                                metadata = await conn.groupMetadata(chat).catch(_ => ({})) || {};
                                if (!chats.subject) chats.subject = metadata.subject || '';
                                if (!chats.metadata) chats.metadata = metadata;
                            }
                            sender = conn.normalizeJid(message.key?.fromMe && conn.user.id || message.participant || message.key?.participant || chat || '');
                            if (sender !== chat) {
                                let chats = conn.chats[sender];
                                if (!chats) chats = conn.chats[sender] = { id: sender };
                                if (!chats.name) chats.name = message.pushName || chats.name || '';
                            }
                        } else if (!chats.name) chats.name = message.pushName || chats.name || '';
                        if (['senderKeyDistributionMessage', 'messageContextInfo'].includes(mtype)) continue;
                        chats.isChats = true;
                        if (!chats.messages) chats.messages = {};
                        const fromMe = message.key.fromMe || areJidsSameUser(sender || chat, conn.user.id);
                        if (!['protocolMessage'].includes(mtype) && !fromMe && message.messageStubType != WAMessageStubType.CIPHERTEXT && message.message) {
                            delete message.message.messageContextInfo;
                            delete message.message.senderKeyDistributionMessage;
                            chats.messages[message.key.id] = JSON.parse(JSON.stringify(message, null, 2));
                            let chatsMessages;
                            if ((chatsMessages = Object.entries(chats.messages)).length > 40) chats.messages = Object.fromEntries(chatsMessages.slice(30, chatsMessages.length));
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        },
        serializeM: {
            value(m) {
                return smsg(conn, m);
            }
        },
        ...(typeof conn.chatRead !== 'function' ? {
            chatRead: {
                value(jid, participant = conn.user.jid, messageID) {
                    jid = conn.normalizeJid(jid);
                    participant = conn.normalizeJid(participant);
                    return conn.sendReadReceipt(jid, participant, [messageID]);
                },
                enumerable: true
            }
        } : {}),
        ...(typeof conn.setStatus !== 'function' ? {
            setStatus: {
                value(status) {
                    return conn.query({
                        tag: 'iq',
                        attrs: {
                            to: 's.whatsapp.net',
                            type: 'set',
                            xmlns: 'status',
                        },
                        content: [
                            {
                                tag: 'status',
                                attrs: {},
                                content: Buffer.from(status, 'utf-8')
                            }
                        ]
                    });
                },
                enumerable: true
            }
        } : {})
    });
    if (sock.user?.id) sock.user.jid = sock.normalizeJid(sock.user.id);
    store.bind(sock);
    return sock;
}

export function smsg(conn, m, hasParent) {
    if (!m) return m;
    let M = proto.WebMessageInfo;
    m = M.fromObject(m);
    m.conn = conn;
    let protocolMessageKey;
    if (m.message) {
        if (m.mtype == 'protocolMessage' && m.msg.key) {
            protocolMessageKey = m.msg.key;
            if (protocolMessageKey == 'status@broadcast') protocolMessageKey.remoteJid = m.chat;
            if (!protocolMessageKey.participant || protocolMessageKey.participant == 'status_me') protocolMessageKey.participant = m.sender;
            protocolMessageKey.fromMe = conn.decodeJid(protocolMessageKey.participant) === conn.decodeJid(conn.user.id);
            if (!protocolMessageKey.fromMe && protocolMessageKey.remoteJid === conn.decodeJid(conn.user.id)) protocolMessageKey.remoteJid = m.sender;
        }
        if (m.quoted) if (!m.quoted.mediaMessage) delete m.quoted.download;
    }
    if (!m.mediaMessage) delete m.download;

    try {
        if (protocolMessageKey && m.mtype == 'protocolMessage') conn.ev.emit('message.delete', protocolMessageKey);
    } catch (e) {
        console.error(e);
    }
    return m;
}

export function serialize() {
    const MediaType = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'];
    return Object.defineProperties(proto.WebMessageInfo.prototype, {
        conn: {
            value: undefined,
            enumerable: false,
            writable: true
        },
        id: {
            get() {
                return this.key?.id;
            }
        },
        isBaileys: {
            get() {
                return (this?.fromMe || areJidsSameUser(this.conn?.user.id, this.sender)) && this.id.startsWith('3EB0') && (this.id.length === 20 || this.id.length === 22 || this.id.length === 12) || false;
            },
        },
        chat: {
            get() {
                const senderKeyDistributionMessage = this.message?.senderKeyDistributionMessage?.groupId;
                return (
                    this.key?.remoteJid ||
                    (senderKeyDistributionMessage &&
                        senderKeyDistributionMessage !== 'status@broadcast'
                    ) || ''
                ).decodeJid();
            }
        },
        isGroup: {
            get() {
                return this.chat.endsWith('@g.us');
            },
            enumerable: true
        },
        sender: {
            get() {
                return this.conn?.normalizeJid(this.key?.fromMe && this.conn?.user.id || this.participant || this.key.participant || this.chat || '');
            },
            enumerable: true
        },
        fromMe: {
            get() {
                return this.key?.fromMe || areJidsSameUser(this.conn?.user.id, this.sender) || false;
            }
        },
        mtype: {
            get() {
                if (!this.message) return '';
                const type = Object.keys(this.message);
                return (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(type[0]) && type[0]) ||
                    (type.length >= 3 && type[1] !== 'messageContextInfo' && type[1]) ||
                    type[type.length - 1];
            },
            enumerable: true
        },
        msg: {
            get() {
                if (!this.message) return null;
                return this.message[this.mtype];
            }
        },
        mediaMessage: {
            get() {
                if (!this.message) return null;
                const Message = ((this.msg?.url || this.msg?.directPath) ? { ...this.message } : extractMessageContent(this.message)) || null;
                if (!Message) return null;
                const mtype = Object.keys(Message)[0];
                return MediaType.includes(mtype) ? Message : null;
            },
            enumerable: true
        },
        mediaType: {
            get() {
                let message;
                if (!(message = this.mediaMessage)) return null;
                return Object.keys(message)[0];
            },
            enumerable: true,
        },
        quoted: {
            get() {
                const self = this;
                const msg = self.msg;
                const contextInfo = msg?.contextInfo;
                const quoted = contextInfo?.quotedMessage;
                if (!msg || !contextInfo || !quoted) return null;
                const type = Object.keys(quoted)[0];
                let q = quoted[type];
                const text = typeof q === 'string' ? q : q.text;
                return Object.defineProperties(JSON.parse(JSON.stringify(typeof q === 'string' ? { text: q } : q)), {
                    mtype: {
                        get() {
                            return type;
                        },
                        enumerable: true
                    },
                    mediaMessage: {
                        get() {
                            const Message = ((q.url || q.directPath) ? { ...quoted } : extractMessageContent(quoted)) || null;
                            if (!Message) return null;
                            const mtype = Object.keys(Message)[0];
                            return MediaType.includes(mtype) ? Message : null;
                        },
                        enumerable: true
                    },
                    mediaType: {
                        get() {
                            let message;
                            if (!(message = this.mediaMessage)) return null;
                            return Object.keys(message)[0];
                        },
                        enumerable: true,
                    },
                    id: {
                        get() {
                            return contextInfo.stanzaId;
                        },
                        enumerable: true
                    },
                    chat: {
                        get() {
                            return self.conn.normalizeJid(contextInfo.remoteJid || self.chat);
                        },
                        enumerable: true
                    },
                    isBaileys: {
                        get() {
                            return (this?.fromMe || areJidsSameUser(this.conn?.user.id, this.sender)) && this.id.startsWith('3EB0') && (this.id.length === 20 || this.id.length === 22 || this.id.length === 12) || false;
                        },
                        enumerable: true
                    },
                    sender: {
                        get() {
                            return self.conn.normalizeJid(contextInfo.participant || this.chat || '');
                        },
                        enumerable: true
                    },
                    fromMe: {
                        get() {
                            return areJidsSameUser(this.sender, self.conn?.user.jid);
                        },
                        enumerable: true,
                    },
                    text: {
                        get() {
                            return text || this.caption || this.contentText || this.selectedDisplayText || '';
                        },
                        enumerable: true
                    },
                    mentionedJid: {
                        get() {
                            const mentions = q.contextInfo?.mentionedJid || self.getQuotedObj()?.mentionedJid || [];
                            return mentions.map(jid => self.conn.normalizeJid(jid));
                        },
                        enumerable: true
                    },
                    name: {
                        get() {
                            const sender = this.sender;
                            return sender ? self.conn?.getName(sender) : null;
                        },
                        enumerable: true

                    },
                    vM: {
                        get() {
                            return proto.WebMessageInfo.fromObject({
                                key: {
                                    fromMe: this.fromMe,
                                    remoteJid: this.chat,
                                    id: this.id
                                },
                                message: quoted,
                                ...(self.isGroup ? { participant: this.sender } : {})
                            });
                        }
                    },
                    fakeObj: {
                        get() {
                            return this.vM;
                        }
                    },
                    download: {
                        value(saveToFile = false) {
                            const mtype = this.mediaType;
                            return self.conn?.downloadM(this.mediaMessage[mtype], mtype.replace(/message/i, ''), saveToFile);
                        },
                        enumerable: true,
                        configurable: true,
                    },
                    reply: {
                        value(text, chatId, options) {
                            return self.conn?.reply(chatId ? chatId : this.chat, text, this.vM, options);
                        },
                        enumerable: true,
                    },
                    copy: {
                        value() {
                            const M = proto.WebMessageInfo;
                            return smsg(conn, M.fromObject(M.toObject(this.vM)));
                        },
                        enumerable: true,
                    },
                    forward: {
                        value(jid, force = false, options) {
                            return self.conn?.sendMessage(jid, {
                                forward: this.vM, force, ...options
                            }, { ...options });
                        },
                        enumerable: true,
                    },
                    copyNForward: {
                        value(jid, forceForward = false, options) {
                            return self.conn?.copyNForward(jid, this.vM, forceForward, options);
                        },
                        enumerable: true,

                    },
                    cMod: {
                        value(jid, text = '', sender = this.sender, options = {}) {
                            return self.conn?.cMod(jid, this.vM, text, sender, options);
                        },
                        enumerable: true,

                    },
                    delete: {
                        value() {
                            return self.conn?.sendMessage(this.chat, { delete: this.vM.key });
                        },
                        enumerable: true,

                    },
                    react: {
                        value(text) {
                            return self.conn?.sendMessage(this.chat, {
                                react: {
                                    text,
                                    key: this.vM.key
                                }
                            });
                        },
                        enumerable: true,
                    }
                });
            },
            enumerable: true
        },
        _text: {
            value: null,
            writable: true,
        },
        text: {
            get() {
                const msg = this.msg;
                
                // Manejo de botones interactivos
                if (this.mtype === 'interactiveResponseMessage') {
                    try {
                        const response = msg?.nativeFlowResponseMessage;
                        if (response && response.paramsJson) {
                            const params = JSON.parse(response.paramsJson);
                            if (params.id) {
                                return params.id;
                            }
                        }
                    } catch (e) {
                        console.log('[Button Handler] Error procesando botón interactivo:', e.message);
                    }
                }
                
                const text = (typeof msg === 'string' ? msg : msg?.text) || msg?.caption || msg?.contentText || '';
                return typeof this._text === 'string' ? this._text : '' || (typeof text === 'string' ? text : (
                    text?.selectedDisplayText ||
                    text?.hydratedTemplate?.hydratedContentText ||
                    text
                )) || '';
            },
            set(str) {
                return this._text = str;
            },
            enumerable: true
        },
        mentionedJid: {
            get() {
                const mentions = this.msg?.contextInfo?.mentionedJid?.length && this.msg.contextInfo.mentionedJid || [];
                return mentions.map(jid => this.conn.normalizeJid(jid));
            },
            enumerable: true
        },
        name: {
            get() {
                return !nullish(this.pushName) && this.pushName || this.conn?.getName(this.sender);
            },
            enumerable: true
        },
        download: {
            value(saveToFile = false) {
                const mtype = this.mediaType;
                return this.conn?.downloadM(this.mediaMessage[mtype], mtype.replace(/message/i, ''), saveToFile);
            },
            enumerable: true,
            configurable: true
        },
        reply: {
            value(text, chatId, options) {
                return this.conn?.reply(chatId ? chatId : this.chat, text, this, options);
            }
        },
        copy: {
            value() {
                const M = proto.WebMessageInfo;
                return smsg(this.conn, M.fromObject(M.toObject(this)));
            },
            enumerable: true
        },
        forward: {
            value(jid, force = false, options = {}) {
                return this.conn?.sendMessage(jid, {
                    forward: this, force, ...options
                }, { ...options });
            },
            enumerable: true
        },
        copyNForward: {
            value(jid, forceForward = false, options = {}) {
                return this.conn?.copyNForward(jid, this, forceForward, options);
            },
            enumerable: true
        },
        cMod: {
            value(jid, text = '', sender = this.sender, options = {}) {
                return this.conn?.cMod(jid, this, text, sender, options);
            },
            enumerable: true
        },
        getQuotedObj: {
            value() {
                if (!this.quoted.id) return null;
                const q = proto.WebMessageInfo.fromObject(this.conn?.loadMessage(this.quoted.id) || this.quoted.vM);
                return smsg(this.conn, q);
            },
            enumerable: true
        },
        getQuotedMessage: {
            get() {
                return this.getQuotedObj;
            }
        },
        delete: {
            value() {
                return this.conn?.sendMessage(this.chat, { delete: this.key });
            },
            enumerable: true
        },
        react: {
            value(text) {
                return this.conn?.sendMessage(this.chat, {
                    react: {
                        text,
                        key: this.key
                    }
                });
            },
            enumerable: true
        }
    });
}

export function logic(check, inp, out) {
    if (inp.length !== out.length) throw new Error('Input and Output must have same length');
    for (let i in inp) if (util.isDeepStrictEqual(check, inp[i])) return out[i];
    return null;
}

export function protoType() {
    Buffer.prototype.toArrayBuffer = function toArrayBufferV2() {
        const ab = new ArrayBuffer(this.length);
        const view = new Uint8Array(ab);
        for (let i = 0; i < this.length; ++i) {
            view[i] = this[i];
        }
        return ab;
    };
    Buffer.prototype.toArrayBufferV2 = function toArrayBuffer() {
        return this.buffer.slice(this.byteOffset, this.byteOffset + this.byteLength);
    };
    ArrayBuffer.prototype.toBuffer = function toBuffer() {
        return Buffer.from(new Uint8Array(this));
    };
    Uint8Array.prototype.getFileType = ArrayBuffer.prototype.getFileType = Buffer.prototype.getFileType = async function getFileType() {
        return await fileTypeFromBuffer(this);
    };
    String.prototype.isNumber = Number.prototype.isNumber = isNumber;
    String.prototype.capitalize = function capitalize() {
        return this.charAt(0).toUpperCase() + this.slice(1, this.length);
    };
    String.prototype.capitalizeV2 = function capitalizeV2() {
        const str = this.split(' ');
        return str.map(v => v.capitalize()).join(' ');
    };
    String.prototype.decodeJid = function decodeJid() {
        if (/:\d+@/gi.test(this)) {
            const decode = jidDecode(this) || {};
            return (decode.user && decode.server && decode.user + '@' + decode.server || this).trim();
        } else return this.trim();
    };
    Number.prototype.toTimeString = function toTimeString() {
        const seconds = Math.floor((this / 1000) % 60);
        const minutes = Math.floor((this / (60 * 1000)) % 60);
        const hours = Math.floor((this / (60 * 60 * 1000)) % 24);
        const days = Math.floor((this / (24 * 60 * 60 * 1000)));
        return (
            (days ? `${days} day(s) ` : '') +
            (hours ? `${hours} hour(s) ` : '') +
            (minutes ? `${minutes} minute(s) ` : '') +
            (seconds ? `${seconds} second(s)` : '')
        ).trim();
    };
    Number.prototype.getRandom = String.prototype.getRandom = Array.prototype.getRandom = getRandom;
}

/**
 * Función optimizada para procesar y normalizar usuarios desde múltiples formatos
 * Soporta: @usuario (mención), responder mensaje, números directos, combinaciones
 * @param {object} m - Objeto del mensaje
 * @param {string} text - Texto del comando
 * @param {array} participants - Lista de participantes del grupo
 * @param {object} conn - Instancia de conexión
 * @returns {array} Lista de JIDs válidos y únicos
 */
export async function parseUserTargets(m, text = '', participants = [], conn, options = {}) {
    let targets = []
  
  // Funciones auxiliares de normalización
  const toNum = v => (v + '').replace(/[^0-9]/g, '')
  const localPart = v => (v + '').split('@')[0].split(':')[0].split('/')[0].split(',')[0]
  const normalizeCore = v => toNum(localPart(v))
  const prettyNum = v => { const n = normalizeCore(v); if (!n) return ''; return `+${n}` }
  
  const normalizeJid = v => {
    if (!v) return ''
    if (typeof v === 'number') v = String(v)
    v = (v + '').trim()
    if (v.startsWith('@')) v = v.slice(1)
    if (v.endsWith('@g.us')) return v
    if (v.includes('@s.whatsapp.net')) {
        const n = toNum(v.split('@')[0])
        return n ? n + '@s.whatsapp.net' : v
    }
    const n = toNum(v)
    return n ? n + '@s.whatsapp.net' : v
  }
  
  // 1. PROCESAR MENCIONES (@usuario)
  if (m._mentionedJidResolved && m._mentionedJidResolved.length > 0) {
    targets.push(...m._mentionedJidResolved)
  } else if (m.mentionedJid && m.mentionedJid.length > 0) {
    targets.push(...m.mentionedJid)
  }
  
  // 2. PROCESAR MENSAJE CITADO/RESPONDIDO
  if (m.quoted && m.quoted.sender) {
    targets.push(m.quoted.sender)
  }
  
  // 3. PROCESAR NÚMEROS DIRECTOS EN EL TEXTO
  if (text && text.trim()) {
    // Dividir por espacios, comas, saltos de línea
    const chunks = text.split(/[\s,\n\r]+/).filter(Boolean)
    
    for (let chunk of chunks) {
      // Limpiar el chunk de caracteres especiales excepto números y +
      let cleanChunk = chunk.replace(/[^\d+]/g, '')
      
      // Detectar números telefónicos (5+ dígitos)
      if (/^\+?\d{5,}$/.test(cleanChunk)) {
        // Remover el + inicial si existe
        let number = cleanChunk.replace(/^\+/, '')
        
        // Validar que sea un número válido
        if (number.length >= 5 && number.length <= 15) {
          let jid = number + '@s.whatsapp.net'
          targets.push(jid)
        }
      }
      
      // También buscar números con formato internacional embebidos
      const internationalMatch = chunk.match(/(\+?\d{1,4}[\s\-]?\d{8,12})/g)
      if (internationalMatch) {
        for (let match of internationalMatch) {
          let number = match.replace(/[^\d]/g, '')
          if (number.length >= 8 && number.length <= 15) {
            let jid = number + '@s.whatsapp.net'
            targets.push(jid)
          }
        }
      }
    }
  }
  
  // 4. NORMALIZACIÓN Y DEDUPLICACIÓN
  // Normalizar todos los JIDs
  targets = targets.map(target => {
    if (!target) return null
    
    // Si ya es un JID válido, normalizarlo
    if (target.includes('@')) {
      return normalizeJid(target)
    }
    
    // Si es solo un número, convertir a JID
    let number = target.toString().replace(/[^\d]/g, '')
    if (number.length >= 5) {
      return number + '@s.whatsapp.net'
    }
    
    return null
  }).filter(Boolean)
  
    // 5. CANONICALIZACIÓN A PARTICIPANTES Y ELIMINAR NO-MIEMBROS
    const participantMap = new Map()
    const participantSet = new Set()
    if (Array.isArray(participants) && participants.length > 0) {
        for (const p of participants) {
            const candidates = [p.id, p.jid, p.wid].filter(Boolean)
            for (const c of candidates) {
                const nj = normalizeJid(c)
                if (!nj) continue
                const key = nj.replace(/@.*$/, '')
                if (!participantMap.has(key)) participantMap.set(key, nj)
                participantSet.add(nj)
            }
        }
        // Mantener solo objetivos que estén en el grupo y mapear al JID canónico del participante
        targets = targets
            .map(t => normalizeJid(t))
            .map(nj => nj ? nj.replace(/@.*$/, '') : '')
            .filter(n => n && participantMap.has(n))
            .map(n => participantMap.get(n))
    } else {
        // Sin participantes, solo deduplicar normalizados
        targets = [...new Set(targets.map(t => normalizeJid(t)))].filter(Boolean)
    }

    // 6. VALIDACIÓN OPCIONAL CON WhatsApp (solo normaliza, no agrega externos)
    // Desactivado por defecto para evitar timeouts; activar con options.waCheck === true
    if (options?.waCheck && conn && typeof conn.onWhatsApp === 'function' && targets.length) {
        const normalized = []
        for (const t of targets) {
            let out = t
            try {
                const waCheck = await conn.onWhatsApp(t)
                const waJid = waCheck?.[0]?.jid
                if (waJid) {
                    // Asegurar que siga siendo el mismo miembro del grupo (por número)
                    const numKey = normalizeJid(waJid).replace(/@.*$/, '')
                    if (!participantMap.size || participantMap.has(numKey)) out = normalizeJid(waJid)
                }
            } catch {}
            normalized.push(out)
        }
        targets = [...new Set(normalized.filter(Boolean))]
    }

    // 7. DEDUPLICACIÓN FINAL
    targets = [...new Set(targets.map(t => normalizeJid(t)))].filter(Boolean)
  
  return targets
}
/** * Función optimizada para obtener información detallada de un usuario
 * Soporta múltiples formatos de entrada y deriva roles de admin de manera flexible
 * @param {string} jid - JID del usuario
 * @param {array} participants - Lista de participantes
 * @param {object} conn - Instancia de conexión
 * @returns {object} Información del usuario
 */
export async function getUserInfo(jid, participants = [], conn) {
    // Funciones auxiliares de normalización
    const toNum = v => (v + '').replace(/[^0-9]/g, '')
    const localPart = v => (v + '').split('@')[0].split(':')[0].split('/')[0].split(',')[0]
    const normalizeCore = v => toNum(localPart(v))
    const prettyNum = v => { const n = normalizeCore(v); if (!n) return ''; return `+${n}` }
    const normalizeJid = v => {
        if (!v) return ''
        if (typeof v === 'number') v = String(v)
        v = (v + '').trim()
        if (v.startsWith('@')) v = v.slice(1)
        if (v.endsWith('@g.us')) return v
        if (v.includes('@s.whatsapp.net')) {
            const n = toNum(v.split('@')[0])
            return n ? n + '@s.whatsapp.net' : v
        }
        const n = toNum(v)
        return n ? n + '@s.whatsapp.net' : v
    }

    const normalizedJid = normalizeJid(jid)
    const numKey = normalizeCore(normalizedJid)
    // Construir mapa de participantes por número para coincidencia robusta
    const partByNum = new Map()
    for (const p of (participants || [])) {
        const candidates = [p.id, p.jid, p.wid].filter(Boolean)
        for (const c of candidates) {
            const pj = normalizeJid(c)
            if (!pj) continue
            const nk = normalizeCore(pj)
            if (!nk) continue
            if (!partByNum.has(nk)) partByNum.set(nk, p)
        }
    }
    const participant = numKey ? partByNum.get(numKey) : undefined

    let name = ''
    try {
        if (conn && typeof conn.getName === 'function') name = await conn.getName(normalizedJid)
    } catch {}

    // Derivar flags de admin de manera flexible
    const adminFlag = typeof participant?.admin !== 'undefined' ? participant.admin : (participant?.isAdmin ? 'admin' : null)
    const isSuperAdmin = adminFlag === 'superadmin'
    const isAdmin = isSuperAdmin || adminFlag === 'admin'

    return {
        jid: normalizedJid,
        number: numKey,
        name: name || prettyNum(normalizedJid),
        isAdmin,
        isSuperAdmin,
        adminRole: adminFlag || null,
        exists: !!participant
    }
}

function isNumber() {
    const int = parseInt(this);
    return typeof int === 'number' && !isNaN(int);
}

function getRandom() {
    if (Array.isArray(this) || this instanceof String) return this[Math.floor(Math.random() * this.length)];
    return Math.floor(Math.random() * this);
}

function nullish(args) {
    return !(args !== null && args !== undefined);
}