export default {
   name: ['ig'],
   command: ['igdl', 'ig'],
   tags: 'download',
   wait: true,
   run: async (m, { sock, args, scrap, prefix, command, func }) => {
      try {
         if (!args || !args[0]) return sock.reply(m.chat, func.example(command, 'https://www.instagram.com/p/CK0tLXyAzEI'), m)
         if (!args[0].match(/(https:\/\/www.instagram.com)/gi)) return sock.reply(m.chat, global.status.invalid, m)

         let old = new Date()
         const json = await scrap.snapsave(args[0])
         if (!json.data.length) return sock.reply(m.chat, func.format(json), m)

         for (let v of json.data) {
            const file = await func.getFile(v.url)
            sock.sendFile(m.chat, file.data, func.filename(/mp4|bin/.test(file.extension) ? 'mp4' : 'jpg'), `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
            await func.delay(1500)
         }
      } catch (e) {
         console.log(e)
         return sock.reply(m.chat, func.format(e), m)
      }
   },
   error: false,
   limit: true,
}