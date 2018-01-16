import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {doWebService} from '../../WebServiceHelper'
import {Modal, Input, Upload, Button, Icon, message} from 'antd';

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
        var task = {
            creatorId: this.state.loginUser.colUid,
            name: this.state.name,
            excellentLine: this.state.excellentFractionalLine,
            passingLine: this.state.qualifiedScoreLine,
            totalScore: this.state.totalValue,
            knowledgeFile: this.state.urlArr[0].url,
            resultFile: this.state.urlArr[1].url,
        };
        // console.log(task);
        var param = {
            "method": "addPaperAnalysisTask",
            "task": JSON.stringify(task)
        };
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
     * 关闭model的回调
     */
    closeAddShiftModal() {
        this.setState({"isShow": false});
        this.props.closeExamAnalysisModel();
        this.state.fileList.splice(0);
        this.state.urlArr.splice(0);
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
        var fileType = file.type;
        if (fileType !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            message.error('只能上传excel文件，请重新上传', 5);
            return false;
        }
    },

    /**
     * 删除上传的回调
     * @param file
     */
    onRemove(file) {
        debugger
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

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        const props = {
            action: 'http://101.201.45.125:8890/Excoord_Upload_Server/file/upload',
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
                    <div>
                        名称:<Input value={this.state.name} onChange={this.nameOnChange}/>
                    </div>
                    <div>
                        总分值:<Input value={this.state.totalValue} onChange={this.totalValueOnChange}/>
                    </div>
                    <div>
                        合格分数线:<Input value={this.state.qualifiedScoreLine} onChange={this.qualifiedScoreLineOnChange}/>
                    </div>
                    <div>
                        优秀分数线:<Input value={this.state.excellentFractionalLine}
                                     onChange={this.excellentFractionalLineOnChange}/>
                    </div>
                    <div>
                        文件上传(先上传知识点,再上传成绩单):
                        <Upload {...props} fileList={this.state.fileList}>
                            <Icon type="upload" className='noom_cursor'/>
                        </Upload>
                    </div>
                </div>
            </Modal>
        );
    }
});

export default ExamUpLoadModel;
