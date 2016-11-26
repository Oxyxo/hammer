'use strict';

const db      = require('@hammer/database');
const config  = require('@hammer/config');
const render  = require('@hammer/render');

const fs      = require('fs');
const path    = require('path');

class Seo {
  constructor() {
    config.default = {
      "seo": {
        "templates": path.join(__dirname, 'templates')
      }
    };

    this.allow = [];
    this.disallow = [];
    this.sitemap = null;
  }

  get routes() {
    return [
      {
        "method": "get",
        "url": "/robots.txt",
        "fn": this.robots(),
        "base": false
      }
    ];
  }

  get helpers() {
    return [
      {
        "name": "meta",
        "alias": ["seo"],
        "fn": this.meta
      }
    ];
  }

  meta({data}) {
    let {root} = data;
    return function() {
      let meta = fs.readFileSync(path.join(config.get.seo.templates, 'meta.hbs'), 'utf-8');

      let template = render.serve(meta);
      return render.safeString(template(data));
    };
  }

  robots() {
    let self = this;
    return function() {
      let txt = fs.readFileSync(path.join(config.get.seo.templates, 'robots.hbs'), 'utf-8');
      let template = render.serve(txt);

      this.body = template({
        "allow": self.allow,
        "disallow": self.disallow,
        "sitemap": self.sitemap
      });

      this.type = 'document';
    };
  }
}

module.exports = Seo;
