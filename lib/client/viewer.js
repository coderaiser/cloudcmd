var CloudCommander, FuncyBox;
/* object contains viewer FuncyBox
 * https://github.com/fancyapps/fancyBox
 */
CloudCommander.Viewer = {};
CloudCommander.Viewer.FuncyBox = {
    load: function(){
         
        CloudCommander.cssLoad({
                src : 'http://fancyapps.com/fancybox/source/jquery.fancybox.css'
        });
        
        CloudCommander.jsload('http://fancyapps.com/fancybox/source/jquery.fancybox.pack.js');
    }
};