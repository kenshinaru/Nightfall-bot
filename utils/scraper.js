import { fileTypeFromBuffer } from 'file-type';
import FormData from 'form-data';
import axios from 'axios';
import got from 'got'
import * as cheerio from 'cheerio'
import { lookup } from "mime-types"
import moment from "moment-timezone"


class Scraper {

 //add your scraper here
 
 ytdl = async(youtubeUrl, quality = 720) => {
    try {
        const apiUrl = 'https://tamimapis.xyz/download-mp4';
        const response = await axios.get(apiUrl, {
            params: { link: youtubeUrl, format: quality },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
                'Referer': 'https://tamimapis.xyz/ytt.html'
            }
        });

        const data = response.data;
        if (!data.status) throw new Error("Gagal mengambil data video dari API.");

        return {
            metadata: {
                title: data.metadata.title,
                description: data.metadata.description,
                videoId: data.metadata.videoId,
                url: data.metadata.url,
                image: data.metadata.image,
                thumbnail: data.metadata.thumbnail,
                duration: data.metadata.duration,
                ago: data.metadata.ago,
                views: data.metadata.views,
                author: data.metadata.author
            },
            download: {
                status: data.download.status,
                quality: data.download.quality,
                availableQuality: data.download.availableQuality,
                downloadUrl: data.download.url,
                filename: data.download.filename
            }
        };
    } catch {
        return { error: "Terjadi kesalahan saat memproses permintaan." };
    }
}

 pins = async(query) => {
    const queryParams = {
        source_url: "/search/pins/?q=" + encodeURIComponent(query),
        data: JSON.stringify({
            options: {
                isPrefetch: false,
                query: query,
                scope: "pins",
                no_fetch_context_on_resource: false,
            },
            context: {},
        }),
        _: Date.now(),
    };

    const url = new URL("https://www.pinterest.com/resource/BaseSearchResource/get/");
    Object.entries(queryParams).forEach(([key, value]) => url.searchParams.set(key, value));

    try {
        const json = await (await fetch(url.toString())).json();
        return json.resource_response.data.results
            .filter((a) => a.title !== "")
            .map((a) => ({
                title: a.title,
                id: a.id,
                create_at: moment(new Date(a.created_at) * 1).format("DD/MM/YYYY HH:mm:ss"),
                author: a.pinner.username,
                followers: a.pinner.follower_count.toLocaleString(),
                source: "https://www.pinterest.com/pin/" + a.id,
                image: a.images["orig"].url,
            }));
    } catch (error) {
        console.error("Error mengambil data:", error);
        return [];
    }
}

  pindl = async(url) => {
    try {
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
            },
        }).catch((e) => e.response);

        const $ = cheerio.load(response.data);
        const tag = $('script[data-test-id="video-snippet"]');

        if (tag.length > 0) {
            const result = JSON.parse(tag.text());
            if (!result || !result.name || !result.thumbnailUrl || !result.uploadDate || !result.creator) {
                return { msg: "- Data tidak ditemukan, coba pakai url lain" };
            }
            return {
                title: result.name,
                thumb: result.thumbnailUrl,
                upload: new Date(result.uploadDate).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric",
                }),
                source: result["@id"],
                author: {
                    name: result.creator.alternateName,
                    username: "@" + result.creator.name,
                    url: result.creator.url,
                },
                keyword: result.keywords ? result.keywords.split(", ").map((keyword) => keyword.trim()) : [],
                download: result.contentUrl,
            };
        } else {
            const json = JSON.parse($("script[data-relay-response='true']").eq(0).text());
            const result = json.response.data["v3GetPinQuery"].data;
            return {
                title: result.title,
                upload: new Date(result.createAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric",
                }),
                source: result.link,
                author: {
                    name: result.pinner.username,
                    username: "@" + result.pinner.username,
                },
                keyword: result.pinJoin.visualAnnotation,
                download: result.imageLargeUrl,
            };
        }
    } catch (e) {
        return { msg: "Error coba lagi nanti" };
    }
}

 
 removebg = (buffer) => {
    try {
        return new Promise(async (resolve, reject) => {
            const image = buffer.toString("base64");
            let res = await axios.post(
                "https://us-central1-ai-apps-prod.cloudfunctions.net/restorePhoto", {
                    image: `data:image/png;base64,${image}`,
                    model: "fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
                },
            );
            const data = res.data?.replace(`"`, "");
            console.log(res.status, data);
            if (!data) return reject("failed removebg image");
            resolve(data);
        });
    } catch (e) {
        return {
            msg: e
        };
    }
}
 
 mediafire = async(url) => {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);

        const type = $(".dl-btn-cont .icon").attr("class")?.split("archive")[1]?.trim() || "unknown";
        const filename = $(".dl-btn-label").attr("title") || "unknown";
        const sizeMatch = $('.download_link .input').text().trim().match(/\((.*?)\)/);
        const size = sizeMatch ? sizeMatch[1] : "unknown";
        const ext = filename.split(".").pop().toLowerCase();
        const mimetype = lookup(ext) || `application/${ext}`;
        const download = $(".input").attr("href") || null;

        return { filename, type, size, ext, mimetype, download };
    } catch (error) {
        throw new Error("Gagal mengambil data dari link tersebut");
    }
}


 
 krakenfiles = (url) => {
    return new Promise(async(resolve, reject) => {
         if (!/krakenfiles.com/.test(url)) return new Error("Input Url from Krakenfiles !")
         await axios.get(url).then(async(a) => {
           let $ = cheerio.load(a.data);
           let result = {
              metadata: {},
              buffer: null
          }
          result.metadata.filename = $(".coin-info .coin-name h5").text().trim();
          $(".nk-iv-wg4 .nk-iv-wg4-overview li").each((a, i) => {
              let name = $(i).find(".sub-text").text().trim().split(" ").join("_").toLowerCase()
              let value = $(i).find(".lead-text").text()
              result.metadata[name] = value
          })
         $(".nk-iv-wg4-list li").each((a, i) => {
              let name = $(i).find("div").eq(0).text().trim().split(" ").join("_").toLowerCase()
              let value = $(i).find("div").eq(1).text().trim().split(" ").join(",")
              result.metadata[name] = value
         })  
         result.metadata.thumbnail = "https:" + $("video").attr("poster");
         let downloads = "https:" + $("video source").attr("src");
         
         let res = await axios.get(downloads, {
              headers: {
               "User-Agent": "Posify/1.0.0",
               "Referer": "krakenfiles.com",
               "Accept": "krakenfile.com",
               "token": $("#dl-token").val()
             },
             responseType: "arraybuffer"
         }).catch(e => e.response);
         result.buffer = res.data
         resolve(result)
         }).catch((e) => {
              reject({
                  msg: "Failed to fetch data"
              })
         })
    })
}

 aiodlv2 = async(url) => {
  try {
    const { data } = await axios.get("https://steptodown.com/");
    const $ = cheerio.load(data);
    const token = $("input[name='token']").val();

    const response = await axios.post("https://steptodown.com/wp-json/aio-dl/video-data/", new URLSearchParams({ url, token }), {
      headers: {
        "cookie": "PHPSESSID=bc791a81f8bf81bc03669e3b06afd939; pll_language=en",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15"
      }
    });

    return response.data;
  } catch (error) {
    throw error;
    }
  }

 aiodl = async(url) => {
    try {
        const apiUrl = 'https://vget.xyz/dl';
        const payload = new URLSearchParams();
        payload.append('url', url);

        const headers = {
            'authority': 'vget.xyz',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/           apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded',
            'origin': 'null',
            'pragma': 'no-cache',
            'sec-ch-ua': '"Not:A-Brand";v="99", "Chromium";v="112"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
        };

        const response = await axios.post(apiUrl, payload.toString(), { headers });
        const html = response.data;
        const $ = cheerio.load(html);
        let downloadLink = null;

        if (url.includes('instagram.com')) {
        const row = $('td').filter(function() {
        return $(this).text().trim() === '5 - 750x1333';
    }).closest('tr');
    downloadLink = row.find('button.btn-download').attr('data')?.replace(/&amp;/g, '&');

   } else if (url.includes('xnxx.com')) {
    const row = $('td').filter(function() {
        return $(this).text().trim() === 'high - unknown';
    }).closest('tr');
    downloadLink = row.find('button.btn-download').attr('data')?.replace(/&amp;/g, '&');

   } else if (url.includes('facebook.com')) {
    const row = $('td').filter(function() {
        return $(this).text().trim() === 'hd - unknown';
    }).closest('tr');
    downloadLink = row.find('button.btn-download').attr('data')?.replace(/&amp;/g, '&');

   } else if (url.includes('x.com')) {
    const row = $('td').filter(function() {
        return $(this).text().trim() === 'http-2176 - 1280x720';
    }).closest('tr');
    downloadLink = row.find('button.btn-download').attr('data')?.replace(/&amp;/g, '&');
}


        const title = $('dt:contains("Title:")').next('dd').text().trim();
        const uploader = $('dt:contains("Uploader:")').next('dd').text().trim();
        const likes = parseInt($('dt:contains("Likes:")').next('dd').text().trim(), 10);
        const duration = $('dt:contains("Duration:")').next('dd').text().trim();
        const uploadDate = $('dt:contains("Upload_date:")').next('dd').text().trim();
        const webpage = $('dt:contains("Webpage:")').next('dd').find('a').attr('href');
         downloadLink = $('button.btn-download').attr('data');

        const result = {
            title: title || null,
            uploader: uploader || null,
            likes: isNaN(likes) ? null : likes,
            duration: duration || null,
            uploadDate: uploadDate || null,
            webpage: webpage || null,
            url: downloadLink || null
        };

        return result;

    } catch (error) {
        console.error('Error fetching data:', error.message);
        throw error;
    }
}


