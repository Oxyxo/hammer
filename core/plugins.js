'use strict';

const _ = require('lodash');
const log = require('./log');
const path = require('path');
const async = require('async');
const fs = require('fs-extra');
const http = require('./http');
const semver = require('semver');
const config = require('./config');
const urljoin = require('url-join');
const modules = require('./modules');
const pk = require('../package.json');
const intercom = require('./intercom');

class Plugins {
  constructor() {
    this._plugins = {};
    modules.extend('plugins', this);
  }

  initialize() {
    let deferred = Promise.defer(),
        promise = deferred.promise;

    let plugins = [],
        push = Array.prototype.push;

    this.mkdirsPluginFolders();

    if(config.get.plugins.corePlugins) {
      push.apply(plugins, this.collectPlugins(config.get.plugins.corePlugins, true));
    }

    if(config.get.plugins.pluginFolders) {
      push.apply(plugins, this.collectPlugins(config.get.plugins.pluginFolders));
    }

    if(plugins.length <= 0) {
      return deferred.resolve();
    }

    this.runCollectedPlugins(plugins).then(()=> {
      deferred.resolve();
    }).catch(()=> {
      deferred.reject();
    });

    return promise;
  }

  mkdirsPluginFolders() {
    let pluginFolders = config.get.plugins.pluginFolders;

    for(let i=0;i<pluginFolders.length;i++) {
      fs.mkdirsSync(pluginFolders[i]);
    }

    return pluginFolders;
  }

  collectPlugins(folders, core = false) {
    if(!folders) {
      return new Error('no folder defined');
    }

    if(!Array.isArray(folders)) {
      folders = [folders];
    }

    let _plugins = [];
    for(let i=0;i<folders.length;i++) {
      let folder = folders[i];
      let plugins = fs.readdirSync(folder);

      for(let i=0;i<plugins.length;i++) {
        let plugin = path.join(folder, plugins[i]);
        if(_.pathExists(plugin, 'isDirectory')) {
          _plugins.push({"folder": plugin, "core": core});
        }
      }
    }

    return _plugins;
  }

  runCollectedPlugins(plugins) {
    let deferred = Promise.defer(),
        promise = deferred.promise;

    let promises = [];
    for(let i=0;i<plugins.length;i++) {
      let plugin = plugins[i];
      promises.push(this.runPlugin(plugin.folder, plugin.core));
    }

    Promise.all(promises).then(()=> {
      deferred.resolve();
    }).catch(()=> {
      deferred.reject();
    });

    return promise;
  }

  runPlugin(folder, core) {
    let deferred = Promise.defer(),
        promise = deferred.promise;

    let configPath = path.join(folder, config.get.plugins.configJSON);
    fs.readJson(configPath, (err, pluginConfig)=> {
      if(err) {
        let message = log('plugin.config.not.json', {"config": configPath});
        return deferred.reject(new Error(message));
      }

      if(!pluginConfig.name) {
        let message = log('no.plugin.name', {"config": configPath});
        return deferred.reject(new Error(message));
      }

      if(this._plugins[pluginConfig.name]) {
        let message = log('plugin.name.already.in.use', {"name": pluginConfig.name});
        return deferred.reject(new Error(message));
      }

      if(!pluginConfig.hammer) {
        let message = log('plugin.no.compatible.hammer.version.defined', {"config": pluginConfig});
        return deferred.reject(new Error(message));
      }

      let mainFile = path.join(folder, pluginConfig.main);
      if(!_.pathExists(mainFile, 'isFile')) {
        let message = log('no.plugin.main.file', {"config": configPath});
        return deferred.reject(new Error(message));
      }

      let plugin = require(mainFile);
      if(!_.isFunction(plugin)) {
        let message = log('plugin.is.not.class', {"plugin": mainFile});
        return deferred.reject(new Error(message));
      }

      if(!semver.satisfies(pk.version, pluginConfig.hammer)) {
        log('plugin.not.compatible.with.current.hammer.version', {"name": pluginConfig.name, "version": pluginConfig.version});
      }

      //TODO: set timeout to check if callback is set

      let _plugin = new plugin(global.Hammer, ()=> {
        deferred.resolve();
      });

      this._plugins[pluginConfig.name] = _plugin;
    });

    return promise;
  }

  get(name) {
    return this._plugins[name];
  }

  newRoute(method, url, cb) {
    url = urljoin(config.get.plugins.routeBase, url);
    http.new(method, url, cb);
  }
}

module.exports = new Plugins();
