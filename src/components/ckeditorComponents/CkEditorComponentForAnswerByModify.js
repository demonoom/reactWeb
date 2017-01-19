import React from 'react';
import { Input } from 'antd';

var CkEditorComponentForAnswerByModify = React.createClass({
  componentDidMount(){
    //加载CKEditor编辑器
    CKEDITOR.replace('answerEditorByModify');
    //CKEditor初始化完毕
    CKEDITOR.on( 'instanceReady', function( ev ) {
      if(answerContent!=""){
        CKEDITOR.instances['answerEditorByModify'].setData(answerContent);
      }
    });
  },
  componentDidUpdate(){
    var currentContent = CKEDITOR.instances['answerEditorByModify'].getData();
    if(answerContent!="" && currentContent==""){
      CKEDITOR.instances['answerEditorByModify'].setData(answerContent);
    }
  },
  render : function(){
    return (
      <div>
        <textarea id="answerEditorByModify" name="answerEditorByModify"></textarea><br/>
      </div>
    )
  }
})
export default CkEditorComponentForAnswerByModify;
