var Api = {
  loadItems: function (u) {
    var q = u ? '?url=' + u : ''
    get('load' + q, r => {
      State.grid = r
      HomeView.render();
    })
  }
};
