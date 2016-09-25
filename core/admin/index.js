'use strict';

const routes = require('./routes');

class Admin {
  constructor() {
    this.controllers = require('./controllers');
  }
}

module.exports = new Admin();
