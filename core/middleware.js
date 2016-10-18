'use strict';

const _ = require('lodash');
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

  call(name, args = [], opts = {}) {
    //TODO: add a function that the given args are returned with the latest changes made by middleware
    let deferred = Promise.defer(),
        promise = deferred.promise;

    let {updateData} = opts;

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
      }, (...data)=> {
        let res;
        if(updateData && _.isFunction(updateData)) {
          res = args;
          for(let i=0;i<data.length;i++) {
            let c = data[i];
            if(c) {
              let newData = updateData(res, c);
              if(newData) {
                if(!Array.isArray(newData)) {
                  newData = [newData];
                }

                res = newData;
              }
            }
          }
        } else {
          res = data;
        }

        deferred.resolve(res);
      });
    }

    return promise;
  }
}

module.exports = new Middleware();
