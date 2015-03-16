var Util, DOM;

(function(Util, DOM) {
    'use strict';
    
    var DOMProto    = Object.getPrototypeOf(DOM);
    
    DOMProto.Buffer = new BufferProto(Util, DOM);
    
    function BufferProto(Util, DOM) {
        var Storage = DOM.Storage,
            Dialog  = DOM.Dialog,
            Files   = DOM.Files,
            Info    = DOM.CurrentInfo,
            json    = Util.json,
            
            CLASS   = 'cut-file',
            
            COPY    = 'copy',
            CUT     = 'cut',
            
            Buffer  = {
                cut     : callIfEnabled.bind(null, cut),
                copy    : callIfEnabled.bind(null, copy),
                clear   : callIfEnabled.bind(null, clear),
                paste   : callIfEnabled.bind(null, paste)
            };
        
        function getNames() {
            var name    = Info.name,
                names   = DOM.getSelectedNames(),
                n       = names.length;
            
            return n ? names : [name];
        }
        
        function addCutClass() {
            var files   = DOM.getActiveFiles();
            
            files.forEach(function(element) {
                DOM.addClass(element, CLASS);
            });
        }
        
        function rmCutClass() {
            var files   = DOM.getByClassAll(CLASS);
            
            [].forEach.call(files, function(element) {
                DOM.removeClass(element, CLASS);
            });
        }
        
        function isEnabled(callback) {
            Files.get('config', function(error, config) {
                if (error)
                    Dialog.alert(error);
                else
                    callback(config.buffer);
            });
        }
        
        function callIfEnabled(callback) {
             isEnabled(function(is) {
                if (is)
                    callback();
                else
                    Dialog.alert('Buffer disabled in config!');
            });
        }
        
        function copy() {
            var Storage = DOM.Storage,
                names   = getNames(),
                from    = Info.dirPath;
            
            clear();
            
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
            
            if (names[0] !== '..') {
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
                var data    = {},
                    msg     = 'Path is same!',
                    path    = Info.dirPath;
                
                if (!error && !cp && !ct)
                    error   = 'Buffer is empty!';
                    
                if (error) {
                    DOM.Dialog.alert(error);
                } else if (cp) {
                    data        = json.parse(cp);
                    data.to     = path;
                    
                    if (data.from === path)
                        Dialog.alert(msg);
                    else
                        DOM.copyFiles(data);
                
                } else if (ct) {
                    data        = json.parse(ct);
                    data.to     = path;
                    
                    if (data.from === path)
                        Dialog.alert(msg);
                    else
                        DOM.moveFiles(data);
                }
                
                clear();
            });
        }
        
        return Buffer;
    }
})(Util, DOM);
