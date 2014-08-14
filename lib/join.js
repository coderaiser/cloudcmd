(function(scope) {
    'use strict';
    
    var Scope = scope.window ? window : global;
    
    if (typeof module === 'object' && module.exports)
        module.exports  = join;
    else
        Scope.join      = join;
    
    function join (names) {
        var url,
            regExp      = new RegExp(',', 'g'),
            nameStr     = names + '';
        
        if (!names)
            throw(Error('names must be array!'));
        
        nameStr         = nameStr.replace(regExp, ':');
        nameStr         = rmFirstSlash(nameStr);
        url             = '/join/' + nameStr;
        
        return url;
    }
    
    function rmFirstSlash(url) {
        var regExp  = new RegExp('^/'),
            is      = url.match(regExp);
        
        if (is)
            url = url.replace('/', '');
        
        return url;
    }
    
})(this);
