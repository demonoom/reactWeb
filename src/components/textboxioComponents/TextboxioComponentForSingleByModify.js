import React from 'react';
import { Input } from 'antd';

var TextboxioComponentForSingleByModify = React.createClass({
  componentDidMount(){
    mytextareaSingleModifyEditor = textboxio.replace('#singleEditorByModify',defaultConfig);
    if(mytextareaSingleModifyEditor!=null && typeof(mytextareaSingleModifyEditor)!='undefined' ){
      mytextareaSingleModifyEditor.content.set(editorContent);
    }
    mytextareaSingleModifyEditor.events.dirty.addListener(function () {
      mytextareaSingleModifyEditor.mode.set("code");
      mytextareaSingleModifyEditor.mode.set("design");
    });
    mytextareaSingleModifyEditor.events.focus.addListener(function () {
      if(mytextareaSingleModifyEditor.mode.get()=="code"){
        mytextareaSingleModifyEditor.mode.set("design");
      }
    });
  },
  componentDidUpdate(){
    if(mytextareaSingleModifyEditor!=null && typeof(mytextareaSingleModifyEditor)!='undefined' ){
      if(mytextareaSingleModifyEditor.content!=null && typeof(mytextareaSingleModifyEditor.content)!='undefined' ){
        var contentIsDirty=mytextareaSingleModifyEditor.content.isDirty();
        if(editorContent!="" && contentIsDirty==false){
          mytextareaSingleModifyEditor.content.set(editorContent);
        }
      }
    }
    mytextareaSingleModifyEditor.events.dirty.addListener(function () {
      mytextareaSingleModifyEditor.mode.set("code");
      mytextareaSingleModifyEditor.mode.set("design");
    });
    mytextareaSingleModifyEditor.events.focus.addListener(function () {
      if(mytextareaSingleModifyEditor.mode.get()=="code"){
        mytextareaSingleModifyEditor.mode.set("design");
      }
    });
  },
  render : function(){
    return (
      <div>
        <div id="singleEditorByModify" style={{width:'100%',height:'300px'}}></div>
      </div>
    )
  }
})
export default TextboxioComponentForSingleByModify;
