const path = require('path');

class Config {
  constructor() {
    this._config = {
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
        "configJSON": "config.json"
      }
    };
  }

  set set(json) {
    this._config = Object.assign(this._config, json);
  }

  get set() {
    return this._config;
  }

  get get() {
    return this._config;
  }
}

module.exports = new Config();
