'use strict';

//TODO: expand module with plausibilty to add your own packages.

const _ = require('lodash');
const Module = require('module');
const config = require('./config');
const modules = require('./modules');

class Require {
  constructor() {
    this.packages = {};
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
        if(module && _.isArray(module)) {
          module = module[0];

          if(Hammer.modules[module]) {
            return Hammer.modules[module];
          }

          if(Hammer.plugins.get[module]) {
            return Hammer.plugins.get[module];
          }

          if(self.packages[module]) {
            return self.packages[module];
          }
        }

        return Hammer;
      }

      return self.originalRequire.apply(this, arguments);
    };
  }
}

module.exports = new Require();
