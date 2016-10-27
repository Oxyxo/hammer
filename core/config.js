'use strict';

const _ = require('lodash');
const path = require('path');
const render = require('./render');

/**
 * With the config class can you
 * set and get the current set config.
 * @class Config
 */
class Config {
  /**
   * The constructor sets the default config
   * and sets a input object to be used
   * later on when a new config is set or get.
   * @constructs Config
   */
  constructor() {
    this._default = {
      "port": 8080,
      "database": {
        "client": "sqlite3",
        "connection": {
          "filename": path.join(process.cwd(), 'database')
        }
      },
      "hammerRoot": __dirname,
      "hashRounds": 10,
      "plugins": {
        "corePlugins": path.join(__dirname, '../plugins'),
        "pluginFolders": [path.join(process.cwd(), 'plugins')],
        "configJSON": "config.json",
        "baseUrl": "/hammer/"
      },
      "logging": true,
      "requirePrefix": { //NOTE: improve the regex? (i am not a regex jedi)
        "base": /^@hammer/,
        "module": /(?!\/)\w+/g
      }
    };

    this._input = {};
  }

  /**
   * merges the given object with the already
   * set config. Warning: The given json can
   * override previously setted config.
   * @param    {Object} json This object wil be merged with the current active set config.
   * @method   Config@set
   */
  set set(json = {}) {
    if(!_.isObject(json)) {
      return;
    }
    this._input = Object.assign(this._input, json);
  }

  /**
   * This getter returns the current set input config.
   * @method  Config@set
   * @returns {Object} The current set input config.
   */
  get set() {
    return this._input;
  }

  /**
   * This getter returns the set config merged
   * with the default config.
   * @method   Config@get
   * @returns {Object} The config object.
   */
  get get() {
    return Object.assign(this._default, this._input);
  }

  /**
   * The setted object wil be overriding the
   * default config.
   * @method   Config@default
   * @param    {Object} json This object wil be merged with the default config.
   */
  set default(json = {}) {
    if(!_.isObject(json)) {
      return;
    }
    this._default = Object.assign(this._default, json);
  }

  /**
   * Returns the
   * @method   default
   * @callback {[type]} [description]
   */
  get default() {
    return this._default;
  }
}

module.exports = new Config();
