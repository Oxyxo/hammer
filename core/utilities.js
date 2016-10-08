const fs = require('fs');
const _ = require('lodash');
const Module = require('module');
const config = require('./config');
const modules = require('./modules');

class Utilities {
  constructor() {
    this.mixin();
    this.overrideRequire();
  }

  mixin() {
    _.mixin({
      'pathExists': this.pathExists
    });
  }

  pathExists(path, type) {
    try {
      let stats = fs.lstatSync(path);
      if(type && !stats[type]()) {
        return false;
      }
    } catch(e) {
      return false;
    }

    return true;
  }

  overrideRequire() {
    let originalRequire = Module.prototype.require;
    let prefix = config.get.requirePrefix;

    Module.prototype.require = function(path) {
      let Hammer = global.Hammer;
      if(prefix.base.test(path)) {
        let module = path.match(prefix.module);
        if(module && _.isArray(module)) {
          module = module[0];

          if(Hammer.modules[module]) {
            return Hammer.modules[module];
          }

          if(Hammer.plugins[module]) {
            return Hammer.plugins[module];
          }
        }

        return Hammer;
      }

      return originalRequire.apply(this, arguments);
    };
  }
}

module.exports = Utilities;
