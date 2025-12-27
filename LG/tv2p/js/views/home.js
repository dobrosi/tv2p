var HomeView = {
  render: function () {
    var html = '<div class="m-2 p-2 text-center">'
    State.grid.siteRows.forEach((row, y) => {
      html += '<div class="row title">' + row.title + '</div><div class="row hide-scrollbar" data-y="' + y + '">'
      row.siteItems.forEach((item ,x) => {
        if (item.imageUrl) {
          html += '<div onclick=playVideo("' + item.url+ '") class="p-3 m-3 col" data-x="' + x + '"><img class="pic" src="' + item.imageUrl + '" alt="' + item.title + '">' + item.title + '</div>'
        } else {
          html += '<div onclick=load("' + item.url+ '") class="p-3 m-3 col" data-x="' + x + '">' + item.title + '</div>'
        }
      })
      html += '</div>';
    });
    html += '</div>'
    getElement('#content').innerHTML = html;
    this.updateFocus();
  },

  updateFocus: function () {
    var items = getElements('.col');
    for (var i = 0; i < items.length; i++) {
      items[i].classList.remove('focused');
    }

    var focused = getCell(State.x, State.y)
    log(focused)
    if (focused) {
      focused.classList.add('focused')
      
      focused.scrollIntoView({
        behavior: 'instant',
        block: 'nearest',
        inline: 'nearest'
      })
    }
  }
};
