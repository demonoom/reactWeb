import React from 'react';
import { Input } from 'antd';

var TextboxioComponentForMulitiSelectByModify = React.createClass({
  componentDidMount(){
    mytextareaMulitiSelectModifyEditor = textboxio.replace('#mulitiSelectEditorByModify',defaultConfig);
    if(mytextareaMulitiSelectModifyEditor!=null && typeof(mytextareaMulitiSelectModifyEditor)!='undefined' ){
      mytextareaMulitiSelectModifyEditor.content.set(muEditorContent);
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
