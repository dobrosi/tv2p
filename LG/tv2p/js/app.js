document.addEventListener('DOMContentLoaded', function () {
  App.init();
});

var App = {
  init: function () {
    State.init();
    Navigation.init();
    Api.loadItems();
  }
};

const url = "https://pgy.no-ip.hu/tv2/api/"

function get(u, f) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url + u, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if(xhr.status === 200) {
        var res = JSON.parse(xhr.responseText)
        log(res)
        f(res)
      } else {
          console.error(xhr)
      }
    }
  }
  xhr.send();
}

function getElement(s) {
  return document.querySelector(s)
}

function getElements(s) {
  return document.querySelectorAll(s)
}

function getCell(x, y) {
  return getElement('.row[data-y="' + y + '"] > .col[data-x="' + x + '"]')
}

function log(m) {
  console.log(m)  
}

function playVideo(url) {
  get('getVideoUrl?url=' + url, r => {
      show('#player')
      var video = getElement('video')
      video.requestFullscreen().then(() => {})
      video.focus()
      video.controls = false
      if (Hls.isSupported()) {
        const hls = new Hls()
        hls.loadSource(r.value)
        hls.attachMedia(video)
        hls.startLoad()
        hls.createController({}, {})
      } else {
        video.src = r.value
      }
  })
}

function load(u) {
  log(u)
  Api.loadItems(u)
}

function stopVideo() {
  hide('#player')
}

function show(s) {
  getElement(s).classList.remove('hidden')
}

function hide(s) {
  getElement(s).classList.add('hidden')
}
