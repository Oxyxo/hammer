'use strict';

const log = require('./log');
const path = require('path');
const http = require('./http');
const config = require('./config');
const client = require('./client');
const render = require('./render');
const plugins = require('./plugins');
const modules = require('./modules');
const _require = require('./require');
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

    new utilities(this);
    Promise.all([
      database.open(),
      http.open(),
      authentication.initialize()
    ]).then(()=> {
      new client();
      plugins.initialize();

      global.Hammer = this;
      deferred.resolve(this);

      log('hammer.running', {"port": config.get.port});
    });

    //TODO: move modules extend to their own files/modules?
    modules.extend('log', log);
    modules.extend('intercom', intercom);
    modules.extend('middleware', middleware);
    modules.extend('plugins', plugins.get);
    modules.extend('config', config);
    modules.extend('authentication', authentication);
    modules.extend('render', render);
    modules.extend('require', _require);

    return promise;
  }

  get config() {
    return config;
  }

  get modules() {
    return modules.collect;
  }

  get plugins() {
    return plugins;
  }
}

module.exports = Hammer;
