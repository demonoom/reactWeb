import React from 'react';

var TextboxioComponentForCorrect = React.createClass({
  componentDidMount(){
    mytextareaCorrectEditor = textboxio.replace('#myCorrectTextarea',defaultConfig);
    mytextareaCorrectEditor.events.focus.addListener(function () {
      if(mytextareaCorrectEditor.mode.get()=="code"){
        mytextareaCorrectEditor.mode.set("design");
      }
        var newContent = "<span></span>";
        mytextareaCorrectEditor.content.insertHtmlAtCursor(newContent);
    });
  },
  componentDidUpdate(){
    if(mytextareaCorrectEditor==null || typeof(mytextareaCorrectEditor)=="undefined" ){
      mytextareaCorrectEditor = textboxio.replace('#myCorrectTextarea',defaultConfig);
    }
    var activeEditor = textboxio.getActiveEditor();
    if(mytextareaCorrectEditor != null && typeof(mytextareaCorrectEditor)!="undefined" && activeEditor==mytextareaCorrectEditor ) {
      mytextareaCorrectEditor.mode.set("code");
      mytextareaCorrectEditor.mode.set("design");
    }
  },
  render : function(){
    return (
      <div>
        <div id="myCorrectTextarea" style={{width:'100%',height:'300px'}}></div>
      </div>
    )
  }
})
export default TextboxioComponentForCorrect;
