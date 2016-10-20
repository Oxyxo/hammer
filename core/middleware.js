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
    let deferred = Promise.defer(),
        promise = deferred.promise;

    if(!this._events[name]) {
      deferred.resolve();
      return promise;
    }

    let {dataUpdate} = opts;

    if(!_.isArray(args)) {
      args = [args];
    }

    let i = 0;

    async.whilst(()=> {
      return i < this._events[name].length;
    }, (done)=> {
      let after = (...data)=> {
        if(dataUpdate && _.isFunction(dataUpdate)) {
          args = dataUpdate.apply(this, [args, data]);

          if(!_.isArray(args)) {
            args = [args];
          }
        }

        i++;
        done(null, data);
      };

      this._events[name][i].apply(null, [after].concat(args));
    }, function(err, ...data) {
      let res = data;
      if(dataUpdate && _.isFunction(dataUpdate)) {
        res = args;
      }

      deferred.resolve(res);
    });

    return promise;

    // let i = -1;
    // if(!this._events[name]) {
    //   deferred.resolve();
    // } else {
    //   async.whilst(()=> {
    //     i++; return i < this._events[name].length;
    //   }, (done)=> {
    //     this._events[name][i].apply(null, [done].concat(args));
    //   }, (...data)=> {
    //     let res;
    //
    //     if(updateData && _.isFunction(updateData)) {
    //       res = args;
    //
    //       for(let i=0;i<data.length;i++) {
    //         let c = data[i];
    //
    //         if(c) {
    //           let newData = updateData(res, c);
    //
    //           if(newData) {
    //
    //             if(!_.isArray(newData)) {
    //               newData = [newData];
    //             }
    //
    //             res = newData;
    //           }
    //         }
    //       }
    //
    //     } else {
    //       res = data;
    //     }
    //
    //     deferred.resolve(res);
    //   });
    // }

    return promise;
  }
}

module.exports = new Middleware();
