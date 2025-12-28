const Navigation = {
  init: function () {
    document.addEventListener('keydown', this.handleKey.bind(this))
    window.addEventListener('popstate', (event) => {
      console.log('History változott')
      console.log('State:', event.state)
      if (State.currentView === '#video') {
        stopVideo()
      } else {
        if (event.state) {
          load(event.state.url, true)
        } else {
          history.back()
        }
      }
    })
  },

  handleKey: function (e) {
    console.log('keyCode:' + e.keyCode + " key:" + e.key + ' view:' + State.currentView)
    switch(State.currentView) {
      case '#loading':
        e.preventDefault()
        break;
      case '#home':
        this.handleKeyHome(e)
        break
      case '#video':
        this.handleKeyVideo(e)
        break
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
      //e.preventDefault()
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
        case ' ':
        case 'Enter': this.enter(); break;
      }
    }
    switch (e.keyCode()) {
      case 415: //play
        clickToButton()
        break
    }
  },

  handleKeyVideo: function(e) {
    //e.preventDefault()
    switch (e.key) {
      case 'Escape':
      case 'Backspace':
        this.goBack()
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        player.controls = true
        break;

    }
    switch (e.keyCode()) {
      case 413: //stop
        this.goBack()
        break
      case 415: //play
        if (player.paused) {
          player.play()
        }
        break;
      case 19: //pause
        if (!player.paused) {
          player.pause()
        }
        break
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
    this.navigateTo(x, y)
    if (y < 0) {
      searchInput.focus()
      scrollIntoView(searchInput, 'center')
    }
  },

  navigateTo(x, y) {
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

  removeFocusFromSearchInput(e) {
    HomeView.updateFocus()
    searchInput.blur()
    e.preventDefault()
  },

  goBack: function () {
    searchInput.value = ''
    history.back()
  }
};
