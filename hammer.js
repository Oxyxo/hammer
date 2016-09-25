'use strict';

const _ = require('lodash');
const path = require('path');
const modules = require('./core/modules');

class Hammer {
  constructor() {
    global.Hammer = this;
  }

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

  set config(inputConfig = {}) {
    this._inputConfig = inputConfig;
  }

  get config() {
    return Object.assign(this.defaultConfig, (this.inputConfig || {}));
  }

  get modules() {
    return modules.collect;
  }

  get plugins() {
    //collect all plugins and return
  }
}

module.exports = Hammer;
