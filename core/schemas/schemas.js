'use strict';

module.exports = {
  "routes": {
    "id": {"type": "increments", "nullable": false, "primary": true},
    "url": {"type": "string", "nullable": false},
  },
  "users": {
    "name": {"type": "string", "nullable": false}
  }
};
