'use strict';

const _ = require('lodash');
const path = require('path');
const core = require('./core');
const modules = require('./core/modules');

class Hammer {
  get defaultConfig() {
    return {
      "port": 8080,
      "database": {
        "client": "sqlite3",
        "connection": {
          "filename": path.join(process.cwd(), 'database')
        },
        "useNullAsDefault": true
      }
    };
  }

  get modules() {
    return modules.collect;
  }

  get plugins() {
    //collect all plugins and return
  }

  setup(config) {
    config = Object.assign(this.defaultConfig, config);
    new core(config);
  }
}

module.exports = new Hammer();
