'use strict';

const uuid = require('node-uuid');
const database = require('./database');

class Authentication {
  initialize() {
    let deferred = Promise.defer();
    let promise = deferred.promise;

    this.users = database.model('users');
    this.tokens = database.model('tokens');

    this.new_token(1).then((token)=> {
      console.log(token);
    }).catch((err)=> {
      console.log(err);
    });

    deferred.resolve();
    return promise;
  }

  new_token(id) {
    let deferred = Promise.defer();
    let promise = deferred.promise;

    if(!id) {
      deferred.reject(new Error('no user id given'));
    } else {
      this.users.where({'id': id}).fetch().then((user)=> {
        if(!user) {
          return deferred.reject(new Error('user not found'));
        }

        user = user.toJSON();
        let token = new this.tokens({
          "user": user.id,
          "access": uuid.v4(),
          "refresh": uuid.v4()
        });

        token.save();
        return deferred.resolve(token.toJSON());
      });
    }

    return promise;
  }

  token(access, user) {
    let deferred = Promise.defer();
    let promise = deferred.promise;

    this.tokens.where({'access': access, 'user': user}).fetch().then((token)=> {
      if(!token) {
        return deferred.reject(new Error('token not found'));
      }

      return deferred.resolve(token.toJSON());
    });

    return promise;
  }

  loginin() {
    //login user
  }

  logout() {
    //logout user and remove tokens
  }
}

module.exports = new Authentication();
