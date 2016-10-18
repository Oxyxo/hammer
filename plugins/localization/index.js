'use strict';

const db = require('@hammer/database');
const middleware = require('@hammer/middleware');

module.exports = class Loc {
  running() {
    db.addColumnsToTable('pages', {
      "lng": {"type": "string", "nullable": false, "defaultTo": "en_EN"}
    });

    middleware.on('page query', this.pageQuery);
  }

  pageQuery(done, query, ctx) {
    let {url} = ctx.url,
        host = ctx.request.header.host;

    done(null, query);
  }
};
