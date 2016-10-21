'use strict';

const db = require('@hammer/database');
const config = require('@hammer/config');
const middleware = require('@hammer/middleware');

const _ = require('lodash');

module.exports = class Loc {
  initialize() {
    config.expandDefault({
      "localization": {
        "sub": /^\w{2}(?=\.)/,
        "domain": /\.[^.]{2,3}(?:\.[^.]{2,3})?$/,
        "port": /(\d{2,4})$/,
        "url": /^(?:\/)(\w{2})(?:\/)/
      }
    });

    db.addColumnsToTable('pages', {
      "lng": {"type": "string", "nullable": false, "defaultTo": "en", "maxlength": 5}
    });

    middleware.on('on request', this.onRequest);
    middleware.on('page query', this.pageQuery);
  }

  onRequest(done, ctx) {
    let href = ctx.url,
        {host} = ctx.request.header;

    let loc;
    let {sub, domain, url} = config.get.localization;

    if(sub.test(host)) {
      loc = host.match(sub)[0];
    }

    if(domain.test(host)) {
      //TODO: check top level domain and link it to a language
    }

    if(url.test(href)) {
      loc = href.match(url)[1];
      ctx.url = href.replace(url, '/');
    }

    ctx.localization = {
      loc: loc,
      href: href,
      host: host
    };

    done();
  }

  pageQuery(done, query, ctx) {
    let {loc} = ctx.localization;
    console.log(loc);
    if(!loc) {
      return done();
    }

    query.lng = loc;
    done(null, query);
  }
};
