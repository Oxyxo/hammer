'use strict';

const http = require('@hammer/http');
const db = require('@hammer/database');
const config = require('@hammer/config');

const _ = require('lodash');

class Api {
  constructor() {
    config.expandDefault({
      "pages": {
        "baseUrl": _.joinUrl(config.get.plugins.baseUrl, "/pages")
      }
    });

    let baseUrl = config.get.pages.baseUrl;
    http.new.route.get([[baseUrl, '/json/:id']], this.getJSONPage());
    http.new.route.get([[baseUrl, '/:id']], this.getRenderedPage());
  }

  getJSONPage() {
    let self = this;
    return function *() {
      let {id} = this.params;
      let {data} = yield self.getPage(id, this);
      this.body = data;
    };
  }

  getRenderedPage() {
    let self = this;
    return function *() {
      let {id} = this.params;
      let page = yield self.renderPage(id);

      if(!page) {
        this.status = 404;
        return;
      }

      this.type = 'text/html';
      this.body = page;
    };
  }
}

module.exports = Api;
