//used to get request the page
const https = require("https");
//used to parse html data
const cheerio = require("cheerio");

class Requester {
  constructor() {}

  getComic(pageObject, callback) {
    var htmlBody = "";
    //GET the html page
    https.get(pageObject.url, d => {
      d.on("data", chunk => (htmlBody += chunk.toString()));
      //when page is fully received
      d.on("end", () => {
        //parse page using cheerio
        const $ = cheerio.load(htmlBody);

        //try getting the image element

        try {
          let img;
          if (pageObject.hasOwnProperty("attrib")) {
            img = $(pageObject.element)[0].getAttribute(pageObject.attrib);
            console.log("hello" + img);
          } else {
            img = $(pageObject.element)[0].attribs.src;
          }
          let d = new Date().toLocaleDateString();
          callback({
            page: pageObject.page,
            date: d,
            data: img,
            panelId: pageObject.panelId
          });
        } catch (e) {
          callback({
            page: pageObject.page,
            error: e.message.toString()
          });
        }
      });
    });
  }
}

module.exports = new Requester();
