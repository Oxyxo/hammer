'use strict';

const net = require('net');
const _ = require('lodash');
const log = require('./log');
const path = require('path');
const config = require('./config');
const express = require('express');
const modules = require('./modules');
const middleware = require('./middleware');

class HTTP {
  constructor() {
    modules.extend('http', this);
    this.server = express();
    this.express = express;
  }

  handle() {
    this.server.all('*', (req, res, next)=> {
      req.on('end', ()=> {
        middleware.call('after_response', [req]);
      });

      middleware.call('on_request', [req, res], (_res)=> {
        if(_res) {
          for(let i=0;i<_res.length;i++) {
            if(_res[i]) {
              return;
            }
          }
        }
        next();
      });
    });
  }

  flexStatic(url, folder) {
    let base = folder;
    this.server.get(path.join(url, '/*'), (req, res)=> {

      res.send('ola');
    });

    return (folder)=> {
      base = folder;
    };
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
