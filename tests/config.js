const path = require('path');

class Config {
  constructor() {
    this._config = {
      "tmpDir": path.join(__dirname, 'tmp'),
      "databaseFile": 'database'
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
