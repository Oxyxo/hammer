const Modules = require('../').modules;
const should = require('should');

describe('create and call middleware', function() {
  it('should create middleware', (done)=> {
    Modules.middleware.on('random middleware', (cb, req, res)=> {

    });
  });
});
