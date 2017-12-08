import React from 'react';

var TextboxioComponentForAnswer = React.createClass({
  componentDidMount(){
    mytextareaAnswerEditor = textboxio.replace('#myAnswerTextarea',defaultConfig);

    mytextareaAnswerEditor.events.focus.addListener(function () {
      if(mytextareaAnswerEditor.mode.get()=="code"){
        mytextareaAnswerEditor.mode.set("design");
      }
      var newContent = "<span></span>";
      mytextareaAnswerEditor.content.insertHtmlAtCursor(newContent);
    });
  },
  componentDidUpdate(){
    if(mytextareaAnswerEditor==null || typeof(mytextareaAnswerEditor)=="undefined" ){
      mytextareaAnswerEditor = textboxio.replace('#myAnswerTextarea',defaultConfig);
    }
    var activeEditor = textboxio.getActiveEditor();
    if(mytextareaAnswerEditor != null && typeof(mytextareaAnswerEditor)!="undefined" && (activeEditor==mytextareaAnswerEditor || activeEditor==mytextareaSimpleAnswerEditor)) {
      if(mytextareaAnswerEditor.mode!= null && typeof(mytextareaAnswerEditor.mode)!="undefined" ) {
        mytextareaAnswerEditor.mode.set("code");
        mytextareaAnswerEditor.mode.set("design");
      }
    }
  },
  render : function(){
    return (
      <div>
        <div id="myAnswerTextarea" style={{width:'100%',height:'300px'}}></div>
      </div>
    )
  }
})
export default TextboxioComponentForAnswer;
