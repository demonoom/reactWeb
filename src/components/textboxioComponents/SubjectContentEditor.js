import React, {PropTypes} from 'react';
import {Button,Spin} from 'antd';

/**
 * 题目题干内容修改组件
 * 2018-1-30启用
 */
var SubjectContentEditor = React.createClass({

    getInitialState() {
        return {
            loading:false,
        };
    },

  componentDidMount(){
    subjectContentForEdit = textboxio.replace('#subjectEditorByModify',defaultConfig);
    if(subjectContentForEdit!=null && typeof(subjectContentForEdit)!='undefined' ){
      subjectContentForEdit.content.set(editorContent);
    }
      /*subjectContentForEdit.events.dirty.addListener(function () {
        subjectContentForEdit.mode.set("code");
        subjectContentForEdit.mode.set("design");
        // var newContent = "<span></span>";
        // subjectContentForEdit.content.insertHtmlAtCursor(newContent);
      });
      subjectContentForEdit.events.focus.addListener(function () {
        if(subjectContentForEdit.mode.get()=="code"){
          subjectContentForEdit.mode.set("design");
        }
        // var newContent = "<span></span>";
        // subjectContentForEdit.content.insertHtmlAtCursor(newContent);
      });*/
  },
  componentDidUpdate(){
      if(editorContent!=""){
          subjectContentForEdit.content.set(editorContent);
      }
    /*if(subjectContentForEdit!=null && typeof(subjectContentForEdit)!='undefined' ){
      if(subjectContentForEdit.content!=null && typeof(subjectContentForEdit.content)!='undefined' ){
        var contentIsDirty=subjectContentForEdit.content.isDirty();
        if(editorContent!="" && contentIsDirty==false){
          subjectContentForEdit.content.set(editorContent);
        }
      }
    }
    subjectContentForEdit.events.dirty.addListener(function () {
      subjectContentForEdit.mode.set("code");
      subjectContentForEdit.mode.set("design");
    });
    subjectContentForEdit.events.focus.addListener(function () {
      if(subjectContentForEdit.mode.get()=="code"){
        subjectContentForEdit.mode.set("design");
      }
    });
    var activeEditor = textboxio.getActiveEditor();
    if(subjectContentForEdit != null && typeof(subjectContentForEdit)!="undefined" && activeEditor==subjectContentForEdit ){
      subjectContentForEdit.mode.set("code");
      subjectContentForEdit.mode.set("design");
    }*/
  },

  setContent(content){
      subjectContentForEdit.content.set(content);
  },

    changeMode() {
        var _this = this;
        _this.setState({loading:true});
        subjectContentForEdit.mode.set("code");
        var t = setTimeout(function () {
            subjectContentForEdit.mode.set("design");
            _this.setState({loading:false});
        }, 2000)
    },

  render : function(){
    return (
      <div>
        <Spin spinning={this.state.loading}  tip="图文内容上传中..." size="large">
            <div className="btn_subject_ri_wrap">
                <div id="subjectEditorByModify" style={{width:'100%',height:'300px'}}></div>
                <Button type="primary" htmlType="submit" className="login-form-button btn_subject_ri" onClick={this.changeMode}>
                    保存题目中的图片
                </Button>
            </div>
        </Spin>
      </div>
    )
  }
})
export default SubjectContentEditor;
