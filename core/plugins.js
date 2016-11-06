'use strict';

//TODO: All plugins (active and inactive) need to be stored in the database
//TODO: Make plausibility to check/add dependencies
//TODO: Do not start a new plugin that is not stored in the database. Each plugin needs to be started by calling the plugin run function or something.
//TODO: Add hammer version check
//TODO: Add error logs again

const co        = require('co');
const _         = require('lodash');
const log       = require('./log');
const path      = require('path');
const async     = require('async');
const fs        = require('fs-extra');
const http      = require('./http');
const semver    = require('semver');
const render    = require('./render');
const config    = require('./config');
const urljoin   = require('url-join');
const pk        = require('../package.json');
const intercom  = require('./intercom');

class Plugins {
  constructor() {
    this._plugins = {};
  }

  get all() {
    let plugins = {};
    for(var key in this._plugins) {
      if(this._plugins.hasOwnProperty(key)) {
        plugins[key] = this._plugins[key].class;
      }
    }

    return plugins;
  }

  init() {
    let self = this;
    return co(function *() {
      const _config = config.get.plugins;

      yield self.collect(_config.core, true);
      yield self.collect(_config.folder);

      log('plugins.running');
    });
  }

  /**
   * this function Collects all plugins
   * found in the given path.
   * @method   Plugins@collect
   * @param    {Array} folders Path to the given folder where all plugins need to be collected from.
   * @param    {Boolean} core Core plugins are imediatly activated
   */
  collect(folders, core) {
    let self = this;
    return co(function *() {
      if(!folders) {
        return;
      }

      if(!_.isArray(folders)) {
        folders = [folders];
      }

      for(let i=0;i<folders.length;i++) {
        let folder = folders[i];
        let plugins = fs.readdirSync(folder);

        for(let i=0;i<plugins.length;i++) {
          let plugin = path.join(folder, plugins[i]);

          if(_.pathExists(plugin, 'isDirectory')) {
            const _config = self.getConfig(plugin);

            if(!_config) {
              continue; //TODO: throw error no config found
            }

            if(!_config.name || self._plugins[_config.name]) {
              continue; //TODO: throw error that there is already a plugins collected with the same name
            }

            if(self.invalidConfig(_config)) {
              continue; //TODO: throw error config is not valid
            }

            self._plugins[_config.name] = {
              "folder": plugin,
              "core": core,
              "config": _config
            };

            let _class;
            if(core) {
              _class = yield self.activate(self._plugins[_config.name]);
            }

            self._plugins[_config.name].class = _class;
          }
        }
      }

      return this._plugins;
    });
  }

  /**
   * Get the config of a plugin by reading
   * the main config file.
   * @method   Plugins@getConfig
   * @param    {String} folder Path to the plugin
   */
  getConfig(folder) {
    const _config = require(path.join(folder, config.get.plugins.config));
    if(!_config || !_.isObject(_config)) {
      return; //TODO: throw error config does not exists or is not a valid json object
    }
    return _config;
  }

  invalidConfig(json) {
    if(!json.hammer) {
      //Warning no hammer version defined
    }

    if(!json.main) {
      //ERROR no main file defined
    }
  }

  activate(plugin) {
    let self = this;
    return co(function *() {
      let file = path.join(plugin.folder, plugin.config.main);
      let _plugin = require(file);

      if(!_.isFunction(_plugin)) {
        return; //TODO: throw error plugins exports no class
      }

      let _p = new _plugin();

      if(_.isPromise(_p)) {
        _p = yield _p;
      }

      self.initHelpers(_p);
      self.initRoutes(_p);

      return _p;
    });
  }

  deactivate() {

  }

  initHelpers(plugin) {
    if(!plugin.helpers) {
      return;
    }

    for(let i=0;i<plugin.helpers.length;i++) {
      let helper = plugin.helpers[i];

      let name = helper.name;
      if(helper.alias) {
        helper.alias.unshift(name);
        name = helper.alias;
      }

      render.helper(name, (helper.fn || helper.cb));
    }
  }

  initRoutes(plugin) {
    if(!plugin.routes) {
      return;
    }

    if(!_.isArray(plugin.routes)) {
      plugin.routes = [plugin.routes];
    }

    //TODO: add plausibility to set aliases
    for(let i=0;i<plugin.routes.length;i++) {
      let route = plugin.routes[i];

      if(route.base !== false) {
        route.url = _.joinUrl(config.get.plugins.base, route.url);
      }

      if(route.method == 'static') {
        http.static(route.url, (route.path || route.folder));
        continue;
      }

      http.router[route.method](route.url, (route.cb || route.fn));
    }
  }
}

module.exports = new Plugins();
