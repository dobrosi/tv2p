var Navigation = {
  init: function () {
    document.addEventListener('keydown', this.handleKey.bind(this));
  },

  handleKey: function (e) {
    switch (e.keyCode) {
      case 37: this.left(); break;
      case 38: this.up(); break;
      case 39: this.right(); break;
      case 40: this.down(); break;
      case 13: this.enter(); break;
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
    var x = State.x + dx
    var y = State.y + dy
    var cell = getCell(x, y)
    if (cell) {
      State.x = x
      State.y = y
      HomeView.updateFocus()
    }
  },

  enter: function () {
    clickToButton()
  }
};
