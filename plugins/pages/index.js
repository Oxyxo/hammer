'use strict';

const http = require('@hammer/http');
const db = require('@hammer/database');
const config = require('@hammer/config');
const render = require('@hammer/render');

module.exports = class Pages {
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

  handle() {
    let Pages = db.model('pages');
    http.router.get('*', function *(next) {
      const themes = require('@hammer/themes');
      let page = yield Pages.where('url', this.url).fetch();
      if(!page) {
        return yield *next;
      }

      page = page.toJSON();
      if(page.data) {
        console.log(page.data);
      }

      var template = yield themes.getTemplate(page.template).catch(()=> {});

      if(!template) {
        //TODO: send message back when no template found
        this.status = 500;
        return;
      }

      this.status = 200;
      this.body = template;
      return;
    });
  }

  servePage() {

  }
};
