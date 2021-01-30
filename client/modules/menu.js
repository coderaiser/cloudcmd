/* global CloudCmd, DOM */

'use strict';

const exec = require('execon');
const wrap = require('wraptile');
const supermenu = require('supermenu');
const createElement = require('@cloudcmd/create-element');

const {FS} = require('../../common/cloudfunc');
const {getIdBySrc} = require('../dom/load');
const RESTful = require('../dom/rest');

const {
    config,
    Key,
} = CloudCmd;

const {
    Buffer,
    Events,
    Dialog,
    Images,
} = DOM;

const Info = DOM.CurrentInfo;
const alertNoFiles = Dialog.alert.noFiles;
const uploadTo = wrap(_uploadTo);

let MenuShowedName;
let MenuContext;
let MenuContextFile;

module.exports.ENABLED = false;

CloudCmd.Menu = exports;

module.exports.init = () => {
    const {
        isAuth,
        menuDataFile,
    } = getFileMenuData();
    
    const fm = DOM.getFM();
    const menuData = getMenuData(isAuth);
    const options = getOptions({type: 'context'});
    const optionsFile = getOptions({type: 'file'});
    
    MenuContext = supermenu(fm, options, menuData);
    MenuContextFile = supermenu(fm, optionsFile, menuDataFile);
    
    MenuContext.addContextMenuListener();
    MenuContextFile.addContextMenuListener();
    
    Events.addKey(listener);
};

module.exports.hide = hide;

function hide() {
    MenuContext.hide();
    MenuContextFile.hide();
}

module.exports.show = (position) => {
    const {x, y} = getPosition(position);
    
    MenuContext.show(x, y);
    MenuContextFile.show(x, y);
    
    Images.hide();
};

function getPosition(position) {
    if (position)
        return {
            x: position.x,
            y: position.y,
        };
    
    return getCurrentPosition();
}

function getMenuNameByEl(el) {
    if (!el)
        return 'context';
    
    const name = DOM.getCurrentName(el);
    
    if (name === '..')
        return 'context';
    
    return 'contextFile';
}

function getOptions({type}) {
    let name;
    let func;
    
    if (type === 'context') {
        name = 'context';
        func = Key.unsetBind;
    } else if (type === 'file') {
        name = 'contextFile';
    }
    
    const options = {
        icon        : true,
        beforeClose : Key.setBind,
        beforeShow  : exec.with(beforeShow, func),
        beforeClick,
        name,
    };
    
    return options;
}

function getMenuData(isAuth) {
    const menu = {
        'Paste': Buffer.paste,
        'New': {
            File: DOM.promptNewFile,
            Directory: DOM.promptNewDir,
        },
        'Upload': () => {
            CloudCmd.Upload.show();
        },
        'Upload From Cloud': uploadFromCloud,
        '(Un)Select All': DOM.toggleAllSelectedFiles,
    };
    
    if (isAuth)
        menu['Log Out'] = CloudCmd.logOut;
    
    return menu;
}

function getFileMenuData() {
    const isAuth = CloudCmd.config('auth');
    
    const menuBottom = getMenuData(isAuth);
    const menuTop = {
        'View': () => {
            CloudCmd.View.show();
        },
        'Edit': () => {
            const name = config('vim') ? 'EditFileVim' : 'EditFile';
            CloudCmd[name].show();
        },
        'Rename': () => {
            setTimeout(DOM.renameCurrent, 100);
        },
        'Delete': () => {
            CloudCmd.Operation.show('delete');
        },
        'Pack': () => {
            CloudCmd.Operation.show('pack');
        },
        'Extract': () => {
            CloudCmd.Operation.show('extract');
        },
        'Download': preDownload,
        'Upload To Cloud': uploadTo('Cloud'),
        'Cut': () => {
            isCurrent(Buffer.cut, alertNoFiles);
        },
        'Copy': () => {
            isCurrent(Buffer.copy, alertNoFiles);
        },
    };
    
    const menuDataFile = {
        ...menuTop,
        ...menuBottom,
    };
    
    return {
        isAuth,
        menuDataFile,
    };
}

function isCurrent(yesFn, noFn) {
    if (Info.name !== '..')
        return yesFn();
    
    noFn();
}

function isPath(x, y) {
    const {panel} = Info;
    const isEmptyRoot = !panel;
    
    if (isEmptyRoot)
        return false;
    
    const el = document.elementFromPoint(x, y);
    const elements = panel.querySelectorAll('[data-name="js-path"] *');
    const is = ~[].indexOf.call(elements, el);
    
    return is;
}

function beforeShow(callback, params) {
    const {name} = params;
    const el = DOM.getCurrentByPosition({
        x: params.x,
        y: params.y,
    });
    
    const menuName = getMenuNameByEl(el);
    
    let isShow = menuName !== 'contextFile';
    
    if (params.name === 'contextFile')
        isShow = !isShow;
    
    if (isShow)
        MenuShowedName = name;
    
    exec(callback);
    
    if (isShow)
        isShow = isPath(params.x, params.y);
    
    return isShow;
}

function beforeClick(name) {
    return MenuShowedName !== name;
}

async function _uploadTo(nameModule) {
    const [error, data] = await Info.getData();
    
    if (error)
        return;
    
    const {name} = Info;
    
    CloudCmd.execFromModule(nameModule, 'uploadFile', name, data);
    CloudCmd.log('Uploading to ' + name + '...');
}

function uploadFromCloud() {
    Images.show.load('top');
    
    CloudCmd.execFromModule('Cloud', 'saveFile', async (currentName, data) => {
        const path = DOM.getCurrentDirPath() + currentName;
        const [e] = await RESTful.write(path, data);
        
        if (e)
            return;
        
        await CloudCmd.refresh({currentName});
    });
}

function preDownload() {
    download(config('packer'));
}

function download(type) {
    const TIME = 30 * 1000;
    const {prefixURL} = CloudCmd;
    const PACK = '/pack';
    const date = Date.now();
    const files = DOM.getActiveFiles();
    
    if (!files.length)
        return alertNoFiles();
    
    for (const file of files) {
        const selected = DOM.isSelected(file);
        const isDir = DOM.isCurrentIsDir(file);
        const path = DOM.getCurrentPath(file);
        
        CloudCmd.log('downloading file ' + path + '...');
        /*
          * if we send ajax request -
          * no need in hash so we escape #
          * and all other characters, like "%"
          */
        const encodedPath = encodeURI(path).replace(/#/g, '%23');
        const id = getIdBySrc(path);
        
        let src;
        
        if (isDir)
            src = prefixURL + PACK + encodedPath + DOM.getPackerExt(type);
        else
            src = prefixURL + FS + encodedPath + '?download';
        
        const element = createElement('iframe', {
            id : id + '-' + date,
            async: false,
            className: 'hidden',
            src,
        });
        
        const {body} = document;
        const removeChild = body.removeChild.bind(body, element);
        
        setTimeout(removeChild, TIME);
        
        if (selected)
            DOM.toggleSelectedFile(file);
    }
}

function getCurrentPosition() {
    const current = Info.element;
    const rect = current.getBoundingClientRect();
    
    const position = {
        x: Math.round(rect.left + rect.width / 3),
        y: Math.round(rect.top),
    };
    
    return position;
}

function listener(event) {
    const {
        F9,
        ESC,
    } = Key;
    
    const key = event.keyCode;
    const isBind = Key.isBind();
    
    if (!isBind)
        return;
    
    if (key === ESC)
        return hide();
    
    if (key === F9) {
        const position = getCurrentPosition();
        MenuContext.show(position.x, position.y);
        
        event.preventDefault();
    }
}
