/* jshint -W124 */
'use strict';

const Koa = require('koa');
const net = require('net');
const _ = require('lodash');
const log = require('../log');
const path = require('path');
const config = require('../config');
const router = require('koa-router');
const modules = require('../modules');
const Response = require('./response');
const middleware = require('../middleware');
const send = require('koa-send');

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

    this.customNotFound();
    this.router.use(this.responseHandle());
  }

  customNotFound() {
    this.fallback.get('*', function *() {
      this.status = 404;
      yield send(this, 'templates/404.html', {root:__dirname});
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
