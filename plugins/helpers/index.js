'use strict';

const render = require('@hammer/render');
const intercom = require('@hammer/intercom');
const plugins = require('@hammer/plugins');

class Helpers {
  constructor(Hammer) {
    intercom.on('plugins running', this.register());
  }

  register() {
    return ()=> {
      render.helper('include', this.include);
    };
  }

  include(promise, ...args) {
    let themes = plugins.themes,
        promises = [];

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
    }).catch((...args)=> {
      //TODO: log error Front end or backend?
      return promise.resolve();
    });
  }
}

module.exports = Helpers;
