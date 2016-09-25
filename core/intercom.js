'use strict';

const modules = require('./modules');

class Intercom {
  constructor() {
    this._events = {};
    modules.expand('intercom', this);
  }

  on(e, cb) {
    if(!this._events[e]) {
      this._events[e] = [];
    }
    this._events[e].push(cb);
  }

  emit(e, d = []) {
    if(!Array.isArray(d)) {
      d = [d];
    }

    for(let i=0;i<this._events[e].length;i++) {
      this._events[e][i].apply(null, d);
    }
  }
}

module.exports = new Intercom();
