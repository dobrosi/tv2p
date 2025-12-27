const Navigation = {
  init: function () {
    document.addEventListener('keydown', this.handleKey.bind(this));
  },

  handleKey: function (e) {
    console.log('keyCode:' + e.keyCode + " key:" + e.key)
    switch(State.currentView) {
      case '#home':
        this.handleKeyHome(e);
        break;
      case '#video':
        this.handleKeyVideo(e);
        break;
    }
  },

  handleSearch (e) {
    switch (e.key) {
      case 'Escape':
      case 'ArrowDown':
        this.removeFocusFromSearchInput(e)
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'Backspace':
        if (searchInput.value === '') {
          this.removeFocusFromSearchInput(e)
        }
        break;
      case 'Enter':
        searchText()
    }
  },

  handleKeyHome: function(e) {
    if (document.activeElement === searchInput) {
      this.handleSearch(e);
    } else {
      e.preventDefault()
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
    }
  },

  handleKeyVideo: function(e) {
    switch (e.key) {
      case 'Backspace':
        e.preventDefault()
        stopVideo()
        document.exitFullscreen()
        break;
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
    if (y < 0) {
      HomeView.removeFocus()
      searchInput.focus()
      scrollIntoView(searchInput, 'center')
    }
  },

  enter: function () {
    clickToButton()
  },

  removeFocusFromSearchInput(e) {
    HomeView.updateFocus()
    searchInput.blur()
    e.preventDefault()
  },

  goBack: function () {
    const pages = State.pages
    if (pages.length > 1) {
      load(pages.pop(), true)
    } else {
      console.log('exit')
      webOS.service.request(
          "luna://com.webos.applicationManager",
          {
            method: "close",
            parameters: {
              id: "com.github.dobrosi.tv2p" // a te app ID-d
            },
            onSuccess: function(response) {
              console.log("Alkalmazás bezárva:", response);
            },
            onFailure: function(err) {
              console.log("Nem sikerült bezárni:", err);
            }
          }
      );
    }
    searchInput.value = ''
  }
};
