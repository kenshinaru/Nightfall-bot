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
      
      Logs(sock, m, isCmd)
      
      if (setting.self && !m.isOwner) return
      for (const name in plugins) {
         const cmd = plugins[name];
    
        if (!cmd.command && cmd.run) {
        if (cmd.owner && !m.isOwner) {
            m.reply(global.status.owner);
            continue;
        }
        if (cmd.private && m.isGroup) {
            m.reply(global.status.private);
            continue;
        }
        if (cmd.group && !m.isGroup) {
            m.reply(global.status.group);
            continue;
        }
        if (cmd.admin && !m.isAdmin) {
            m.reply(global.status.admin);
            continue;
        }
        if (cmd.botAdmin && !m.isBotAdmin) {
            m.reply(global.status.botAdmin);
            continue;
        }
        if (cmd.limit && users.limit < 1) {
    sock.reply(m.chat, `Limit pemakaian kamu sudah habis.
Limit pemakaian akan reset setiap jam 00:00 WIB

Jika kamu ingin mendapat limit pemakaian unlimited, silakan ketik .premium.`, m)
           continue
         }

        if (cmd.limit && users.limit > 0) {
    const limit = cmd.limit.constructor.name == 'Boolean' ? 1 : cmd.limit
        if (users.limit >= limit) {
        users.limit -= limit
                } else {
        sock.reply(m.chat, func.texted('bold', `⚠️ Your limit is not enough to use this feature.`), m)
        continue
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
            setting,
            text,
            })
          } catch (e) {
          console.error(e)
          m.report(e)
          }
     } else if ((cmd.noPrefix || prefix) && [...new Set([cmd.name].flat().concat(cmd.command))].includes(command)) {
       if (cmd.owner && !m.isOwner) {
            m.reply(global.status.owner);
            continue;
        }
        if (cmd.private && m.isGroup) {
            m.reply(global.status.private);
            continue;
        }
        if (cmd.group && !m.isGroup) {
            m.reply(global.status.group);
            continue;
        }
        if (cmd.admin && !m.isAdmin) {
            m.reply(global.status.admin);
            continue;
        }
        if (cmd.botAdmin && !m.isBotAdmin) {
            m.reply(global.status.botAdmin);
            continue;
        }
        if (cmd.limit && users.limit < 1) {
    sock.reply(m.chat, `Limit pemakaian kamu sudah habis.
Limit pemakaian akan reset setiap jam 00:00 WIB

Jika kamu ingin mendapat limit pemakaian unlimited, silakan ketik .premium.`, m)
           continue
         }

        if (cmd.limit && users.limit > 0) {
    const limit = cmd.limit.constructor.name == 'Boolean' ? 1 : cmd.limit
        if (users.limit >= limit) {
        users.limit -= limit
                } else {
        sock.reply(m.chat, func.texted('bold', `⚠️ Your limit is not enough to use this feature.`), m)
        continue
           }
        }
       if (cmd.wait) m.react('🕒')
       
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
            setting,
            text,
            })
          } catch (e) {
          console.error(e)
          m.report(e)
          }
        }
      }
    } catch (e) {
        console.error(e)
    }
}
