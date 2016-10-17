'use strict';

const http = require('@hammer/http');
const db = require('@hammer/database');
const config = require('@hammer/config');

class Api {
  constructor() {
    config.expandDefault({
      "pages": {
        "urlBase": "/hammer/pages"
      }
    });

    let urlBase = config.get.pages.urlBase;
    http.new.route.get([[urlBase, '/json/:id']], this.getJSONPage());
    http.new.route.get([[urlBase, '/:id']], this.getRenderedPage());
  }

  getJSONPage() {
    let self = this;
    return function *() {
      let {id} = this.params;
      let {data} = yield self.getPage(id);
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
