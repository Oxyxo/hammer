process.env.NODE_ENV = 'test';

const path = require('path');
const fs = require('fs-extra');
const Hammer = require('../core');
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
      }
    }).then((core)=> {
      if(core) {
        done();
      }
    });
  });
});

//require('./middleware');

describe('clean up', function() {
  it('delete tmp dir', (done)=> {
    fs.remove(config.get.tmpDir, (err)=> {
      done(err);
    });
  });
});
