(function(object) {
    'use strict';
    
    /*
     * users.js'
     * -----------
     * get names from uids on unix from /etc/passwd'
    */
    
    var fs          = require('fs'),
        time        = require('./timem'),
        Util        = require('../util'),
        FILE        = '/etc/passwd',
        FileTime,
        Names;
    
    object.getNames = function(callback) {
        getTime(function(error, names) {
            Util.exec(callback, error, names);
        });
    };
    
    function getTime(callback) {
        time.get(FILE, 'raw', function(error, time) {
            if (error)
                callback(error);
            else if (FileTime === time) {
                    if (!Names)
                        error = 'user: parse error of ' + FILE;
                    
                    callback(error, Names);
                } else {
                    FileTime = time;
                    read(callback);
                }
         });
    }
    
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
