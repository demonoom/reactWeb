import React from 'react';
import { Input } from 'antd';

var CkEditorComponentForMuSelectByModify = React.createClass({
  componentDidMount(){
    //加载CKEditor编辑器
    CKEDITOR.replace('muEditorByModify');
    //CKEditor初始化完毕
    CKEDITOR.on( 'instanceReady', function( ev ) {
      if(muEditorContent!=""){
        CKEDITOR.instances['muEditorByModify'].setData(muEditorContent);
      }
    });
  },
  componentDidUpdate(){
    var currentContent = CKEDITOR.instances['muEditorByModify'].getData();
    if(muEditorContent!="" && currentContent==""){
      CKEDITOR.instances['muEditorByModify'].setData(muEditorContent);
    }
  },
  shouldComponentUpdate(){
    return true;
  },
  render : function(){
    return (
      <div>
        <textarea id="muEditorByModify" name="muEditorByModify"></textarea><br/>
      </div>
    )
  }
})
export default CkEditorComponentForMuSelectByModify;
