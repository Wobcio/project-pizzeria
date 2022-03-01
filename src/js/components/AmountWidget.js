import {settings, select} from '../settings.js';

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

    //console.log('newValue: ', newValue);

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

export default AmountWidget;