'use strict';

const Hammer = require('./hammer');
const core = require('./core');
let Nail;

module.exports = function(config) {
  if(Nail) {
    return Nail;
  }

  Nail = new Hammer(config);
  new core(Nail.config);
  return Nail;
};
