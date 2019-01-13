var ws = new WebSocket("ws://localhost:9000");
var img = document.getElementById("comic_strip");
var comic_date = document.getElementById("comic_date");

ws.onopen = () => {
  console.log("yhdistetty live-feediin");
};

ws.onmessage = d => {
  //document.querySelector("#panels").innerHTML = "";

  let _d = JSON.parse(d.data);

  for (let item of _d) {
    let exists = false;
    //do not update existing panels
    for (let html_item of document.querySelector("#panels").childNodes) {
      //
      if (item.data == html_item.querySelector("img").src) {
        exists = true;
      }
    }
    //check that image is not an error and that it does not already exist
    if (!item.hasOwnProperty("error") && !exists) {
      //create image
      let img = document.createElement("img");
      img.src = item.data;
      img.className = "comic_panel";

      //create website name text
      let label = document.createElement("h1");
      label.innerHTML = `${item.page} | ${item.date}`;
      label.className = "comic_panel_page";

      //create div to contain the image
      let container = document.createElement("div");
      container.className = "comic_panel_container";
      //append image
      container.append(label);
      container.append(img);

      document.querySelector("#panels").prepend(container);
    }
  }

  //remove extra panels
  let panels = document.querySelector("#panels");
  if (panels.childElementCount > 8) {
    for (let i = panels.childElementCount - 1; i > 8; i--)
      panels.removeChild(panels.childNodes[i]);
  }
};
