import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {doWebService} from '../../WebServiceHelper'
import {Modal, Input, Upload, Button, Icon, message} from 'antd';
import {showLargeImg} from '../../utils/utils';

const ExamUpLoadModel = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            isShow: false,
            name: '',
            totalValue: '',
            qualifiedScoreLine: '',
            excellentFractionalLine: '',
            fileList: [],
            urlArr: [],
        }
    },

    componentDidMount() {

    },

    componentWillReceiveProps(nextProps) {
        var isShow = nextProps.isShow;
        this.setState({isShow});
    },

    /**
     * 确定的回调
     */
    handleOk() {
        //先验证
        if (this.state.urlArr.length != 2) {
            message.error('请上传两个文件');
            return
        }
        if (this.state.name.length == 0) {
            message.error('请输入名称');
            return
        }
        if (this.state.name.length > 10) {
            message.error('名称不能超过10个字');
            return
        }
        if (this.state.totalValue.length == 0) {
            message.error('请输入总分值');
            return
        }
        if (this.state.qualifiedScoreLine.length == 0) {
            message.error('请输入合格分数线');
            return
        }
        if (this.state.excellentFractionalLine.length == 0) {
            message.error('请输入优秀分数线');
            return
        }
        this.addPaperAnalysisTask()
    },

    addPaperAnalysisTask() {
        var _this = this;
        var task = {
            creatorId: this.state.loginUser.colUid,
            name: this.state.name,
            excellentLine: this.state.excellentFractionalLine,
            passingLine: this.state.qualifiedScoreLine,
            totalScore: this.state.totalValue,
            knowledgeFile: this.state.urlArr[0].url,
            resultFile: this.state.urlArr[1].url,
        };
        var param = {
            "method": "addPaperAnalysisTask",
            "task": JSON.stringify(task)
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    message.success('成绩单上传成功');
                    _this.closeAddShiftModal();
                    _this.props.addFinish();
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
     * 关闭model的回调
     */
    closeAddShiftModal() {
        this.setState({"isShow": false});
        this.props.closeExamAnalysisModel();
        this.state.fileList.splice(0);
        this.state.urlArr.splice(0);
        this.state.name = '';
        this.state.excellentFractionalLine = '';
        this.state.qualifiedScoreLine = '';
        this.state.totalValue = '';
    },

    /**
     * 上传文件
     * @param info
     */
    handleChange(info) {
        if (info.file.status == 'removed') {
            return
        }
        var urlArr = this.state.urlArr;
        let fileList = info.fileList;
        if (info.file.status == 'done') {
            var obj = {
                uid: info.file.uid,
                url: info.file.response,
                name: info.file.name
            }
            urlArr.push(obj);
        }
        this.setState({fileList, urlArr});
    },

    /**
     * 上传之前的检查
     * @param file
     * @returns {boolean}
     */
    beforeUpload(file) {
        var currentFileList = this.state.fileList;
        if (isEmpty(currentFileList) == false && currentFileList.length >= 2) {
            message.error('只能上传2个文件', 5);
            return false;
        }
        // var fileType = file.type;
        // if (fileType !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        //     message.error('只能上传excel文件，请重新上传', 5);
        //     return false;
        // }
        var fileName = file.name;
        var lastPointIndex = fileName.lastIndexOf(".");
        //通过截取文件后缀名的形式，完成对上传文件类型的判断
        var fileType = fileName.substring(lastPointIndex + 1);
        if(fileType != "xlsx" && fileType!="xls"){
            message.error('只能上传excel文件，请重新上传', 5);
            return false;
        }
    },

    /**
     * 删除上传的回调
     * @param file
     */
    onRemove(file) {
        var arr = this.state.urlArr;
        arr.forEach(function (v, i) {
            if (v.uid == file.uid) {
                arr.splice(i, 1);
            }
        });
        this.setState({urlArr: arr});
    },

    nameOnChange(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var name = target.value;
        this.setState({name});
    },

    totalValueOnChange(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var totalValue = target.value;
        this.setState({totalValue});
    },

    qualifiedScoreLineOnChange(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var qualifiedScoreLine = target.value;
        this.setState({qualifiedScoreLine});
    },

    excellentFractionalLineOnChange(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var excellentFractionalLine = target.value;
        this.setState({excellentFractionalLine});
    },

    ckeckFirstImg() {
        document.getElementById('firstImg').click();
        document.getElementById('J_pg').style.zIndex = 10000;
    },

    secFirstImg() {
        document.getElementById('secImg').click();
        document.getElementById('J_pg').style.zIndex = 10000;
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        const props = {
            action: 'http://60.205.86.217:8890/Excoord_Upload_Server/file/upload',
            beforeUpload: this.beforeUpload,
            onChange: this.handleChange,
            onRemove: this.onRemove,
            // multiple: true,
        };

        return (
            <Modal
                title="上传成绩单"
                visible={this.state.isShow}
                width={600}
                transitionName=""  //禁用modal的动画效果
                closable={true}     //设置显示右上角的关闭按钮（但是需要调整颜色，否则白色会无法显示）
                maskClosable={false} //设置不允许点击蒙层关闭
                onCancel={this.closeAddShiftModal}
                onOk={this.handleOk}
                className="schoolgroup_modal checking_in_modal"
            >
                <div className="modal_register_main">
                    <div className="row_div">
                        <div className="ant-col-6 right_look">名称：</div>
                        <div className="ant-col-14"><Input value={this.state.name} onChange={this.nameOnChange}/></div>
                    </div>
                    <div className="row_div">
                        <div className="ant-col-6 right_look">总分值：</div>
                        <div className="ant-col-14"><Input value={this.state.totalValue}
                                                           onChange={this.totalValueOnChange}/></div>
                    </div>
                    <div className="row_div">
                        <div className="ant-col-6 right_look">合格分数线：</div>
                        <div className="ant-col-14"><Input value={this.state.qualifiedScoreLine}
                                                           onChange={this.qualifiedScoreLineOnChange}/></div>
                    </div>
                    <div className="row_div">
                        <div className="ant-col-6 right_look">优秀分数线：</div>
                        <div className="ant-col-14"><Input value={this.state.excellentFractionalLine}
                                                           onChange={this.excellentFractionalLineOnChange}/></div>
                    </div>
                    <div className="row_div">
                        <div className="ding_t_red ding_t_12 exam_analysis_red">＊先上传双向细目表，再上传成绩单</div>
                        <span className="ding_t_red ding_t_12 exam_analysis_red"
                              style={{marginLeft: 132}}>＊点击查看文件规范要求:</span>
                        <span className="ding_t_red ding_t_12 exam_analysis_red noom_cursor"
                              style={{marginLeft: 8, color: 'blue'}}
                              onClick={this.ckeckFirstImg}
                        >双向细目表规范</span>
                        <span className="ding_t_red ding_t_12 exam_analysis_red noom_cursor"
                              style={{marginLeft: 5, color: 'blue'}}
                              onClick={this.secFirstImg}
                        >试卷成绩规范</span>
                        <img id='firstImg' style={{display: 'none'}}
                             src={require('../images/lALPBY0V4ucb2ujNBKTNA3M_883_1188.png')}
                             onClick={showLargeImg}/>
                        <img id='secImg' style={{display: 'none'}}
                             src={require('../images/lALPBY0V4ucb2ufNBKTNA3M_883_1188.png')}
                             onClick={showLargeImg}/>
                    </div>
                    <div>
                        <div className="ant-col-6 right_look">文件上传：</div>
                        <div className="ant-col-14">
                            <Upload {...props} fileList={this.state.fileList}>
                                <Button>
                                    <Icon type="upload"/>上传
                                </Button>
                            </Upload>
                        </div>
                    </div>
                </div>
            </Modal>
        )
            ;
    }
});

export default ExamUpLoadModel;
