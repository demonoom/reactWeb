import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {LOCAL_CLASS_ROOM_URL} from '../../utils/Const';
import {Button, message, Table} from 'antd';
import {doWebService} from '../../WebServiceHelper'

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
            courseVid : ''  ,     //课程id
            classId : '',
            account: ''   //te...
        };
    },

    componentWillMount() {
        this.getDisconnectedClass();
    },


    componentDidMount() {
        this.getTeacherClasses()
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
                        response.forEach(function (classInfo, i) {
                            var classInfoArray = classInfo.split("#");
                            var classId = classInfoArray[0];
                            var className = classInfoArray[1];
                            var openButton = <div><Button onClick={_this.openClass.bind(_this, classId)}
                                                          className="lesson_start">开课</Button></div>
                            var obj = {
                                key: classId,
                                className: className,
                                action: openButton
                            }
                            classRoomList.push(obj);
                        })
                        _this.setState({classRoomList});
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
     * 开启本地课堂
     * @param classId 班级id
     */
    openClass(classId) {
        var classType = "A";
        var account = this.state.loginUser.colAccount;
        var userId = this.state.loginUser.colUid;
        // window.open(LOCAL_CLASS_ROOM_URL + "?userId=" + userId + "&account=" + account + "&classCode=" + classId + "&classType=" + classType);
        window.open("http://localhost:8090/#/localClassRoom?userId=" + userId + "&account=" + account + "&classCode=" + classId + "&classType=" + classType);
        this.setState({courseState: false});
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
                if (isEmpty(response) == false) {
                    var vid = response.vid;
                    var classId = response.classCode;
                    var account = response.account
                    _this.setState({courseState:true, courseVid: vid,classId:classId, account:account});
                } else {
                    _this.setState({courseState:false});
                }
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
        debugger
        var _this = this;
        var param = {
            "method": 'closeVirtureClass',
            "userId": _this.state.loginUser.colUid,
            "vid": _this.state.courseVid,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                console.log(ret);
                _this.setState({courseState: false});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },




    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {

        var courseState = <div className="startClass">
            <span>您的课堂已中断,是否继续刚才的课堂?</span>
            <Button  onClick={this.closeDisconnectionClass} className="lesson_start closeClass ">关闭课堂</Button>
            <Button  onClick={this.openClass.bind(this,this.state.classId)} className="lesson_start">继续上课</Button>
            
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
                <div className="localclass_scroll">
                    <Table columns={classRoomColumns}
                           dataSource={this.state.classRoomList}
                           pagination={false} scroll={{y: '420px'}}/>
                </div>
            </div>
        );
    }
});

export default LocalClasses;
