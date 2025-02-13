export default {
   name: ['sticker'],
   command: ['s', 'sk', 'stiker', 'sgif'],
   tags: 'convert',
   run: async (m, { sock, setting, set, func }) => {
      try {
         let exif = setting
         if (m.quoted ? m.quoted.message : m.msg.viewOnce) {
            let type = m.quoted ? Object.keys(m.quoted.message)[0] : m.mtype
            let q = m.quoted ? m.quoted.message[type] : m.msg
            let img = await m.quoted.download()
            if (/video/.test(type)) {
               if (q.seconds > 10) return sock.reply(m.chat, func.texted('bold', `🚩 Maximum video duration is 10 seconds.`), m)
               return await sock.sendSticker(m.chat, img, m, {
                  packname: exif.sk_pack,
                  author: exif.sk_author
               })
            } else if (/image/.test(type)) {
               return await sock.sendSticker(m.chat, img, m, {
                  packname: exif.sk_pack,
                  author: exif.sk_author
               })
            }
         } else {
            let q = m.quoted ? m.quoted : m
            let mime = (q.msg || q).mimetype || ''
            if (/image\/(jpe?g|png)/.test(mime)) {
               let img = await q.download()
               if (!img) return sock.reply(m.chat, set.msg.wrong, m)
               return await sock.sendSticker(m.chat, img, m, {
                  packname: exif.sk_pack,
                  author: exif.sk_author
               })
            } else if (/video/.test(mime)) {
               if ((q.msg || q).seconds > 10) return sock.reply(m.chat, func.texted('bold', `🚩 Maximum video duration is 10 seconds.`), m)
               let img = await q.download()
               if (!img) return sock.reply(m.chat, set.msg.wrong, m)
               return await sock.sendSticker(m.chat, img, m, {
                  packname: exif.sk_pack,
                  author: exif.sk_author
               })
            } else sock.reply(m.chat, func.texted('bold', `Stress ??`), m)
         }
      } catch (e) {
         console.log(e)
         return sock.reply(m.chat, func.format(e), m)
      }
   },
   error: false,
   wait: true,
}