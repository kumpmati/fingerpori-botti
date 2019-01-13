const requester = new require("./requester");
const WebSocket = require("ws");
const express = require("express");
let app = express();
//example comic: { status: 0, data: 0, date: 0 };
let refresh_interval = 1000 * 60 * 60;

let preloadedComics = [];

let urls = [
  {
    page: "Etelä-Suomen Sanomat",
    url: "https://www.ess.fi/sarjakuvat/fingerpori/",
    element: "#sarjis-lataalisaa article:nth-of-type(1) .image-wrapper a img",
    panelId: 0
  },
  {
    page: "Kaleva",
    url: "https://www.kaleva.fi/fingerpori/",
    element: "img[class=comics__strip__image]",
    panelId: 2
  },
  {
    page: "HS",
    url: "https://www.hs.fi/fingerpori/",
    element:
      "#page-main-content div.block.cartoon div ol li:nth-child(1) div a figure img",
    attrib: "srcset"
  },
  {
    page: "Iltalehti",
    url: "https://www.iltalehti.fi/fingerpori/",
    element:
      "#news-container>div>main>div>div.main-column-content.show-true>div>div:nth-child(2)>div.comic-container>div>img",
    panelId: 1
  }
];

//start express http server
app.use(express.static("html"));
app.listen(80, () => console.log("website is up"));

//start websocket server
const wss = new WebSocket.Server({ port: 9000 }, () => {
  console.log("live feed started");
});

//websocket events
wss.on("connection", ws => {
  //send all comics
  ws.send(JSON.stringify(preloadedComics));
});

function promiseNewComics() {
  return new Promise((resolveFinal, rejectFinal) => {
    let comicPromises = [];
    for (let page of urls) {
      comicPromises.push(
        new Promise((resolve, reject) => {
          requester.getComic(page, comic => {
            //loop through preloaded comics
            if (
              !JSON.stringify(preloadedComics).includes(JSON.stringify(comic))
            ) {
              preloadedComics.push(comic);
            } else {
            }
            resolve(comic);
          });
        })
      );
    }

    Promise.all(comicPromises)
      .then(d => {
        resolveFinal(d);
      })
      .catch(d => {
        rejectFinal(d);
      });
  });
}

setInterval(() => {
  promiseNewComics()
    .then(d => {
      console.log("checked for new comics");
      wss.broadcast(JSON.stringify(preloadedComics));
    })
    .catch(e => {
      console.log(e.message);
    });
}, refresh_interval);

// Broadcast to all.
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

promiseNewComics();
console.log("checked for new comics");
