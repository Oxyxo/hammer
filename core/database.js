'use strict';

const knex = require('knex');
const bookshelf = require('bookshelf');
const modules = require('./modules');

class Database {
  constructor() {
    modules.extend('database', this);
  }

  open(config) {
    let deferred = Promise.defer();
    let promise = this.deferred.promise;

    this.knex = knex(config);
    deferred.resolve(this);

    return promise;
  }

  model(table) {
    return this.knex(table);
  }
}

module.exports = new Database();
