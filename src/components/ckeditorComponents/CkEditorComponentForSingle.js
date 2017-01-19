import React from 'react';

var CkEditorComponentForSingle = React.createClass({
  componentDidMount(){
    //加载CKEditor编辑器
    CKEDITOR.replace('singleEditor');
    //CKEditor初始化完毕
    CKEDITOR.on( 'instanceReady', function( ev ) {
    });
  },
  render : function(){
    return (
      <div>
        <textarea id="singleEditor" name="singleEditor"></textarea><br/>
      </div>
    )
  }
})
export default CkEditorComponentForSingle;
