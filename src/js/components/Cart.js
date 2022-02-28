import {settings, select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import CartProduct from './CartProduct.js';
//import AmountWidget from './AmountWidget.js';


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

export default Cart;