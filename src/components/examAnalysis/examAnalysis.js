import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {Button, message, Table} from 'antd';
import {doWebService} from '../../WebServiceHelper'
import ExamUpLoadModel from './examUpLoadModel'

const data = [{
    key: '1',
    name: '语文XXXxxxxxxxxx',
}, {
    key: '2',
    name: '数学XXXxxxxxx',
}, {
    key: '3',
    name: '英语XXXxxxxxxxxxxx',
},{
    key: '4',
    name: '语文XXXxxxxxxxxx',
}, {
    key: '5',
    name: '数学XXXxxxxxx',
}, {
    key: '6',
    name: '英语XXXxxxxxxxxxxx',
},{
    key: '7',
    name: '语文XXXxxxxxxxxx',
}, {
    key: '8',
    name: '数学XXXxxxxxx',
}, {
    key: '9',
    name: '英语XXXxxxxxxxxxxx',
},{
    key: '10',
    name: '语文XXXxxxxxxxxx',
}, {
    key: '11',
    name: '数学XXXxxxxxx',
}, {
    key: '12',
    name: '英语XXXxxxxxxxxxxx',
}];

const ExamAnalysisComponents = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            examUpLoadModelIsShow: false,
            scoreData: []   //成绩数据
        };
    },

    componentDidMount() {
        this.viewPaperAnalysisTaskPage()
    },

    /**
     * 获取成绩列表
     */
    viewPaperAnalysisTaskPage() {
        var _this = this;
        var param = {
            "method": "viewPaperAnalysisTaskPage",
            "colUid": _this.state.loginUser.colUid,
            "pageNo": '-1'
        };
        console.log(param);
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                console.log(ret);
                // var data = ret.response;
                /*if (ret.msg == "调用成功" && ret.success == true) {

                } else {
                    message.error(ret.msg);
                }*/
            },
            onError: function (error) {
                message.error(error);
            }
        });
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
     * 分析的回调
     */
    analysis(record) {
        alert(record);
    },

    /**
     * 删除的回调
     * @param record
     */
    delScore(record) {
        alert(record)
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        var _this = this;
        const columns = [{
            title: '名称',
            dataIndex: 'name',
            key: 'name',
            className: 'checking_in_name focus_3',
        }, {
            title: '操作',
            key: 'action',
            className: 'class_right right',
            render: (text, record) => (
                <span>
                    <Button type="button" className="score3_i" icon="area-chart" onClick={_this.analysis.bind(this, record)}></Button>
                    <Button type="button" icon="delete"
                            onClick={_this.delScore.bind(this, record)}></Button>
                </span>
            ),
        }];
        return (
            <div>
                <div className="public—til—blue">
                    <div className="talk_ant_btn1">
                        <Button type="primary" className="antnest_talk" onClick={this.examUpLoad}>成绩单上传</Button>
                    </div>
                    成绩分析列表
                </div>
                <div className="exam_analysis">
                    <Table columns={columns}
                        // dataSource={this.state.scoreData}
                           dataSource={data}
                           pagination={false}/>
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
