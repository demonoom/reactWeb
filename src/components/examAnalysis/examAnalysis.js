import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {Button, message, Table} from 'antd';
import {doWebService} from '../../WebServiceHelper'
import ExamUpLoadModel from './examUpLoadModel'
import Confirm from '../ConfirmModal'

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
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var data = ret.response;
                var arr = [];
                if (ret.msg == "调用成功" && ret.success == true) {
                    if (isEmpty(data) == false) {
                        data.forEach(function (v, i) {
                            var obj = {
                                key: v.taskId,
                                name: v.taskName
                            }
                            arr.push(obj);
                        })
                        _this.setState({scoreData: arr});
                    }
                } else {
                    message.error(ret.msg);
                }
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
        // var urls = 'http://172.16.2.53:8091/#/resultAnalysis?taskId=' + record.key;
        var urls = 'http://jiaoxue.maaee.com:8091/#/resultAnalysis?taskId=' + record.key;
        let param = {
            mode: 'teachingAdmin',
            title: '成绩分析',
            url: urls,
        };

        LP.Start(param);
    },

    /**
     * 删除的回调
     * @param record
     */
    delScore(record) {
        this.setState({delRec: record});   //要删除的班次的对象
        this.showConfirmModal();
    },

    /**
     * 删除成绩单
     */
    deletePaperAnalysisTask() {
        var num = this.state.delRec.key;
        this.refs.confirm.changeConfirmModalVisible(false);
        var _this = this;
        //1.调用接口
        var param = {
            "method": "deletePaperAnalysisTask",
            "taskId": num
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" || ret.success == true) {
                    //2.从本地数据删除那条班次信息
                    var arr = _this.state.scoreData;
                    arr.forEach(function (v, i) {
                        if (v.key == num) {
                            arr.splice(i, 1);
                            return
                        }
                    });
                    _this.setState({scoreData: arr});
                    message.success('删除成功');
                } else {
                    message.error(ret.msg);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * Confirm打开
     */
    showConfirmModal() {
        this.refs.confirm.changeConfirmModalVisible(true);
    },

    /**
     * Confirm关闭
     */
    closeConfirmModal() {
        this.refs.confirm.changeConfirmModalVisible(false);
    },

    addFinish() {
        this.viewPaperAnalysisTaskPage();
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
                    <Button type="button" className="score3_i" icon="area-chart"
                            onClick={_this.analysis.bind(this, record)}></Button>
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
                           dataSource={this.state.scoreData}
                           pagination={false}/>
                </div>
                <ExamUpLoadModel
                    isShow={this.state.examUpLoadModelIsShow}
                    closeExamAnalysisModel={this.closeExamAnalysisModel}
                    addFinish={this.addFinish}
                />
                <Confirm
                    ref="confirm"
                    title="确定删除?"
                    onConfirmModalCancel={this.closeConfirmModal}
                    onConfirmModalOK={this.deletePaperAnalysisTask}
                />
            </div>
        );
    }
});

export default ExamAnalysisComponents;
