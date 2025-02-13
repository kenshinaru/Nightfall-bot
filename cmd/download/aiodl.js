export default {
    name: ["aiodl"],
    command: ["dl", "download"],
    tags: "download",
    run: async(m, { sock, args, scrap }) => {
        try {
            if (!args || !args[0]) return sock.reply(m.chat, `Supported Sites :\n• YouTube\n• Tiktok\n• Facebook\n• Douyin\n• Instagram\n• Twitter\n• 爱奇艺\n• 优酷\n• 1000+ websites\n\n*Example* : #aiodl https://www.example.com/video`, m);
            
            let json = await scrap.aiodl(args[0]);
            let url = json.url || (await scrap.aiodlv2(args[0]))?.medias?.[0]?.url;
            
            if (!url) return sock.reply(m.chat, '*The provided link is not supported.*', m);
            
            sock.sendFile(m.chat, url, '', json.title, m);
        } catch (e) {
            sock.reply(m.chat, e.toString(), m);
        }
    },
    error: false,
    wait: true,
    limit: true,
    location: __filename
};