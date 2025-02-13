import jimp from "jimp";
import { S_WHATSAPP_NET } from "baileys";

export default {
    name: ["setpp"],
    command: ["setppbot", "setpp"],
    tags: ["owner"],
    run: async (m, { sock, command, prefix }) => {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || q.mediaType || "";
        if (!mime)
            throw `Send/Reply Images with the caption *${prefix + command}*`;
        if (/image/g.test(mime) && !/webp/g.test(mime)) {
            let media = await q.download();
            let { img } = await pepe(media);
            await sock.query({
                tag: "iq",
                attrs: {
                    to: S_WHATSAPP_NET,
                    type: "set",
                    xmlns: "w:profile:picture",
                },
                content: [{
                    tag: "picture",
                    attrs: { type: "image" },
                    content: img,
                }],
            });
            await m.reply(`Berhasil mengganti foto profile bot`);
       
        }
    },
    wait: true,
    owner: true,
};

async function pepe(media) {
    const image = await jimp.read(media);
    const min = image.getWidth();
    const max = image.getHeight();
    const cropped = image.crop(0, 0, min, max);
    return {
        img: await cropped.scaleToFit(720, 720).getBufferAsync(jimp.MIME_JPEG),
        preview: await cropped.normalize().getBufferAsync(jimp.MIME_JPEG),
    };
}