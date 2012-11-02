var DIR,
    LIBDIR,
    SRVDIR,
    srvfunc;

exports.DIR     = DIR       = process.cwd()             + '/',
exports.LIBDIR  = LIBDIR    = DIR                       + 'lib/',
exports.SRVDIR  = SRVDIR    = LIBDIR                    + 'server/',
exports.srvfunc = srvfunc   = require(SRVDIR            + 'srvfunc'),

exports.path                = require('path'),
exports.fs                  = require('fs'),
exports.querystring         = require('querystring'),
exports.child_process       = require('child_process'),
exports.https               = require('https'),
exports.zlib                = srvfunc.require('zlib'), 
exports.cloudfunc           = srvfunc.require(LIBDIR    + 'cloudfunc'),
exports.util                = srvfunc.require(LIBDIR    + 'util'),
exports.update              = srvfunc.require(SRVDIR    + 'update'),
exports.appcache            = srvfunc.require(SRVDIR    + 'appcache'),
exports.auth                = srvfunc.require(SRVDIR    + 'auth'),
exports.socket              = srvfunc.require(SRVDIR    + 'socket'),
exports.object              = srvfunc.require(SRVDIR    + 'object'),

exports.config              = srvfunc.require(DIR + 'config');
exports.mainpackage         = srvfunc.require(DIR + 'package');