const requester = new require("./requester");
const WebSocket = require("ws");
const express = require("express");
const fs = require("fs");
let app = express();
//example comic: { status: 0, data: 0, date: 0 };
let refresh_interval = 1000 * 60 * 60; //refresh hourly

//load pre-existing comic urls from file
let preloadedComics = loadComics();

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
    panelId: 1
  },
  {
    page: "Iltalehti",
    url: "https://www.iltalehti.fi/fingerpori/",
    element:
      "#news-container>div>main>div>div.main-column-content.show-true>div>div:nth-child(2)>div.comic-container>div>img",
    panelId: 2
  },
  {
    page: "Aamulehti",
    url: "https://www.aamulehti.fi/fingerpori/",
    element: "#pipe-1537868390035 > div.sc-dAOnuy.lmmNIK > img",
    panelId: 3
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
            //only add comics that aren't preloaded
            if (
              !JSON.stringify(preloadedComics).includes(JSON.stringify(comic))
            ) {
              preloadedComics.push(comic);
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
      saveComics();
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

function saveComics() {
  fs.writeFileSync(
    "./comics.txt",
    JSON.stringify(preloadedComics, false, "\r"),
    "utf-8"
  );
  console.log("saved comics to file");
}

function loadComics() {
  let savedComics = fs.readFileSync("./comics.txt", "utf-8");
  try {
    console.log("loaded comics");
    return JSON.parse(savedComics);
  } catch (err) {
    console.log(err.message);
  }
}
