const knex = require('knex');
const bookshelf = require('bookshelf');
const modules = require('./modules');

class Database {
  constructor() {

  }

  open(config) {
    this.knex = knex(config);
    this.bookshelf = bookshelf(knex);
    return this;
  }

  model(table) {
    return this.bookshelf.Model.extend({
      "tableName": table
    });
  }
}

module.exports = new Database();
