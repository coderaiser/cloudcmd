/* global CloudCmd, DOM, CloudFunc */

'use strict';

CloudCmd.Menu = MenuProto;

const exec = require('execon');
const currify = require('currify/legacy');

const load = require('./load');
const RESTful = require('./rest');
const bind = (f, ...a) => (...b) => f(...a, ...b);

function MenuProto(position) {
    const config = CloudCmd.config;
    const Buffer = DOM.Buffer;
    const Info = DOM.CurrentInfo;
    
    let Loading = true;
    const Key = CloudCmd.Key;
    const Events = DOM.Events;
    const Dialog = DOM.Dialog;
    const Images = DOM.Images;
    const Menu = this;
    const TITLE = 'Menu';
    const alert = currify(Dialog.alert, TITLE);
    const alertNoFiles = () => Dialog.alert.noFiles(TITLE);
    
    let MenuShowedName;
    let MenuContext;
    let MenuContextFile;
    
    this.ENABLED = false;
    
    function init() {
        Loading  = true;
        Menu.show();
        
        Events.addKey(listener);
    }
    
    this.hide = () => {
        MenuContext.hide();
        MenuContextFile.hide();
    };
    
    this.show = (position = {}) => {
        const {
            x = 0,
            y = 0,
        } = position;
        
        const showFunc = () => {
            show(x, y);
            Images.hide();
        };
        
        exec.if(window.MenuIO, showFunc, () => {
            DOM.loadMenu((error) => {
                if (error)
                    return alert(error);
                
                showFunc();
            });
        });
    };
    
    function show(x, y) {
        if (!x || !y) {
            if (position) {
                x = position.x;
                y = position.y;
            } else {
                const pos = getCurrentPosition();
                
                x = pos.x;
                y = pos.y;
            }
        }
        
        if (!Loading) {
            MenuContext.show(x, y);
            MenuContextFile.show(x, y);
            return;
        }
        
        loadFileMenuData((isAuth, menuDataFile) => {
            const NOT_FILE = true;
            const fm = DOM.getFM();
            const menuData = getMenuData(isAuth);
            const options = getOptions(NOT_FILE);
            const optionsFile = getOptions();
            const MenuIO = window.MenuIO;
            
            MenuContext = new MenuIO(fm, options, menuData);
            MenuContextFile = new MenuIO(fm, optionsFile, menuDataFile);
            
            const is = DOM.getCurrentByPosition({x, y});
            const menu = is ? MenuContextFile : MenuContext;
            
            menu.show(x, y);
            
            Loading = false;
            position = null;
        });
    }
    
    function getOptions(notFile) {
        let name, func;
        
        if (notFile) {
            name    = 'context';
            func    = Key.unsetBind;
        } else {
            name    = 'contextFile';
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
                'File': DOM.promptNewFile,
                'Directory': DOM.promptNewDir
            },
            'Upload': () => {
                CloudCmd.Upload.show();
            },
            'Upload From Cloud': uploadFromCloud,
            '(Un)Select All': DOM.toggleAllSelectedFiles
        };
        
        if (isAuth)
            menu['Log Out'] = CloudCmd.logOut;
        
        return menu;
    }
    
    function loadFileMenuData(callback) {
        const is = CloudCmd.config('auth');
        const show = (name) => {
            CloudCmd[name].show();
        };
        
        const menuBottom = getMenuData(is);
        
        const menuTop = {
            'View': bind(show, 'View'),
            'Edit': bind(show, 'EditFile'),
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
            'Upload To Cloud': bind(uploadTo, 'Cloud'),
            'Cut': () => {
                isCurrent(Buffer.cut, alertNoFiles);
            },
            'Copy': () => {
                isCurrent(Buffer.copy, alertNoFiles);
            },
        };
        
        const menu = Object.assign({}, menuTop, menuBottom);
        
        callback(is, menu);
    }
    
    function isCurrent(yesFn, noFn) {
        if (Info.name !== '..')
            return yesFn();
        
        noFn();
    }
    
    function isPath(x, y) {
        const panel = Info.panel;
        
        const el = document.elementFromPoint(x, y);
        const elements = panel.querySelectorAll('[data-name="js-path"] *');
        const is = ~[].indexOf.call(elements, el);
        
        return is;
    }
    
    function beforeShow(callback, params) {
        const name = params.name;
        let notShow = DOM.getCurrentByPosition({
            x: params.x,
            y: params.y
        });
        
        if (params.name === 'contextFile') {
            notShow = !notShow;
        }
        
        if (!notShow)
            MenuShowedName = name;
        
        exec(callback);
        
        if (!notShow)
            notShow = isPath(params.x, params.y);
        
        return notShow;
    }
    
    function beforeClick(name) {
        return MenuShowedName !== name;
    }
    
    function uploadTo(nameModule) {
        Info.getData((error, data) => {
            const name = Info.name;
            const execFrom = CloudCmd.execFromModule;
             
            execFrom(nameModule, 'uploadFile', name, data);
        });
        
        CloudCmd.log('Uploading to ' + name + '...');
    }
    
    function uploadFromCloud() {
        Images.show.load('top');
        
        CloudCmd.execFromModule('Cloud', 'saveFile', (name, data) => {
            const path = DOM.getCurrentDirPath() + name;
            
            RESTful.write(path,  data, (error) => {
                !error && CloudCmd.refresh();
            });
        });
    }
    
    function preDownload() {
        download(config('packer'));
    }
    
    function download(type) {
        const TIME = 30 * 1000;
        const prefixUr = CloudCmd.PREFIX_URL;
        const FS = CloudFunc.FS;
        const PACK = '/pack';
        const date = Date.now();
        const files = DOM.getActiveFiles();
        
        if (!files.length)
            return alertNoFiles();
            
        files.forEach((file) => {
            const selected = DOM.isSelected(file);
            const id = load.getIdBySrc(path);
            const isDir = DOM.isCurrentIsDir(file);
            
            CloudCmd.log('downloading file ' + path + '...');
            
             /*
              * if we send ajax request -
              * no need in hash so we escape #
              * and all other characters, like "%"
              */
            const path = DOM.getCurrentPath(file)
                .replace(/#/g, '%23');
            
            const encodedPath = encodeURI(path);
            
            let src;
            
            if (isDir)
                src = prefixUr + PACK + encodedPath + DOM.getPackerExt(type);
            else
                src = prefixUr + FS + encodedPath + '?download';
            
            const element = load({
                id          : id + '-' + date,
                name        : 'iframe',
                async       : false,
                className   : 'hidden',
                src,
            });
            
            setTimeout(() => {
                document.body.removeChild(element);
            }, TIME);
            
            if (selected)
                DOM.toggleSelectedFile(file);
        });
    }
    
    function getCurrentPosition() {
        const current = Info.element;
        const rect = current.getBoundingClientRect();
        
        const position    = {
            x: rect.left + rect.width / 3,
            y: rect.top
        };
        
        return position;
    }
    
    function listener(event) {
        const F9 = Key.F9;
        const ESC = Key.ESC;
        const key = event.keyCode;
        const isBind = Key.isBind();
        
        if (!isBind)
            return;
        
        if (key === ESC)
            return Menu.hide();
        
        if (key === F9) {
            const position = getCurrentPosition();
            MenuContext.show(position.x, position.y);
            
            event.preventDefault();
        }
    }
    
    init();
}
