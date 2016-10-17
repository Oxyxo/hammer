'use strict';

const http = require('@hammer/http');
const db = require('@hammer/database');
const render = require('@hammer/render');
const themes = require('@hammer/themes');

const co = require('co');
const Api = require('./api');

/**
 * This class handles Everything
 * that has something to do with Pages
 *
 * @extends Api
 * @class Pages
 */
module.exports = class Pages extends Api {
  /**
   * This constructor function created the
   * nessesary db tables.
   *
   * @constructs Pages
   */
  constructor() {
    super();

    let deferred = Promise.defer(),
        promise = deferred.promise;

    this._routes = [];

    Promise.all([
      db.newTable('pages', {
        "id": {"type": "increments", "nullable": false, "primary": true},
        "title": {"type": "string", "maxlength": 150, "nullable": false},
        "url": {"type": "string", "nullable": false, "unique": true},
        "template": {"type": "string", "nullable": false},
        "data": {"type": "json", "nullable": true}
      })
    ]).then(()=> {
      deferred.resolve(this);
    });

    this.handle();
    return promise;
  }

  /**
   * This handle is handling all incomming
   * GET requests. And returns the requested
   * page if found.
   *
   * @method   Pages@handle
   */
  handle() {
    let self = this;
    let Pages = db.model('pages');

    let route = http.new.route.get('*', function *(next) {
      let page = yield self.renderPage(this.url);

      if(!page) {
        return yield *next;
      }

      this.status = 200;
      this.body = page;
    });

    this._routes.push(route);
  }

  renderPage(id) {
    let self = this;
    let Pages = db.model('pages');

    return co(function *() {
      let page = yield self.getPage(id);
      if(!page) {
        return;
      }

      if(page.data) {
        let parsed = JSON.parse(page.data);
        page.data = render.pageData(parsed);
      }

      var template = yield themes.getTemplate(page.template).catch(()=> {});
      if(!template) {
        return;
      }

      let source = render.serve(template);
      return yield source(page.data);
    });
  }

  getPage(page) {
    let Pages = db.model('pages');
    return co(function *() {
      let data = yield Pages.query({
        where: {
          "url": page
        },
        orWhere: {
          "id": page
        }
      }).fetch();

      if(!data) {
        return false;
      }

      return data.toJSON();
    });
  }

  deactivate() {
    for(let i=0;i<this._routes.length;i++) {
      let route = this._routes[i];
      route.destroy();
    }
  }
};
