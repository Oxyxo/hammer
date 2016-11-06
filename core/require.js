'use strict';

const _         = require('lodash');
const Module    = require('module');
const config    = require('./config');
const modules   = require('./modules');

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
        //TODO: move getters in some way out of the proxy (plugins still need to be collected)

        if(module && _.isArray(module)) {
          return new Proxy({}, {
            get: function(func, name) {
              let getters = [Hammer.modules, Hammer.plugins.all];
              for(let i=0;i<getters.length;i++) {
                if(getters[i] && getters[i][module[0]] && getters[i][module[0]][name]) {
                  return getters[i][module[0]][name];
                }
              }
            },
            set: function(target, name, value) {
              let getters = [Hammer.modules, Hammer.plugins.all];
              for(let i=0;i<getters.length;i++) {
                if(getters[i] && getters[i][module[0]] && getters[i][module[0]][name]) {
                  getters[i][module[0]][name] = value;
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
