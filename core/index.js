'use strict';

const path = require('path');
const http = require('./http');
const database = require('./database');
const schemas = require('./schemas');
const plugins = require('./plugins');
const modules = require('./modules');

class Hammer {
  constructor(config = {}) {
    let deferred = Promise.defer();
    let promise = deferred.promise;

    this.input_config = config;

    Promise.all([
      database.open(this.config.database),
      http.open(this.config.port),
      schemas.initialize(),
      plugins.initialize()
    ]).then(()=> {
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
        },
        "useNullAsDefault": true
      },
      "hammerRoot": __dirname
    };
  }

  get modules() {
    return modules.collect;
  }
}

module.exports = Hammer;
