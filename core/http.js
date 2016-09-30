'use strict';

const express = require('express');
const net = require('net');
const config = require('./config');
const middleware = require('./middleware');

class HTTP {
  constructor() {
    this.server = express();
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

  static(url, folder) {
    //TODO: create flexibele static
  }

  open() {
    let deferred = Promise.defer(),
        promise = deferred.promise,
        port = config.get.port;

    this.portInUse(port, (inUse)=> {
      if(inUse) {
        //TODO: throw error port in use
        return;
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
