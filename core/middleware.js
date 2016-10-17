'use strict';

const async = require('async');

class Middleware {
  constructor() {
    this._events = {};
  }

  on(name, fn) {
    if(!this._events[name]) {
      this._events[name] = [];
    }
    this._events[name].push(fn);
  }

  call(name, args = []) {
    //TODO: add a function that the given args are returned with the latest changes made by middleware
    let deferred = Promise.defer(),
        promise = deferred.promise;

    if(!Array.isArray(args)) {
      args = [args];
    }

    let i = -1;
    if(!this._events[name]) {
      deferred.resolve();
    } else {
      async.whilst(()=> {
        i++; return i < this._events[name].length;
      }, (done)=> {
        this._events[name][i].apply(null, [done].concat(args));
      }, deferred.resolve);
    }

    return promise;
  }
}

module.exports = new Middleware();
