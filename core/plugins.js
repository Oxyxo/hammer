'use strict';

const fs = require('fs');
const log = require('./log');
const path = require('path');
const modules = require('./modules');
const middleware = require('./middleware');

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
    }
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

    this._plugins[config.name] = config;
    return config;
  }

  startup() {
    middleware.call('before_init_plugins', [this._plugins], ()=> {
    });
  }

  uninstall() {

  }
}

module.exports = new Plugins();
