'use strict';

const db = require('./');
const _ = require('lodash');

class Commands {
  addTableColumn(tableName, table, columnName) {
    let column,
        columnSpec = schema[tableName][columnName];

    if(columnSpec.type === 'text' && columnSpec.hasOwnProperty('fieldtype')) {
      column = table[columnSpec.type](columnName, columnSpec.fieldtype);
    } else if(columnSpec.type === 'string' && columnSpec.hasOwnProperty('maxlength')) {
      column = table[columnSpec.type](columnName, columnSpec.maxlength);
    } else {
      column = table[columnSpec.type](columnName);
    }

    if(columnSpec.hasOwnProperty('nullable') && columnSpec.nullable === true) {
      column.nullable();
    } else {
      column.notNullable();
    }
    if(columnSpec.hasOwnProperty('primary') && columnSpec.primary === true) {
      column.primary();
    }
    if(columnSpec.hasOwnProperty('unique') && columnSpec.unique) {
      column.unique();
    }
    if(columnSpec.hasOwnProperty('unsigned') && columnSpec.unsigned) {
      column.unsigned();
    }
    if(columnSpec.hasOwnProperty('references')) {
      // check if table exists?
      column.references(columnSpec.references);
    }
    if(columnSpec.hasOwnProperty('defaultTo')) {
      column.defaultTo(columnSpec.defaultTo);
    }
  }

  addColumn(tableName, column, transaction) {
    return (transaction || db.knex).schema.table(tableName, (table)=> {
      this.addTableColumn(tableName, table, column);
    });
  }

  createTable(table, transaction, schema) {
    return (transaction || db.knex).schema.createTableIfNotExists(table, (t)=> {
        let columnKeys = _.keys(schema);
        _.each(columnKeys, (column)=> {
          return this.addTableColumn(table, t, column);
        });
    });
  }
}

module.exports = new Commands();
