const Api = {
  loadItems: function (u, f) {
    State.init()
    get(u, r => {
      f(r)
    })
  }
}
