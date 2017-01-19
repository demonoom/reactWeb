import React from 'react';
import { Input } from 'antd';

var CkEditorComponentForSimpleByModify = React.createClass({
  componentDidMount(){
    //加载CKEditor编辑器
    CKEDITOR.replace('simpleEditorByModify');
    //CKEditor初始化完毕
    CKEDITOR.on( 'instanceReady', function( ev ) {
      if(simpleEditorContent!=""){
        CKEDITOR.instances['simpleEditorByModify'].setData(simpleEditorContent);
      }
    });
  },
  componentDidUpdate(){
    var currentContent = CKEDITOR.instances['simpleEditorByModify'].getData();
    if(simpleEditorContent!="" && currentContent==""){
      CKEDITOR.instances['simpleEditorByModify'].setData(simpleEditorContent);
    }
  },
  render : function(){
    return (
      <div>
        <textarea id="simpleEditorByModify" name="simpleEditorByModify"></textarea><br/>
      </div>
    )
  }
})
export default CkEditorComponentForSimpleByModify;
