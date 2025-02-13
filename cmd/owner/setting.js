export default {
   name: ['setcover', 'setlink'],
   command: ['setcover', 'setlink'],
   tags: 'owner',
   run: async (m, { sock, func, command, scraper, q, setting 
   }) => {
         if (command == 'setcover') {
         let mime = (q.msg || q).mimetype || '';
         if (!mime.includes('image')) return sock.reply(m.chat, func.texted('bold', '🚩 Please reply to an image.'), m);
         let mediaBuffer = await q.download();
         let json = await scraper.uploadFile(mediaBuffer)
         setting.cover = json
         client.reply(m.chat, func.texted('bold', `🚩 Cover berhasil di ganti.`), m)
         m.react('✅')
        } else if (command === 'setlink') {
         if (!text) return m.reply('Kirim link yang akan di setting')
         if (/https?:\/\//i.test(text)) return m.reply('Kirim link yang valid')
         setting.link = text.trim()
         client.reply(m.chat, func.texted('bold', `🚩 Setting Link berhasil di ganti.`), m)
         m.react('✅')
        }
   },
   error: false,
   owner: true,
   wait: true
};
