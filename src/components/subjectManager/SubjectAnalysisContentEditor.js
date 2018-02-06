import React, {PropTypes} from 'react';
import {Button,Spin} from 'antd';

/**
 * 修改题目时，题目解析组件
 * 2018-1-30启用
 */
var SubjectAnalysisContentEditor = React.createClass({
    getInitialState() {
        return {
            loading:false,
        };
    },

  componentDidMount(){
    subjectAnalysisContentModifyEditor = textboxio.replace('#subjectAnalysisModify',defaultConfig);
      subjectAnalysisContentModifyEditor.content.set(analysisEditContent);
    /*if(subjectAnalysisContentModifyEditor!=null && typeof(subjectAnalysisContentModifyEditor)!='undefined' ){
      subjectAnalysisContentModifyEditor.content.set(analysisEditContent);
    }
    subjectAnalysisContentModifyEditor.events.dirty.addListener(function () {
      subjectAnalysisContentModifyEditor.mode.set("code");
      subjectAnalysisContentModifyEditor.mode.set("design");
    });
    subjectAnalysisContentModifyEditor.events.focus.addListener(function () {
      if(subjectAnalysisContentModifyEditor.mode.get()=="code"){
        subjectAnalysisContentModifyEditor.mode.set("design");
      }
    });*/
  },
  componentDidUpdate(){
      if(analysisEditContent!=""){
          subjectAnalysisContentModifyEditor.content.set(analysisEditContent);
      }
    /*if(subjectAnalysisContentModifyEditor!=null && typeof(subjectAnalysisContentModifyEditor)!='undefined' ){
      if(subjectAnalysisContentModifyEditor.content!=null && typeof(subjectAnalysisContentModifyEditor.content)!='undefined' ){
        var contentIsDirty=subjectAnalysisContentModifyEditor.content.isDirty();
        if(analysisEditContent!="" && contentIsDirty==false){
          subjectAnalysisContentModifyEditor.content.set(analysisEditContent);
        }
      }
    }
    subjectAnalysisContentModifyEditor.events.dirty.addListener(function () {
      subjectAnalysisContentModifyEditor.mode.set("code");
      subjectAnalysisContentModifyEditor.mode.set("design");
    });
    subjectAnalysisContentModifyEditor.events.focus.addListener(function () {
      if(subjectAnalysisContentModifyEditor.mode.get()=="code"){
        subjectAnalysisContentModifyEditor.mode.set("design");
      }
    });
    var activeEditor = textboxio.getActiveEditor();
    if(subjectAnalysisContentModifyEditor != null && typeof(subjectAnalysisContentModifyEditor)!="undefined" && activeEditor==subjectAnalysisContentModifyEditor ){
      subjectAnalysisContentModifyEditor.mode.set("code");
      subjectAnalysisContentModifyEditor.mode.set("design");
    }*/
  },

  setContent(content){
      subjectAnalysisContentModifyEditor.content.set(content);
  },

    changeMode(){
        var _this = this;
        _this.setState({loading:true});
        subjectAnalysisContentModifyEditor.mode.set("code");
        var t=setTimeout(function () {
            subjectAnalysisContentModifyEditor.mode.set("design");
            _this.setState({loading:false});
        },2000)
    },

  render : function(){
    return (
      <div className="btn_subject_ri_wrap">
        <Spin spinning={this.state.loading}  tip="图文内容上传中..." size="large">
          <div id="subjectAnalysisModify" style={{width:'100%',height:'300px'}}></div>
          <Button type="primary" htmlType="submit" className="login-form-button btn_subject_ri" onClick={this.changeMode}>
            保存解析中的图片
          </Button>
        </Spin>
      </div>
    )
  }
})
export default SubjectAnalysisContentEditor;
