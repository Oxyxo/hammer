const http = require('@hammer/http');
const config = require('@hammer/config');
const themes = require('@hammer/themes');

const co = require('co');
const path = require('path');

class Public {
  constructor() {
    config.default = {
      "publicFolder": path.join(process.cwd(), 'public')
    };

    http.static('/', this.handle);
  }

  handle() {
    return config.get.publicFolder;
  }
}

module.exports = Public;
