import {select, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking{
  constructor(bookingContainer){
    const thisBooking = this;

    thisBooking.getElements(bookingContainer);
    thisBooking.render();
    thisBooking.initWidgets();
  }

  getElements(bookingContainer){
    const thisBooking = this;

    thisBooking.dom = {};
    thisBooking.dom.wrapper = bookingContainer;
   
  }

  render(){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();
    
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    thisBooking.amountWigetPeople = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.amountWidgetHours = new AmountWidget(thisBooking.dom.hoursAmount);

  }
}

export default Booking;