const requester = new require("./requester");
const WebSocket = require("ws");
const express = require("express");
let app = express();
let comic = { status: 0, data: 0, date: 0 };
let url = "https://www.kaleva.fi/fingerpori/";

app.use(express.static("html"));

app.listen(80, () => console.log("express: 80"));

const wss = new WebSocket.Server({ port: 8080 }, () => {
  console.log("ws: 8080");
});

wss.on("connection", ws => {
  //send newest comic
  if (comic.status) {
    console.log(
      `${new Date().toLocaleString()}: lähetetään viimeisin fingerpori`
    );
    try {
      ws.send(JSON.stringify(comic));
    } catch (e) {
      throw err;
    }
  } else {
    console.log(
      `${new Date().toLocaleString()}: hankitaan viimeisin fingerpori`
    );
    requester.getComic(url, data => ws.send(JSON.stringify(data)));
  }
});

//check for new comic every 60 seconds
setInterval(check, 1000 * 60 * 60 * 12);

function check() {
  //fetch latest comic
  requester.getComic("https://www.kaleva.fi/fingerpori/", data => {
    //if fetching comic was successful and the comic
    //is different to the previous one
    //send the new comic to all the clients
    if (data.status == 1 && data.data != comic.data) {
      comic = data;
      console.log(`${new Date().toLocaleString()}: UUSI FINGERPORI LÖYDETTY`);
      //broadcast to all connected clients
      wss.clients.forEach(function each(ws) {
        if (ws.readyState === WebSocket.OPEN) {
          //remember to stringify data
          ws.send(JSON.stringify(comic));
        }
      });
    }
  });
}

check();
