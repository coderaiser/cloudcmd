var Util, DOM;

(function(Util, DOM) {
    'use strict';
    
    DOM.Buffer  = new BufferProto();
    
    function BufferProto() {
        var Storage = DOM.Storage,
            Dialog  = DOM.Dialog,
            Info    = DOM.CurrentInfo;
        
        function getNames() {
            var name    = Info.name,
                names   = DOM.getSelectedNames(),
                n       = names.length;
            
            return n ? names : [name];
        }
        
        this.copy   = function() {
            var Storage = DOM.Storage,
                names   = getNames(),
                from    = Info.dirPath;
            
            Storage.remove('move')
                .set('copy', {
                    from : from,
                    names: names
                });
        };
        
        this.move   = function() {
            var Storage = DOM.Storage,
                names   = getNames(),
                from    = Info.dirPath;
                
            Storage.remove('copy')
                .set('move', {
                    from : from,
                    names: names
                });
        };
        
        this.paste  = function() {
            var copy    = Storage.get.bind(Storage, 'copy'),
                move    = Storage.get.bind(Storage, 'move');
            
            Util.exec.parallel([copy, move], function(error, cp, mv) {
                var data    = {},
                    msg     = 'Path is same!',
                    path    = Info.dirPath;
                
                if (!error && !cp && !mv)
                    error   = 'No files selected!';
                    
                if (error) {
                    DOM.Dialog.alert(error);
                } else if (cp) {
                    data    = Util.parseJSON(cp);
                    data.to   = path;
                    
                    if (data.from === path)
                        Dialog.alert(msg);
                    else
                        DOM.copyFiles(data);
                
                } else if (mv) {
                    data    = Util.parseJSON(mv);
                    data.to   = path;
                    
                    if (data.from === path)
                        Dialog.alert(msg);
                    else
                        DOM.moveFiles(data);
                }
                
                Storage.remove('copy')
                    .remove('move');
            });
        };
    }
})(Util, DOM);
