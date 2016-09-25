'use strict';

const http = require('../http');

class Routes {
  constructor() {
    this._routes = [];
    http.server.all('/admin/*', this.handle);
  }

  handle(req, res, next) {
    res.send('admin');
  }
}

module.exports = new Routes();
