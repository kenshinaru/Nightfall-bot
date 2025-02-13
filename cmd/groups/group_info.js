import moment from 'moment-timezone'
moment.tz.setDefault(global.timezone)

export default {
   name: ['groupinfo'],
   command: ['gcinfo'],
   tags: 'group',
   run: async(m, { sock }) => {
      try {
         let setting = global.db.groups[m.chat]
         let pic = './media/image/default.jpg'
         let member = m.participants.map(u => u.id)

         try {
            pic = await sock.profilePictureUrl(m.chat, 'image')
         } catch {} 

         let caption = `─◦ *GROUP INFO*\n`
         caption += `│ ◦ *Name* : ${m.metadata.subject}\n`
         caption += `│ ◦ *Member* : ${member.length}\n`
         caption += `│ ◦ *Admin* : ${m.admins.length}\n`
         caption += `│ ◦ *Created* : ${moment(m.metadata.creation * 1000).format('DD/MM/YY HH:mm:ss')}\n`
         caption += `│ ◦ *Owner* : ${m.metadata.owner ? '@' + m.metadata.owner.split('@')[0] : m.chat.match('-') ? '@' + m.chat.split('-')[0] : ''}\n`
         caption += `╰──────────────\n\n`

         caption += `─◦ *MODERATION*\n`
         caption += `│ ◦ [${setting.antibot ? '✓' : '✗'}] Anti Bot\n`
         caption += `│ ◦ [${setting.antidelete ? '✓' : '✗'}] Anti Delete\n`
         caption += `│ ◦ [${setting.antilink ? '✓' : '✗'}] Anti Link\n`
         caption += `│ ◦ [${setting.antivirtex ? '✓' : '✗'}] Anti Virtex\n`
         caption += `│ ◦ [${setting.autosticker ? '✓' : '✗'}] Auto Sticker\n`
         caption += `│ ◦ [${setting.filter ? '✓' : '✗'}] Filter\n`
         caption += `│ ◦ [${setting.game ? '✓' : '✗'}] Games\n`
         caption += `│ ◦ [${setting.left ? '✓' : '✗'}] Left Message\n`
         caption += `│ ◦ [${setting.localonly ? '✓' : '✗'}] Localonly\n`
         caption += `│ ◦ [${setting.viewonce ? '✓' : '✗'}] Viewonce Forwarder\n`
         caption += `│ ◦ [${setting.welcome ? '✓' : '✗'}] Welcome Message\n`
         caption += `╰──────────────\n\n`

         caption += `─◦ *GROUP STATUS*\n`
         caption += `│ ◦ *Muted* : [${setting.mute ? '✓' : '✗'}]\n`
         caption += `│ ◦ *Stay* : [${setting.stay ? '✓' : '✗'}]\n`
         caption += `│ ◦ *Expired* : ${setting.expired == 0 ? 'NOT SET' : func.timeReverse(setting.expired - new Date * 1)}\n`
         caption += `╰──────────────\n`

         sock.sendMessage(m.chat, {
         text: caption.trim(),
         contextInfo: {
            mentionedJid: sock.parseMentions(caption),
            isForwarded: true,
            externalAdReply: {
               thumbnailUrl: pic,
               sourceUrl: '',
               mediaType: 1,
               renderLargerThumbnail: true,
            },
         },
      }, { quoted: m });
      } catch (e) {
         console.log(e)
         return sock.reply(m.chat, JSON.stringify(e, null, 2), m)
      }
   },
   group: true,
   cache: true,
   location: import.meta.url
}