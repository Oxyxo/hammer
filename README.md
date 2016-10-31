# Hammer
```
🙏 Hammer is currently under active development. The api can break/change without notice.
```

Hammer is a modular CMS with a small core. Everything in Hammer is a plugin (except the templates) and can be overwritten. The aim with Hammer is to create a flexible CMS that is focused on serving content based websites (yes Hammer is not another blog CMS 😱).

## Getting started

```
npm install projecthammer
```
or
```
yarn add projecthammer
```

The next thing that we have to do is create a small project that starts Hammer.

```
let Hammer = require('projecthammer');
new Hammer();
```

Yes, it is as simple as that. Hammer is now up and running on port 8080. 🎉

## Config

The configuration of Hammer can be overwritten/changed by passing an object as the first argument when constructing Hammer.

```
new Hammer({
  port: 5050,
  database: {
    client: "mysql",
    connection: {
      host : "127.0.0.1",
      user : "hammer",
      password : "super_secret_password",
      database : "super_website"
    }
  }
});
```
## Questions
For any questions and support please use the gitter chat room (coming soon). The issue list of this repo is **exclusively** for bug reports and feature requests.

## License
[MIT](http://opensource.org/licenses/MIT)

Copyright © 2016 Jeroen Rinzema
