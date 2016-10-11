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
const middleware = require('../middleware');

class HTTP {
  constructor() {
    modules.extend('http', this);
    this.server = Koa();
    this.koa = Koa;

    this.router = new router();
    this.fallback = new router();

    this.server.use(this.router.routes());
    this.server.use(this.fallback.routes());

    this.customNotFound();
  }

  customNotFound() {
    this.fallback.get('*', function *() {
      //TODO: get 404 page from active theme
      this.body = '😱 Not Found';
      this.status = 404;
    });
  }

  readFile() {
    let deferred = Promise.defer(),
        promise = deferred.promise;

    //read a file and return

    return promise;
  }

  handle() {
    // this.server.use((req, res, next)=> {
    //   for(let i=0;i<this.routes.length;i++) {
    //
    //   }
    //   req.on('end', ()=> {
    //     middleware.call('afterRequestResponse', [req]);
    //   });
    //
    //   middleware.call('request', [req, res], (_res)=> {
    //     if(_res) {
    //       for(let i=0;i<_res.length;i++) {
    //         if(_res[i]) {
    //           return;
    //         }
    //       }
    //     }
    //     next();
    //   });
    // });
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

      this.handle();
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
}

module.exports = new HTTP();
