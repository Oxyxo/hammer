'use strict';

const http = require('./http');
const database = require('./database');
const schemas = require('./schemas');
const plugins = require('./plugins');
const admin = require('./admin');

class Core {
  constructor(config) {
    database.open(config.database);
    http.open(config.port);

    schemas._initialize();
    plugins._initialize();

    return [
      http,
      database,
      schemas,
      plugins,
      admin
    ];
  }
}

module.exports = Core;
