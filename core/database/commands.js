'use strict';

const database = require('./');
const _ = require('lodash');

class Commands {
  addTableColumn(table, columnName, columnSpec) {
    let column;

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

  addColumns(tableName, schema, db = database) {
    (db.knex || db).schema.table(tableName, (table)=> {
      _.each(schema, (column, key)=> {
        return this.addTableColumn(table, key, column);
      });
    }).then();
  }

  createTable(name, schema, db = database) {
    let deferred = Promise.defer(),
        promise = deferred.promise;

    (db.knex || db).schema.hasTable(name).then((table)=> {
      if(table) {
        return deferred.resolve();
      }

      (db.knex || db).schema.createTableIfNotExists(name, (table)=> {
        _.each(schema, (column, key)=> {
          return this.addTableColumn(table, key, column);
        });
      }).then(()=> {
        deferred.resolve();
      });
    });

    return promise;
  }
}

module.exports = new Commands();
