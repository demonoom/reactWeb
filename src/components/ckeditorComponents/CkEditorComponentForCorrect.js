import React from 'react';

var CkEditorComponentForCorrect = React.createClass({
  componentDidMount(){
    //加载CKEditor编辑器
    CKEDITOR.replace('correctEditor');
    //CKEditor初始化完毕
    CKEDITOR.on( 'instanceReady', function( ev ) {
    });
  },
  render : function(){
    return (
      <div>
        <textarea id="correctEditor" name="correctEditor"></textarea><br/>
      </div>
    )
  }
})
export default CkEditorComponentForCorrect;
