'use strict';

const http = require('@hammer/http');
const db = require('@hammer/database');
const render = require('@hammer/render');
const themes = require('@hammer/themes');
const middleware = require('@hammer/middleware');

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

  get routes() {
    return [
      {
        "method": "get",
        "url": "*",
        "fn": this.handle()
      }
    ];
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

      var template = yield themes.getTemplate(page.template).catch(()=> {});
      if(!template) {
        return;
      }

      let source = render.serve(template);
      return yield source(page.data);
    });
  }

  getPage(page, ctx) {
    let Pages = db.model('pages');
    return co(function *() {
      let [query] = yield middleware.call('page query', [{
        where: {
          "url": page
        },
        orWhere: {
          "id": page
        }
      }, ctx], {
        updateData: (orgi, data)=> {
          return Object.assign(orgi[0], data[0]);
        }
      });

      let data = yield Pages.query(query).fetch();
      if(!data) {
        return false;
      }

      return data.toJSON();
    });
  }
};
