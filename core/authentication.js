'use strict';

const uuid = require('node-uuid');
const bcrypt = require('bcryptjs');
const config = require('./config');
const database = require('./database');

class Authentication {
  initialize() {
    let deferred = Promise.defer();
    let promise = deferred.promise;

    this.users = database.model('users');
    this.tokens = database.model('tokens');

    deferred.resolve();
    return promise;
  }

  new_token(id) {
    let deferred = Promise.defer();
    let promise = deferred.promise;

    if(!id) {
      deferred.reject(new Error('no user id given'));
    } else {
      this.users.where({"id": id}).fetch().then((user)=> {
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

    this.tokens.where({"access": access, "user": user}).fetch().then((token)=> {
      if(!token) {
        return deferred.reject(new Error('token not found'));
      }

      return deferred.resolve(token.toJSON());
    });

    return promise;
  }

  loginin(email, password) {
    let deferred = Promise.defer();
    let promise = deferred.promise;

    this.users.where({"email": email}).fetch().then((user)=> {
      if(!user) {
        return deferred.reject(new Error('user not found'));
      }


    });

    return promise;
  }

  logout() {
    //logout user and remove tokens
  }

  compare(input, hash) {
    let deferred = Promise.defer();
    let promise = deferred.promise;

    bcrypt.compare(input, hash, (err, res)=> {
      if(err) {
        return deferred.reject(err);
      }

      if(!res) {
        deferred.resolve(new Error('does not compare'));
      } else {
        deferred.resolve(res);
      }
    });

    return promise;
  }

  hash(string) {
    let deferred = Promise.defer();
    let promise = deferred.promise;

    if(!string) {
      promise.reject(new Error('no string given'));
    } else {
      bcrypt.genSalt(config.get.hashRounds, (err, salt)=> {
          bcrypt.hash(string, salt, (err, hash)=> {
              if(err) {
                return promise.reject(err);
              }
              promise.resolve(hash);
          });
      });
    }

    return promise;
  }
}

module.exports = new Authentication();
