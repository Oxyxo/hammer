'use strict';

const db = require('@hammer/database');
const config = require('@hammer/config');
const plugins = require('@hammer/plugins');

const co = require('co');
const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const async = require('async');

class Themes {
  constructor(Hammer) {
    let deferred = Promise.defer(),
        promise = deferred.promise;

    config.default = {
      "themes": {
        "themesFolder": path.join(process.cwd(), 'themes'),
        "templatesFolder": "templates",
        "configFile": "theme.json"
      }
    };

    Promise.all([
      db.newTable('themes', {
        "id": {"type": "increments", "nullable": false, "primary": true},
        "name": {"type": "string", "maxlength": 150, "nullable": false, "unique": true},
        "folder": {"type": "string", "nullable": false},
        "active": {"type": "boolean", "nullable": false, "defaultTo": false}
      })
    ]).then(()=> {
      this.collect(config.get.themes.themesFolder).then(()=> {
        deferred.resolve(this);
      });
    });

    return promise;
  }

  collect(base) {
    let self = this;
    return co(function *() {
      let folders = fs.readdirSync(base),
          Themes = db.table('themes');

      let themes = yield Themes.where({});

      for(let i=0;i<themes.length;i++) {
        let theme = themes[i],
            folder = path.join(base, theme.folder);

        if(!_.pathExists(folder, 'isDirectory') || folders.indexOf(theme.folder) === -1) {
          yield Themes.where('id', theme.id).delete();
          continue;
        }

        folders.splice(folders.indexOf(theme.folder), 1);
      }

      for(let i=0;i<folders.length;i++) {
        let folder = folders[i],
            configPath = path.join(base, folder, config.get.themes.configFile);

        if(_.isHiddenPath(configPath)) {
          continue;
        }

        if(!_.pathExists(configPath)) {
          //TODO: log error when no config found.
          continue;
        }

        let themeConfig = fs.readJSONSync(configPath);
        yield Themes.insert({
          "name": themeConfig.name,
          "folder": folder
        });
      }
    });
  }

  active() {
    let Themes = db.model('themes');
    return co(function *() {
      let theme = yield Themes.forge().where('active', 1).fetch();
      if(!theme) {
        return null;
      }
      return theme.toJSON();
    });
  }

  folder() {
    let self = this;
    return co(function *() {
      let theme = yield self.active();
      if(!theme) {
        return;
      }

      return path.join(config.get.themes.themesFolder, theme.folder);
    });
  }

  template(template) {
    let self = this;
    return co(function *() {
      let theme = yield self.active();

      if(!theme) {
        return new Error('no active theme');
      }

      let folder = yield self.folder();
      let file = path.join(folder, config.get.themes.templatesFolder, template);

      if(!_.pathExists(file)) {
        return new Error('template does not exists');
      }

      return fs.readFileSync(file, 'utf-8');
    });
  }
}

module.exports = Themes;
