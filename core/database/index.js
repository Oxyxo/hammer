'use strict';

const _ = require('lodash');
const knex = require('knex');
const bookshelf = require('bookshelf');
const config = require('../config');
const commands = require('./commands');
const schemas = require('./schemas');
const modules = require('../modules');

class Database {
  constructor() {
    modules.extend('database', this);
  }

  open() {
    let database = config.get.database;
    if(database.client === 'sqlite3') {
      database.useNullAsDefault = database.useNullAsDefault || true;
    }

    if(database.client === 'mysql') {
      database.connection.timezone = 'UTC';
      database.connection.charset = 'utf8mb4';
    }

    let deferred = Promise.defer();
    let promise = deferred.promise;

    this.knex = knex(database);
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

  table(table) {
    return this.knex(table);
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

  addColumnsToTable(table, columns) {
    if(!_.isArray(columns)) {
      return new Error('given columns is not a array');
    }

    for(let i=0;i<columns.length;i++) {
      commands.addColumn(table, columns[i]);
    }
  }

  initializeSchemas() {
    let deferred = Promise.defer();
    let promise = deferred.promise;

    let promises = [],
        tables = _.keys(schemas);

    for(let i=0;i<tables.length;i++) {
      let name = tables[i];
      promises.push(commands.createTable(name, schemas[name], this.knex, this));
    }

    Promise.all(promises).then(()=> {
      deferred.resolve(this);
    });

    return promise;
  }
}

module.exports = new Database();
