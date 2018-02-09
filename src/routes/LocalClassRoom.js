import React from 'react';
import {Modal, message, Row, Col, Button, Tabs, Input} from 'antd';
import LocalClassesMessage from '../components/localClassRoom/LocalClassesMessage'
import {isEmpty} from "../utils/Const";
import SelectSubjectModal from '../components/localClassRoom/SelectSubjectModal';
import SelectMaterialsModal from '../components/localClassRoom/SelectMaterialsModal';

var connection = null;
var ms = null;
const LocalClassRoom = React.createClass({
    getInitialState() {
        ms = opener.ms;
        return {
            vid: '',
            account: '',
            classRoomUrl: '',
            messageTagArray:[],
            subjectModalIsShow:false,
            materialsModalIsShow:false
        };
    },

    componentWillMount() {
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var searchArray = locationSearch.split("&");
        var userId = searchArray[0].split('=')[1];
        var account = searchArray[1].split('=')[1];
        var classCode = searchArray[2].split('=')[1];
        var classType = searchArray[3].split('=')[1];
        document.title = "本地课堂";   //设置title
        sessionStorage.setItem("userId",userId);
        this.connectClazz(userId, classCode, classType);
        // this.getDisconnectedClass(userId, classCode, classType);
        this.setState({userId, account, classCode, classType});
    },

    /**
     * 获取断开的课堂信息(这个在老师进入程序主界面的时候获取，如果有的的话，根据里面返回的信息重新进入课堂)
     */
    getDisconnectedClass(userId, classCode, classType) {
        var _this = this;
        var param = {
            "method": "getDisconnectedClass",
            "userId": userId
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (ret.msg == "调用成功" && ret.success == true) {
                    //如果response不是null，表示存在已断开的课堂，直接进入已存在的课堂
                    if (isEmpty(response) == false) {
                        //虚拟课堂的id
                        var vid = response.vid;
                        //开课老师账号
                        var account = response.account;
                        sessionStorage.setItem("vid",vid);
                        _this.setState({vid});
                    } else {
                        //如果不存在断开的课堂，以当前老师的信息，开启新的课堂
                        _this.connectClazz(userId, classCode, classType);
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

    connectClazz(userId, classCode, classType) {
        var _this = this;
        connection = new ClazzConnection();
        connection.clazzWsListener = {

            onError: function (errorMsg) {
                //强制退出课堂
                message.error(errorMsg);
                // window.close();
            },

            onWarn: function (warnMsg) {
                message.warn(warnMsg);
            },
            // 显示消息
            onMessage: function (info) {
                var data = info.data;
                console.log("=============================================>"+info);
                switch (info.command) {
                    case "teacherLogin":
                        //老师登入课堂成功后，返回新建课堂的vid，以此vid进入课堂
                        var account = data.account;
                        var vid = data.vid;
                        sessionStorage.setItem("vid",vid);
                        _this.setState({vid});
                        break;
                    case'simpleClassDanmu': // 弹幕
                        var message = info.data.message;
                        break;

                    case 'classDanmu':
                        var message = info.data.message;
                        break;
                }
            }
        };
        //构建登录课堂的协议信息
        var loginPro = {
            "command": "teacherLogin",
            "data": {
                "password": "zcl123456",
                "account": "TE24491",
                "classType": classType,
                "classCode": classCode,
                "userId": userId
            }
        };
        //连接登入课堂
        connection.connect(loginPro);
    },

    /**
     * 获取课件，打开ppt，完成推ppt的操作
     */
    getPPT() {
        this.setState({materialsModalIsShow:true});
    },

    /**
     * 打开选择题目的modal
     */
    getSubject() {
        this.setState({subjectModalIsShow:true});
    },

    /**
     * 关闭选择题目的modal
     */
    closeSubjectModal(){
        this.setState({subjectModalIsShow:false});
    },

    pushSubjectToClass(subjectIdsArray){
        // var protocal = eval('(' + "{'command':'pushSubjecShowContentUrl','data':{'sids':'"+sids+"'}}" + ')');
        var sids = subjectIdsArray.join(",");
        var pushSubjectProtocal = {
            'command':'pushSubjecShowContentUrl',
            'data':{'sids':sids}
        };
        connection.send(pushSubjectProtocal);
    },

    closeMaterialsModal(){
        this.setState({materialsModalIsShow:false});
    },

    pushMaterialsToClass(materials){
        var htmlPath = materials.htmlPath;
        var pptURL = htmlPath.replace("60.205.111.227","www.maaee.com");
        pptURL = pptURL.replace("http","https");
        var vid = this.state.vid;
        var userId = this.state.userId;
        var classRoomUrl = "https://www.maaee.com/Excoord_For_Education/drawboard/main.html?vid="+vid+"&userId="+userId+"&role=manager&ppt="+pptURL;
        this.setState({classRoomUrl});
    },

    render() {

        var classIfream = null;
        if (isEmpty(this.state.classRoomUrl) == false) {
            classIfream = <div className="classroom_draw"><iframe src={this.state.classRoomUrl} style={{width: '100%', height: '100%'}}></iframe></div>;
        }else{
            classIfream = <div className="classroom_welcome">
                <img className="center_all" src="../../src/components/images/board_welcome.jpg" />
            </div>
        }

        return (
            <div className="local_class flex">
                <div className="flex_auto classroom_left">

                    {classIfream}
                    <div className="classroom_btn">
                        <Button className="classroom_btn_b classroom_btn_orange" onClick={this.getPPT} icon="folder-open">课件</Button>
                        <Button className="classroom_btn_b classroom_btn_green add_out" onClick={this.getSubject} icon="file-text">题目</Button>
                    </div>
                </div>
                <div className="local_class_right">
                    <LocalClassesMessage ms={ms} classCode={this.state.classCode} classType={this.state.classType}></LocalClassesMessage>
                </div>
                <SelectSubjectModal isShow={this.state.subjectModalIsShow} onCancel={this.closeSubjectModal} pushSubjectToClass={this.pushSubjectToClass}></SelectSubjectModal>
                <SelectMaterialsModal isShow={this.state.materialsModalIsShow} onCancel={this.closeMaterialsModal} pushMaterialsToClass={this.pushMaterialsToClass}></SelectMaterialsModal>
            </div>
        );
    },

});

export default LocalClassRoom;

