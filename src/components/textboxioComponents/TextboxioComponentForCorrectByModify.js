import React from 'react';

var TextboxioComponentForCorrectByModify = React.createClass({
  componentDidMount(){
    mytextareaCorrectModifyEditor = textboxio.replace('#correctEditorByModify',defaultConfig);
    if(mytextareaCorrectModifyEditor!=null && typeof(mytextareaCorrectModifyEditor)!='undefined' ){
      mytextareaCorrectModifyEditor.content.set(correctEditorContent);
    }
    mytextareaCorrectModifyEditor.events.dirty.addListener(function () {
      mytextareaCorrectModifyEditor.mode.set("code");
      mytextareaCorrectModifyEditor.mode.set("design");
        var newContent = "<span></span>";
        mytextareaCorrectModifyEditor.content.insertHtmlAtCursor(newContent);
    });
    mytextareaCorrectModifyEditor.events.focus.addListener(function () {
      if(mytextareaCorrectModifyEditor.mode.get()=="code"){
        mytextareaCorrectModifyEditor.mode.set("design");
      }
        var newContent = "<span></span>";
        mytextareaCorrectModifyEditor.content.insertHtmlAtCursor(newContent);
    });
  },
  componentDidUpdate(){
    if(mytextareaCorrectModifyEditor!=null && typeof(mytextareaCorrectModifyEditor)!='undefined' ){
      if(mytextareaCorrectModifyEditor.content!=null && typeof(mytextareaCorrectModifyEditor.content)!='undefined' ){
        var contentIsDirty=mytextareaCorrectModifyEditor.content.isDirty();
        if(correctEditorContent!="" && contentIsDirty==false){
          mytextareaCorrectModifyEditor.content.set(correctEditorContent);
        }
      }
    }
    mytextareaCorrectModifyEditor.events.dirty.addListener(function () {
      mytextareaCorrectModifyEditor.mode.set("code");
      mytextareaCorrectModifyEditor.mode.set("design");
    });
    mytextareaCorrectModifyEditor.events.focus.addListener(function () {
      if(mytextareaCorrectModifyEditor.mode.get()=="code"){
        mytextareaCorrectModifyEditor.mode.set("design");
      }
    });
    var activeEditor = textboxio.getActiveEditor();
    if(mytextareaCorrectModifyEditor != null && typeof(mytextareaCorrectModifyEditor)!="undefined" && activeEditor==mytextareaCorrectModifyEditor ){
      mytextareaCorrectModifyEditor.mode.set("code");
      mytextareaCorrectModifyEditor.mode.set("design");
    }
  },
  render : function(){
    return (
      <div>
        <div id="correctEditorByModify" style={{width:'100%',height:'300px'}}></div>
      </div>
    )
  }
})
export default TextboxioComponentForCorrectByModify;
