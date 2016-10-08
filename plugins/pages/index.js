'use strict';

const db = require('@hammer/database');
const config = require('@hammer/config');
const render = require('@hammer/render');
const middleware = require('@hammer/middleware');

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
    let Pages = db.table('pages');

    middleware.on('request', (next, req, res)=> {
      Pages.where('url', req.url).then((pages)=> {
        if(!pages || !pages[0]) {
          return next();
        }

        let page = pages[0];
        if(page.data) {
          page.data = JSON.parse(page.data);
        }

        next(res.send(Plugins.get.themes.getTemplate(page.template)));
      });
    });
  }

  servePage() {

  }
};
