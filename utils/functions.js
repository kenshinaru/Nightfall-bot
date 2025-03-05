import axios from "axios";
import fs from "fs";
import path from "path";
import mimes from "mime-types";
import { fileTypeFromBuffer as fromBuffer } from "file-type";
import { format } from "util";
import moment from 'moment-timezone';
import chalk from 'chalk';

class Func {

  example = (command, args) => {
      return `• ${this.texted('bold', 'Example')} : #${command} ${args}`
   }
   
   delay = (time) => new Promise((res) => setTimeout(res, time));
   
   filename = (ext = "", length = "10") => {
    var result = "";
    var character =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
    var characterLength = character.length;
    for (var i = 0; i < length; i++) {
      result += character.charAt(Math.floor(Math.random() * characterLength));
    }

    return `${result}${ext ? `.${ext}` : ""}`;
  }
  
  Styles = (text, style = 1) => {
   var xStr = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('')
   var yStr = Object.freeze({
      1: 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘqʀꜱᴛᴜᴠᴡxʏᴢ1234567890',
      2: '𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙1234567890'
   })
   var replacer = []
   xStr.map((v, i) => replacer.push({
      original: v,
      convert: yStr[style].split('')[i]
   }))
   var str = text.toLowerCase().split('')
   var output = []
   str.map(v => {
      const find = replacer.find(x => x.original == v)
      find ? output.push(find.convert) : output.push(v)
   })
   return output.join('')
}

 randomInt = (min, max) => {
      min = Math.ceil(min)
      max = Math.floor(max)
      return Math.floor(Math.random() * (max - min + 1)) + min
   }
   
   texted = (type, text) => {
      switch (type) {
         case 'bold':
            return '*' + text + '*'
            break
         case 'italic':
            return '_' + text + '_'
            break
         case 'monospace':
            return '```' + text + '```'
      }
   }
   
   makeId = (length) => {
      var result = ''
      var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      var charactersLength = characters.length
      for (var i = 0; i < length; i++) {
         result += characters.charAt(Math.floor(Math.random() * charactersLength))
      }
      return result.toLowerCase()
   }
   
   formatter = (angka) => {
    var balancenyeini = "";
    var angkarev = angka.toString().split("").reverse().join("");
    for (var i = 0; i < angkarev.length; i++)
      if (i % 3 == 0) balancenyeini += angkarev.substr(i, 3) + ".";
    return (
      "" +
      balancenyeini
        .split("", balancenyeini.length - 1)
        .reverse()
        .join("")
    );
  }
  
   format = (obj) => {
  try {
    const print = (obj && (obj.constructor.name === "Object" || obj.constructor.name === "Array"))
      ? format(JSON.stringify(obj, null, 2))
      : format(obj);
    return print;
      } catch {
        return format(obj);
     }
   }
   
   fetchJson = async(url, options = {}) => {
    try {
      let data = await axios.get(url, {
        headers: {
          ...(!!options.headers ? options.headers : {}),
        },
        responseType: "json",
        ...options,
      });

      return await data?.data;
    } catch (e) {
      throw e;
    }
  }
  
  fetchBuffer = async (source, filename, options = {}) => {
    try {
        if (Buffer.isBuffer(source)) {
            let meta = await fromBuffer(source).catch(() => ({}));
            return {
                status: true,
                data: source,
                size: Buffer.byteLength(source),
                filename: filename || `buffer.${meta.ext || "bin"}`,
                mime: meta.mime || mimes.lookup(filename) || "application/octet-stream",
                ext: meta.ext || mimes.extension(mimes.lookup(filename)) || "bin",
            };
        }

        if (fs.existsSync(source) && fs.statSync(source).isFile()) {
            return {
                status: true,
                data: fs.readFileSync(source),
                size: fs.statSync(source).size,
                filename: filename || path.basename(source),
                mime: mimes.lookup(source) || "application/octet-stream",
                ext: path.extname(source).slice(1) || mimes.extension(mimes.lookup(source)) || "bin",
            };
        }

        if (/^https?:\/\//i.test(source)) {
            let res = await axios.get(source, { headers: options.headers, responseType: "arraybuffer" });
            let name = filename || res.headers["content-disposition"]?.match(/filename="?([^";]*)"?/)?.[1]?.replace(/["';]/g, "") || path.basename(new URL(source).pathname);
            return {
                status: true,
                data: res.data,
                size: Buffer.byteLength(res.data),
                filename: name,
                mime: mimes.lookup(name) || res.headers["content-type"],
                ext: path.extname(name).slice(1) || mimes.extension(mimes.lookup(name)) || "bin",
            };
        }

        if (/^data:.*?\/.*?;base64,/i.test(source) || /^[a-zA-Z0-9+/]+={0,2}$/i.test(source)) {
            let data = Buffer.from(source.split(",").pop(), "base64");
            let meta = await fromBuffer(data).catch(() => ({}));
            return {
                status: true,
                data,
                size: Buffer.byteLength(data),
                filename: filename || `base64.${meta.ext || "bin"}`,
                mime: meta.mime || "application/octet-stream",
                ext: meta.ext || "bin",
            };
        }
    } catch (e) {
        return { status: false, msg: e.message };
    }

    return { status: false, msg: "" };
}

  getFile = async (PATH) => {
    try {
      const data = await this.fetchBuffer(PATH);
      return { ...data };
    } catch (e) {
      throw e;
    }
  };

  toTime = (ms) => {
    let h = isNaN(ms) ? "--" : Math.floor(ms / 3600000);
    let m = isNaN(ms) ? "--" : Math.floor(ms / 60000) % 60;
    let s = isNaN(ms) ? "--" : Math.floor(ms / 1000) % 60;
    return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(":");
  }
  
  formatSize = (size) => {
    if (size >= 1e6) return `${(size / 1e6).toFixed(2)} MB`;
    if (size >= 1e3) return `${(size / 1e3).toFixed(2)} KB`;
    return `${size} B`;
  };

  removeAcents = (text) => {
    return (typeof text === "string") ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : text;
  };
}

// Export the instance
export default new Func();
