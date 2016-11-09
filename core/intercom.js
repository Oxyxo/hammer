'use strict';

const globRegex = require('glob-to-regexp');

/**
 * The intercom class gives plugins or core
 * modules the plausibility to send/listen to socket
 * like events.
 * @class Intercom
 */
class Intercom {
  /**
   * This constructor creates the variable
   * _events to store all functions that are
   * listening to spesific events.
   * @constructs Intercom
   */
  constructor() {
    this._events = [];
  }

  /**
   * By calling this function can you add
   * a function to listen to a spesific event.
   * This function is called when the event
   * occures. When a callback function is called
   * is the data stored in the arguments set by the caller.
   * @method   Intercom@on
   * @param    {String} event event name that you want to listen to.
   * @param    {Function} fn this callback function is called when the event occures.
   */
  on(event, fn) {
    this._events.push({
      "event": event,
      "regexp": globRegex(event),
      "fn": fn
    });
  }

  /**
   * With this function can you emit a event to all
   * listeners. The given data will be apply'd to
   * the listener callback functions.
   * @method   Intercom@emit
   * @param    {String} event Name of the event that you want to call.
   * @param    {Array} data the given data will be given in form of a argument to all listeners
   */
  emit(event, data = []) {
    if(!Array.isArray(data)) {
      data = [data];
    }

    for(let i=0;i<this._events.length;i++) {
      let e = this._events[i];
      if(!e.regexp.test(event)) {
        continue;
      }
      e.fn.apply(null, data);
    }
  }
}

module.exports = new Intercom();
