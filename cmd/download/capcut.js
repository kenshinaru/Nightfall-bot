export default {
    name: ["capcut"],
    command: ["cc"],
    tags: "download",
    run: async(m, { sock, args, scrap, prefix, command, func }) => {
        try {
            if (!args || !args[0]) return sock.reply(m.chat, func.example(command, "https://www.capcut.com/watch/7178705274797067521"), m);
            const json = await scrap.capcut(args[0]);
            if (json.status !== 200) return sock.reply(m.chat, func.format(json), m);
            sock.sendFile(m.chat, json.video, "", '', m);
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