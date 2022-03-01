import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product{
  constructor(id, data){
    const thisProduct = this;
    //console.log('thisProduct: ', thisProduct);

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
    //console.log(generatedHTML);

    // create element using utils.createElementFromHTML
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      
    // find menu container
    const menuContainer = document.querySelector(select.containerOf.menu);
    //console.log(menuContainer);
      
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
    //console.log('initOrderForm');
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
    //console.log('processOrder');
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

    //app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
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

export default Product;