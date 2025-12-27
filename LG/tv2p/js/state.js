const State = {
  currentView: undefined,
  focused: undefined,
  x: undefined,
  y: undefined,
  grid: undefined,

  init: function () {
    this.initFocus()
    this.currentView = '#loading'
    this.grid = {}
  },

  initFocus: function () {
    this.focused = undefined
    this.x = 0
    this.y = 0
  }
};
