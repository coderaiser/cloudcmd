(function() {
    'use strict';

    var DIR     =  '../',
        Util    = require(DIR + 'util');
    
    /** Функция получает короткие размеры
     * конвертируя байт в килобайты, мегабойты,
     * гигайбайты и терабайты
     * @pSize - размер в байтах
     */
    exports.size    = function(size) {
        var isNumber    = Util.isNumber(size),
            l1KB        = 1024,
            l1MB        = l1KB * l1KB,
            l1GB        = l1MB * l1KB,
            l1TB        = l1GB * l1KB,
            l1PB        = l1TB * l1KB;
        
        if (isNumber) {
            if      (size < l1KB)   size = size + 'b';
            else if (size < l1MB)   size = (size/l1KB).toFixed(2) + 'kb';
            else if (size < l1GB)   size = (size/l1MB).toFixed(2) + 'mb';
            else if (size < l1TB)   size = (size/l1GB).toFixed(2) + 'gb';
            else if (size < l1PB)   size = (size/l1TB).toFixed(2) + 'tb';
            else                    size = (size/l1PB).toFixed(2) + 'pb';
        }
        
        return size;
    };
})();
