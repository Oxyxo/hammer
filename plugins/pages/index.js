'use strict';

const http        = require('@hammer/http');
const db          = require('@hammer/database');
const render      = require('@hammer/render');
const themes      = require('@hammer/themes');
const config      = require('@hammer/config');
const middleware  = require('@hammer/middleware');

const co          = require('co');
const _           = require('lodash');
const Api         = require('./api');

/**
 * This class handles Everything
 * that has something to do with Pages
 * @extends Api
 * @class Pages
 */
module.exports = class Pages extends Api {
  /**
   * This constructor function created the
   * nessesary db tables.
   * @constructs Pages
   */
  constructor() {
    super();
    let self = this;

    return co(function *() {
      config.default = {
        "pages": {
          "base": "/pages"
        }
      };

      yield db.newTable('pages', {
        "id": {"type": "increments", "nullable": false, "primary": true},
        "title": {"type": "string", "maxlength": 150, "nullable": false},
        "url": {"type": "string", "nullable": false, "unique": true},
        "template": {"type": "string", "nullable": false},
        "data": {"type": "json", "nullable": true}
      });

      return self;
    });
  }

  get routes() {
    return [
      {
        "method": "get",
        "url": "*",
        "fn": this.handle(),
        "base": false
      },
      {
        "method": "get",
        "url": [config.get.pages.base, "/json/:id"],
        "fn": this.getJSONPage()
      },
      {
        "method": "get",
        "url": [config.get.pages.base, "/:id"],
        "fn": this.getRenderedPage()
      }
    ];
  }

  /**
   * This handle is handling all incomming
   * GET requests. And returns the requested
   * page if found.
   * @method   Pages@handle
   */
  handle() {
    let self = this;
    let Pages = db.model('pages');

    return function *(next) {
      let page = yield self.renderPage(this.url, this);

      if(!page) {
        return yield *next;
      }

      this.status = 200;
      this.body = page;
    };
  }

  renderPage(id, ctx) {
    let self = this;
    let Pages = db.model('pages');

    return co(function *() {
      let page = yield self.getPage(id, ctx);
      if(!page) {
        return;
      }

      if(page.data) {
        let parsed = JSON.parse(page.data);
        page.data = render.pageData(parsed);
      }

      let template = yield themes.template(page.template).catch(()=>{});
      if(!template) {
        return;
      }

      let data = {ctx};

      this.type = 'text/html';
      let source = render.serve(template);
      return yield source(Object.assign(data, page.data));
    });
  }

  getPage(page, ctx) {
    let Pages = db.model('pages');
    return co(function *() {
      let [query] = yield middleware.call('page query', [{
        "url": page
      }, ctx], {
        dataUpdate: (orgi, data)=> {
          return Object.assign(orgi[0], data[0]);
        }
      });

      let data = yield Pages.forge().where(query).fetch();
      if(!data) {
        return false;
      }

      return data.toJSON();
    });
  }
};
