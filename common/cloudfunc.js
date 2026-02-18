import {rendy} from 'rendy';
import currify from 'currify';
import store from 'fullstore';
import {encode} from '#common/entity';

export const getHeaderField = currify(_getHeaderField);

/* КОНСТАНТЫ (общие для клиента и сервера)*/
/* название программы */
const NAME = 'Cloud Commander';

export const FS = '/fs';

const Path = store();

Path('/');

const filterOutDotFiles = ({showDotFiles}) => ({name}) => {
    if (showDotFiles)
        return true;
    
    return !name.startsWith('.');
};

export const apiURL = '/api/v1';
export const MAX_FILE_SIZE = 500 * 1024;

export const formatMsg = (msg, name, status) => {
    status = status || 'ok';
    name = name || '';
    
    if (name)
        name = `("${name}")`;
    
    return `${msg}: ${status}${name}`;
};

/**
 * Функция возвращает заголовок веб страницы
 * @path
 */
export const getTitle = (options) => {
    options = options || {};
    
    const {path = Path(), name} = options;
    
    const array = [
        name || NAME,
        path,
    ];
    
    return array
        .filter(Boolean)
        .join(' - ');
};

/** Функция получает адреса каждого каталога в пути
 * возвращаеться массив каталогов
 * @param url -  адрес каталога
 */
export function getPathLink(url, prefix, template) {
    if (!url)
        throw Error('url could not be empty!');
    
    if (!template)
        throw Error('template could not be empty!');
    
    const names = url
        .split('/')
        .slice(1, -1);
    
    const allNames = [
        '/',
        ...names,
    ];
    
    const lines = [];
    const n = allNames.length;
    
    let path = '/';
    
    for (let i = 0; i < n; i++) {
        const name = allNames[i];
        const isLast = i === n - 1;
        
        if (i)
            path += `${name}/`;
        
        if (i && isLast) {
            lines.push(`${name}/`);
            continue;
        }
        
        const slash = i ? '/' : '';
        
        lines.push(rendy(template, {
            path,
            name,
            slash,
            prefix,
        }));
    }
    
    return lines.join('');
}

export function _getDataName(name) {
    const encoded = btoa(encodeURI(name));
    return `data-name="js-file-${encoded}" `;
}

/**
 * Функция строит таблицу файлв из JSON-информации о файлах
 * @param params - информация о файлах
 *
 */
export const buildFromJSON = (params) => {
    const {
        prefix,
        template,
        sort = 'name',
        order = 'asc',
        showDotFiles,
    } = params;
    
    const templateFile = template.file;
    const templateLink = template.link;
    const json = params.data;
    
    const path = encode(json.path);
    const {files} = json;
    
    /*
     * Строим путь каталога в котором мы находимся
     * со всеми подкаталогами
     */
    const htmlPath = getPathLink(path, prefix, template.pathLink);
    
    let fileTable = rendy(template.path, {
        link: prefix + FS + path,
        fullPath: path,
        path: htmlPath,
    });
    
    const owner = 'owner';
    const mode = 'mode';
    
    const getFieldName = getHeaderField(sort, order);
    
    const name = getFieldName('name');
    const size = getFieldName('size');
    const date = getFieldName('date');
    
    const header = rendy(templateFile, {
        tag: 'div',
        attribute: 'data-name="js-fm-header" ',
        className: 'fm-header',
        type: '',
        name,
        size,
        date,
        owner,
        mode,
    });
    
    /* сохраняем путь */
    Path(path);
    
    fileTable += `${header}<ul data-name="js-files" class="files">`;
    
    /* Если мы не в корне */
    if (path !== '/') {
        const dotDot = getDotDot(path);
        const link = prefix + FS + dotDot;
        
        const linkResult = rendy(template.link, {
            link,
            title: '..',
            name: '..',
        });
        
        const dataName = _getDataName('..');
        const attribute = `draggable="true" ${dataName}`;
        
        /* Сохраняем путь к каталогу верхнего уровня*/
        fileTable += rendy(template.file, {
            tag: 'li',
            attribute,
            className: '',
            type: 'directory',
            name: linkResult,
            size: '&lt;dir&gt;',
            date: '--.--.----',
            owner: '.',
            mode: '--- --- ---',
        });
    }
    
    fileTable += files
        .filter(filterOutDotFiles({
            showDotFiles,
        }))
        .map(updateField)
        .map((file) => {
            const name = encode(file.name);
            const link = prefix + FS + path + name;
            
            const {
                type,
                mode,
                date,
                owner,
                size,
            } = file;
            
            const linkResult = rendy(templateLink, {
                link,
                title: name,
                name,
                attribute: getAttribute(file.type),
            });
            
            const dataName = _getDataName(file.name);
            const attribute = `draggable="true" ${dataName}`;
            
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
        })
        .join('');
    
    fileTable += '</ul>';
    
    return fileTable;
};

const updateField = (file) => ({
    ...file,
    date: file.date || '--.--.----',
    owner: file.owner || 'root',
    size: getSize(file),
});

function getAttribute(type) {
    if (type === 'directory')
        return '';
    
    return 'target="_blank" ';
}

export const _getSize = getSize;

function getSize({size, type}) {
    if (type === 'directory')
        return '&lt;dir&gt;';
    
    if (/link/.test(type))
        return '&lt;link&gt;';
    
    return size;
}

function _getHeaderField(sort, order, name) {
    const arrow = order === 'asc' ? '↑' : '↓';
    
    if (sort !== name)
        return name;
    
    if (sort === 'name' && order === 'asc')
        return name;
    
    return `${name}${arrow}`;
}

export function getDotDot(path) {
    // убираем последний слеш и каталог в котором мы сейчас находимся
    const lastSlash = path.substr(path, path.lastIndexOf('/'));
    const dotDot = lastSlash.substr(lastSlash, lastSlash.lastIndexOf('/'));
    
    if (!dotDot)
        return '/';
    
    return dotDot;
}
