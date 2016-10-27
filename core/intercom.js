'use strict';

//TODO: add a way to change string path's to regex in order to use wildcards to listen to events.

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
    this._events = {};
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
    if(!this._events[event]) {
      this._events[event] = [];
    }
    this._events[event].push(fn);
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

    if(!this._events[event]) {
      return;
    }

    for(let i=0;i<this._events[event].length;i++) {
      this._events[event][i].apply(null, data);
    }
  }
}

module.exports = new Intercom();
