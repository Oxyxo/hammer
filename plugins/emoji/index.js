'use strict';

const emoji   = require('./emoji.json');
const render  = require('@hammer/render');

class Emoji {
  get helpers() {
    return [
      {
        "name": "emoji",
        "fn": this.handle
      }
    ];
  }

  handle(...args) {
    if(2 >= args.length) {
      return render.safeString(emoji[args[0]]);
    }

    let imgs = '';

    for(let i=0;i<(args.length - 1);i++) {
      imgs += `<img class="emoji" src="${emoji[args[i]]}" />`;
    }

    return render.safeString(imgs);
  }
}

module.exports = Emoji;
