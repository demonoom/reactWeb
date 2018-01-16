import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {Button} from 'antd';
import ExamUpLoadModel from './examUpLoadModel'

const ExamAnalysisComponents = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            examUpLoadModelIsShow: false,
        };
    },

    componentDidMount() {

    },

    /**
     * 成绩单上传
     */
    examUpLoad() {
        this.setState({examUpLoadModelIsShow: true});
    },

    /**
     * model关闭
     */
    closeExamAnalysisModel() {
        this.setState({examUpLoadModelIsShow: false});
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        return (
            <div>
                <div className="public—til—blue">
                    <div className="talk_ant_btn1">
                        <Button type="primary" className="antnest_talk" onClick={this.examUpLoad}>成绩单上传</Button>
                    </div>
                    成绩分析列表
                </div>
                <ExamUpLoadModel
                    isShow={this.state.examUpLoadModelIsShow}
                    closeExamAnalysisModel={this.closeExamAnalysisModel}
                />
            </div>
        );
    }
});

export default ExamAnalysisComponents;
