'use strict';

const path = require('path');
const http = require('./http');
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
      database.open(this.config.database),
      http.open(this.config.port),
      authentication.initialize()
    ]).then(()=> {
      global.Hammer = this;
      plugins.initialize(this.config.plugins);
      deferred.resolve(this);
    });

    return promise;
  }

  set config(config = {}) {
    this._config = config;
  }

  get config() {
    return Object.assign(this.default_config, (this.input_config || {}));
  }

  get default_config() {
    return {
      "port": 8080,
      "database": {
        "client": "sqlite3",
        "connection": {
          "filename": path.join(process.cwd(), 'database')
        }
      },
      "hammerRoot": __dirname
    };
  }

  get modules() {
    return modules.collect;
  }
}

module.exports = Hammer;
