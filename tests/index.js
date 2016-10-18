process.env.NODE_ENV = 'test';

const path = require('path');
const Hammer = require('../');
const fs = require('fs-extra');
const should = require('should');
const config = require('./config');

describe('startup Hammer', function() {
  it('create tmp folder', (done)=> {
    fs.mkdirs(config.get.tmpDir, (err)=> {
      done(err);
    });
  });

  it('should setup Hammer', (done)=> {
    new Hammer({
      "logging": false,
      "database": {
        "client": "sqlite3",
        "connection": {
          "filename": path.join(config.get.tmpDir, config.get.databaseFile)
        }
      },
      "port": 9090
    }).then(()=> {
      done();
    });
  });
});

describe('middleware', function() {
  it('should call middleware', (done)=> {
    const middleware = require('@hammer/middleware');

    middleware.on('event', (cb)=> {
      cb();
    });

    middleware.call('event', []).then(()=> {
      done();
    });
  });

  it('should collect data over middleware', (done)=> {
    const middleware = require('@hammer/middleware');

    middleware.on('data_event', (cb, name)=> {
      cb(`hello ${name}`);
    });

    middleware.call('data_event', ['world']).then((data)=> {
      data[0].should.equal('hello world');
      done();
    });
  });
});

describe('clean up', function() {
  it('delete tmp dir', (done)=> {
    fs.remove(config.get.tmpDir, (err)=> {
      done(err);
    });
  });
});
