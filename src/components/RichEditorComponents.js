import React, { PropTypes } from 'react';

var RichEditorComponents = React.createClass({
  componentDidMount(){

    var editor = UE.getEditor("container", {
      //工具栏
      toolbars: [[
      'fullscreen', 'source', '|', 'undo', 'redo', '|',
      'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'superscript', 'subscript', 'removeformat', 'formatmatch',
      '|', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'selectall', 'cleardoc', '|',
      'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
      'customstyle', 'paragraph', 'fontfamily', 'fontsize', '|',
      'directionalityltr', 'directionalityrtl', 'indent', '|',
      'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'touppercase', 'tolowercase', '|',
      'imagenone', 'imageleft', 'imageright', 'imagecenter', '|',
      'simpleupload',
      'horizontal', 'date', 'time',
  ]]
  ,lang:"zh-cn"
      //字体
      ,'fontfamily':[
      { label:'',name:'songti',val:'宋体,SimSun'},
      { label:'',name:'kaiti',val:'楷体,楷体_GB2312, SimKai'},
      { label:'',name:'yahei',val:'微软雅黑,Microsoft YaHei'},
      { label:'',name:'heiti',val:'黑体, SimHei'},
      { label:'',name:'lishu',val:'隶书, SimLi'},
      { label:'',name:'andaleMono',val:'andale mono'},
      { label:'',name:'arial',val:'arial, helvetica,sans-serif'},
      { label:'',name:'arialBlack',val:'arial black,avant garde'},
      { label:'',name:'comicSansMs',val:'comic sans ms'},
      { label:'',name:'impact',val:'impact,chicago'},
      { label:'',name:'timesNewRoman',val:'times new roman'}
    ]
      //字号
      ,'fontsize':[10, 11, 12, 14, 16, 18, 20, 24, 36]
      , enableAutoSave : false
      , autoHeightEnabled : false
      , initialFrameHeight: this.props.height  //设置当前组件的初始高度，具体大小由调用者传入（不需要带单位）
      , initialFrameWidth: this.props.width   //设置当前组件的初始宽度，具体大小由调用者传入（不需要带单位）
      ,readonly:this.props.disabled
  });
    var me = this;
    editor.ready( function( ueditor ) {
      var value = me.props.value?me.props.value:'<p></p>';
      editor.setContent(value);
    });
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
