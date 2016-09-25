'use strict';

const http = require('./http');
const database = require('./database');
const schemas = require('./schemas');

class Core {
  constructor(config) {
    database.open(config.database);
    http.open(config.port);

    schemas._initialize();
  }
}

module.exports = Core;
