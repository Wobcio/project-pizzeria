import AmountWidget from './AmountWidget.js';
import {select} from '../settings.js';

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
    thisCartProduct.amountWidget.dom.input.value = thisCartProduct.amount;

    thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
      thisCartProduct.amount = parseInt(thisCartProduct.amountWidget.dom.input.value);
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

export default CartProduct;