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
  
  fetchBuffer = async (string, options = {}) => {
    try {
      if (/^https?:\/\//i.test(string)) {
        const data = await axios.get(string, {
          headers: { ...(options.headers || {}) },
          responseType: "arraybuffer",
          ...options,
        });
        const buffer = data?.data;
        const name = /filename/i.test(data.headers?.["content-disposition"])
          ? data.headers["content-disposition"]
              ?.match(/filename=(.*)/)?.[1]
              ?.replace(/["';]/g, "")
          : "";
        const mime =
          mimes.lookup(name) ||
          data.headers["content-type"] ||
          (await fromBuffer(buffer))?.mime;
        return {
          data: buffer,
          size: Buffer.byteLength(buffer),
          sizeH: this.formatSize(Buffer.byteLength(buffer)),
          name,
          mime,
          ext: mimes.extension(mime),
        };
      } else if (/^data:.*?\/.*?;base64,/i.test(string)) {
        const data = Buffer.from(string.split(",")[1], "base64");
        const size = Buffer.byteLength(data);
        return {
          data,
          size,
          sizeH: this.formatSize(size),
          ...((await fromBuffer(data)) || {
            mime: "application/octet-stream",
            ext: "bin",
          }),
        };
      } else if (fs.existsSync(string) && fs.statSync(string).isFile()) {
        const data = fs.readFileSync(string);
        const size = Buffer.byteLength(data);
        return {
          data,
          size,
          sizeH: this.formatSize(size),
          ...((await fromBuffer(data)) || {
            mime: "application/octet-stream",
            ext: "bin",
          }),
        };
      } else if (Buffer.isBuffer(string)) {
        const size = Buffer.byteLength(string) || 0;
        return {
          data: string,
          size,
          sizeH: this.formatSize(size),
          ...((await fromBuffer(string)) || {
            mime: "application/octet-stream",
            ext: "bin",
          }),
        };
      } else if (/^[a-zA-Z0-9+/]{1,}={0,2}$/i.test(string)) {
        const data = Buffer.from(string, "base64");
        const size = Buffer.byteLength(data);
        return {
          data,
          size,
          sizeH: this.formatSize(size),
          ...((await fromBuffer(data)) || {
            mime: "application/octet-stream",
            ext: "bin",
          }),
        };
      } else {
        const buffer = Buffer.alloc(20);
        const size = Buffer.byteLength(buffer);
        return {
          data: buffer,
          size,
          sizeH: this.formatSize(size),
          ...((await fromBuffer(buffer)) || {
            mime: "application/octet-stream",
            ext: "bin",
          }),
        };
      }
    } catch (e) {
      throw new Error(e?.message || e);
    }
  };

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