'use strict';

const log = require('./log');
const path = require('path');
const http = require('./http');
const config = require('./config');
const client = require('./client');
const render = require('./render');
const plugins = require('./plugins');
const modules = require('./modules');
const intercom = require('./intercom');
const database = require('./database');
const utilities = require('./utilities');
const middleware = require('./middleware');
const authentication = require('./authentication');

class Hammer {
  constructor(_config = {}) {
    let deferred = Promise.defer(),
        promise = deferred.promise;

    config.set = _config;

    Promise.all([
      database.open(),
      http.open(),
      authentication.initialize()
    ]).then(()=> {
      new client();
      utilities.mixin();
      plugins.initialize();

      global.Hammer = this;
      deferred.resolve(this);

      log('hammer.running', {"port": config.get.port});
    });

    modules.extend('log', log);
    modules.extend('intercom', intercom);
    modules.extend('middleware', middleware);
    modules.extend('plugins', plugins);
    modules.extend('config', config);
    modules.extend('authentication', authentication);
    modules.extend('render', render);

    return promise;
  }

  get config() {
    return config;
  }

  get modules() {
    return modules.collect;
  }
}

module.exports = Hammer;
