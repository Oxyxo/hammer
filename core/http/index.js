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
    this.fallback = new router();

    this.server.use(this.router.routes());
    this.server.use(this.fallback.routes());

    this.customErrorHandle();
    this.beforeRequestMiddleware();

    this.router.use(this.responseHandle());
  }

  beforeRequestMiddleware() {
    this.router.use(function *(next) {
      yield middleware.call('on request', this);
      yield *next;
    });
  }

  customErrorHandle() {
    let self = this;
    this.fallback.get('*', function *(next) {
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

  open() {
    let deferred = Promise.defer(),
        promise = deferred.promise,
        port = config.get.port;

    this.portInUse(port, (inUse)=> {
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

  portInUse(port, cb) {
    let net = require('net');
    let tester = net.createServer();

    tester.once('error', (err)=> {
      if(err.code != 'EADDRINUSE') {
        return cb();
      }
      return cb(err);
    });

    tester.once('listening', ()=> {
      tester.once('close', cb).close();
    });

    tester.listen(port);
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
