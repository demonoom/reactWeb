import React from 'react';
import { Input } from 'antd';

var CkEditorComponentForCorrectByModify = React.createClass({
  componentDidMount(){
    //加载CKEditor编辑器
    CKEDITOR.replace('correctEditorByModify');
    //CKEditor初始化完毕
    CKEDITOR.on( 'instanceReady', function( ev ) {
      if(correctEditorContent!=""){
        CKEDITOR.instances['correctEditorByModify'].setData(correctEditorContent);
      }
    });
  },
  componentDidUpdate(){
    var currentContent = CKEDITOR.instances['correctEditorByModify'].getData();
    if(correctEditorContent!="" && currentContent==""){
      CKEDITOR.instances['correctEditorByModify'].setData(correctEditorContent);
    }
  },
  shouldComponentUpdate(){
    return true;
  },
  render : function(){
    return (
      <div>
        <textarea id="correctEditorByModify" name="correctEditorByModify"></textarea><br/>
      </div>
    )
  }
})
export default CkEditorComponentForCorrectByModify;
