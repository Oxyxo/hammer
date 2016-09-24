'use strict';

const routes = require('./routes');
const express = require('express');
const net = require('net');

class HTTP {
  constructor() {
    this.app = express();
  }

  open(port, cb = ()=>{}) {
    this.portInUse(port, (inUse)=> {
      if(inUse) {
        //TODO: throw error port in use
        return;
      }

      this.app.listen(port, cb);
    });
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
