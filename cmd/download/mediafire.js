export default {
    name: ["mediafire"],
    command: ["mf"],
    tags: "download",
    run: async(m, { sock, args, scrap, prefix, command, func }) => {
        try {
            if (!args || !args[0]) return sock.reply(m.chat, func.example(command, "https://www.mediafire.com/file/6d3xgla7hqhy91l/IMPROVE_V8_GEN_2.zip/file"), m);
            const json = await scrap.mediafire(args[0]);
            if (!json.download) return sock.reply(m.chat, func.format(json), m);
            sock.sendFile(m.chat, json.download, json.filename, '', m);
        } catch (e) {
            console.log(e);
            return sock.reply(m.chat, func.format(e), m);
        }
    },
    error: false,
    wait: true,
    limit: true,
    location: __filename
};