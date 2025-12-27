const Navigation = {
  init: function () {
    document.addEventListener('keydown', this.handleKey.bind(this));
  },

  handleKey: function (e) {
    log('key: ' + e.keyCode + " " + e.key)
    e.preventDefault()
    switch(State.currentView) {
      case '#home':
        this.handleKeyHome(e);
        break;
      case '#video':
        this.handleKeyVideo(e);
        break;
    }
  },

  handleKeyHome: function(e) {
    switch (e.key) {
      case 'Backspace':
        this.goBack(); break;
      case 'ArrowLeft':
        this.left(); break;
      case 'ArrowRight':
        this.right(); break;
      case 'ArrowUp':
        this.up(); break;
      case 'ArrowDown':
        this.down(); break;
      case 'Space':
      case 'Enter': this.enter(); break;
    }
  },

  handleKeyVideo: function(e) {
    switch (e.key) {
      case 'Backspace':
        stopVideo()
        document.exitFullscreen()
        break;
      default: log(e.keyCode)
    }
  },

  left: function () {
    this.navigate(-1, 0)
  },

  right: function () {
    this.navigate(1, 0)
  },

  up: function () {
    State.x = 0
    this.navigate(0, -1)
  },

  down: function () {
    State.x = 0
    this.navigate(0, 1)
  },

  navigate: function (dx, dy) {
    const x = State.x + dx
    const y = State.y + dy
    const cell = getCell(x, y)
    if (cell) {
      State.x = x
      State.y = y
      HomeView.updateFocus()
    }
  },

  enter: function () {
    clickToButton()
  },

  goBack: function () {
    const pages = State.pages
    if (pages.length > 1) {
      load(pages.pop(), true)
    } else {
      log('exit')
    }
  }
};
