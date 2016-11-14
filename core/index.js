'use strict';

const co              = require('co');
const log             = require('./log');
const path            = require('path');
const http            = require('./http');
const config          = require('./config');
const render          = require('./render');
const plugins         = require('./plugins');
const modules         = require('./modules');
const _require        = require('./require');
const intercom        = require('./intercom');
const database        = require('./database');
const utilities       = require('./utilities');
const middleware      = require('./middleware');
const authentication  = require('./authentication');

/**
 * This class in constructed when a new
 * Hammer instance is created. This class
 * is globaly accasible and is used by modules
 * as plugins and require.
 * @class Hammer
 */
class Hammer {
  /**
   * When the constructor is called is a new
   * database opened with the given / set config
   * and a new http server opened. Also are the plugins
   * initialized and are the modules extended.
   * @constructs Hammer
   */
  constructor(_config = {}) {
    let self = this;
    return co(function *() {
      modules.extend('log', log);
      modules.extend('intercom', intercom);
      modules.extend('middleware', middleware);
      modules.extend('plugins', plugins.get);
      modules.extend('config', config);
      modules.extend('authentication', authentication);
      modules.extend('render', render);
      modules.extend('require', _require);

      global.Hammer = self;
      config.set = _config;

      new utilities(self);
      yield [
        database.open(),
        http.open(),
        authentication.init(),
        plugins.init()
      ];

      log('hammer.running', {"port": config.get.port});
      return self;
    });
  }

  /**
   * This getter retuns the set config
   * merged with the default config in the
   * config module.
   * @method   Hammer@config
   * @returns {Object} The set config.
   */
  get config() {
    return config;
  }

  /**
   * The modules getter returns all
   * extended modules found in the modules
   * module.
   * @method   Hammer@modules
   * @returns {Object} All extended modules.
   */
  get modules() {
    return modules.collect;
  }

  /**
   * This getter returns all active
   * plugins found in the current Hammer
   * instance. The plugins are collected by
   * the plugins module.
   * @method   Hammer@plugins
   * @returns {Object} All active plugins.
   */
  get plugins() {
    return plugins;
  }
}

process.on('uncaughtException', function (exception) {
  console.log(exception);
});

process.on('unhandledRejection', (reason, p) => {
  console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
});

module.exports = Hammer;
