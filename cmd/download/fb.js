export default {
    name: ["fb"],
    command: ["fbdl", "fbvid"],
    tags: "download",
    run: async(m, { sock, args, prefix, command, scrap, func }) => {
        try {
            if (!args || !args[0]) return sock.reply(m.chat, func.example(prefix, command, "https://fb.watch/7B5KBCgdO3"), m);
            if (!args[0].match(/(?:https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+)?$/)) return sock.reply(m.chat, global.status.invalid, m);
            const json = await scrap.snapsave(args[0]);
            if (!json.data.length) return sock.reply(m.chat, func.jsonFormat(json), m);
            let result = json.data.find((v) => v.resolution === "720p (HD)") || json.data.find((v) => v.quality === "360p (SD)");
            if (!result) return sock.reply(m.chat, global.status.fail, m);
            sock.sendFile(m.chat, result.url, func.filename("mp4"), `◦ *Quality* : ${result.resolution || result.quality}`, m);
        } catch (e) {
            console.log(e);
            return sock.reply(m.chat, func.jsonFormat(e), m);
       }
    },
    error: false,
    limit: true,
    wait: true,
    location: __filename
};