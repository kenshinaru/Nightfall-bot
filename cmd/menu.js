import fs from 'fs';
import { join } from 'path';

const pkg = JSON.parse(fs.readFileSync(join(process.cwd(), 'package.json')));

export default {
   name: 'menu',
   command: ['menu'],
   tags: 'miscs',
   run: async (m, { sock, plugins, func, setting, users }) => {
      const categories = {};
      let totalCommands = 0;

      Object.values(plugins).forEach(menu => {
         if (!menu.tags || (menu.tags === 'owner' && !m.isOwner)) return;
         const cmds = Array.isArray(menu.name) ? menu.name : [menu.name];
         categories[menu.tags] = categories[menu.tags] || new Set();
         cmds.forEach(cmd => categories[menu.tags].add(cmd));
         totalCommands += cmds.length;
      });

      const caseFile = fs.readFileSync('./cmd/case.js', 'utf-8');
      const caseCommands = [...caseFile.matchAll(/case\s+'([^']+)'/g)].map(match => match[1]);

      if (caseCommands.length) {
         categories['other'] = categories['other'] || new Set();
         caseCommands.forEach(cmd => categories['other'].add(cmd));
         totalCommands += caseCommands.length;
      }

      const time = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
      const uptime = func.toTime(process.uptime() * 1000);

      const message = `⎯⎯⎯ \`INFO USER\` ⎯⎯⎯
⦿ *Nama*    : ${m.pushName}
⦿ *Status*   : ${m.isOwner ? 'Developer' : m.isPremium ? 'Premium' : 'Gratisan'}
⦿ *Limit*      : ${m.isOwner ? 'Unlimited' : users.limit}

⎯⎯⎯ \`INFO BOT\` ⎯⎯⎯
⦿ *Nama*      : ${pkg.name}
⦿ *Versi*        : ${pkg.version}
⦿ *Source*    : https://github.com/kenshinaru/Nightfall-bot

` + Object.keys(categories).sort().map(category => 
         ` ✦ \`${category.toUpperCase()}\`\n` +
         [...categories[category]].sort().map((cmd, i, arr) => 
            ` ${i === arr.length - 1 ? '└' : '├'} ${cmd}`
         ).join('\n')
      ).join('\n\n') +
      '\n\n> Lightweight Whatsapp Bot';

      return sock.sendMessage(m.chat, {
         text: message.trim(),
         contextInfo: {
            mentionedJid: sock.parseMentions(message),
            isForwarded: true,
            externalAdReply: {
               title: `Hi, ${m.pushName}`,
               body: `Hi, i'm ${pkg.name}`,
               thumbnailUrl: setting.cover,
               sourceUrl: setting.link,
               mediaType: 1,
               renderLargerThumbnail: true,
            },
         },
      }, { quoted: m });
   },
   location: __filename
};
