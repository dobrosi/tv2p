var Api = {
  loadItems: function (u) {
    State.init()
    get(u, r => {
      State.grid = r
      HomeView.render()
    })
  }
};
