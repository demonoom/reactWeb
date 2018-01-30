import React, {PropTypes} from 'react';
import {Button,Spin} from 'antd';

/**
 * 上传题目时，简答题答案组件
 * 2018-1-30启用
 */
var TextboxioComponentForAnswer = React.createClass({

    getInitialState() {
        return {
            loading:false,
        };
    },

  componentDidMount(){
    mytextareaAnswerEditor = textboxio.replace('#myAnswerTextarea',defaultConfig);

    /*mytextareaAnswerEditor.events.focus.addListener(function () {
      if(mytextareaAnswerEditor.mode.get()=="code"){
        mytextareaAnswerEditor.mode.set("design");
      }
      var newContent = "<span></span>";
      mytextareaAnswerEditor.content.insertHtmlAtCursor(newContent);
    });*/
  },
  componentDidUpdate(){
    /*if(mytextareaAnswerEditor==null || typeof(mytextareaAnswerEditor)=="undefined" ){
      mytextareaAnswerEditor = textboxio.replace('#myAnswerTextarea',defaultConfig);
    }
    var activeEditor = textboxio.getActiveEditor();
    if(mytextareaAnswerEditor != null && typeof(mytextareaAnswerEditor)!="undefined" && (activeEditor==mytextareaAnswerEditor || activeEditor==mytextareaSimpleAnswerEditor)) {
      if(mytextareaAnswerEditor.mode!= null && typeof(mytextareaAnswerEditor.mode)!="undefined" ) {
        mytextareaAnswerEditor.mode.set("code");
        mytextareaAnswerEditor.mode.set("design");
      }
    }*/
  },

    changeMode(){
        var _this = this;
        _this.setState({loading:true});
        mytextareaAnswerEditor.mode.set("code");
        var t=setTimeout(function () {
            mytextareaAnswerEditor.mode.set("design");
            _this.setState({loading:false});
        },2000)
    },

  render : function(){
    return (
      <div className="btn_subject_ri_wrap">
        <Spin spinning={this.state.loading}  tip="图文内容上传中..." size="large">
          <div id="myAnswerTextarea" style={{width:'100%',height:'300px'}}></div>
          <Button type="primary" htmlType="submit" className="login-form-button btn_subject_ri" onClick={this.changeMode}>
            保存答案中的图片
          </Button>
        </Spin>
      </div>
    )
  }
})
export default TextboxioComponentForAnswer;
