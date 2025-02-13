export default {
    name: ["pin", "pins"],
    command: ["pinterest"],
    tags: "download",
    async run(m, { sock, text, prefix, command, scrap, func }) {
        try {
            if (!text) return sock.reply(m.chat, func.example(command, "https://pin.it/5fXaAWE"), m)
            if (/https?:\/\//i.test(text)) {
                if (!text.match(/pin(?:terest)?(?:\.it|\.com)/)) return m.reply(global.status.invalid);
                const json = await scrap.pindl(text.trim());
                if (!json.download) return sock.reply(m.chat, func.format(json), m);
                if (/jpg|mp4/i.test(json.download)) return sock.sendFile(m.chat, json.download, ``, json.title, m);
                if (/gif/i.test(json.download)) return sock.sendFile(m.chat, json.download, "", "", m, { gif: true });
            } else {
             const json = await scrap.pins(text.trim());
             if (!json.length) return sock.reply(m.chat, func.format(json), m);

          for (let i = 0; i < Math.min(3, json.length); i++) {
              const data = json[i];
              const caption = `*${data.title}*\n\n📌 *Author:* ${data.author}\n👥 *Followers:* ${data.followers}\n🔗 *Source:* ${data.source}`;
    
    sock.sendFile(m.chat, data.image, "", caption, m);
    await func.delay(2000);
               }
            }
        } catch {
            sock.reply(m.chat, global.status.error, m);
        }
    },
    error: false,
    wait: true,
    limit: true
};