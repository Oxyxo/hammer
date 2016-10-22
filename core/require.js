'use strict';

//TODO: expand module with plausibilty to add your own packages.

const _ = require('lodash');
const Module = require('module');
const config = require('./config');
const modules = require('./modules');

class Require {
  constructor() {
    this.originalRequire = Module.prototype.require;
    Module.prototype.require = this.require();
  }

  require() {
    let self = this;
    return function(path) {
      let Hammer = global.Hammer;
      let prefix = config.get.requirePrefix;

      if(prefix.base.test(path)) {
        let module = path.match(prefix.module);
        module.splice(0,1);
        //NOTE: in future plausibility to add adding nested require require('@hammer/render/serve')

        if(module && _.isArray(module)) {
          let getters = [Hammer.modules, Hammer.plugins.get];

          return new Proxy({}, {
            get: function(func, name) {
              for(let i=0;i<getters.length;i++) {
                if(getters[i][module[0]] && getters[i][module[0]][name]) {
                  return getters[i][module[0]][name];
                }
              }
            }
          });
        }

        return Hammer;
      }

      return self.originalRequire.apply(this, arguments);
    };
  }
}

module.exports = new Require();
