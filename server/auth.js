'use strict';

const httpAuth = require('http-auth');
const criton = require('criton');
const currify = require('currify');
const middle = currify(_middle);

const config = require('./config');

module.exports = () => {
    const auth = httpAuth.basic({
        realm: 'Cloud Commander',
    }, check);
    
    return middle(auth);
};

function _middle(authentication, req, res, next) {
    const is = config('auth');
    
    if (!is)
        return next();
    
    const success = () => next(/* success */);
    authentication.check(req, res, success);
}

function check(username, password, callback) {
    const BAD_CREDENTIALS = false;
    const name = config('username');
    const pass = config('password');
    const algo = config('algo');
    
    if (!password)
        return callback(BAD_CREDENTIALS);
    
    const sameName = username === name;
    const samePass = pass === criton(password, algo);
    
    callback(sameName && samePass);
}

