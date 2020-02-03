'use strict';

const httpAuth = require('http-auth');
const criton = require('criton');
const currify = require('currify');
const middle = currify(_middle);
const check = currify(_check);

module.exports = (config) => {
    const auth = httpAuth.basic({
        realm: 'Cloud Commander',
    }, check(config));
    
    return middle(config, auth);
};

function _middle(config, authentication, req, res, next) {
    const is = config('auth');
    
    if (!is)
        return next();
    
    const success = () => next(/* success */);
    return authentication.check(success)(req, res);
}

function _check(config, username, password, callback) {
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

