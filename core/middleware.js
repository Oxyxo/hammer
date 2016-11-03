'use strict';

const _       = require('lodash');
const async   = require('async');

/**
 * This class can be used to call and listen
 * to middleware events. Middleware events can
 * be created by core modules or plugins.
 * @class Middleware
 */
class Middleware {
  /**
   * This constructor creates the variable
   * _events to store all functions that are
   * listening to spesific events.
   * @constructs Middleware
   */
  constructor() {
    this._events = {};
  }

  /**
   * By calling this function can you add
   * a function to listen to a spesific event.
   * This function is called when the event
   * occures. When the given callback function
   * is called is the first argument a callback
   * function that needs to be called when the
   * callback function is done. The remaining
   * arguments are set by the caller.
   * @method   Middleware@on
   * @param    {String} name Name of the event that you want to listen to.
   * @param    {Function} fn The callback function that needs to be called on that event.
   */
  on(name, fn) {
    if(!this._events[name]) {
      this._events[name] = [];
    }
    this._events[name].push(fn);
  }

  /**
   * This function calls a spesific event
   * and runs/calls all listening listners
   * to this event. Listners can manipulate the
   * given data and return it to the Middleware class.
   * If the option dataUpdate is set will this
   * function be called in order to check and set
   * the new/given data.
   * @method   Middleware@call
   * @param    {String} name Name of the event that you want to call
   * @param    {Array} args Args that you want to give to the events
   * @param    {Object} opts Options to give to the call function
   * @returns  {Promise} A promise that returns a string if resolved, or an Error if rejected.
   */
  call(name, args = [], opts = {}) {
    let deferred = Promise.defer(),
        promise = deferred.promise;

    if(!this._events[name]) {
      //TODO: check if we should return a true boolean or the given args?
      deferred.resolve(true);
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
  }
}

module.exports = new Middleware();
