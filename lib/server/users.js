(function(object) {
    'use strict';
    
    /*
     * users.js'
     * -----------
     * get names from uids on unix from /etc/passwd'
    */
    
    var fs          = require('fs'),
        ischanged   = require('./ischanged'),
        Util        = require('../util'),
        FILE        = '/etc/passwd',
        Names;
    
    object.getNames = function(callback) {
        ischanged(FILE, function(error, is) {
            if (error)
                callback(error);
            else if (is || !Names)
                read(callback);
            else
                callback(null, Names);
         });
    };
    
    function read(callback) {
        fs.readFile(FILE, 'utf8', function(error, passwd) {
            if (!error)
                Names   = get(passwd);
            
            callback(error, Names);
        });
    }
    
    
    /** Функция парсит uid и имена пользователей
     * из переданного в строке вычитаного файла /etc/passwd
     * и возвращает массив обьектов имён и uid пользователей
     * @param passwd - строка, в которой находиться файл /etc/passwd
     */
    function get(passwd) {
        var uid, name,
            passwdArray = passwd.split('\n'),
            users   = {};
        
            passwdArray.forEach(function(line) {
                passwd = Util.rmStr(passwd, line);
                
                /* получаем первое слово строки */
                name = line.substr(line, line.indexOf(':'));
                line = Util.rmStr(line, name + ':x:');
                
                /* получаем uid */
                uid = line.substr(line, line.indexOf(':'));
                
                if (uid)
                    users[uid] = name;
            });
        
        return users;
    }
})(this);
