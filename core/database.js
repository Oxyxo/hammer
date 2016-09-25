const knex = require('knex');
const bookshelf = require('bookshelf');
const modules = require('./modules');

class Database {
  constructor() {
    modules.extend('database', this);
  }

  open(config) {
    this.knex = knex(config);
    return this;
  }

  model(table) {
    return this.knex(table);
  }
}

module.exports = new Database();
