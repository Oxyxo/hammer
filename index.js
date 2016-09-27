'use strict';

let Hammer = require('./core'),
    App;

module.exports = function(config = {}) {
  if(App) {
    return App;
  }

  return new Hammer(config).then((core)=> {
    App = core;
  });
};
