'use strict';

const http = require('@hammer/http');
const db = require('@hammer/database');
const config = require('@hammer/config');
const render = require('@hammer/render');

/**
 * This class handles Everything
 * that has something to do with Pages
 *
 * @class Pages
 */
module.exports = class Pages {
  /**
   * This constructor function expands
   * the default config and creates the db table
   * pages.
   *
   * @constructs Pages
   */
  constructor() {
    let deferred = Promise.defer(),
        promise = deferred.promise;

    config.expandDefault({
      "pages": {

      }
    });

    Promise.all([
      db.newTable('pages', {
        "id": {"type": "increments", "nullable": false, "primary": true},
        "title": {"type": "string", "maxlength": 150, "nullable": false},
        "url": {"type": "string", "nullable": false, "unique": true},
        "template": {"type": "string", "nullable": false},
        "data": {"type": "json", "nullable": true}
      })
    ]).then(deferred.resolve);

    this.handle();
    return deferred;
  }

  /**
   * This handle is handling all incomming
   * GET requests. the function checks if the
   * page/url is found in the database and returns
   * a renderd page.
   *
   * @method   Pages@handle
   */
  handle() {
    let Pages = db.model('pages');
    //This handle checks if the requested page/url is stored in the DB
    http.router.get('*', function *(next) {
      const themes = require('@hammer/themes');
      let page = yield Pages.where('url', this.url).fetch();
      if(!page) {
        return yield *next;
      }

      page = page.toJSON();
      if(page.data) {
        //We have to parse the stored JSON in the DB
        let parsed = JSON.parse(page.data);
        page.data = render.pageData(parsed);
      }

      var template = yield themes.getTemplate(page.template).catch(()=> {});
      if(!template) {
        //TODO: send message back when no template found
        this.status = 500;
        return;
      }

      let source = render.serve(template);
      this.status = 200;
      this.body = yield source(page.data);
      return;
    });
  }

  servePage() {

  }
};
