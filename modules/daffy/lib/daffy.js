!(function (global) {
    'use strict';
    
    if (typeof module !== 'undefined' && module.exports)
        module.exports = new DiffProto(require('diff-match-patch'));
    else
        global.daffy = new DiffProto(global.diff_match_patch);
    
    function DiffProto(DiffMatchPatch) {
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
    }
})(this);
