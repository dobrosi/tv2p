const HomeView = {
  render: function () {
    let html = '<div class="pt-3">'
    State.grid.siteRows.forEach((row, y) => {
      if (row.title) {
        html += '<div class="row1 title pt-3 pb-2">' + row.title + '</div>'
      }
      html += '<div class="d-flex row1 hide-scrollbar" data-y="' + y + '">'
      row.siteItems.forEach((item ,x) => {
        if (item.imageUrl) {
          if (item.title === '') { // Hasonlo musorok
            html += '<div class="p-2 col1" onclick=load("load?url=' + item.url + '") data-x="' + x + '">'
                + '<img class="pic2" src="' + item.imageUrl + '" alt="' + item.title + '">' + item.title + '</div>'
          } else { // Video link
            html += '<div class="p-2 col1" onclick="playVideo(\'' + item.url + '\', ' + x + ', ' + y + ')" data-x="' + x + '">'
                + '<img class="pic" src="' + item.imageUrl + '" alt="' + item.title + '">' + item.title + '</div>'
          }
        } else { // Mutasd mindet!
          html += '<div class="p-2 col1 d-flex justify-content-center align-items-center" onclick=load("load?url=' + item.url+ '") data-x="' + x + '">'
              + item.title
              + '</div>'
        }
      })
      html += '</div>';
    });
    html += '</div>'
    getElement('#home-content').innerHTML = html;
    show('#home')
    this.updateFocus()
  },

  updateFocus: function () {
    searchInput.blur()
    this.removeFocus()
    const focused = State.focused = getCell(State.x, State.y)
    if (focused) {
      focused.classList.add('focused')
      scrollIntoView(focused, 'nearest')
    }
  },
  removeFocus() {
    const items = getElements('.col1');
    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove('focused');
    }
  }
};
