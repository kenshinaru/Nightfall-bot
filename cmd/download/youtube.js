export default {
   name: ['ytmp3', 'ytmp4'],
   command: ['yta', 'ytmp3', 'ytmp4', 'ytv'],
   tags: 'download',
   wait: true,
   run: async (m, { sock, scrap, func, args, prefix, command }) => {
      try {
         if (/yt?(a|mp3)/i.test(command)) {
            if (!args || !args[0]) return sock.reply(m.chat, func.example(command, 'https://youtu.be/zaRFmdtLhQ8'), m);
            if (!/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/.test(args[0])) return sock.reply(m.chat, global.status.invalid, m);
            const json = await scrap.ytdl(args[0]);
            if (!json) return sock.reply(m.chat, func.format(json), m);
            sock.sendMessage(m.chat, {
               audio: { url: json.download.downloadUrl },
               mimetype: "audio/mpeg",
               contextInfo: {
                  externalAdReply: {
                     thumbnailUrl: json.metadata.thumbnail,
                     title: json.metadata.title,
                     body: `Author : ${json.metadata.author.name} & Duration ${json.metadata.duration.timestamp}`,
                     sourceUrl: args[0],
                     renderLargerThumbnail: true,
                     mediaType: 1
                  }
               }
            }, { quoted: m });
         } else if (/yt?(v|mp4)/i.test(command)) {
            if (!args || !args[0]) return sock.reply(m.chat, func.example(command, 'https://youtu.be/zaRFmdtLhQ8'), m);
            if (!/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/.test(args[0])) return sock.reply(m.chat, global.status.invalid, m);
            const json = await scrap.ytdl(args[0], );
            if (!json) return sock.reply(m.from, func.format(json), m);
            sock.sendMessage(m.chat, {
               audio: { url: json.download.downloadUrl },
               mimetype: "video/mp4",
               contextInfo: {
                  externalAdReply: {
                     thumbnailUrl: json.metadata.thumbnail,
                     title: json.metadata.title,
                     body: `Author : ${json.metadata.author.name} & Duration ${json.metadata.duration.timestamp}`,
                     sourceUrl: args[0],
                     renderLargerThumbnail: true,
                     mediaType: 1
                  }
               }
            }, { quoted: m });
         }
      } catch (e) {
         return sock.reply(m.chat, func.jsonFormat(e), m);
      }
   },
   error: false,
   limit: true
};