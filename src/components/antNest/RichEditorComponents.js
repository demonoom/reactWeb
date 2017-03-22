import React, { PropTypes } from 'react';

var RichEditorComponents = React.createClass({
  componentDidMount(){
    var editor = UE.getEditor("container", {
      //工具栏
      toolbars: [[
        'emotion'
      ]] ,
      lang:"zh-cn"
    });
    uParse('.content',{
      'liiconpath':'ueditor/themes/ueditor-list/'    //使用 '/' 开头的绝对路径
    })
  },

  render : function(){
    return (
      <div>
        <script id="container" name="content" type="text/plain">

        </script>
      </div>
    )
  }
})
export default RichEditorComponents;
