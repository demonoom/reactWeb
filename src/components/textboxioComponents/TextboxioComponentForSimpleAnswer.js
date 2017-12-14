import React from 'react';

var TextboxioComponentForSimpleAnswer = React.createClass({
  componentDidMount(){
    mytextareaSimpleAnswerEditor = textboxio.replace('#mySimpleAnswerTextarea',defaultConfig);
    mytextareaSimpleAnswerEditor.events.focus.addListener(function () {
      if(mytextareaSimpleAnswerEditor.mode.get()=="code"){
        mytextareaSimpleAnswerEditor.mode.set("design");
      }
        var newContent = "<span></span>";
        mytextareaSimpleAnswerEditor.content.insertHtmlAtCursor(newContent);
    });
  },
  componentDidUpdate(){
    if(mytextareaSimpleAnswerEditor==null || typeof(mytextareaSimpleAnswerEditor)=="undefined" ){
      mytextareaSimpleAnswerEditor = textboxio.replace('#mySimpleAnswerTextarea',defaultConfig);
    }
    var activeEditor = textboxio.getActiveEditor();
    if(mytextareaSimpleAnswerEditor != null && typeof(mytextareaSimpleAnswerEditor)!="undefined" && (activeEditor==mytextareaSimpleAnswerEditor || activeEditor==mytextareaAnswerEditor)) {
      if(mytextareaSimpleAnswerEditor.mode!= null && typeof(mytextareaSimpleAnswerEditor.mode)!="undefined" ){
        mytextareaSimpleAnswerEditor.mode.set("code");
        mytextareaSimpleAnswerEditor.mode.set("design");
      }
    }
  },
  render : function(){
    return (
      <div>
        <div id="mySimpleAnswerTextarea" style={{width:'100%',height:'300px'}}></div>
      </div>
    )
  }
})
export default TextboxioComponentForSimpleAnswer;