capcut = async(url) => {
  const response = await fetch(url);
  const data = await response.text();
  const $ = cheerio.load(data);

  return {
    status: 200,
    creator: "Luthfi Joestars",
    video: $("video").attr("src"),
    thumbnail: $("video").attr("poster"),
  };
}
 
 snapsave = async (url) => {
  return new Promise(async (resolve) => {
    try {
      function decodeSnapApp(args) {
        let [h, u, n, t, e, r] = args;
        function decode(d, e, f) {
          const g = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/'.split('');
          let h = g.slice(0, e);
          let i = g.slice(0, f);
          let j = d.split('').reverse().reduce(function (a, b, c) {
            if (h.indexOf(b) !== -1)
              return a += h.indexOf(b) * (Math.pow(e, c));
          }, 0);
          let k = '';
          while (j > 0) {
            k = i[j % f] + k;
            j = (j - (j % f)) / f;
          }
          return k || '0';
        }
        r = '';
        for (let i = 0, len = h.length; i < len; i++) {
          let s = "";
          while (h[i] !== n[e]) {
            s += h[i]; i++;
          }
          for (let j = 0; j < n.length; j++)
            s = s.replace(new RegExp(n[j], "g"), j.toString());
          r += String.fromCharCode(decode(s, e, 10) - t);
        }
        return decodeURIComponent(encodeURIComponent(r));
      }

      function getEncodedSnapApp(data) {
        return data.split('decodeURIComponent(escape(r))}(')[1]
          .split('))')[0]
          .split(',')
          .map(v => v.replace(/"/g, '').trim());
      }

      function getDecodedSnapSave(data) {
        return data.split('getElementById("download-section").innerHTML = "')[1]
          .split('"; document.getElementById("inputData").remove(); ')[0]
          .replace(/\\(\\)?/g, '');
      }

      function decryptSnapSave(data) {
        return getDecodedSnapSave(decodeSnapApp(getEncodedSnapApp(data)));
      }

      const html = await got.post('https://snapsave.app/action.php?lang=id', {
        headers: {
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
          'content-type': 'application/x-www-form-urlencoded',
          'origin': 'https://snapsave.app',
          'referer': 'https://snapsave.app/id',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
        },
        form: { url }
      }).text();

      const decode = decryptSnapSave(html);
      const $ = cheerio.load(decode);
      const results = [];

      if ($('table.table').length || $('article.media > figure').length) {
        const thumbnail = $('article.media > figure').find('img').attr('src');
        $('tbody > tr').each((_, el) => {
          const $el = $(el);
          const $td = $el.find('td');
          const resolution = $td.eq(0).text();
          let _url = $td.eq(2).find('a').attr('href') || $td.eq(2).find('button').attr('onclick');
          const shouldRender = /get_progressApi/ig.test(_url || '');
          if (shouldRender) {
            _url = /get_progressApi\('(.*?)'\)/.exec(_url || '')?.[1] || _url;
          }
          results.push({
            resolution,
            thumbnail,
            url: _url,
            shouldRender
          });
        });
      } else {
        $('div.download-items__thumb').each((_, tod) => {
          const thumbnail = $(tod).find('img').attr('src');
          const btns = $(tod).next('div.download-items__btn'); // Asumsi tombol berada tepat setelah thumbnail
          btns.each((_, ol) => {
            let _url = $(ol).find('a').attr('href');
            if (!/https?:\/\//.test(_url || '')) _url = `https://snapsave.app${_url}`;
            results.push({
              thumbnail,
              url: _url
            });
          });
        });
      }

      if (!results.length) return resolve({ msg: `Blank data` });
      return resolve({ data: results });
    } catch (e) {
      return resolve({ msg: e.message });
    }
  });
}

 brat = async(text) => {
   const code = `
      const { chromium } = require('playwright');

      (async () => {
         const browser = await chromium.launch({ headless: true });
         const page = await browser.newPage();
         await page.goto('https://www.bratgenerator.com/');
         await page.click('#toggleButtonWhite');
         await page.fill('#textInput', '${text}');
         await page.locator('#textOverlay').screenshot({ path: 'screenshot.png' });
         await browser.close();
      })();
   `;

   const url = 'https://try.playwright.tech/service/control/run';
   const headers = { 'content-type': 'application/json', 'origin': 'https://try.playwright.tech' };

   try {
      const { data } = await axios.post(url, { code, language: 'javascript' }, { headers });
      return {
         url: 'https://try.playwright.tech' + data.files[0].publicURL,
         fileName: data.files[0].fileName,
         extension: data.files[0].extension
      };
   } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
   }
}

  uploadFile = async (buffer) => {
    try {
      const { ext, mime } = (await fileTypeFromBuffer(buffer)) || {};
      const formData = new FormData();
      formData.append('fileToUpload', buffer, {
        filename: `upload.${ext}`,
        contentType: mime,
      });
      formData.append('reqtype', 'fileupload');

      const response = await axios.post('https://catbox.moe/user/api.php', formData, {
        headers: {
          ...formData.getHeaders(),
          "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36"
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading to Catbox:', error);
      throw new Error('Upload failed');
        }
      }
  
}

export default new Scraper();