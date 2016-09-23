const _ = require('lodash');
const bookshelf = require('bookshelf');
const knex = require('knex');

const schemas = require('./schemas');

class Database {
  constructor(config) {
    this.knex = knex(config);
    this.bookshelf = bookshelf(this.knex);
  }
}

module.exports = Database;
