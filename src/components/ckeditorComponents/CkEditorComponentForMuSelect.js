import React from 'react';

var CkEditorComponentForMuSelect = React.createClass({
  componentDidMount(){
    //加载CKEditor编辑器
    CKEDITOR.replace('muEditor');
    //CKEditor初始化完毕
    CKEDITOR.on( 'instanceReady', function( ev ) {
    });
  },
  render : function(){
    return (
      <div>
        <textarea id="muEditor" name="muEditor"></textarea><br/>
      </div>
    )
  }
})
export default CkEditorComponentForMuSelect;
