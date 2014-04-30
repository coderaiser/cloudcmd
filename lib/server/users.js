(function(object) {
    'use strict';
    
    if(!global.cloudcmd)
        return console.log(
            '# time.js'                                         + '\n'  +
            '# -----------'                                     + '\n'  +
            '# Module is part of Cloud Commander,'              + '\n'  +
            '# used for getting file change time.'              + '\n'  +
            '# http://cloudcmd.io'                              + '\n');
    
    var main        = global.cloudcmd.main,
        fs          = main.fs,
        time        = main.time,
        Util        = main.util,
        FILE        =  '/etc/passwd',
        FileTime,
        Names;
    
    object.getNames = function(callback) {
        getTime(function(error, names) {
            Util.exec(callback, error, names);
        });
    };
    
    function getTime(callback) {
        time.get(FILE, function(error, time) {
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
     * @pPasswd_s - строка, в которой находиться файл /etc/passwd
     */
    function get(passwd) {
        var uid, name, line,
            users   = {};
        
        if (passwd)
            do {
                line = passwd.substr(passwd, passwd.indexOf('\n') + 1);
                
                if (line) {
                    passwd = Util.rmStr(passwd, line);
                    
                    /* получаем первое слово строки */
                    name = line.substr(line, line.indexOf(':'));
                    line = Util.rmStr(line, name + ':x:');
                    
                    /* получаем uid */
                    uid = line.substr(line, line.indexOf(':'));
                    
                    if (uid)
                        users[uid] = name;
                }
            } while (passwd);
        
        return users;
    }
})(this);
