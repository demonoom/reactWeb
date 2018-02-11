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
            classRoomList:[]
        };
    },

    componentDidMount() {
        this.getTeacherClasses()
    },

    getMsObj(){
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
                            var openButton = <div><Button onClick={_this.openClass.bind(_this,classId)} className="lesson_start">开课</Button></div>
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
        var classType = "A";
        var account = this.state.loginUser.colAccount;
        var userId = this.state.loginUser.colUid;
        // window.open(LOCAL_CLASS_ROOM_URL+"?userId="+userId+"&account="+account+"&classCode="+classId+"&classType="+classType);
        window.open("http://localhost:8090/#/localClassRoom?userId="+userId+"&account="+account+"&classCode="+classId+"&classType="+classType);
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
                    班级列表
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
