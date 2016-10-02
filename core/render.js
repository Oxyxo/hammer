'use strict';

//TODO: make default data that should be included when a page renders

const hbs = require('handlebars');
const modules = require('./modules');

class Render {
  constructor() {
    modules.extend('render', this);
  }

  serve(source) {
    let template = hbs.compile(source);

    return (data)=> {
      return template(data);
    };
  }
}

module.exports = new Render();
