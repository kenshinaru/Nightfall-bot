//Untuk menentukan tags case didalam menu, gunakan // tags: namatags
//Contoh case-case dibawah yang sudah ditentukan tags nya.

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
                case 'tourl': // tags: convert
                    {
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
                case 'runtime': // tags: miscs
                case "run": {
                    let _uptime = process.uptime() * 1000
                    let uptime = func.toTime(_uptime)
                    sock.reply(m.chat, func.texted('bold', `Running for : [ ${uptime} ]`), m)
                }
                break
                case 'rvo': // tags: group
                case "readviewonce": {
                    if (!q.viewOnce) return m.reply("Balas media dengan satu kali lihat");
                    q.msg.viewOnce = false
                    await m.reply({ forward: q, force: true })
                }
                break
                case 'rmbg': // tags: tools
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
               case 'jadianime': // tags: ai
               case 'toanime': {
                    let mime = (q.msg || q).mimetype || '';
                    if (/image/g.test(mime) && !/webp/g.tes>
                        m.react('🕒')
                        try {
                            let img = await q.download();
                            let out = await scrap.uploadFil>
                            let old = new Date();

                            const animeApiUrl = `https://in>
                            const response = await fetch(an>
                            if (!response.ok) throw new Err>

                            const imageBuffer = await respo>

                            await sock.sendMessage(m.chat, {
                                image: Buffer.from(imageBuf>
                                caption: `🍟 *Fetching* : $>
                            }, {
                                quoted: m
                            });

                        } catch (e) {
                            console.log(e);
                            return sock.reply(m.chat, `[ ! >
                        }
                    } else {
                        return sock.reply(m.chat, `🚩 Kirim>
                    }
                }
              break
            }
        } catch (e) {
            return sock.reply(m.chat, func.format(e), m);
        }
    }
};
