import { select, classNames, templates } from '../settings.js';
import { utils } from '../utils.js';
import { AmountWidget } from './AmountWidget.js';

export class Product {
  constructor(id, data) {
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    thisProduct.initAccordion();
  }

  renderInMenu() {
    const thisProduct = this;

    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);

    /* create element using utils.createDOMFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);

    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements() {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(
      select.menuProduct.clickable
    );
    thisProduct.form = thisProduct.element.querySelector(
      select.menuProduct.form
    );
    thisProduct.formInputs = thisProduct.form.querySelectorAll(
      select.all.formInputs
    );
    thisProduct.cartButton = thisProduct.element.querySelector(
      select.menuProduct.cartButton
    );
    thisProduct.priceElem = thisProduct.element.querySelector(
      select.menuProduct.priceElem
    );
    thisProduct.imageWrapper = thisProduct.element.querySelector(
      select.menuProduct.imageWrapper
    );
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(
      select.menuProduct.amountWidget
    );
  }

  initAccordion() {
    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) */
    const trigger = thisProduct.accordionTrigger;

    /* START: click event listener to trigger */
    trigger.addEventListener('click', function(e) {
      /* prevent default action for event */

      e.preventDefault();

      /* toggle active class on element of thisProduct */
      trigger.parentElement.classList.toggle('active');

      /* find all active products */
      const activeProducts = document.querySelectorAll(
        select.all.menuProductsActive
      );

      /* START LOOP: for each active product */
      for (const activeProduct of activeProducts) {
        /* START: if the active product isn't the element of thisProduct */
        if (thisProduct.element !== activeProduct) {
          /* remove class active for the active product */
          activeProduct.classList.remove('active');
          /* END: if the active product isn't the element of thisProduct */
        }
        /* END LOOP: for each active product */
      }

      /* END: click event listener to trigger */
    });
  }

  initOrderForm() {
    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function(e) {
      e.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function() {
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(e) {
      e.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

    thisProduct.amountWidgetElem.addEventListener('updated', function(e) {
      thisProduct.processOrder();
    });
  }

  processOrder() {
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);
    const paramsData = thisProduct.data.params;

    thisProduct.params = {};
    /* set variable price to equal thisProduct.data.price */
    let price = thisProduct.data.price;
    const imageWrapper = thisProduct.imageWrapper;

    for (let paramKey in paramsData) {
      for (let optionKey in paramsData[paramKey].options) {
        const allOptions = paramsData[paramKey].options[optionKey];
        const isDefault = allOptions.default;
        const isChosen =
          formData[paramKey] && formData[paramKey].includes(optionKey);
        const ingredientImgClass = `.${paramKey}-${optionKey}`;
        const ingredientSelector = imageWrapper.querySelector(
          ingredientImgClass
        );

        if (isDefault && !isChosen) {
          price -= allOptions.price;
        } else if (!isDefault && isChosen) {
          price += allOptions.price;
        }

        if (ingredientSelector && isChosen) {
          imageWrapper
            .querySelector(ingredientImgClass)
            .classList.add(classNames.menuProduct.imageVisible);
        } else if (ingredientSelector) {
          imageWrapper
            .querySelector(ingredientImgClass)
            .classList.remove(classNames.menuProduct.imageVisible);
        }

        if (isChosen) {
          if (!thisProduct.params[paramKey]) {
            thisProduct.params[paramKey] = {
              label: paramsData[paramKey].label,
              options: {}
            };
          }
          thisProduct.params[paramKey].options[optionKey] =
            paramsData[paramKey].options[optionKey].label;
        }
      }
    }

    /* multiply price by amount */
    thisProduct.priceSingle = price;
    thisProduct.price =
      thisProduct.priceSingle * thisProduct.amountWidget.value;

    /* set the contents of thisProduct.priceElem to be the value of variable price */
    thisProduct.priceElem.innerHTML = thisProduct.price;
  }

  addToCart() {
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    const event = new CustomEvent('add-to-cart', {
      bubbles: templates,
      detail: {
        product: thisProduct
      }
    });

    thisProduct.element.dispatchEvent(event);
  }
}
