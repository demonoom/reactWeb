import React from 'react';

var CkEditorComponentForAnswer = React.createClass({
  componentDidMount(){
    //加载CKEditor编辑器
    CKEDITOR.replace('answerEditor');
    //CKEditor初始化完毕
    CKEDITOR.on( 'instanceReady', function( ev ) {
    });
  },
  render : function(){
    return (
      <div>
        <textarea id="answerEditor" name="answerEditor"></textarea><br/>
      </div>
    )
  }
})
export default CkEditorComponentForAnswer;
