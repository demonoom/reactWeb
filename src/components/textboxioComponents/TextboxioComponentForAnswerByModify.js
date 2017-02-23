import React from 'react';
import { Input } from 'antd';

var TextboxioComponentForAnswerByModify = React.createClass({
  componentDidMount(){
    mytextareaAnswerModifyEditor = textboxio.replace('#answerEditorByModify',defaultConfig);
    if(mytextareaAnswerModifyEditor!=null && typeof(mytextareaAnswerModifyEditor)!='undefined' ){
      mytextareaAnswerModifyEditor.content.set(answerContent);
    }
    mytextareaAnswerModifyEditor.events.dirty.addListener(function () {
      mytextareaAnswerModifyEditor.mode.set("code");
      mytextareaAnswerModifyEditor.mode.set("design");
    });
    mytextareaAnswerModifyEditor.events.focus.addListener(function () {
      if(mytextareaAnswerModifyEditor.mode.get()=="code"){
        mytextareaAnswerModifyEditor.mode.set("design");
      }
    });
  },
  componentDidUpdate(){
    if(mytextareaAnswerModifyEditor!=null && typeof(mytextareaAnswerModifyEditor)!='undefined' ){
      if(mytextareaAnswerModifyEditor.content!=null && typeof(mytextareaAnswerModifyEditor.content)!='undefined' ){
        var contentIsDirty=mytextareaAnswerModifyEditor.content.isDirty();
        if(answerContent!="" && contentIsDirty==false){
          mytextareaAnswerModifyEditor.content.set(answerContent);
        }
      }
    }
    mytextareaAnswerModifyEditor.events.dirty.addListener(function () {
      mytextareaAnswerModifyEditor.mode.set("code");
      mytextareaAnswerModifyEditor.mode.set("design");
    });
    mytextareaAnswerModifyEditor.events.focus.addListener(function () {
      if(mytextareaAnswerModifyEditor.mode.get()=="code"){
        mytextareaAnswerModifyEditor.mode.set("design");
      }
    });
    var activeEditor = textboxio.getActiveEditor();
    if(mytextareaAnswerModifyEditor != null && typeof(mytextareaAnswerModifyEditor)!="undefined" && activeEditor==mytextareaAnswerModifyEditor ){
      mytextareaAnswerModifyEditor.mode.set("code");
      mytextareaAnswerModifyEditor.mode.set("design");
    }
  },
  render : function(){
    return (
      <div>
        <div id="answerEditorByModify" style={{width:'100%',height:'300px'}}></div>
      </div>
    )
  }
})
export default TextboxioComponentForAnswerByModify;
