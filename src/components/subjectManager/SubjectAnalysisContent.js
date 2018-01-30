import React, {PropTypes} from 'react';
import {Button,Spin} from 'antd';
import {isEmpty} from "../../utils/Const";

/**
 * 添加题目时，题目解析组件
 * 2018-1-30启用
 */
var SubjectAnalysisContent = React.createClass({

    getInitialState() {
        return {
            loading:false,
        };
    },

    componentDidMount() {
        subjectAnalysisContentEditor = textboxio.replace('#subjectAnalysis', defaultConfig);

        /*subjectAnalysisContentEditor.events.focus.addListener(function () {
            if (subjectAnalysisContentEditor.mode.get() == "code") {
                subjectAnalysisContentEditor.mode.set("design");
            }
            var newContent = "<span></span>";
            subjectAnalysisContentEditor.content.insertHtmlAtCursor(newContent);
        });
        var analysisContent = this.props.analysisContent;
        if(isEmpty(analysisContent)==false){
            subjectAnalysisContentEditor.content.set(analysisContent);
        }*/
    },
    componentDidUpdate() {
       /* if (subjectAnalysisContentEditor == null || typeof(subjectAnalysisContentEditor) == "undefined") {
            subjectAnalysisContentEditor = textboxio.replace('#subjectAnalysis', defaultConfig);
        }
        var activeEditor = textboxio.getActiveEditor();
        if (subjectAnalysisContentEditor != null && typeof(subjectAnalysisContentEditor) != "undefined" && activeEditor == subjectAnalysisContentEditor) {
            subjectAnalysisContentEditor.mode.set("code");
            subjectAnalysisContentEditor.mode.set("design");
        }*/
    },

    componentWillReceiveProps(nextProps){
        /*var analysisContent = nextProps.analysisContent;
        if(isEmpty(analysisContent)==false){
            subjectAnalysisContentEditor.content.set(analysisContent);
        }*/
    },

    /**
     * 获取题目的题干
     */
    getSubjectAnalysisContent() {
        return subjectAnalysisContentEditor.content.get();
    },

    /**
     * 获取题目的题干
     */
    setSubjectAnalysisContent(content) {
        subjectAnalysisContentEditor.content.set(content);
    },

    changeMode(){
        var _this = this;
        _this.setState({loading:true});
        subjectAnalysisContentEditor.mode.set("code");
        var t=setTimeout(function () {
            subjectAnalysisContentEditor.mode.set("design");
            _this.setState({loading:false});
        },2000)
    },

    render: function () {
        return (
            <div>
                <Spin spinning={this.state.loading}  tip="图文内容上传中..." size="large">
                    <textarea id="subjectAnalysis" style={{width: '100%', height: '300px'}}></textarea>
                    <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.changeMode}>
                        保存解析中的图片
                    </Button>
                </Spin>
            </div>
        )
    }
})
export default SubjectAnalysisContent;
