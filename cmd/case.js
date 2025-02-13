export default {
    run: async (m, {
        sock,
        prefix,
        command,
        func,
        scrap,
        setting,
        users,
        store,
        q
    }) => {
        try {
            switch (command) {
                case 'tourl': {
                    let mime = (q.msg || q).mimetype || '';
                    if (/image\/(png|jpe?g|webp)|video\/mp4|audio\/(mpeg|opus)/.test(mime)) {
                        m.react('🕒')
                        let img = await q.download();
                        const json = await scrap.uploadFile(img);
                        sock.reply(m.chat, json, m);
                    } else {
                        return sock.reply(m.chat, `🚩 Give a caption or reply to the photo with the ${prefix + command} command`, m);
                    }
                }
                break
                case 'runtime':
                case "run": {
                    let _uptime = process.uptime() * 1000
                    let uptime = func.toTime(_uptime)
                    sock.reply(m.chat, func.texted('bold', `Running for : [ ${uptime} ]`), m)
                }
                break
                case 'rvo':
                case "readviewonce": {
                    if (!m.quoted) return m.reply("Balas media dengan satu kali lihat");
                    let type = Object.keys(m.quoted.message || {})[0];
                    if (!type || !m.quoted.message[type].viewOnce)
                        return sock.sendMessage(m.chat, {
                            text: `🚩 Pesan bukan view once.`
                        }, {
                            quoted: m
                        });
                    let media = await m.quoted.download();
                    let fileType = /video/.test(type) ? 'video' : 'image';
                    let fileName = fileType === 'video' ? 'media.mp4' : 'media.jpg';
                    return await sock.sendMessage(m.chat, {
                        [fileType]: media,
                        caption: m.quoted.message[type].caption || ''
                    }, {
                        quoted: m
                    });
                }
                break
                case 'rmbg':
                case "removebg": {
                    if (!q) return m.reply("Kirim atau reply media")
                    let mime = (q.msg || q).mimetype || ''
                    if (!mime) return sock.sendMessage(m.chat, {
                        text: `🚩 Kirim atau reply media`
                    }, {
                        quoted: m
                    })
                    if (/image/i.test(mime)) {
                        m.react('🕒')
                        let media = await q.download()
                        let json = await scrap.removebg(media)
                        return await sock.sendFile(m.chat, json, '', '', m)
                    }
                }
                break
            }
        } catch (e) {
            return sock.reply(m.chat, func.format(e), m);
        }
    }
};