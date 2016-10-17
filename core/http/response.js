'use strict';

const _ = require('lodash');
const send = require('koa-send');

/**
 * This class handles all outgoing request
 * the response class also gives a developer
 * the plausibilty to easily send a file or
 * json back to the client without setting all the
 * nessesary variables. Response is extended by the
 * HTTP class.
 *
 * @class Response
 */
class Response {
  /**
   * responseHandle is handling all outgoing request
   * to check if all the nessesary values are set.
   *
   * @method   Response@responseHandle
   * @return {Generator} The returned generator can be used by koa
   */
  responseHandle() {
    return function *(next) {
      var startTime = Date.now();

      yield *next;

      var delta = Math.ceil(Date.now() - startTime);
      this.set('X-Response-Time', `${delta} ms`);
    };
  }

  /**
   * Send is a alias to koa-send.
   * This function apply's all arguments to
   * koa-send.
   * @method   Response@send
   * @param    {Object} koa  The current koa session
   * @param    {String} path Full path to the file that you are wanting to send
   * @param    {Object} opts Optional options that can be set. See koa-send documentation.
   * @return   {Function} Send returns a generator function that can be used by koa.
   */
  send(...args) {
    return send.apply(this, args);
  }
}

module.exports = Response;
