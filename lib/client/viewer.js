var CloudCommander, CloudFunc;
/* object contains viewer FuncyBox
 * https://github.com/fancyapps/fancyBox
 */
CloudCommander.Viewer = {};
CloudCommander.Viewer.FuncyBox = {
    load: function(){
         
        CloudCommander.cssLoad({
                src : 'http://fancyapps.com/fancybox/source/jquery.fancybox.css'
        });
        
        CloudCommander.jsload(
            'http://fancyapps.com/fancybox/source/jquery.fancybox.pack.js',
            function(){
                $(".fancybox").fancybox({
                    openEffect	: 'none',
                    closeEffect	: 'none'
                });
            });
                
    },
    set: function(){
        try{
            /* get current panel (left or right) */
            var lPanel = this.getByClass('current-file');

            lPanel.length &&
                (lPanel = lPanel[0].parentElement);
                
            /* get all file links */
            var lA = lPanel.getElementsByTagName('a');
            
            var lName;
            for (var i=0; i < lA.length; i++) {
                lName = lA[i].title || lA[i].textContent;
                
                CloudFunc.checkExtension(lName,['png','jpg']) && 
                    (lA[i].className = 'fancybox');
            }
        }catch(pError){
            console.log(pError);
        }
    },
    getById     : function(pId){return document.getElementById(pId);},
    getByClass  : function(pClass){
        return document.getElementsByClassName(pClass);
    }
};