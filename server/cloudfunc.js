'use strict';

const rendy = require('rendy');
const Entity = require('./entity');

/* КОНСТАНТЫ (общие для клиента и сервера)*/

/* название программы */
const NAME = 'Cloud Commander';
const FS = '/fs';

let Path;

module.exports.FS = FS;
module.exports.apiURL = '/api/v1';
module.exports.MAX_FILE_SIZE = 500 * 1024;
module.exports.Entity = Entity;

module.exports.formatMsg = (msg, name, status = 'ok') => {
    if (name)
        name = '("' + name + '")';
    else
        name = '';
    
    return msg + ': ' + status + name;
};

/**
 * Функция возвращает заголовок веб страницы
 * @path
 */
module.exports.getTitle = (path) => {
    if (!Path)
        Path = '/';
    
    return  NAME + ' - ' + (path || Path);
};

/** Функция получает адреса каждого каталога в пути
 * возвращаеться массив каталогов
 * @param url -  адрес каталога
 */
function getPathLink(url, prefix, template) {
    var namesRaw, names, length,
        pathHTML    = '',
        path        = '/';
    
    if (!url)
        throw Error('url could not be empty!');
    
    if (!template)
        throw Error('template could not be empty!');
    
    namesRaw    = url.split('/')
                     .slice(1, -1),
    
    names       = [].concat('/', namesRaw),
    
    length      = names.length - 1;
    
    names.forEach((name, index) => {
        var slash       = '',
            isLast      = index === length;
        
        if (index)
            path        += name + '/';
        
        if (index && isLast) {
            pathHTML    += name + '/';
        } else {
            if (index)
                slash = '/';
            
            pathHTML    += rendy(template, {
                path: path,
                name: name,
                slash: slash,
                prefix: prefix
            });
        }
    });
    
    return pathHTML;
}

/**
 * Функция строит таблицу файлв из JSON-информации о файлах
 * @param params - информация о файлах
 *
 */
module.exports.buildFromJSON = (params) => {
    var attribute,
        dotDot, link, dataName,
        linkResult,
        prefix          = params.prefix,
        template        = params.template,
        templateFile    = template.file,
        templateLink    = template.link,
        json            = params.data,
        files           = json.files,
        path            = json.path,
        
        sort            = params.sort || 'name',
        order           = params.order || 'asc',
        
        /*
         * Строим путь каталога в котором мы находимся
         * со всеми подкаталогами
         */
        htmlPath        = getPathLink(path, prefix, template.pathLink);
    
    let fileTable = rendy(template.path, {
        link        : prefix + FS + path,
        fullPath    : path,
        path        : htmlPath
    });
    
    let name = 'name';
    let size = 'size';
    let date = 'date';
    const owner = 'owner';
    const mode = 'mode';
    const arrow = order === 'asc' ?  '↑' : '↓';
    
    if (sort === 'name' && order !== 'asc')
        name += arrow;
    else if (sort === 'size')
        size += arrow;
    else if (sort === 'date')
        date += arrow;
    
    const header = rendy(templateFile, {
        tag         : 'div',
        attribute   : 'data-name="js-fm-header" ',
        className   : 'fm-header',
        type        : '',
        name,
        size,
        date,
        owner,
        mode,
    });
    
    /* сохраняем путь */
    Path = path;
    
    fileTable += header + '<ul data-name="js-files" class="files">';
    /* Если мы не в корне */
    if (path !== '/') {
        /* убираем последний слеш и каталог в котором мы сейчас находимся*/
        dotDot = path.substr(path, path.lastIndexOf('/'));
        dotDot = dotDot.substr(dotDot, dotDot.lastIndexOf('/'));
        /* Если предыдущий каталог корневой */
        if (dotDot === '')
            dotDot = '/';
        
        link = prefix + FS + dotDot;
        
        linkResult = rendy(template.link, {
            link        : link,
            title       : '..',
            name        : '..'
        });
        
        dataName = 'data-name="js-file-.." ';
        attribute = 'draggable="true" ' + dataName;
        
        /* Сохраняем путь к каталогу верхнего уровня*/
        fileTable += rendy(template.file, {
            tag         : 'li',
            attribute   : attribute,
            className   : '',
            type        : 'directory',
            name        : linkResult,
            size        : '&lt;dir&gt;',
            date        : '--.--.----',
            owner       : '.',
            mode        : '--- --- ---'
        });
    }
    
    fileTable += files.map((file) => {
        const link = prefix + FS + path + file.name;
        
        const type = getType(file.size);
        const  size = getSize(file.size);
        
        const  date = file.date || '--.--.----';
        const  owner = file.owner || 'root';
        const  mode = file.mode;
        
        const linkResult = rendy(templateLink, {
            link,
            title: file.name,
            name: Entity.encode(file.name),
            attribute: getAttribute(file.size)
        });
        
        const dataName = 'data-name="js-file-' + file.name + '" ';
        const attribute = 'draggable="true" ' + dataName;
        
        return rendy(templateFile, {
            tag: 'li',
            attribute,
            className: '',
            type,
            name: linkResult,
            size,
            date,
            owner,
            mode,
        });
    }).join('');
    
    fileTable += '</ul>';
    
    return fileTable;
};

function getType(size) {
    if (size === 'dir')
        return 'directory';
    
    return 'text-file';
}

function getAttribute(size) {
    if (size === 'dir')
        return '';
    
    return 'target="_blank" ';
}

function getSize(size) {
    if (size === 'dir')
        return '&lt;dir&gt;';
    
    return size;
}

