import React from 'react';
import { Input } from 'antd';

var CkEditorComponentForSingleByModify = React.createClass({
  componentDidMount(){
    //加载CKEditor编辑器
    CKEDITOR.replace('singleEditorByModify');
    //CKEditor初始化完毕
    CKEDITOR.on( 'instanceReady', function( ev ) {
      if(editorContent!=""){
        CKEDITOR.instances['singleEditorByModify'].setData(editorContent);
      }
    });
  },
  componentDidUpdate(){
    var currentContent = CKEDITOR.instances['singleEditorByModify'].getData();
    if(editorContent!="" && currentContent==""){
      CKEDITOR.instances['singleEditorByModify'].setData(editorContent);
    }
  },
  render : function(){
    return (
      <div>
        <textarea id="singleEditorByModify" name="singleEditorByModify"></textarea><br/>
      </div>
    )
  }
})
export default CkEditorComponentForSingleByModify;
