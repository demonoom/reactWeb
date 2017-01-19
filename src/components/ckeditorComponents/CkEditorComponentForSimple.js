import React from 'react';

var CkEditorComponentForSimple = React.createClass({
  componentDidMount(){
    //加载CKEditor编辑器
    CKEDITOR.replace('simpleEditor');
    //CKEditor初始化完毕
    CKEDITOR.on( 'instanceReady', function( ev ) {
    });
  },
  render : function(){
    return (
      <div>
        <textarea id="simpleEditor" name="simpleEditor"></textarea><br/>
      </div>
    )
  }
})
export default CkEditorComponentForSimple;
