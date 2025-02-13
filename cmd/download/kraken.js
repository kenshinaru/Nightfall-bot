export default {
    name: ["krakendl"],
    command: ["kraken", "krakenfiles"],
    tags: "download",
    run: async(m, { sock, args, scrap, prefix, command, func }) => {
        try {
            if (!args || !args[0]) return sock.reply(m.chat, func.example(command, "https://krakenfiles.com/view/zeLYGa4X7f/file.html"), m);
            const json = await scrap.krakenfiles(args[0]);
            if (!json.metadata) return sock.reply(m.chat, func.format(json), m);
            sock.sendFile(m.chat, json.buffer, json.metadata.filename, '', m);
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