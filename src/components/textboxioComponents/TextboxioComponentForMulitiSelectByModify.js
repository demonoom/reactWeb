import React from 'react';

var TextboxioComponentForMulitiSelectByModify = React.createClass({
  componentDidMount(){
    mytextareaMulitiSelectModifyEditor = textboxio.replace('#mulitiSelectEditorByModify',defaultConfig);
    if(mytextareaMulitiSelectModifyEditor!=null && typeof(mytextareaMulitiSelectModifyEditor)!='undefined' ){
      mytextareaMulitiSelectModifyEditor.content.set(muEditorContent);
    }
    mytextareaMulitiSelectModifyEditor.events.dirty.addListener(function () {
      mytextareaMulitiSelectModifyEditor.mode.set("code");
      mytextareaMulitiSelectModifyEditor.mode.set("design");
        var newContent = "<span></span>";
        mytextareaMulitiSelectModifyEditor.content.insertHtmlAtCursor(newContent);
    });
    mytextareaMulitiSelectModifyEditor.events.focus.addListener(function () {
      if(mytextareaMulitiSelectModifyEditor.mode.get()=="code"){
        mytextareaMulitiSelectModifyEditor.mode.set("design");
      }
        var newContent = "<span></span>";
        mytextareaMulitiSelectModifyEditor.content.insertHtmlAtCursor(newContent);
    });
  },
  componentDidUpdate(){
    if(mytextareaMulitiSelectModifyEditor!=null && typeof(mytextareaMulitiSelectModifyEditor)!='undefined' ){
      if(mytextareaMulitiSelectModifyEditor.content!=null && typeof(mytextareaMulitiSelectModifyEditor.content)!='undefined' ){
        var contentIsDirty=mytextareaMulitiSelectModifyEditor.content.isDirty();
        if(muEditorContent!="" && contentIsDirty==false){
          mytextareaMulitiSelectModifyEditor.content.set(muEditorContent);
        }
      }
    }
    mytextareaMulitiSelectModifyEditor.events.dirty.addListener(function () {
      mytextareaMulitiSelectModifyEditor.mode.set("code");
      mytextareaMulitiSelectModifyEditor.mode.set("design");
    });
    mytextareaMulitiSelectModifyEditor.events.focus.addListener(function () {
      if(mytextareaMulitiSelectModifyEditor.mode.get()=="code"){
        mytextareaMulitiSelectModifyEditor.mode.set("design");
      }
    });
    var activeEditor = textboxio.getActiveEditor();
    if(mytextareaMulitiSelectModifyEditor != null && typeof(mytextareaMulitiSelectModifyEditor)!="undefined" && activeEditor==mytextareaMulitiSelectModifyEditor ){
      mytextareaMulitiSelectModifyEditor.mode.set("code");
      mytextareaMulitiSelectModifyEditor.mode.set("design");
    }
  },
  render : function(){
    return (
      <div>
        <div id="mulitiSelectEditorByModify" style={{width:'100%',height:'300px'}}></div>
      </div>
    )
  }
})
export default TextboxioComponentForMulitiSelectByModify;
