(function (obj) {
    'use strict';
    
    obj.DiffProto = function(DiffMatchPatch) {
        var dmp = new DiffMatchPatch();
        
        this.createPatch    = function(oldText, newText) {
            var diff        = dmp.diff_main(oldText, newText),
                patchList   = dmp.patch_make(oldText, newText, diff),
                patch       = dmp.patch_toText(patchList);
            
            return patch;
        };
      
        this.applyPatch     = function(oldText, patch) {
            var patches     = dmp.patch_fromText(patch),
                result      = dmp.patch_apply(patches, oldText),
                newText     = result[0];
            
            return newText;
        };
    };
})(this);
