/*
  *  Script by Luthfi Joestars
  *  Github : kenshinaru
  *  Telegram : t.me/kenshin
  *  WhatsApp : wa.me/6281310994964
  *  Instagram : @urheadfather_
*/


import pino from "pino";
import path from "path";
import fs from "node:fs";
import chalk from "chalk"
import { fileURLToPath } from "url";
import { WAConnection } from "./utils/client.js";
import baileys, { Browsers, DisconnectReason } from "baileys";
import setting from './setting.js'
import NodeCache from "node-cache"
import { schema } from './utils/schema.js'
import { Boom } from "@hapi/boom"
import treeKill from './utils/treekill.js';
import { exec } from 'child_process';
import { join } from 'path';


const groupCache = new NodeCache({stdTTL: 5 * 60, useClones: false})
const machine = new schema();
const msgRetryCounterCache = new NodeCache();
const logger = pino({ level: "silent" }).child({ level: "silent" })
const pkg = JSON.parse(fs.readFileSync(join(process.cwd(), 'package.json')));
const store = baileys.makeInMemoryStore({
  logger
});

global.__filename = fileURLToPath(import.meta.url);
global.__dirname = path.dirname(__filename);

const Starting = async() => {
     global.db = {
		users: {},
		groups: {},
		setting: {},
		statistic: {},
		...((await machine.fetch()) || {}), 
      }
    const { state, saveCreds } = await baileys.useMultiFileAuthState("session")
	let sock = WAConnection({
		printQRInTerminal: setting.pairing.state ? false : true,
		logger,
		auth: {
			creds: state.creds,
			keys: baileys.makeCacheableSignalKeyStore(state.keys, logger)
		},
     getMessage: async (key) => {
      if (store) {
      let msg = await store.loadMessage(key.remoteJid, key.id);

      return msg?.message || "Hi bro";
      }
       return baileys.proto.Message.fromObject({})
    },
      generateHighQualityLinkPreview: true,
      version: [2, 3000, 1019430034],
      browser: Browsers.macOS('Safari'),
      cachedGroupMetadata: async (jid) => groupCache.get(jid),
      msgRetryCounterCache,
      syncFullHistory: true,
      retryRequestDelayMs: 10,
      transactionOpts: {
      maxCommitRetries: 10,
      delayBetweenTriesMs: 10
      },
      maxMsgRetryCount: 15,
      appStateMacVerification: {
      patch: true,
      snapshot: true
        },
      })
    
   if (setting.pairing.state && !sock.authState.creds.registered) {
   var phoneNumber = setting.pairing.number
   setTimeout(async () => {
      try {
         let code = await sock.requestPairingCode(phoneNumber)
         code = code.match(/.{1,4}/g)?.join("-") || code
         console.log(chalk.black(chalk.bgGreen(` Your Pairing Code `)), ' : ' + chalk.black(chalk.white(code)))
      } catch {}
   }, 3000)
  }
    
   sock.ev.on("creds.update", saveCreds);

   sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
  if (connection === "close") {
    const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
    if (reason === DisconnectReason.badSession) {
      console.log(chalk.red.bold("File sesi buruk, Harap hapus sesi dan scan ulang"));
      sock.logout();
      fs.rmSync("./session", { recursive: true, force: true });
      exec("process.exit(1)", (err) => err && treeKill(process.pid));
    } else if (reason === DisconnectReason.connectionClosed) {
      console.log(chalk.yellow.bold("Koneksi ditutup, mencoba untuk terhubung kembali..."));
    } else if (reason === DisconnectReason.connectionLost) {
      console.log(chalk.yellow.bold("Koneksi hilang, mencoba untuk terhubung kembali..."));
    } else if (reason === DisconnectReason.connectionReplaced) {
      console.log(chalk.green.bold("Koneksi diganti, sesi lain telah dibuka. Harap tutup sesi yang sedang berjalan."));
      sock.logout();
    } else if (reason === DisconnectReason.loggedOut) {
      console.log(chalk.green.bold("Perangkat logout, harap scan ulang."));
      sock.logout();
      fs.rmSync("./session", { recursive: true, force: true });
      exec("process.exit(1)", (err) => err && treeKill(process.pid));
    } else if (reason === DisconnectReason.restartRequired) {
      console.log(chalk.green.bold("Restart diperlukan, sedang memulai ulang..."));
      Starting();
    } else if (reason === DisconnectReason.timedOut) {
      console.log(chalk.green.bold("Koneksi waktu habis, sedang mencoba untuk terhubung kembali..."));
      Starting();
    }
  } else if (connection === "connecting") {
    console.log("Menghubungkan ke WhatsApp...");
  } else if (connection === "open") {
    console.log(chalk.cyan.bold("━━･❪ Koneksi berhasil! ❫ ･━━"));
    console.log(chalk.white.bold(" ✦ Server Status  : ") + chalk.green.bold("Online"));
    console.log(chalk.white.bold(" ✦ Waktu Koneksi  : ") + chalk.cyan.bold(new Date().toLocaleString()));
    console.log(chalk.white.bold(" ✦ Versi Node.js  : ") + chalk.magenta.bold(process.version));
  }
})

    
    sock.ev.on('contacts.update', update => {
		for (let contact of update) {
			let id = baileys.jidNormalizedUser(contact.id);
			if (store && store.contacts) store.contacts[id] = { ...(store.contacts?.[id] || {}), ...(contact || {}) };
		}
	});

    sock.ev.on('contacts.upsert', update => {
		for (let contact of update) {
			let id = baileys.jidNormalizedUser(contact.id);
			if (store && store.contacts) store.contacts[id] = { ...(contact || {}), isContact: true };
		}
	})
	
    sock.ev.on('groups.update', async (updates) => {
  for (const update of updates) {
    const metadata = await sock.groupMetadata(update.id);
    groupCache.set(update.id, metadata);
    if (store.groupMetadata[update.id]) {
      store.groupMetadata[update.id] = {
        ...(store.groupMetadata[update.id] || {}),
        ...(update || {}),
      };
    }
  }
});

    sock.ev.on('group-participants.update', async ({ id, participants, action, author }) => {
    try {
      let metadata = groupCache.get(id) || await sock.groupMetadata(id);
      groupCache.set(id, metadata);

      if (store.groupMetadata[id]) {
        switch (action) {
          case 'add':
          case 'revoked_membership_requests':
            metadata.participants.push(
              ...participants.map((id) => ({
                id: baileys.jidNormalizedUser(id),
                admin: null,
              }))
            )
            if (global.db.setting.welcome) {
            for (const jid of participants) {
              let profile;
              try {
                profile = await sock.profilePictureUrl(jid, "image");
              } catch {
                profile = "https://telegra.ph/file/ed3144572e1b6a0dc2b64.png";
              }

              await sock.sendMessage(id, {
                text: `────── 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 ──────
✦ User: @${jid.split("@")[0]}
✦ Group: ${metadata.subject}
✦ Description: ${metadata?.desc || "No Description"}
✦ Invited by: @${author.split`@`[0]}
────────────────────`.trim(),
                contextInfo: {
                  mentionedJid: [jid, author],
                  externalAdReply: {
                    title: pkg.name,
                    mediaType: 1,
                    previewType: 5,
                    renderLargerThumbnail: true,
                    thumbnailUrl: profile,
                    sourceUrl: setting.link
                  }
                }
              });
              }
            }
          break;

          case 'demote':
          case 'promote':
            for (const participant of metadata.participants) {
              let id = baileys.jidNormalizedUser(participant.id);
              if (participants.includes(id)) {
                participant.admin = action === 'promote' ? 'admin' : null;
              }
            }
            break;

          case 'remove':
            metadata.participants = metadata.participants.filter(
              (p) => !participants.includes(baileys.jidNormalizedUser(p.id))
            );
            break;
        }
      }
    } catch (e) {
      console.log(e)
    }
  })

    sock.ev.on("messages.upsert", async ({ type, messages }) => {
    if (type !== "notify") return;
    let plugins = {};
    let stack = [path.join(__dirname, "cmd")];
    while (stack.length) {
        let dir = stack.pop();
        for (let file of fs.readdirSync(dir)) {
            let fullPath = path.join(dir, file);
            fs.statSync(fullPath).isDirectory() ? stack.push(fullPath) : fullPath.endsWith(".js") && (plugins[fullPath] = (await import(fullPath + "?t=" + Date.now())).default);
        }
    }

    fs.watch(path.join(__dirname, "cmd"), { recursive: true }, async (event, filename) => {
        if (filename) console.info(chalk.green(`[Info] File changed: ${filename}`));
        plugins = {};
        let stack = [path.join(__dirname, "cmd")];
        while (stack.length) {
            let dir = stack.pop();
            for (let file of fs.readdirSync(dir)) {
                let fullPath = path.join(dir, file);
                fs.statSync(fullPath).isDirectory() ? stack.push(fullPath) : fullPath.endsWith(".js") && (plugins[fullPath] = (await import(fullPath + "?t=" + Date.now())).default);
            }
        }
    });
    
    if (store.groupMetadata && !Object.keys(store.groupMetadata).length) store.groupMetadata = await sock.groupFetchAllParticipating();
    
    for (let m of messages) {
        if (!m.message) continue;
        m.message = m.message?.ephemeralMessage?.message || m.message;
        await (await import(`./events/msg.upsert.js?update=${Date.now()}`)).default(sock, m, plugins, store)
    }
});
    
   sock.ev.on("call", async (calls) => {;
  for (const call of calls) {
    if (call.status === "offer") {
      await sock.sendMessage(call.from, {
        text: "Maaf akun ini sedang tidak bisa menjawab panggilan anda.",
        mentions: [call.from],
      });
      await sock.rejectCall(call.id, call.from);
    }
  }
})
   
   
  setInterval(async () => {
    if (global.db) await machine.save(global.db)
    }, 10 * 1000)
    
  return sock
}

Starting()
