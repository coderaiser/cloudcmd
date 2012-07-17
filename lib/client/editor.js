var CloudCommander;
CloudCommander.Editor = { CloudMirror: undefined };
CloudCommander.Editor.CloudMirror = { load: (function(){
  
    CloudCommander.jsload('http://codemirror.net/lib/codemirror.js', load_all(this));
    
    function load_all(pParent) {
        return function(){
            CloudCommander.cssLoad({
                src     : 'http://codemirror.net/lib/codemirror.css',
                element : document.head
            });
          
            CloudCommander.cssLoad({
                src     : 'http://codemirror.net/theme/night.css',
                element : document.head
            });
          
            CloudCommander.cssSet({id:'editor',
                inner:'.CodeMirror{'+
                    'font-family:\'Droid Sans Mono\';'+
                    'font-size:15px;'+
                    'resize:vertical;'+ 'margin:16px;'+'padding:20px;' +
                '}'+
                '.CodeMirror-scroll{'+
                    'height: 660px;' +
                '}' +                           
                '.CodeMirror-scrollbar{'+
                     'overflow-y:auto' +
                '}'
            });  
                      
              var lShowEditor_f = function (){
                  if (!document.getElementById('CloudEditor')) {      
                      var lEditor=document.createElement('div'); 
                      lEditor.id ='CloudEditor';
                      lEditor.className = 'hidden';
                      fm.appendChild(lEditor);
                      
                      CodeMirror(lEditor,{
                          mode        : "xml",  
                          htmlMode    : true,
                          theme       : 'night',
                          lineNumbers : true,
                          //переносим длинные строки
                          lineWrapping: true,
                          extraKeys: {
                              //Сохранение
                              "Esc": pParent.hide
                          },
                        onLoad: pParent.show()
                      });
                  
                  }
            }
            CloudCommander.jsload('http://codemirror.net/mode/xml/xml.js', lShowEditor_f)
        }
    }
}),
  show : (function(){
              /* removing keyBinding if set */
            CloudCommander.keyBinded = false;        
            left.className = 'panel hidden';
            CloudEditor.className = '';
        }),
        
        
        
        
  hide :(function() {
            CloudCommander.keyBinded = true;
            CloudEditor.className='hidden';
            left.className = 'panel';
        })
};