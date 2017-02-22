import React from 'react';

var TextboxioComponentForAnswer = React.createClass({
  componentDidMount(){
    mytextareaAnswerEditor = textboxio.replace('#myAnswerTextarea',defaultConfig);
    mytextareaAnswerEditor.events.dirty.addListener(function () {
      mytextareaAnswerEditor.mode.set("code");
      mytextareaAnswerEditor.mode.set("design");
    });
    mytextareaAnswerEditor.events.focus.addListener(function () {
      if(mytextareaAnswerEditor.mode.get()=="code"){
        mytextareaAnswerEditor.mode.set("design");
      }
    });
  },
  componentDidUpdate(){
    mytextareaAnswerEditor.mode.set("code");
    mytextareaAnswerEditor.mode.set("design");
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
