/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

import { Product } from './components/Product.js';
import { Cart } from './components/Cart.js';
import { select, settings, classNames } from './settings.js';

const app = {
  initData: function() {
    const thisApp = this;
    const url = settings.db.url + '/' + settings.db.product;
    thisApp.data = {};

    fetch(url)
      .then(function(rawResponse) {
        return rawResponse.json();
      })
      .then(function(parsedResponse) {
        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;
        /* execute initMenu method */
        thisApp.initMenu();
      });
  },
  initMenu: function() {
    const thisApp = this;
    for (let productData in thisApp.data.products) {
      new Product(
        thisApp.data.products[productData].id,
        thisApp.data.products[productData]
      );
    }
  },
  initCart: function() {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(e) {
      app.cart.add(e.detail.product);
    });
  },
  activatePage: function(pageId) {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    const navElem = document.querySelector(select.containerOf.nav);
    let check;
    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
      if (
        (link.getAttribute('href') == '#' + pageId) &
        ('#' + pageId == '#home')
      )
        check = true;
    }

    if (check) {
      cartElem.classList.add('none');
      navElem.classList.add('none');
    } else {
      cartElem.classList.remove('none');
      navElem.classList.remove('none');
    }
  },
  initPages: function() {
    const thisApp = this;

    thisApp.pages = Array.from(
      document.querySelector(select.containerOf.pages).children
    );
    thisApp.navLinks = Array.from(document.querySelectorAll(select.nav.links));
    // thisApp.activatePage(thisApp.pages[0].id);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function(event) {
        event.preventDefault();
        const clickedElement = this;
        const id = clickedElement.getAttribute('href').replace('#', '');
        thisApp.activatePage(id);
        window.location.hash = '#/' + id;
      });
    }
  },

  init: function() {
    const thisApp = this;
    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
  }
};

app.init();
