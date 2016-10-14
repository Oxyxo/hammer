'use strict';

const fs = require('fs');
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
   * responseHandle makes it easier to send for example
   * json back to the client without setting the response
   * type's.
   *
   * @method   Response@responseHandle
   * @return {Generator} The returned generator can be used by koa
   */
  responseHandle() {
    return function *(next) {
      var startTime = Date.now();

      yield *next;

      let body = this.body;
      if(_.isObject(body)) {
        this.response.type = 'json';
        return;
      }

      var delta = Math.ceil(Date.now() - startTime);
      this.set('X-Response-Time', `${delta} ms`);
    };
  }

  send(...args) {
    send.apply(this, args);
  }
}

module.exports = Response;
