'use strict';

class Intercom {
  constructor() {
    this._events = {};
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

    if(!this._events[e]) {
      return;
    }

    for(let i=0;i<this._events[e].length;i++) {
      this._events[e][i].apply(null, d);
    }
  }
}

module.exports = new Intercom();
