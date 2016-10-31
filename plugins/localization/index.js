'use strict';

const db = require('@hammer/database');
const config = require('@hammer/config');
const render = require('@hammer/render');
const middleware = require('@hammer/middleware');

const _ = require('lodash');

module.exports = class Loc {
  initialize() {
    config.default = {
      "localization": {
        "sub": /^\w{2}(?=\.)/,
        "domain": /\.[^.]{2,3}(?:\.[^.]{2,3})?$/,
        "port": /(\d{2,4})$/,
        "url": /^(?:\/)(\w{2})(?:\/)/,
        "defaultLanguage": "en"
      }
    };

    db.addColumnsToTable('pages', {
      "lng": {"type": "string", "maxlength": 6, "nullable": false, "defaultTo": "en"}
    });

    middleware.on('on request', this.onRequest);
    middleware.on('page query', this.pageQuery);
  }

  get helpers() {
    return [
      {
        "name": "loc",
        "alias": ["lang", "localization"],
        "fn": this.helper
      }
    ];
  }

  helper() {
    return function *() {

    };
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
      loc: (loc ? loc : config.get.localization.defaultLanguage),
      href: href,
      host: host
    };

    done();
  }

  pageQuery(done, query, ctx) {
    let loc = ctx.localization.loc ? ctx.localization.loc : config.get.localization.defaultLanguage;
    query.lng = loc;
    done(null, query);
  }
};
