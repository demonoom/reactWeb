import React, { PropTypes } from 'react';
import { WordPasterManager } from '../../ueditor/WordPaster/js/WordPaster';
var editor;
var RichEditorComponentsForCorrect = React.createClass({
  componentDidMount(){
    editor = UE.getEditor("correctContainer", {
      //工具栏
      toolbars: [[
        'undo', 'redo', '|',
        'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'superscript', 'subscript', 'removeformat', 'formatmatch',
        '|', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'selectall', 'cleardoc', '|',
        'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
        'fontfamily', 'fontsize', '|',
        'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'link', 'unlink', '|',
        'horizontal','spechars',
      ]] ,
      lang:"zh-cn"
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
      ,readonly:this.props.disabled,
      imageUrlPrefix:'http://www.maaee.com/Excoord_For_Education/manage/',
      imageUrl: "subject/subject_upload.jsp",
      imagePath: "http://www.maaee.com/Excoord_For_Education/manage/subject/subject_upload.jsp",
      imageManagerUrl: "http://www.maaee.com/Excoord_For_Education/manage/subject/subject_upload.jsp",
      imageManagerPath: "__ROOT__/",
      imageActionName: "uploadimage", /* 执行上传图片的action名称 */
      imageFieldName: "upfile", /* 提交的图片表单名称 */
      imageMaxSize: 2048000, /* 上传大小限制，单位B */
      imageAllowFiles: [".png", ".jpg", ".jpeg", ".gif", ".bmp"], /* 上传图片格式显示 */
      imageCompressEnable: true, /* 是否压缩图片,默认是true */
      imageCompressBorder: 1600, /* 图片压缩最长边限制 */
      imageInsertAlign: "none", /* 插入的图片浮动方式 */
      imageUrlPrefix: "http://localhost:8081/Test/", /* 图片访问路径前缀 */
      /*imagePathFormat: "/ueditor/jsp/upload/image/{yyyy}{mm}{dd}/{time}{rand:6}",  上传保存路径,可以自定义保存路径和文件名格式 */
      /* {filename} 会替换成原文件名,配置这项需要注意中文乱码问题 */
      /* {rand:6} 会替换成随机数,后面的数字是随机数的位数 */
      /* {time} 会替换成时间戳 */
      /* {yyyy} 会替换成四位年份 */
      /* {yy} 会替换成两位年份 */
      /* {mm} 会替换成两位月份 */
      /* {dd} 会替换成两位日期 */
      /* {hh} 会替换成两位小时 */
      /* {ii} 会替换成两位分钟 */
      /* {ss} 会替换成两位秒 */
      /* 非法字符 \ : * ? " < > | */
    });
    var me = this;
    editor.ready( function( ueditor ) {
      if(correctEditorContent!=""){
        editor.setContent(correctEditorContent);
      }else {
        var value = me.props.value ? me.props.value : '<p></p>';
        editor.setContent(value);
      }
      // pasterMgr.SetEditor(editor);
        if(pasterMgr==null || typeof (pasterMgr)=="undefined"){
          pasterMgr = new PasterManager();
          pasterMgr.Config["PostUrl"] = "http://www.maaee.com/Excoord_For_Education/manage/subject/subject_upload.jsp";
        }
        pasterMgr.Init(editor);
    });

  },

  componentDidUpdate(){
    if(correctEditorContent!=""){
      editor.setContent(correctEditorContent);
    }else {
      var value = me.props.value ? me.props.value : '<p></p>';
      editor.setContent(value);
    }
  },

  componentWillUnmount(){
    console.log("判断unmount");
    //React.unmountComponentAtNode(document.getElementById("singleContainer"));
    UE.getEditor("correctContainer").destroy();
  },

  render : function(){
    return (
      <div>
        <script id="correctContainer" name="content" type="text/plain">

        </script>
        <embed type="application/chrWordPstSXLY" PLUGINSPAGE="http://www.maaee.com/uploadFile/WordPaster.crx" width="1" height="0"
               id="objWordPaster"/>
        <div style={{display: "none"}}>
          <div id="PasterMessager">
            <img name="ico" id="infIco" alt="进度图标"
                 src="http://www.ncmem.com/products/word-imagepaster/ckeditor353/WordPaster/upload.gif" />
            <span name="msg">图片上传中...</span>
            <span name="percent">10%</span>
          </div>
          <div className="UploaderItem" id="UploaderTemplate"><div className="UploaderItemLeft">
            <div name="fname" className="FileName top-space">HttpUploader程序开发.pdf</div>
            <div className="ProcessBorder top-space">
              <div name="process" className="Process"></div>
            </div>
            <div name="msg" className="PostInf top-space">
              已上传:15.3MB 速度:20KB/S 剩余时间:10:02:00</div></div>
            <div className="UploaderItemRight">
              <a name="btn" className="Btn" href="javascript:void(0)">取消</a>
              <div name="percent" className="ProcessNum">35%</div>
            </div>
          </div>
          <div className="Line" id="FilePostLine"></div>
          <div id="ImageUploadDialog" title="上传图片">
            <div id="FilePostLister"></div>
          </div>
        </div>
      </div>
    )
  }
})
export default RichEditorComponentsForCorrect;
