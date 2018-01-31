import React, {PropTypes} from 'react';
import {Button,Spin} from 'antd';

/**
 * 题目题干内容上传组件
 * 2018-1-30启用
 */
var SubjectContent = React.createClass({

    getInitialState() {
        return {
            loading:false,
        };
    },

    componentDidMount() {
        console.log("SubjectContent didMount");
        subjectContentEditor = textboxio.replace('#mytextarea', defaultConfig);

        /*subjectContentEditor.events.focus.addListener(function () {
            console.log("SubjectContent focus"+subjectContentEditor.mode.get());
            if (subjectContentEditor.mode.get() == "code") {
                console.log("modalSet");
                subjectContentEditor.mode.set("design");
            }
            var newContent = "<span></span>";
            subjectContentEditor.content.insertHtmlAtCursor(newContent);
        });*/
    },
    componentDidUpdate() {
        console.log("SubjectContent componentDidUpdate");
        /*if (subjectContentEditor == null || typeof(subjectContentEditor) == "undefined") {
            subjectContentEditor = textboxio.replace('#mytextarea', defaultConfig);
        }
        var activeEditor = textboxio.getActiveEditor();
        if (subjectContentEditor != null && typeof(subjectContentEditor) != "undefined" && activeEditor == subjectContentEditor) {
            subjectContentEditor.mode.set("code");
            subjectContentEditor.mode.set("design");
        }*/
    },
    /**
     * 获取题目的题干
     */
    getSubjectContent() {
        return subjectContentEditor.content.get();
    },

    /**
     * 获取题目的题干
     */
    setSubjectContent(content) {
        subjectContentEditor.content.set(content);
    },

    changeMode(){
        var _this = this;
        _this.setState({loading:true});
        subjectContentEditor.mode.set("code");
        var t=setTimeout(function () {
            subjectContentEditor.mode.set("design");
            _this.setState({loading:false});
        },2000)
    },

    render: function () {
        return (
            <div className="btn_subject_ri_wrap">
                <Spin spinning={this.state.loading}  tip="图文内容上传中..." size="large">
                    <textarea id="mytextarea" style={{width: '100%', height: '300px'}}></textarea>
                    <Button type="primary" htmlType="submit" className="login-form-button btn_subject_ri" onClick={this.changeMode}>
                        保存题目中的图片
                    </Button>
                </Spin>
            </div>
        )
    }
})
export default SubjectContent;
