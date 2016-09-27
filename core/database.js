'use strict';

const knex = require('knex');
const bookshelf = require('bookshelf');
const modules = require('./modules');

class Database {
  constructor() {
    modules.extend('database', this);
  }

  open(config) {
    this.deferred = Promise.defer();
    this.promise = this.deferred.promise;

    this.knex = knex(config);
    this.deferred.resolve(this);

    return this.promise;
  }

  model(table) {
    return this.knex(table);
  }
}

module.exports = new Database();
