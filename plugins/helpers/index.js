'use strict';

const render = require('@hammer/render');
const themes = require('@hammer/themes');
const intercom = require('@hammer/intercom');

const _ = require('lodash');
const helpers = require('@hammer/helpers');

module.exports = class Helpers {
  get helpers() {
    return [
      {
        "name": "include",
        "fn": this.include
      },
      {
        "name": "header",
        "fn": this.header
      },
      {
        "name": "footer",
        "fn": this.footer
      }
    ];
  }

  include(...args) {
    return function *() {
      let promises = [];

      if(1 > args.length) {
        //TODO: optionally log here that include tag does not contain template
        return;
      }

      for(let i=0;i<(args.length);i++) {
        let arg = args[i];
        if(!_.isString(arg)) {
          continue;
        }

        promises.push(themes.getTemplate(arg));
      }

      let data = yield Promise.all(promises);
      return render.safeString(data.join(''));
    };
  }

  header() {
    return function *() {
      return yield helpers.include('header.html');
    };
  }

  footer() {
    return function *() {
      return yield helpers.include('footer.html');
    };
  }
};
