import { msg } from "../utils/serialize.js";
import Logs from "../utils/logger.js";
import set from '../setting.js'
import func from '../utils/functions.js'
import scrap from '../utils/scraper.js'
import cron from 'node-cron';

export default async (sock, m, plugins, store) => {
        m = await msg(sock, m, store);
    try {
       await (await import(`../utils/schema.js?update=${Date.now()}`)).default(sock, m, set)
        const isCmd = set.prefixes.some((prefix) => m.body.startsWith(prefix));
        const prefix = set.prefixes.find((prefix) => m.body.startsWith(prefix)) ? set.prefixes.find((prefix) => m.body.startsWith(prefix)) : "";
        const command = m.body
        .slice(prefix ? prefix.length : 0) 
        .toLowerCase()
        .trim()
        .split(/ +/)[0]
        .trim()
       const args = m.body.trim().split(/ +/).slice(1);
       const text = args.join(" ")
       const users = global.db.users[m.sender]
       const setting = global.db.setting

       cron.schedule('00 00 * * *', () => {
           setting.lastReset = Date.now();
           for (let user in global.db.users) {
              if (global.db.users[user].limit < set.limit && !global.db.users[user].premium) {
         global.db.users[user].limit = set.limit;
                       }
                  }
           }, {
                  scheduled: true,
                  timezone: 'Asia/Jakarta'
         })
      if (m.isGroup && !m.isBot && users && users.afk > -1) {
         sock.reply(m.chat, 
  `Kamu kembali online setelah offline selama: *${func.toTime(new Date - users.afk)}*\n\n> *Alasan*: ${users.afkReason ? users.afkReason : '-'}`, m)
         users.afk = -1
         users.afkReason = ''
      }
      
      await (await import(`../utils/logger.js?update=${Date.now()}`)).default(store, m, isCmd);
      
        if (setting.self && !m.isOwner) return
    Object.entries(plugins).forEach(([name, cmd]) => {
        if (!cmd.command && cmd.run) {
            if (cmd.owner && !m.isOwner) return
            if (cmd.private && m.isGroup) return
            if (cmd.group && !m.isGroup) return
            if (cmd.admin && !m.isAdmin) return 
            if (cmd.botAdmin && !m.isBotAdmin) return
            if (cmd.limit) {
                if (users.limit < 1) {
                    return;
                }
                const limit = cmd.limit === true ? 1 : cmd.limit;
                if (users.limit >= limit) {
                    users.limit -= limit;
                } else {
                    return;
                }
            }

            try {
                cmd.run(m, {
                    sock,
                    q: m.isQuoted ? m.quoted : m,
                    plugins,
                    command,
                    setting,
                    scrap,
                    users,
                    func,
                    store,
                    args,
                    set,
                    text,
                });
            } catch (e) {
                console.error(e);
                m.report(e);
            }
        } else if ((cmd.noPrefix || prefix) && cmd.command.includes(command)) {
            if (cmd.owner && !m.isOwner) return m.reply(global.status.owner);
            if (cmd.private && m.isGroup) return m.reply(global.status.private);
            if (cmd.group && !m.isGroup) return m.reply(global.status.group);
            if (cmd.admin && !m.isAdmin) return m.reply(global.status.admin);
            if (cmd.botAdmin && !m.isBotAdmin) return m.reply(global.status.botAdmin);
            if (cmd.limit) {
                if (users.limit < 1) {
                    sock.reply(m.chat, `Limit pemakaian kamu sudah habis.
Limit pemakaian akan reset setiap jam 00:00 WIB

Jika kamu ingin mendapat limit pemakaian unlimited, silakan ketik .premium.`, m);
                    return;
                }
                const limit = cmd.limit === true ? 1 : cmd.limit;
                if (users.limit >= limit) {
                    users.limit -= limit;
                } else {
                    sock.reply(m.chat, func.texted('bold', `⚠️ Your limit is not enough to use this feature.`), m);
                    return;
                }
            }

            if (cmd.wait) m.react('🕒');

            try {
                cmd.run(m, {
                    sock,
                    q: m.isQuoted ? m.quoted : m,
                    plugins,
                    command,
                    setting,
                    scrap,
                    users,
                    prefix,
                    func,
                    store,
                    args,
                    set,
                    text,
                });
            } catch (e) {
                console.error(e);
                m.report(e);
            }
        }
    });
} catch (e) {
    console.error(e);
   }
}
