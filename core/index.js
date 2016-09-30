'use strict';

const path = require('path');
const http = require('./http');
const config = require('./config');
const client = require('./client');
const plugins = require('./plugins');
const modules = require('./modules');
const database = require('./database');
const authentication = require('./authentication');

class Hammer {
  constructor(config = {}) {
    let deferred = Promise.defer();
    let promise = deferred.promise;

    this.input_config = config;

    Promise.all([
      database.open(),
      http.open(),
      authentication.initialize()
    ]).then(()=> {
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
