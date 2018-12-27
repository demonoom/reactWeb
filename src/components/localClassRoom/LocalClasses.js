import React, { PropTypes } from 'react';
import { isEmpty } from '../../utils/utils';
import { LOCAL_CLASS_ROOM_URL } from '../../utils/Const';
import { Button, message, Table, Modal } from 'antd';
import { doWebService } from '../../WebServiceHelper'

const classRoomColumns = [{
    title: '班级',
    dataIndex: 'className',
    key: 'className',
    className: 'class_in_name focus_3',
}, {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    className: 'class_right right'
}];

var noomArr = [];  //所有班级的集合
var localClassRoomWindow = null;
/**
 * 本地课堂组件
 */
const LocalClasses = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            classRoomList: [],
            courseState: false, //开课状态
            courseVid: '',     //课程id
            classId: '',
            account: '', //te...
            noomClassName: '',
            changeConfirmModalVisible: false   //关闭弹窗确认modal
        };
    },

    componentWillMount() {
        this.getDisconnectedClass();
    },


    componentDidMount() {
        this.getTeacherClasses();
    },

    getMsObj() {
        return window.ms;
    },

    /**
     * 获取当前老师所带班级列表
     */
    getTeacherClasses() {
        var _this = this;
        var param = {
            "method": "getTeacherClasses",
            "ident": _this.state.loginUser.colUid
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                var classRoomList = [];
                if (ret.msg == "调用成功" && ret.success == true) {
                    if (isEmpty(response) == false) {
                        noomArr = response;
                        response.forEach(function (classInfo, i) {
                            var classInfoArray = classInfo.split("#");
                            var classId = classInfoArray[0];
                            var className = classInfoArray[1];
                            var openButton = <div><Button onClick={_this.openClass.bind(_this, classId)}
                                className="lesson_start">开课</Button></div>;
                            if (isEmpty(_this.state.courseState) == false && _this.state.courseState == true) {
                                if (classId == _this.state.classId) {
                                    openButton = <div><Button onClick={_this.openClass.bind(_this, classId)}
                                        className="localclass_btn" disabled>正在开课</Button></div>;
                                }
                                else {
                                    openButton = <div><Button onClick={_this.openClass.bind(_this, classId)}
                                        className="localclass_btn" disabled>开课</Button></div>;
                                }
                            }

                            var obj = {
                                key: classId,
                                className: className,
                                action: openButton
                            }
                            classRoomList.push(obj);
                        })
                        _this.setState({ classRoomList });
                        _this.getDisconnectedClass();
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
     * 根据是否存在开课的课堂,来决定是否重建班级列表
     */
    rebuildClassRoomList(isHaveDisconnection) {
        var _this = this;
        var classRoomList = [];
        noomArr.forEach(function (classInfo, i) {
            var classInfoArray = classInfo.split("#");
            var classId = classInfoArray[0];
            var className = classInfoArray[1];
            var openButton = <div><Button onClick={_this.openClass.bind(_this, classId)}
                className="localclass_continue localclass_btn">开课</Button></div>;
            if (isHaveDisconnection == true) {
                if (classId == _this.state.classId) {
                    openButton = <div><Button onClick={_this.openClass.bind(_this, classId)}
                        className="localclass_btn" disabled>正在开课</Button></div>;
                }
                else {
                    openButton = <div><Button onClick={_this.openClass.bind(_this, classId)}
                        className="localclass_btn" disabled>开课</Button></div>;
                }
            }

            var obj = {
                key: classId,
                className: className,
                action: openButton
            }
            classRoomList.push(obj);
        })
        _this.setState({ classRoomList });
    },

    /**
     * 开启本地课堂
     * @param classId 班级id
     */
    openClass(classId) {
        var _this = this;
        var classType = "A";
        var account = this.state.loginUser.colAccount;
        var userId = this.state.loginUser.colUid;
        localClassRoomWindow = window.open(LOCAL_CLASS_ROOM_URL + "?userId=" + userId + "&account=" + account + "&classCode=" + classId + "&classType=" + classType);
        // localClassRoomWindow = window.open("http://localhost:8090/#/localClassRoom?userId=" + userId + "&account=" + account + "&classCode=" + classId + "&classType=" + classType);
        var refreshTime = 0;
        var timer = setInterval(function () {
            _this.getDisconnectedClass();
            _this.getTeacherClasses();
            refreshTime += 5;
            if (refreshTime == 15) {
                clearInterval(timer);
            }
        }, 5000)


        /* setTimeout(function () {
             _this.getDisconnectedClass();
             _this.getTeacherClasses();
         }, 3000);*/
    },

    /**
     * 获取当前未关闭的课堂-班级列表
     */
    getDisconnectedClass() {
        var _this = this;
        var param = {
            "method": 'getDisconnectedClass',
            "userId": _this.state.loginUser.colUid
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                console.log(ret);
                var response = ret.response;
                var isHaveDisconnection = false;
                if (isEmpty(response) == false) {
                    var vid = response.vid;
                    var classId = response.classCode;
                    if (isEmpty(noomArr) == false) {
                        var noomArray;
                        noomArr.forEach(function (v, i) {
                            if (v.indexOf(classId) != -1) {
                                noomArray = v.split('#');
                            }
                        })
                    }
                    var account = response.account
                    _this.setState({
                        courseState: true,
                        courseVid: vid,
                        classId: classId,
                        account: account,
                        noomClassName: noomArray[1]
                    });
                    isHaveDisconnection = true;
                } else {
                    isHaveDisconnection = false;
                    _this.setState({ courseState: false });
                }
                _this.rebuildClassRoomList(isHaveDisconnection);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 关闭未断开的课堂
     */
    closeDisconnectionClass() {
        var _this = this;
        var classOverProtocal = {
            'command': 'classOver'
        };
        var localClassConnection = window.localClassConnection;
        if (isEmpty(localClassConnection) == false) {
            window.localClassConnection.send(classOverProtocal);
            window.localClassConnection = null;
        }

        var param = {
            "method": 'closeVirtureClass',
            "userId": _this.state.loginUser.colUid,
            "vid": _this.state.courseVid,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                console.log(ret);
                _this.setState({ courseState: false });
            },
            onError: function (error) {
                message.error(error);
            }
        });
        if (isEmpty(localClassRoomWindow) == false) {
            localClassRoomWindow.close();
        }
        _this.setState({ courseState: false });
        var isHaveDisconnectedClass = false;
        _this.rebuildClassRoomList(isHaveDisconnectedClass);
    },

    /**
     * 点击关闭课堂弹出确认modal
     */
    showConfirmModal(e) {
        this.setState({ changeConfirmModalVisible: true })
    },

    /**
     * 关闭下课弹窗modal
     */
    closeConfirmModal() {
        this.setState({ changeConfirmModalVisible: false })
    },

    /**
     * 确认下课弹窗modal
     */
    disConnectClassRoom() {
        var _this = this;
        _this.closeDisconnectionClass();
        this.setState({ changeConfirmModalVisible: false })

    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {

        var courseState = <div className="startClass localclass_bg">
            <span className="localclass_font">当前
                <span>  " {this.state.noomClassName} "  </span>
                正在开课
            </span>
            <Button onClick={this.openClass.bind(this, this.state.classId)}
                className="localclass_continue right_ri localclass_btn">继续上课</Button>
            <Button onClick={this.showConfirmModal} className="localclass_close right_ri localclass_btn">关闭课堂</Button>
        </div>
        var _this = this;
        return (
            <div>
                <div className="public—til—blue">
                    班级列表
                </div>
                <div>
                    {this.state.courseState == true ? courseState : ''}
                </div>

                <Modal
                    className="calmModal"
                    visible={this.state.changeConfirmModalVisible}
                    title="提示"
                    onCancel={this.closeConfirmModal}
                    maskClosable={false} //设置不允许点击蒙层关闭
                    transitionName=""  //禁用modal的动画效果
                    footer={[
                        <button type="primary" className="login-form-button examination_btn_blue calmSure"
                            onClick={this.disConnectClassRoom}>确定</button>,
                        <button type="ghost" className="login-form-button examination_btn_white calmCancle"
                            onClick={this.closeConfirmModal}>取消</button>
                    ]}
                >
                    <div className="isDel">
                        <img className="sadFeel" src={require("../../../jquery-photo-gallery/icon/sad.png")} />
                        确定要下课吗?
                    </div>
                </Modal>

                <div className="localclass_scroll">
                    <Table columns={classRoomColumns}
                        dataSource={this.state.classRoomList}
                        pagination={false} scroll={{ y: '420px' }} />
                </div>
            </div>
        );
    }
});

export default LocalClasses;
