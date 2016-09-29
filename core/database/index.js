'use strict';

const _ = require('lodash');
const knex = require('knex');
const bookshelf = require('bookshelf');
const commands = require('./commands');
const schemas = require('./schemas');
const modules = require('../modules');

class Database {
  constructor() {
    modules.extend('database', this);
  }

  open(config) {
    if(config.client === 'sqlite3') {
      config.useNullAsDefault = config.useNullAsDefault || false;
    }

    if(config.client === 'mysql') {
      config.connection.timezone = 'UTC';
      config.connection.charset = 'utf8mb4';
    }

    let deferred = Promise.defer();
    let promise = deferred.promise;

    this.knex = knex(config);
    this.bookshelf = bookshelf(this.knex);

    this.initializeSchemas().then(()=> {
      deferred.resolve(this);
    });

    return promise;
  }

  model(table, options = {}) {
    options = Object.assign({
      "tableName": table
    }, options);
    return this.bookshelf.Model.extend(options);
  }

  newTable(name, schema) {
    commands.createTable(name, schema, this);
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

  initializeSchemas() {
    let deferred = Promise.defer();
    let promise = deferred.promise;

    let tables = _.keys(schemas);
    for(let i=0;i<tables.length;i++) {
      let name = tables[i];
      commands.createTable(name, schemas[name], this);
    }

    deferred.resolve(this);
    return promise;
  }
}

module.exports = new Database();
