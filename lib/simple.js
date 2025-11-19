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
import * as Jimp from 'jimp';
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

export function makeWASocket(connectionOptions, options = {}) {
    let conn = _makeWaSocket(connectionOptions);

    let sock = Object.defineProperties(conn, {
        chats: {
            value: { ...(options.chats || {}) },
            writable: true
        },
        decodeJid: {
            value(jid) {
                if (!jid || typeof jid !== 'string') return (!nullish(jid) && jid) || null;
               
                if (/:\d+@/gi.test(jid)) {
                    const decode = jidDecode(jid) || {};
                    return (decode.user && decode.server && decode.user + '@' + decode.server || jid).trim();
                } else return jid.trim();
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
                                    phoneNumber: !nullish(call) && call || !nullish(callText