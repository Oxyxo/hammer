'use strict';

const db = require('@hammer/database');
const config = require('@hammer/config');
const render = require('@hammer/render');

const fs = require('fs');
const path = require('path');

class Seo {
  initialize() {
    config.expandDefault({
      "seo": {
        "templates": path.join(__dirname, 'templates')
      }
    });
  }

  get helpers() {
    return [
      {
        "name": "meta",
        "alias": ["seo"],
        "fn": this.metaHelper
      }
    ];
  }

  metaHelper(...args) {
    return function *() {
      let meta = fs.readFileSync(path.join(config.get.seo.templates, 'meta.hbs'), 'utf-8');

      let template = render.serve(meta);
      return render.safeString(template());
    };
  }

  getMeta() {

  }
}

module.exports = Seo;
