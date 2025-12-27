const State = {
  currentView: undefined,
  focused: undefined,
  x: undefined,
  y: undefined,
  grid: undefined,

  init: function () {
    this.currentView = '#loading'
    this.focused = undefined
    this.x = 0
    this.y = 0
    this.grid = {}
  }
};
