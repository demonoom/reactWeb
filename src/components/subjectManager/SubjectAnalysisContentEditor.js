import React from 'react';

var SubjectAnalysisContentEditor = React.createClass({
  componentDidMount(){
    subjectAnalysisContentModifyEditor = textboxio.replace('#subjectAnalysisModify',defaultConfig);
    if(subjectAnalysisContentModifyEditor!=null && typeof(subjectAnalysisContentModifyEditor)!='undefined' ){
      subjectAnalysisContentModifyEditor.content.set(analysisEditContent);
    }
    subjectAnalysisContentModifyEditor.events.dirty.addListener(function () {
      subjectAnalysisContentModifyEditor.mode.set("code");
      subjectAnalysisContentModifyEditor.mode.set("design");
    });
    subjectAnalysisContentModifyEditor.events.focus.addListener(function () {
      if(subjectAnalysisContentModifyEditor.mode.get()=="code"){
        subjectAnalysisContentModifyEditor.mode.set("design");
      }
    });
  },
  componentDidUpdate(){
    if(subjectAnalysisContentModifyEditor!=null && typeof(subjectAnalysisContentModifyEditor)!='undefined' ){
      if(subjectAnalysisContentModifyEditor.content!=null && typeof(subjectAnalysisContentModifyEditor.content)!='undefined' ){
        var contentIsDirty=subjectAnalysisContentModifyEditor.content.isDirty();
        if(analysisEditContent!="" && contentIsDirty==false){
          subjectAnalysisContentModifyEditor.content.set(analysisEditContent);
        }
      }
    }
    subjectAnalysisContentModifyEditor.events.dirty.addListener(function () {
      subjectAnalysisContentModifyEditor.mode.set("code");
      subjectAnalysisContentModifyEditor.mode.set("design");
    });
    subjectAnalysisContentModifyEditor.events.focus.addListener(function () {
      if(subjectAnalysisContentModifyEditor.mode.get()=="code"){
        subjectAnalysisContentModifyEditor.mode.set("design");
      }
    });
    var activeEditor = textboxio.getActiveEditor();
    if(subjectAnalysisContentModifyEditor != null && typeof(subjectAnalysisContentModifyEditor)!="undefined" && activeEditor==subjectAnalysisContentModifyEditor ){
      subjectAnalysisContentModifyEditor.mode.set("code");
      subjectAnalysisContentModifyEditor.mode.set("design");
    }
  },

  setContent(content){
      subjectAnalysisContentModifyEditor.content.set(content);
  },

  render : function(){
    return (
      <div>
        <div id="subjectAnalysisModify" style={{width:'100%',height:'300px'}}></div>
      </div>
    )
  }
})
export default SubjectAnalysisContentEditor;
