var Util, Zip, pako;

(function () {
    'use strict';
   
   Zip = new ZipProto();
   
   function ZipProto() {
        this.pack = function(str, callback) {
            var buf, deflate, result,
                isArray = Util.isArrayBuffer(str);
            
            if (isArray)
                buf = str;
            else
                buf = utf8AbFromStr(str);
            
            deflate = new pako.Deflate({
                gzip:true
            });
            
            deflate.push(buf, true);
            
            if (!deflate.error)
                result = deflate.result.buffer;
            
            Util.exec(callback, deflate.error, result);
        };
        
        function utf8AbFromStr(str) {
            var i,
                strUtf8 = unescape(encodeURIComponent(str)),
                n       = strUtf8.length,
                arr     = new Uint8Array(n);
            
            for (i = 0; i < n; i++)
                arr[i] = strUtf8.charCodeAt(i);
            
            return arr;
        }
   }
})();
