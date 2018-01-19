import React from 'react';

var SubjectContentEditor = React.createClass({
  componentDidMount(){
    subjectContentForEdit = textboxio.replace('#subjectEditorByModify',defaultConfig);
    if(subjectContentForEdit!=null && typeof(subjectContentForEdit)!='undefined' ){
      subjectContentForEdit.content.set(editorContent);
    }
    subjectContentForEdit.events.dirty.addListener(function () {
      subjectContentForEdit.mode.set("code");
      subjectContentForEdit.mode.set("design");
      // var newContent = "<span></span>";
      // subjectContentForEdit.content.insertHtmlAtCursor(newContent);
    });
    subjectContentForEdit.events.focus.addListener(function () {
      if(subjectContentForEdit.mode.get()=="code"){
        subjectContentForEdit.mode.set("design");
      }
      // var newContent = "<span></span>";
      // subjectContentForEdit.content.insertHtmlAtCursor(newContent);
    });
  },
  componentDidUpdate(){
    if(subjectContentForEdit!=null && typeof(subjectContentForEdit)!='undefined' ){
      if(subjectContentForEdit.content!=null && typeof(subjectContentForEdit.content)!='undefined' ){
        var contentIsDirty=subjectContentForEdit.content.isDirty();
        if(editorContent!="" && contentIsDirty==false){
          subjectContentForEdit.content.set(editorContent);
        }
      }
    }
    subjectContentForEdit.events.dirty.addListener(function () {
      subjectContentForEdit.mode.set("code");
      subjectContentForEdit.mode.set("design");
    });
    subjectContentForEdit.events.focus.addListener(function () {
      if(subjectContentForEdit.mode.get()=="code"){
        subjectContentForEdit.mode.set("design");
      }
    });
    var activeEditor = textboxio.getActiveEditor();
    if(subjectContentForEdit != null && typeof(subjectContentForEdit)!="undefined" && activeEditor==subjectContentForEdit ){
      subjectContentForEdit.mode.set("code");
      subjectContentForEdit.mode.set("design");
    }
  },

  setContent(content){
      subjectContentForEdit.content.set(content);
  },

  render : function(){
    return (
      <div>
        <div id="subjectEditorByModify" style={{width:'100%',height:'300px'}}></div>
      </div>
    )
  }
})
export default SubjectContentEditor;
