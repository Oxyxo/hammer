'use strict';

const _ = require('lodash');
const commands = require('./commands');
const schemas = require('./schemas');

class Schemas {
  initialize() {
    let tables = _.keys(schemas);
    for(let i=0;i<tables.length;i++) {
      let name = tables[i];
      commands.createTable(name, schemas[name]);
    }
  }
}

module.exports = new Schemas();
