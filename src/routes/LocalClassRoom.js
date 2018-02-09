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
        // this.getUsersByAccount(account);
        this.connectClazz(userId, classCode, classType,account);
        this.setState({userId, account, classCode, classType});
    },

    /**
     * 根据从地址中获取的用户账号，重新获取用户的信息
     * @param account
     */
    /*getUsersByAccount(account){
        var _this = this;
        var param = {
            "method": 'getUserByAccount',
            "account": account,
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (res) {
                if (res.success) {
                    if (res.response) {
                        console.log(res.response);
                        sessionStorage.setItem("teacherInfoAtClass",res.response);
                    }
                } else {
                    message.error(res.msg);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },*/

    connectClazz(userId, classCode, classType,account) {
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
                "password": sessionStorage.getItem("pd"),
                "account": account,
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

