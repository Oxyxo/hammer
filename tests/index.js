process.env.NODE_ENV = 'test';

const Hammer = require('../');

describe('startup Hammer', function() {
  it('should setup Hammer', (done)=> {
    Hammer.setup();
    done();
  });
});

require('./middleware');
