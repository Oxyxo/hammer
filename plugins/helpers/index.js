'use strict';

const render = require('@hammer/render');
const themes = require('@hammer/themes');
const intercom = require('@hammer/intercom');

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

  include(promise, ...args) {
    let promises = [];

    if(1 >= args.length) {
      //TODO: optionally log here that include tag does not contain template
      return promise.resolve();
    }

    for(let i=0;i<(args.length-1);i++) {
      let arg = args[i];
      promises.push(themes.getTemplate(arg));
    }

    Promise.all(promises).then((data)=> {
      return promise.resolve(render.safeString(data.join('')));
    }).catch((error)=> {
      //TODO: log error Front end or backend?
      return promise.resolve();
    });
  }

  header(promise) {
    promise.resolve();
  }

  footer(promise) {
    promise.resolve();
  }
};
