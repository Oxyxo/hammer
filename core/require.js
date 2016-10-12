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

          if(this.packages[module]) {
            return this.packages[module];
          }
        }

        return Hammer;
      }

      return self.originalRequire.apply(this, arguments);
    };
  }

  extend(name, fn) {
    if(this.packages[name]) {
      throw new Error(`the package ${name} already exists and cannot be created`);
    }
    this.packages[name] = fn;
  }

  remove(name) {
    if(!this.package[name]) {
      throw new Error(`the package ${name} was not found and cannot be removed. Plugins or core modules can not be removed via this function.`);
    }
    delete this.packages[name];
  }
}

module.exports = new Require();
