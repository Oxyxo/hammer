'use strict';

const _ = require('lodash');
const fs = require('fs');
const log = require('./log');
const path = require('path');
const async = require('async');
const modules = require('./modules');
const intercom = require('./intercom');

class Plugins {
  constructor() {
    this._plugins = {};
    this._config = {
      "pluginFolders": [path.join(__dirname, '../plugins'), path.join(process.cwd(), 'plugins')],
      "configJSON": "config.json"
    };

    modules.extend('plugins', this);
  }

  set config(inputConfig) {
    this._config = Object.assign(this._config, inputConfig);
  }

  get config() {
    return this._config;
  }

  fileExists(path, type) {
    try {
      let stats = fs.lstatSync(path);
      if(stats[type]) {

      }
    } catch(e) {
      return false;
    }

    return true;
  }

  _initialize() {
    this.deferred = Promise.defer();
    this.promise = this.deferred.promise;

    let pluginFolders = this.config.pluginFolders;
    if(!pluginFolders) {
      return; //TODO: throw error no pluginFolders defined
    }

    for(let i=0;i<pluginFolders.length;i++) {
      const folder = pluginFolders[i];
      try {
        fs.accessSync(folder, fs.F_OK);
      } catch(e) {
        return;
      }

      let plugins = fs.readdirSync(folder);
      for(let i=0;i<plugins.length;i++) {
        let plugin = path.join(folder, plugins[i]);
        if(!this.fileExists(path.join(plugin, this.config.configJSON))) {
          log('noPluginConfiguration', {
            "configFile": this.config.configJSON,
            "folder": plugin
          });
          continue;
        }

        let config = require(path.join(plugin, this.config.configJSON));
        this.expand(plugin, config);
      }

      this.constructPlugins();
    }

    this.deferred.resolve(this);
    return this.promise;
  }

  expand(base, config) {
    if(!config.name) {
      return log('noPluginName', {
        "code": config
      });
    }

    if(this._plugins[config.name]) {
      return log('pluginNameAlreadyInUse', {
        "name": config.name
      });
    }

    if(!config.main || !this.fileExists(path.join(base, config.main))) {
      return log('noPluginMainFile', {
        "code": config
      });
    }

    if(!config.hammer) {
      log('noCompatibleHammerVersionDefined', {
        "code": config
      });
    }

    //TODO: check if plugin is compatible with current Hammer version

    config.base = base;
    this._plugins[config.name] = config;
    return config;
  }

  constructPlugins() {
    intercom.emit('before_construct_plugins', [this._plugins]);

    let keys = _.keys(this._plugins),
        i = -1;

    async.whilst(()=> {
      i++; return i < keys.length;
    }, (done)=> {
      let plugin = this._plugins[keys[i]];
      if(plugin.initialised) {
        return done();
      }

      let main = require(path.join(plugin.base, plugin.main));
      new main(global.Hammer);

      this._plugins[keys[i]].initialised = true;
      return done();
    }, ()=> {
      intercom.emit('after_construct_plugins', [this._plugins]);
    });
  }

  deactivate() {

  }

  delete() {

  }
}

module.exports = new Plugins();
