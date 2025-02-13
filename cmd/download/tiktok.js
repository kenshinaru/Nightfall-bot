export default {
   name: ['tiktok'],
   command: ['tiktok', 'tikmp3', 'tikwm', 'tt'],
   tags: 'download',
   wait: true,
   run: async (m, { sock, args, command, func }) => {
      try {
         if (!args || !args[0]) return sock.reply(m.chat, func.example(command, 'https://vm.tiktok.com/ZSR7c5G6y/'), m)
         if (!args[0].match('tiktok.com')) return sock.reply(m.chat, global.status.invalid, m)
         let old = new Date()
         const json = await func.fetchJson(`https://api.tiklydown.eu.org/api/download?url=${args[0]}`)

         if (command == 'tiktok' || command == 'tt') {
            if (json.video) return sock.replyButton(m.chat, [
               { text: 'Audio', command: `.tikmp3 ${args[0]}` },
               { text: 'Watermark', command: `.tikwm ${args[0]}` }
            ], m, {
               text: `Hi @${m.sender.split('@')[0]}, jika ingin opsi lain silahkan pilih tombol di bawah ini`,
               footer: global.footer,
               media: json.video.noWatermark
            })
            if (json.images) {
               for (let p of json.images) {
                  sock.sendFile(m.chat, p.url, 'image.jpg', ``, m)
                  await func.delay(1500)
               }
            }
         }
         if (command == 'tikwm') return sock.sendFile(m.chat, json.video.watermark, 'video.mp4', `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
         if (command == 'tikmp3') return !json.music ? sock.reply(m.chat, global.status.fail, m) : sock.sendFile(m.chat, json.music.play_url, 'audio.mp3', '', m)
      } catch (e) {
         return sock.reply(m.chat, func.format(e), m)
      }
   },
   error: false,
   limit: true,
}