/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    }
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;
      console.log('thisProduct: ', thisProduct);

      thisProduct.id = id;
      thisProduct.data = data;
      
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initAmountWidget();
      thisProduct.initOrderForm();
    }
    renderInMenu(){
      const thisProduct = this;

      // generate HTML based on template
      const generatedHTML = templates.menuProduct(thisProduct.data);

      // create element using utils.createElementFromHTML
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      
      // find menu container
      const menuContainer = document.querySelector(select.containerOf.menu);
      
      // add element to menu
      menuContainer.appendChild(thisProduct.element);
    }
    getElements(){
      const thisProduct = this;
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }
    initAccordion(){
      const thisProduct = this;

      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function(event) {
        console.log('accordion');
        /* prevent default action for event */
        event.preventDefault();

        /* find active product (product that has active class) */
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
        //console.log(activeProducts);

        /* if there is active product and it's not thisProduct.element, remove class active from it */
        for (let activeProduct of activeProducts) {
          if (activeProduct != thisProduct.element) {
            activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
          }
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }
    initOrderForm(){
      console.log('initOrderForm');
      const thisProduct = this;
      thisProduct.processOrder();
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
    processOrder(){
      console.log('processOrder');
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log(thisProduct.data);
      //console.log('formData', formData);
    
    
      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        
        //console.log('param', param);
        //console.log('paramId', paramId);


        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          
          //console.log('option', option);
          //console.log('optionId', optionId);

          // ADD CLASS ACTIVE TO IMAGES

          //find exact wrapper
          const exactWrapper = thisProduct.imageWrapper.querySelector('.' + paramId + '-' +optionId);
          //console.log(exactWrapper);

          if (exactWrapper !== null){

            //check if formData[paramId] includes optionId
            if (formData[paramId] && formData[paramId].includes(optionId)){
              exactWrapper.classList.add(classNames.menuProduct.imageVisible);
              //console.log('added');
            }else{
              exactWrapper.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
          //add class active to paramId-optionId


          // OBLICZANIE CENY

          //check if optionId is default
          if (option.default == true) {

            //if yes check if optionId is not included in formData
            if (!formData[paramId].includes(optionId)){

              //if yes decrease price
              price = price - option.price;
            }
          }
          else {
            //if no check if optionId is included in formData
            if (formData[paramId].includes(optionId)){
              //if yes increase price
              price = price + option.price;
            }
          }  
        }
      }
      // save single price
      thisProduct.priceSingle = price;


      // multiply price by amount
      price *= thisProduct.amountWidget.value;

      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
    }
    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });


    }
    addToCart(){
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());
    }
    prepareCartProduct(){
      const thisProduct = this;

      const productSummary = {};

      productSummary.id = thisProduct.id;
      productSummary.name = thisProduct.data.name;
      productSummary.amount = thisProduct.amountWidget.value;
      productSummary.priceSingle = thisProduct.priceSingle;
      productSummary.price = (productSummary.amount * productSummary.priceSingle);
      productSummary.params = thisProduct.prepareCartProductParams();
      
      return(productSummary);
    }
    prepareCartProductParams(){
      console.log('prepareCartProductParams');
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log(thisProduct.data);
      //console.log('formData', formData);

      const params = {};

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        
        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {}
        };

        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];


          //check if formData[paramId] includes optionId
          if (formData[paramId] && formData[paramId].includes(optionId)){
            params[paramId].options[optionId] = option.label;
            console.log('found');
          }
        }    
      }
      return params;
    } 
  }
  
  class AmountWidget{
    constructor(element){
      const thisWidget = this;
      
      thisWidget.getElements(element);
      thisWidget.setValue(settings.amountWidget.defaultValue);
      thisWidget.initActions();
      
      //console.log('AmountWidget: ', thisWidget);
      //console.log('constructor arguments: ', element);
    }
    getElements(element){
      const thisWidget = this;
    
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);

    }
    setValue(value){
      //console.log('setValue');
      const thisWidget = this;

      const newValue = parseInt(value);

      console.log('newValue: ', newValue);

      /* TODO: Add validation */
      if (newValue !== thisWidget.value && newValue != null && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
        thisWidget.value = newValue;
        //console.log('thisWidget.value: ', thisWidget.value);
        
      }
      
      thisWidget.input.value = thisWidget.value;
      thisWidget.announce();

    }
    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(--thisWidget.input.value);
      });
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(++thisWidget.input.value);
      });


    }
    announce(){
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();

      //console.log('new Cart', thisCart);
    }
    getElements(element){
      const thisCart = this;
      
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      // form
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.phone = thisCart.dom.form.querySelector(select.cart.phone);
      thisCart.dom.formSubmit = thisCart.dom.form.querySelector(select.cart.formSubmit);
      thisCart.dom.address = thisCart.dom.form.querySelector(select.cart.address);

    }
    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct);
      });
      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisCart.sendOrder();
      });
    }
    add(menuProduct){
      const thisCart = this;

      //console.log('adding product', menuProduct);

      // generate HTML based on template
      const generatedHTML = templates.cartProduct(menuProduct);
      
      // create element using utils.createElementFromHTML
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
            
      // add element to cart
      thisCart.dom.productList.appendChild(generatedDOM);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      //console.log('thisCart.produts', thisCart.products);
      thisCart.update();
    }
    update(){
      const thisCart = this;
      
      console.log('update');

      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
      thisCart.totalPrice = 0;

      for (const product of thisCart.products){
        //console.log('product.amount: ', product.amount);
        thisCart.totalNumber += product.amount;
        thisCart.subtotalPrice += product.price;
      }
      if(thisCart.totalNumber == 0){
        thisCart.deliveryFee = 0;
      }
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      //console.log('totalNumber: ', totalNumber);
      //console.log('subtotalPrice: ', subtotalPrice);
      //console.log('deliveryFee: ', deliveryFee);
      //console.log('thisCart.totalPrice: ', thisCart.totalPrice);

      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;

      [].forEach.call(thisCart.dom.totalPrice, function(totalPrice){
        totalPrice.innerHTML = thisCart.totalPrice;
      });

      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;


    }
    remove(cartProductToDelete){
      const thisCart = this;

      const indexOfProduct = thisCart.products.indexOf(cartProductToDelete);

      //console.log('indexOfProduct: ', indexOfProduct);
      //console.log('cartProductToDelete: ', cartProductToDelete);
      //console.log('thisCart.products: ', thisCart.products);

      thisCart.products.splice(indexOfProduct, 1);

      //console.log('thisCart.products: ', thisCart.products);
      //console.log('thisCart.dom.productList: ',thisCart.dom.productList);
      //console.log('thisCart.dom.productList: ',thisCart.dom.productList.children);

      const DOMToDelete = thisCart.dom.productList.children.item(indexOfProduct);
      DOMToDelete.remove();
      thisCart.update();
    }
    sendOrder(){
      const thisCart = this;

      const url = settings.db.url + '/' + settings.db.orders;

      const payload = {};
      payload.products = [];

      for(let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }

      payload.address = thisCart.dom.address.value;
      payload.phone = thisCart.dom.phone.value;
      payload.totalPrice = thisCart.totalPrice;
      payload.subtotalPrice = thisCart.subtotalPrice;
      payload.totalNumber = thisCart.totalNumber;
      payload.deliveryFee = thisCart.deliveryFee;

      console.log('payload: ', payload);

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      fetch(url, options)
        .then(function(response){
          return response.json();
        }).then(function(parsedResponse){
          console.log('pasredResponse: ', parsedResponse);
        });
    }
  }

  class CartProduct{
    constructor(menuProduct, element){
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = menuProduct.params;

      //console.log('new CartProduct', thisCartProduct);

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();

    }
    getElements(element){
      const thisCartProduct = this;
      
      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

    }
    initAmountWidget(){
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.amountWidget.input.value = thisCartProduct.amount;

      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        thisCartProduct.amount = parseInt(thisCartProduct.amountWidget.input.value);
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }
    initActions(){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartProduct.remove();
      });
    }
    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        }
      });
      console.log('remove');
      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }
    getData(){
      const thisCartProduct = this;

      console.log('getData');

      const productsData = {};

      productsData.id = thisCartProduct.id;
      productsData.amount = thisCartProduct.amount;
      productsData.price = thisCartProduct.price;
      productsData.priceSingle = thisCartProduct.priceSingle;
      productsData.name = thisCartProduct.name;
      productsData.params = thisCartProduct.params;


      return productsData;
    }
  }


  const app = {
    initMenu: function(){
      const thisApp = this;
      
      //console.log('thisApp.data:', thisApp.data);
      
      for(let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
        // console.log(productData, thisApp.data.products[productData]);
      }
    },
    initData: function(){
      const thisApp = this;

      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
        .then(function(rawrResponse){
          return rawrResponse.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse: ', parsedResponse);

          // save parsedResponse as thisApp.data.products
          thisApp.data.products = parsedResponse;

          //execute initMenu method
          thisApp.initMenu();

        });
      console.log('thisApp.data: ', JSON.stringify(thisApp.data));
    },
    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initCart();
    },
  };

  app.init();
}
