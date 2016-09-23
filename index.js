'use strict';

const path = require('path');
const core = require('./core');

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

  constructor(config = {}) {
    config = Object.assign(this.defaultConfig, config);
    new core(config);
  }
}

module.exports = Hammer;
