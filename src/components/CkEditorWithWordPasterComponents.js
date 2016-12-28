import React from 'react';
import { Input } from 'antd';

var CkEditorWithWordPasterComponents = React.createClass({
  componentDidMount(){

      var pasterMgr = new PasterManager();
      pasterMgr.Config["PostUrl"] = "http://www.maaee.com/manage/subject/subject_upload.jsp";
      pasterMgr.Load();//加载控件
      CKEDITOR.config.extraPlugins = 'imagepaster,netpaster';
      //CKEditor初始化完毕
      CKEDITOR.on('instanceReady', function(ev) {
          ev.editor.on('focus', function() {
              pasterMgr.Init(ev.editor);
          });
      });
        //自定义快捷键
      CKEDITOR.config.keystrokes = [ [ CKEDITOR.CTRL + 86/*V*/, 'imagepaster' ] ];

      function changeFen(element){
          $("#fen_select").find("dt").removeClass("select");
          $(element).addClass("select");
          var fen = $("#fen_select").find(".select").attr("fen");
          $("#score").val(fen);
      }

      $(document).ready(function(){
          changeFen($("#fen_select").find(".select"));
      });

  },


  render : function(){
    return (
      <div>
          <textarea className="ckeditor"></textarea>
      </div>
    )
  }
})
export default CkEditorWithWordPasterComponents;
