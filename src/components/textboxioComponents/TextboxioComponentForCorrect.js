import React from 'react';

var TextboxioComponentForCorrect = React.createClass({
  componentDidMount(){
    mytextareaCorrectEditor = textboxio.replace('#myCorrectTextarea',defaultConfig);
    mytextareaCorrectEditor.events.dirty.addListener(function () {
      mytextareaCorrectEditor.mode.set("code");
      mytextareaCorrectEditor.mode.set("design");
    });
    mytextareaCorrectEditor.events.focus.addListener(function () {
      if(mytextareaCorrectEditor.mode.get()=="code"){
        mytextareaCorrectEditor.mode.set("design");
      }
    });
  },
  componentDidUpdate(){
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
