import React from 'react';
import { Input } from 'antd';

var TextboxioComponentForAnswerByModify = React.createClass({
  componentDidMount(){
    mytextareaAnswerModifyEditor = textboxio.replace('#answerEditorByModify',defaultConfig);
    if(mytextareaAnswerModifyEditor!=null && typeof(mytextareaAnswerModifyEditor)!='undefined' ){
      mytextareaAnswerModifyEditor.content.set(answerContent);
    }
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
