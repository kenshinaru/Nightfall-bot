export default {
    name: ["bcgc"],
    command: ["bcgc"],
    tags: ["owner"],
    run: async (m, { sock, func, prefix, command, text }) => {
        let group = Object.keys(store.groupMetadata);
        let q = m.quoted ? m.quoted : m;
        let mime = q.mimetype || "";
        for (let i of group) {
            if (mime) {
                await sock.sendMessage(i, {
                    forward: q
                });
                await func.delay(2000);
            } else {
                await sock.reply(i, text, null);
                await func.delay(2000);
            }
        }
        await m.reply(`Berhasil mengirim pesan broadcast ke ${group.length} group chat`);
    },
    wait: true,
    owner: true,
};