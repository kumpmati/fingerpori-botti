var ws = new WebSocket("ws://localhost:8080");
var img = document.getElementById("comic_strip");
var comic_date = document.getElementById("comic_date");

ws.onopen = () => {
  console.log("yhdistetty live-feediin");
};

ws.onmessage = d => {
  let _d = JSON.parse(d.data);
  if (_d.status) {
    //change to new image
    img.src = _d.data;
    document.getElementById("comic_div").style.opacity = 1;
    comic_date.innerHTML = _d.date;
  }
};
