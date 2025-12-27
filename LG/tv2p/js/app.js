const url = "https://pgy.no-ip.hu/tv2/api/"
//const url = "http://localhost:8085/tv2/api/"
const hls = new Hls()
const video = getElement('video')
hls.attachMedia(video)
const searchInput = getElement('#search-input')
const loggerDiv = getElement('#logger')

document.addEventListener('DOMContentLoaded', function () {
  App.init();
});

const App = {
  init: function () {
    Navigation.init()
    load()
  }
}

function get(u, f) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url + u, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if(xhr.status === 200) {
          const res = JSON.parse(xhr.responseText)
          console.log('http response', res)
          f(res)
      } else {
          console.error(xhr)
          show('#home')
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

function playVideo(url) {
    console.log('play video', url)
    show('#loading')
    get('getVideoUrl?url=' + url, r => {
        if (r && r.value) {
            history.pushState({}, undefined, '')
            if (Hls.isSupported()) {
                show('#video')
                hls.loadSource(r.value)
                hls.startLoad()
                video.focus()
            } else {
                video.src = r.value
            }
        } else {
            show('#home')
        }
    })
}

function stopVideo() {
    video.pause();
    video.currentTime = 0;
    video.removeAttribute('src');
    video.load();
    show('#home')
}

function clickToButton() {
    State.focused.click()
}

function show(s) {
    hide(State.currentView)
    State.currentView = s
    const e = getElement(s)
    if (e) {
        e.classList.remove('hidden')
    }
}

function hide(s) {
    const e = getElement(s)
    if (e) {
        e.classList.add('hidden')
    }
}

function scrollIntoView(e, pos) {
    e.scrollIntoView({
        behavior: 'instant',
        block: 'center',
        inline: pos
    })
}

function load(u, skipHistory) {
    show('#loading')
    u = u ? u : 'load'
    console.log('load', u)
    State.init();
    Api.loadItems(u, r => {
        State.grid = r
        HomeView.render()
        if (!skipHistory) {
            history.pushState({url: u}, '', '')
        }
    })
}

function searchText() {
    load('search?text=' + searchInput.value)
}

