var Api = {
  loadItems: function (u) {
    State.init()
    let q = u ? '?url=' + u : ''
    get('load' + q, r => {
      State.grid = r
      HomeView.render()
    })
  }
};
