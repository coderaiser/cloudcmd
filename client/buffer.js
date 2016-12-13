/* global Util */
/* global DOM */
/* global CloudCmd */

(function(Util, DOM, CloudCmd) {
    'use strict';
    
    var DOMProto    = Object.getPrototypeOf(DOM);
    
    DOMProto.Buffer = new BufferProto(Util, DOM, CloudCmd);
    
    function BufferProto(Util, DOM, CloudCmd) {
        var Storage = DOM.Storage,
            Files   = DOM.Files,
            Info    = DOM.CurrentInfo,
            json    = Util.json,
            
            CLASS   = 'cut-file',
            
            COPY    = 'copy',
            CUT     = 'cut',
            
            TITLE   = 'Buffer',
            
            Buffer  = {
                cut     : callIfEnabled.bind(null, cut),
                copy    : callIfEnabled.bind(null, copy),
                clear   : callIfEnabled.bind(null, clear),
                paste   : callIfEnabled.bind(null, paste)
            };
        
        function showMessage(msg) {
            DOM.Dialog.alert(TITLE, msg);
        }
        
        function getNames() {
            var files   = DOM.getActiveFiles(),
                names   = DOM.getFilenames(files);
            
            return names;
        }
        
        function addCutClass() {
            var files   = DOM.getActiveFiles();
            
            files.forEach(function(element) {
                element.classList.add(CLASS);
            });
        }
        
        function rmCutClass() {
            var files   = DOM.getByClassAll(CLASS);
            
            []
                .slice.call(files)
                .forEach(function(element) {
                    element.classList.remove(CLASS);
                });
        }
        
        function isEnabled(callback) {
            Files.get('config', function(error, config) {
                if (error)
                    showMessage(error);
                else
                    callback(config.buffer);
            });
        }
        
        function callIfEnabled(callback) {
             isEnabled(function(is) {
                if (is)
                    callback();
                else
                    showMessage('Buffer disabled in config!');
            });
        }
        
        function copy() {
            var Storage = DOM.Storage,
                names   = getNames(),
                from    = Info.dirPath;
            
            clear();
            
            if (names.length)
                Storage.remove(CUT)
                    .set(COPY, {
                        from : from,
                        names: names
                    });
        }
        
        function cut() {
            var Storage = DOM.Storage,
                names   = getNames(),
                from    = Info.dirPath;
                
            clear();
            
            if (names.length) {
                addCutClass();
                
                Storage
                    .set(CUT, {
                        from : from,
                        names: names
                    });
            }
        }
        
        function clear() {
             Storage.remove(COPY)
                    .remove(CUT);
            
            rmCutClass();
        }
        
        function paste() {
            var copy    = Storage.get.bind(Storage, COPY),
                cut     = Storage.get.bind(Storage, CUT);
            
            Util.exec.parallel([copy, cut], function(error, cp, ct) {
                var opStr       = cp ? 'copy' : 'move',
                    opData      = cp || ct,
                    data        = {},
                    Operation   = CloudCmd.Operation,
                    msg         = 'Path is same!',
                    path        = Info.dirPath;
                
                if (!error && !cp && !ct)
                    error   = 'Buffer is empty!';
                    
                if (error) {
                    showMessage(error);
                } else {
                    data        = json.parse(opData);
                    data.to     = path;
                    
                    if (data.from === path) {
                        showMessage(msg);
                    } else {
                        Operation.show(opStr, data);
                        clear();
                    }
                }
            });
        }
        
        return Buffer;
    }
})(Util, DOM, CloudCmd);
