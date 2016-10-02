'use strict';

const log = require('./log');
const path = require('path');
const http = require('./http');
const config = require('./config');
const client = require('./client');
const plugins = require('./plugins');
const modules = require('./modules');
const database = require('./database');
const authentication = require('./authentication');

class Hammer {
  constructor(_config = {}) {
    let deferred = Promise.defer();
    let promise = deferred.promise;

    config.set = _config;

    Promise.all([
      database.open(),
      http.open(),
      authentication.initialize()
    ]).then(()=> {
      log('hammer.running', {"port": config.get.port});
      
      new client();
      plugins.initialize();

      global.Hammer = this;
      deferred.resolve(this);
    });

    return promise;
  }

  set config(config = {}) {
    config.set = config;
  }

  get config() {
    return config.get;
  }

  get modules() {
    return modules.collect;
  }
}

module.exports = Hammer;
