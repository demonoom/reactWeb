import React from 'react';

var TextboxioComponentForSimpleAnswer = React.createClass({
  componentDidMount(){
    mytextareaSimpleAnswerEditor = textboxio.replace('#mySimpleAnswerTextarea',defaultConfig);
    mytextareaSimpleAnswerEditor.events.dirty.addListener(function () {
      mytextareaSimpleAnswerEditor.mode.set("code");
      mytextareaSimpleAnswerEditor.mode.set("design");
    });
    mytextareaSimpleAnswerEditor.events.focus.addListener(function () {
      if(mytextareaSimpleAnswerEditor.mode.get()=="code"){
        mytextareaSimpleAnswerEditor.mode.set("design");
      }
    });
  },
  componentDidUpdate(){
    var activeEditor = textboxio.getActiveEditor();
    if(mytextareaSimpleAnswerEditor != null && typeof(mytextareaSimpleAnswerEditor)!="undefined" && activeEditor==mytextareaSimpleAnswerEditor ) {
      mytextareaSimpleAnswerEditor.mode.set("code");
      mytextareaSimpleAnswerEditor.mode.set("design");
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
