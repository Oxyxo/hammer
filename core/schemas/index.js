'use strict';

const _ = require('lodash');
const commands = require('./commands');
const schemas = require('./schemas');
const modules = require('../modules');

class Schemas {
  constructor() {
    modules.extend('schemas', this);
  }

  new(name, schema) {
    commands.createTable(name, schema);
  }

  addColumnToTable(table, colmn) {
    commands.addColumn(table, colmn);
  }

  _initialize() {
    let tables = _.keys(schemas);
    for(let i=0;i<tables.length;i++) {
      let name = tables[i];
      commands.createTable(name, schemas[name]);
    }
  }
}

module.exports = new Schemas();
