import React, {PropTypes} from 'react';
import {Button,Spin} from 'antd';

/**
 * 修改题目时，简答题答案组件
 * 2018-1-30启用
 */
var TextboxioComponentForAnswerByModify = React.createClass({

    getInitialState() {
        return {
            loading:false,
        };
    },

  componentDidMount(){
    mytextareaAnswerModifyEditor = textboxio.replace('#answerEditorByModify',defaultConfig);
      mytextareaAnswerModifyEditor.content.set(answerContent);
    /*if(mytextareaAnswerModifyEditor!=null && typeof(mytextareaAnswerModifyEditor)!='undefined' ){
      mytextareaAnswerModifyEditor.content.set(answerContent);
    }
    mytextareaAnswerModifyEditor.events.dirty.addListener(function () {
      mytextareaAnswerModifyEditor.mode.set("code");
      mytextareaAnswerModifyEditor.mode.set("design");
        var newContent = "<span></span>";
        mytextareaAnswerModifyEditor.content.insertHtmlAtCursor(newContent);
    });
    mytextareaAnswerModifyEditor.events.focus.addListener(function () {
      if(mytextareaAnswerModifyEditor.mode.get()=="code"){
        mytextareaAnswerModifyEditor.mode.set("design");
      }
        var newContent = "<span></span>";
        mytextareaAnswerModifyEditor.content.insertHtmlAtCursor(newContent);
    });*/
  },
  componentDidUpdate(){
      if(answerContent!=""){
          mytextareaAnswerModifyEditor.content.set(answerContent);
      }
    /*if(mytextareaAnswerModifyEditor!=null && typeof(mytextareaAnswerModifyEditor)!='undefined' ){
      if(mytextareaAnswerModifyEditor.content!=null && typeof(mytextareaAnswerModifyEditor.content)!='undefined' ){
        var contentIsDirty=mytextareaAnswerModifyEditor.content.isDirty();
        if(answerContent!="" && contentIsDirty==false){
          mytextareaAnswerModifyEditor.content.set(answerContent);
        }
      }
    }
    mytextareaAnswerModifyEditor.events.dirty.addListener(function () {
      mytextareaAnswerModifyEditor.mode.set("code");
      mytextareaAnswerModifyEditor.mode.set("design");
    });
    mytextareaAnswerModifyEditor.events.focus.addListener(function () {
      if(mytextareaAnswerModifyEditor.mode.get()=="code"){
        mytextareaAnswerModifyEditor.mode.set("design");
      }
    });
    var activeEditor = textboxio.getActiveEditor();
    if(mytextareaAnswerModifyEditor != null && typeof(mytextareaAnswerModifyEditor)!="undefined"  && (activeEditor==mytextareaAnswerModifyEditor || activeEditor==mytextareaSimpleAnswerModifyEditor)){
      mytextareaAnswerModifyEditor.mode.set("code");
      mytextareaAnswerModifyEditor.mode.set("design");
    }*/
  },

    changeMode(){
        var _this = this;
        _this.setState({loading:true});
        mytextareaAnswerModifyEditor.mode.set("code");
        var t=setTimeout(function () {
            mytextareaAnswerModifyEditor.mode.set("design");
            _this.setState({loading:false});
        },2000)
    },

  render : function(){
    return (
      <div className="btn_subject_ri_wrap">
        <Spin spinning={this.state.loading}  tip="图文内容上传中..." size="large">
          <div id="answerEditorByModify" style={{width:'100%',height:'300px'}}></div>
          <Button type="primary" htmlType="submit" className="login-form-button btn_subject_ri" onClick={this.changeMode}>
           保存答案中的图片
          </Button>
        </Spin>
      </div>
    )
  }
})
export default TextboxioComponentForAnswerByModify;
