/* jshint -W124 */

'use strict';

const fs    = require("fs");
const _     = require("lodash");
const path  = require("path");
const mime  = require("mime-types");

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


  send(ctx, file) {
    return function *() {
      let ext     = path.extname(file);
      let exists  = fs.existsSync(file);

      if(!exists) {
        ctx.status = 404; return;
      }

      let stats = fs.statSync(file);

      if(!ctx.response.get("Last-Modified")) {
        ctx.set("Last-Modified", stats.mtime.toUTCString());
      }

      ctx.type = mime.lookup(ext);
      ctx.body = fs.createReadStream(file);
    };
  }

  static(url, root) {
    let self = this;
    url = new RegExp(`^${url}`);

    this.router.use(function *(next) {
      if(!url.test(this.url)) {
        return yield *next;
      }

      root = _.isFunction(root) ? root() : root;
      root = _.isPromise(root) ? yield root : root;
      root = _.isArray(root) ? path.join.apply(this, root) : root;

      if(!root) {
        return yield *next;
      }

      let file    = path.join(root, this.path.replace(url, ''));
      let exists  = fs.existsSync(file);
      let ext     = path.extname(file);

      if(exists) {
        yield self.send(this, file);
      }

      if(!exists && ext) {
        this.status = 404;
        return;
      }

      yield *next;
    });
  }
}

module.exports = Response;
