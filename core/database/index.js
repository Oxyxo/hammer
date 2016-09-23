const bookshelf = require('bookshelf');
const knex = require('knex');

const schemas = require('./schemas');

class Database {
  constructor(config) {
    this.db = bookshelf(knex(config));
    this.schemas();
  }

  schemas() {
    for(let i=0;i<schemas.length;i++) {
      let schema = schemas[i];
      this[schema.tableName] = this.db.Model.extend(schema);
    }
  }
}

module.exports = Database;
