(function (obj) {
    obj.DiffProto = function(diffMatchPatch) {
        var dmp = new diffMatchPatch();
        
        this.createPatch    = function(oldText, newText) {
            var diff        = dmp.diff_main(oldText, newText),
                patchList   = dmp.patch_make(oldText, newText, diff),
                patch       = dmp.patch_toText(patchList);
            
            return patch;
        };
      
        this.applyPatch     = function(oldText, patch) {
            var patches     = dmp.patch_fromText(patch),
                results     = dmp.patch_apply(patches, oldText);
        
            return results;
        };
    };
})(this);

