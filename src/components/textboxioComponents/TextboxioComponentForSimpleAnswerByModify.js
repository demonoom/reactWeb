import React from 'react';
import { Input } from 'antd';

var TextboxioComponentForSimpleAnswerByModify = React.createClass({
  componentDidMount(){
    mytextareaSimpleAnswerModifyEditor = textboxio.replace('#simpleAnswerEditorByModify',defaultConfig);
    if(mytextareaSimpleAnswerModifyEditor!=null && typeof(mytextareaSimpleAnswerModifyEditor)!='undefined' ){
      mytextareaSimpleAnswerModifyEditor.content.set(simpleEditorContent);
    }
  },
  componentDidUpdate(){
    if(mytextareaSimpleAnswerModifyEditor!=null && typeof(mytextareaSimpleAnswerModifyEditor)!='undefined' ){
      if(mytextareaSimpleAnswerModifyEditor.content!=null && typeof(mytextareaSimpleAnswerModifyEditor.content)!='undefined' ){
        var contentIsDirty=mytextareaSimpleAnswerModifyEditor.content.isDirty();
        if(simpleEditorContent!="" && contentIsDirty==false){
          mytextareaSimpleAnswerModifyEditor.content.set(simpleEditorContent);
        }
      }
    }
  },
  render : function(){
    return (
      <div>
        <div id="simpleAnswerEditorByModify" style={{width:'100%',height:'300px'}}></div>
      </div>
    )
  }
})
export default TextboxioComponentForSimpleAnswerByModify;
