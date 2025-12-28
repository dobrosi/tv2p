const url = "https://pgy.no-ip.hu/tv2/api/"
//const url = "http://localhost:8085/tv2/api/"
const hls = new Hls()
const player = getElement('#player')
const searchInput = getElement('#search-input')
const loggerInput = getElement('#logger')
const playbackRates = [0.1, 0.2, 0.5, 1, 2, 4, 8]

document.addEventListener('DOMContentLoaded', function () {
  App.init();
});
searchInput.addEventListener('focus', function () {
    HomeView.removeFocus()
    State.initFocus()
});

const App = {
    init: function () {
        hls.attachMedia(player)
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

const originalLog = console.log;

// Új console.log
console.log = function(...args) {
    const timestamp = new Date().toISOString();
    originalLog.apply(console, [`[${timestamp}]`, ...args]);
    loggerInput.value = args[0]
}

function getElement(s) {
  return document.querySelector(s)
}

function getElements(s) {
    return document.querySelectorAll(s)
}

function getCell(x, y) {
    return getElement('.row1[data-y="' + y + '"] > .col1[data-x="' + x + '"]')
}

function playVideo(x, y, url) {
    console.log('play video', url)
    Navigation.navigateTo(x, y)
    show('#loading')
    get('getVideoUrl?url=' + url, r => {
        if (r && r.value) {
            history.pushState({}, undefined, '')
            if (Hls.isSupported()) {
                show('#video')
                hls.loadSource(r.value)
                hls.startLoad()
                player.focus()
            } else {
                player.src = r.value
            }
        } else {
            show('#home')
        }
    })
}

function stopVideo() {
    player.pause();
    player.currentTime = 0;
    player.removeAttribute('src');
    player.load();
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
    if (s !== '#home') {
        const e = getElement(s)
        if (e) {
            e.classList.add('hidden')
        }
    }
}

function scrollIntoView(e, pos) {
    e.scrollIntoView({
        behavior: 'smooth',
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
    const v = searchInput.value
    if (v && v.length > 0) {
        load('search?text=' + searchInput.value)
    }
}

