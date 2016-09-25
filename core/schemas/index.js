'use strict';

const _ = require('lodash');
const commands = require('./commands');
const schemas = require('./schemas');
const modules = require('../modules');

class Schemas {
  constructor() {
    modules.extend('schemas', this);
  }

  newTable(name, schema) {
    commands.createTable(name, schema);
  }

  newTables(tables) {
    let keys = _.keys(tables);
    for(let i=0;i<keys.length;i++) {
      let columns = tables[keys[i]];
      this.newTable(keys[i], columns);
    }
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
