const knex = require('knex');

class Database {
  open(config) {
    this.knex = knex(config);
    return this;
  }
}

module.exports = new Database();
