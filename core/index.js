'use strict';

const http = require('./http');
const database = require('./database');
const schemas = require('./schemas');
const plugins = require('./plugins');

class Core {
  constructor(config) {
    database.open(config.database);
    http.open(config.port);

    schemas._initialize();
    plugins._initialize();
  }
}

module.exports = Core;
