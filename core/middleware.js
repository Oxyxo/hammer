'use strict';

const async = require('async');
const modules = require('./modules');

class Middleware {
  constructor() {
    this._events = {};
    modules.set('middleware', this);
  }

  on(name, fn) {
    if(!this._events[name]) {
      this._events[name] = [];
    }
    this._events[name].push(fn);
  }

  call(name, args, cb = ()=>{}) {
    let i = -1;
    if(!this._events[name]) {
      return cb([]);
    }

    async.whilst(()=> {
      i++; return i < this._events[name].length;
    }, (done)=> {
      this._events[name][i].apply(null, [done].concat(args));
    }, cb);
  }
}

module.exports = new Middleware();
