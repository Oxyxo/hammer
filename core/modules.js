'use strict';

class Modules {
  constructor() {
    this._modules = {};
  }

  extend(n, v) {
    this._modules[n] = v;
  }

  get collect() {
    return this._modules;
  }
}

module.exports = new Modules();
