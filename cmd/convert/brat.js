export default {
   name: ['brat'],
   command: ['brat'],
   tags: 'convert',
   run: async (m, { sock, text, scrap, func, prefix, command }) => {
      try {
         if (!text) return sock.reply(m.chat, func.example(command, 'Hi!'), m);
         if (text.length > 500) return sock.reply(m.chat, `Max 500 character.`, m);
         const exif = global.db.setting;
         const json = await scrap.brat(text);
         sock.sendSticker(m.chat, json.url, m, {
            packname: exif.sk_pack,
            author: exif.sk_author
         });
      } catch (e) {
         return m.reply(func.format(e));
      }
   },
   error: false,
   wait: true
};