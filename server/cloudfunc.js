'use strict';

const rendy = require('rendy');
const Entity = require('./entity');

/* КОНСТАНТЫ (общие для клиента и сервера)*/

/* название программы */
const NAME = 'Cloud Commander';
const FS = '/fs';

const Path = store();

Path('/');

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
    return  NAME + ' - ' + (path || Path());
};

/** Функция получает адреса каждого каталога в пути
 * возвращаеться массив каталогов
 * @param url -  адрес каталога
 */
function getPathLink(url, prefix, template) {
    if (!url)
        throw Error('url could not be empty!');
    
    if (!template)
        throw Error('template could not be empty!');
    
    const names = url
        .split('/')
        .slice(1, -1);
    
    const allNames = ['/', ...names];
    const length = allNames.length - 1;
    
    let path = '/';
    
    const pathHTML = allNames.map((name, index) => {
        const isLast = index === length;
        
        if (index)
            path += name + '/';
        
        if (index && isLast)
            return name + '/';
        
        const slash = index ? '/' : '';
        
        return rendy(template, {
            path,
            name,
            slash,
            prefix,
        });
    }).join('');
    
    return pathHTML;
}

/**
 * Функция строит таблицу файлв из JSON-информации о файлах
 * @param params - информация о файлах
 *
 */
module.exports.buildFromJSON = (params) => {
    const prefix = params.prefix;
    const template = params.template;
    const templateFile = template.file;
    const templateLink = template.link;
    const json = params.data;
    
    const {path, files} = json;
    
    const sort = params.sort || 'name';
    const order = params.order || 'asc';
    
    /*
     * Строим путь каталога в котором мы находимся
     * со всеми подкаталогами
     */
    const htmlPath = getPathLink(path, prefix, template.pathLink);
    
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
    Path(path);
    
    fileTable += header + '<ul data-name="js-files" class="files">';
    /* Если мы не в корне */
    if (path !== '/') {
        /* убираем последний слеш и каталог в котором мы сейчас находимся*/
        const lastSlash  = path.substr(path, path.lastIndexOf('/'))
        const dotDot = lastSlash.substr(lastSlash, lastSlash.lastIndexOf('/'));
        
        const link = prefix + FS + (dotDot || '/');
        
        const linkResult = rendy(template.link, {
            link,
            title       : '..',
            name        : '..'
        });
        
        const dataName = 'data-name="js-file-.." ';
        const attribute = 'draggable="true" ' + dataName;
        
        /* Сохраняем путь к каталогу верхнего уровня*/
        fileTable += rendy(template.file, {
            tag         : 'li',
            attribute,
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
        const size = getSize(file.size);
        
        const date = file.date || '--.--.----';
        const owner = file.owner || 'root';
        const mode = file.mode;
        
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

function store() {
    const data = {};
    return (value) => {
        if (typeof value !== 'undefined')
            data.value = value;
        
        return data.value;
    };
};

