const path = require('path');

class Config {
  constructor() {
    this._defaultConfig = {
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
        "routeBase": "/hammer/"
      },
      "logging": true
    };

    this._inputConfig = {};
  }

  set set(json) {
    this._inputConfig = Object.assign(this._inputConfig, json);
  }

  get set() {
    return this._inputConfig;
  }

  get get() {
    return Object.assign(this._defaultConfig, this._inputConfig);
  }

  set expand(json) {
    this._defaultConfig = Object.assign(this._defaultConfig, json);
  }

  get expand() {
    return this._defaultConfig;
  }
}

module.exports = new Config();
