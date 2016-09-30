'use strict';

//FIXME: i am not really happy with how this code flows

const _ = require('lodash');
const fs = require('fs-extra');
const log = require('./log');
const path = require('path');
const async = require('async');
const modules = require('./modules');
const intercom = require('./intercom');

class Plugins {
  constructor() {
    this._plugins = {};
    this._config = {
      "corePlugins": path.join(__dirname, '../plugins'),
      "pluginFolders": [path.join(process.cwd(), 'plugins')],
      "configJSON": "config.json"
    };

    for(let i=0;i<this.config.pluginFolders.length;i++) {
      fs.mkdirsSync(this.config.pluginFolders[i]);
    }

    modules.extend('plugins', this);
  }

  set config(inputConfig) {
    this._config = Object.assign(this._config, inputConfig);
  }

  get config() {
    return this._config;
  }

  initialize(config = {}) {
    let deferred = Promise.defer();
    let promise = deferred.promise;

    if(!this.config.corePlugins) {
      return deferred.reject(new Error(log('no.core.plugin.folder.defined')));
    }

    let folders = [
      this.initializeFolder(this.config.corePlugins, true)
    ];

    if(this.config.pluginFolders) {
      let pluginFolders = this.config.pluginFolders;
      if(!this.config.pluginFolders || !Array.isArray(pluginFolders)) {
        log('config.plugins.folder.is.not.array');
      } else {
        for(let i=0;i<pluginFolders.length;i++) {
          folders.push(this.initializeFolder(this.config.pluginFolders[i]));
        }
      }
    }

    this.config = config;
    Promise.all(folders).then(()=> {
      deferred.resolve();
    });

    return promise;
  }

  initializeFolder(folders, core = false) {
    let deferred = Promise.defer();
    let promise = deferred.promise;

    if(!Array.isArray(folders)) {
      folders = [folders];
    }

    let plugins = [];
    for(let i=0;i<folders.length;i++) {
      plugins.push(this.runPluginsInFolder(folders[i], core));
    }

    Promise.all(plugins).then(()=> {
      deferred.resolve();
    });

    return promise;
  }

  runPluginsInFolder(folder, core = false) {
    let deferred = Promise.defer();
    let promise = deferred.promise;

    const base = folder;
    if(!fs.existsSync(folder) || !fs.statSync(folder).isDirectory()) {
      return log('plugin.folder.does.not.exists.or', {"path": folder});
    }

    let folders = fs.readdirSync(folder).filter((file)=> {
      return fs.statSync(path.join(folder, file)).isDirectory();
    });

    if(folders.length <= 0) {
      return deferred.resolve();
    }

    folders.forEach((folder, index)=> {
      const pluginBase = path.join(base, folder);
      let config = path.join(pluginBase, this.config.configJSON);

      if(!fs.statSync(config).isFile()) {
        let message = log('no.plugin.configuration', {"configFile": this.config.configJSON, "folder": folder});
        return deferred.reject(new Error(message));
      }

      fs.readJson(config, (err, json)=> {
        if(err) {
          let message = log('plugin.config.not.json', {"configFile": this.config.configJSON, "folder": folder});
          return deferred.reject(new Error(message));
        }

        this.runPlugin(pluginBase, json, core);

        if(index === (folders.length-1)) {
          return deferred.resolve();
        }
      });
    });

    return promise;
  }

  fileExists(path, type) {
    try {
      let stats = fs.lstatSync(path);
      if(type && !stats[type]) {
        return false;
      }
    } catch(e) {
      return false;
    }

    return true;
  }

  runPlugin(base, config, core) {
    if(!config.name) {
      return log('no.plugin.name', {
        "code": config
      });
    }

    if(this._plugins[config.name]) {
      return log('plugin.name.already.in.use', {
        "name": config.name
      });
    }

    if(!config.main || !this.fileExists(path.join(base, config.main))) {
      return log('no.plugin.main.file', {
        "code": config
      });
    }

    if(!config.hammer) {
      log('no.compatible.hammer.version.defined', {
        "code": config
      });
    }

    //TODO: check if plugin is compatible with current Hammer version

    config.core = core;
    config.base = base;

    this._plugins[config.name] = config;

    let main = path.join(base, config.main);
    let plugin = require(main);

    if(!_.isFunction(plugin)) {
      return log('plugin.is.not.class', {"plugin": main});
    }

    new plugin(global.Hammer);
    return config;
  }

  deactivate() {

  }

  delete() {

  }
}

module.exports = new Plugins();
