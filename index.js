'use strict';
const core = require('./core');

class Hammer extends require('./hammer') {
  setup(config = {}) {
    this.config = config;
    new core(this.config);
  }
}

module.exports = new Hammer();
