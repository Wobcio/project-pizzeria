/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import {select, templates, } from '../settings.js';

class Home {
  constructor(homeContainer) {
    const thisHome = this;

    thisHome.render(homeContainer);
    this.initCarousel();
    
  }

  render(homeContainer) {
    const thisHome = this;

    thisHome.dom = {};
    thisHome.dom.wrapper = homeContainer;

    const generatedTML = templates.home();

    thisHome.dom.wrapper.innerHTML = generatedTML;
  }

  initCarousel() {
    const thisHome = this;

    var elem = thisHome.dom.wrapper.querySelector(select.containerOf.carousel);
    var flkty = new Flickity(elem, {
      // options
      cellAlign: 'left',
      contain: true,
      imagesLoaded: true,
      autoPlay: true,
    });
  }

}

export default Home;