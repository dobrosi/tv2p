const HomeView = {
  render: function () {
    let html = '<div class="m-2 p-2 text-center">'
    State.grid.siteRows.forEach((row, y) => {
      if (row.title) {
        html += '<div class="row title">' + row.title + '</div>'
      }
      html += '<div class="row hide-scrollbar" data-y="' + y + '">'
      row.siteItems.forEach((item ,x) => {
        if (item.imageUrl) {
          html += '<div tabindex="0" onclick=playVideo("' + item.url+ '") class="p-3 m-3 col" data-x="' + x + '"><img class="pic" src="' + item.imageUrl + '" alt="' + item.title + '">' + item.title + '</div>'
        } else {
          html += '<div onclick=load("load?url=' + item.url+ '") class="p-3 m-3 col" data-x="' + x + '">' + item.title + '</div>'
        }
      })
      html += '</div>';
    });
    html += '</div>'
    getElement('#home-content').innerHTML = html;
    this.updateFocus()
    show('#home')
  },

  updateFocus: function () {
    this.removeFocus()

    const focused = State.focused = getCell(State.x, State.y)
    console.log("focused", focused)
    if (focused) {
      focused.classList.add('focused')
      scrollIntoView(focused, 'nearest')
    }
  },
  removeFocus() {
    const items = getElements('.col');
    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove('focused');
    }
  }
};
