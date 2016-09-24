'use strict';

module.exports = {
  "users": {
    "id": {"type": "increments", "nullable": false, "primary": true},
    "uuid": {"type": "string", "maxlength": 150, "nullable": false, "unique": true},
    "name": {"type": "string", "maxlength": 150, "nullable": false, "unique": true},
    "password": {"type": "string", "nullable": false},
    "email": {"type": "string", "maxlength": 191, "nullable": false, "unique": true},
    "language": {"type": "string", "maxlength": 6, "nullable": false, "defaultTo": "en_US"},
    "last_login": {"type": "dateTime", "nullable": true},
    "created_at": {"type": "dateTime", "nullable": false},
    "created_by": {"type": "integer", "nullable": false},
    "updated_at": {"type": "dateTime", "nullable": true},
    "updated_by": {"type": "integer", "nullable": true}
  }
};
