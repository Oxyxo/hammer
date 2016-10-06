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
    this.server.use((req, res, next)=> {
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
      let param = req.params[0];
      if(!param) {
        return res.sendStatus(404);
      }

      let file = path.join(base, param);
      if(!_.pathExists(file, 'isFile')) {
        return res.sendStatus(404);
      }

      res.sendFile(file);
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

  routeInUse(route) {
    let routes = this.server._router.stack;

    for(let i=0;i<routes.length;i++) {
      let _route = routes[i];
      if(_route.regexp.test(route) && _route.route) {
        return true;
      }
    }

    return false;
  }

  new(method, url, cb) {
    if(this.routeInUse(url)) {
      log('route.in.use', {url: url});
    }
    this.server[method](url, cb);
  }
}

module.exports = new HTTP();
