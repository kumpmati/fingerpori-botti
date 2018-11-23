//used to get request the page
const https = require("https");
//used to parse html data
const cheerio = require("cheerio");

class Requester {
  constructor() {}

  getComic(url, callback) {
    https.get(url, res => {
      let rawData = "";
      let ret = { status: 0, data: "" };
      res.on("data", chunk => (rawData += chunk.toString()));
      res.on("end", () => {
        //load html to be parsed
        const $ = cheerio.load(rawData);
        try {
          //return the comic url
          ret = {
            status: 1,
            data: $("img[class=comics__strip__image]")[0].attribs.src,
            date: new Date().toLocaleDateString()
          };
        } catch (e) {
          //error happened while parsing html
          ret = { status: 0, data: e.message };
        }
        callback(ret);
      });
      //
      res.on("error", e => {
        //error happened while sending request
        callback({ status: -1, data: e.message });
      });
    });
  }
}

module.exports = new Requester();
