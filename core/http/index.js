//TODO: i want to rewrite the HTTP registering of routes to be more easier.

/* jshint -W124 */
'use strict';

const Koa = require('koa');
const net = require('net');
const _ = require('lodash');
const path = require('path');
const log = require('../log');
const config = require('../config');
const router = require('koa-router');
const modules = require('../modules');
const Response = require('./response');
const middleware = require('../middleware');

/**
 * This class handles the http server and
 * all incomming and outgoing requests.
 *
 * @extends Response
 * @class HTTP
 */
class HTTP extends Response {
  /**
   * In the this constructor are the nessesary
   * variables set up to start a http server.
   * Also is the router included that handles all
   * request methods + requests.
   *
   * @constructs HTTP
   */
  constructor() {
    super();

    modules.extend('http', this);
    this.server = Koa();
    this.koa = Koa;

    this.router = new router();
    this.server.use(this.router.routes());

    this.customErrorHandle();
    this.beforeRequestMiddleware();

    this.router.use(this.responseHandle());
  }

  /**
   * This function calls the event 'on request'
   * over the intercom module. When 'on request'
   * is called is the current session included in the
   * first argument.
   *
   * @method   HTTP@beforeRequestMiddleware
   */
  beforeRequestMiddleware() {
    this.router.use(function *(next) {
      yield middleware.call('on request', this);
      yield *next;
    });
  }

  /**
   * This function handles all 404 and 500 errors.
   * In the future will this function give active
   * themes the plausibilty to create cusom 404 and
   * 500 templates.
   *
   * @method   HTTP@customErrorHandle
   */
  customErrorHandle() {
    let self = this;
    this.router.get('*', function *(next) {
      //TODO: give plausibility to templates to override 500 and 404 message
      try {
        yield *next;
      } catch(err) {
        this.status = err.status || 500;
        yield self.send(this, 'templates/500.html', {root: __dirname});
        return;
      }

      this.status = 404;
      yield self.send(this, 'templates/404.html', {root: __dirname});
    });
  }

  /**
   * When this function is called starts the
   * Hammer http server listening on the given port.
   * If no port is given does it use the port set
   * in the config. This function does also check if
   * the given port is already in use (HTTP@portInUse).
   *
   * @method   HTTP@open
   * @param    port {Number} port The port number that the http server should listen to.
   */
  open(port = config.get.port) {
    let deferred = Promise.defer(),
        promise = deferred.promise;

    this.portInUse(port).then((inUse)=> {
      if(inUse) {
        return deferred.reject(new Error(log('port.in.use', {"port": port})));
      }

      this.server.listen(port, ()=> {
        log('http.server.running', {"port": config.get.port});
        deferred.resolve(this);
      });
    });

    return promise;
  }

  /**
   * When called is the given port checked if
   * in use.
   *
   * @method   HTTP@portInUse
   * @param    {Number} port [description]
   * @returns  {Promise}
   */
  portInUse(port) {
    let deferred = Promise.defer(),
        promise = deferred.promise;

    let net = require('net');
    let tester = net.createServer();

    tester.once('error', (err)=> {
      if(err.code != 'EADDRINUSE') {
        return deferred.resolve();
      }
      return deferred.resolve(err);
    });

    tester.once('listening', ()=> {
      tester.once('close', deferred.resolve).close();
    });

    tester.listen(port);

    return promise;
  }

  get route() {
    return new Proxy({}, {
      get: (func, method)=> {
        return (url, fn)=> {
          if(Array.isArray(url)) {
            for(let i=0;i<url.length;i++) {
              let c = url[i];
              if(Array.isArray(c)) {
                url[i] = _.joinUrl(c);
              }
            }
          }

          this.router[method](url, fn);

          return new Proxy({
            destroy: ()=> {
              let stack = this.router.stack;

              if(!Array.isArray(fn)) {
                fn = [fn];
              }

              for(let i=0;i<stack.length;i++) {
                let route = stack[i];

                for(let i=0;i<fn.length;i++) {
                  if(route.stack.indexOf(fn[i]) >= 0) {
                    delete this.router.stack[i];
                  }
                }
              }
            }
          }, {});
        };
      }
    });
  }

  get new() {
    return this;
  }
}

module.exports = new HTTP();
