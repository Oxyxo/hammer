'use strict';

const http = require('./http');
const database = require('./database');

class Core {
  constructor(config) {
    new database(config.database);
    new http(config.port);
  }
}

module.exports = Core;
