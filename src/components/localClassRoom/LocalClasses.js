import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {Button, message, Table} from 'antd';
import {doWebService} from '../../WebServiceHelper'

const classRoomColumns = [{
    title: '班级',
    dataIndex: 'className',
    key: 'className',
    className: 'checking_in_name focus_3',
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
            classRoomList:[]
        };
    },

    componentDidMount() {
        this.getTeacherClasses()
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
                            var openButton = <div><Button onClick={_this.openClass.bind(_this,classId)}>开课</Button></div>
                            var obj = {
                                key: classId,
                                className:className,
                                action:openButton
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
    openClass(classId){
        console.log(classId);
        this.getDisconnectedClass();
    },

    /**
     * 获取断开的课堂信息(这个在老师进入程序主界面的时候获取，如果有的的话，根据里面返回的信息重新进入课堂)
     */
    getDisconnectedClass() {
        var _this = this;
        var param = {
            "method": "getDisconnectedClass",
            "userId": _this.state.loginUser.colUid
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (ret.msg == "调用成功" && ret.success == true) {
                    //如果response不是null，表示存在已断开的课堂
                    if (isEmpty(response) == false) {
                        //虚拟课堂的id
                        var vid = response.vid;
                        //开课老师id
                        var userId = response.userId;
                        //开课老师账号
                        var account = response.account;
                        //如A
                        var type = response.type;
                        //这是一个数组，如['A']
                        var joinType = response.joinType;
                        //正在开课的班级id
                        var classCode = response.classCode;
                        window.open("http://localhost:8090/#/localClassRoom?vid="+vid+"&account="+account);
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
     * 渲染页面
     * @returns {XML}
     */
    render() {
        var _this = this;
        return (
            <div>
                <div className="public—til—blue">
                    成绩分析列表
                </div>
                <div>
                    <Table columns={classRoomColumns}
                           dataSource={this.state.classRoomList}
                           pagination={false}/>
                </div>
            </div>
        );
    }
});

export default LocalClasses;
