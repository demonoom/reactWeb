import React from 'react';
import {Modal, message, Row, Col, Button, Tabs, Input} from 'antd';
import LocalClassesMessage from '../components/localClassRoom/LocalClassesMessage'
import {isEmpty} from "../utils/Const";
import SelectSubjectModal from '../components/localClassRoom/SelectSubjectModal';
import SelectAntCloudMaterialsModal from '../components/localClassRoom/SelectAntCloudMaterialsModal';
import SelectScheduleMaterialsModal from '../components/localClassRoom/SelectScheduleMaterialsModal';
import ConfirmModal from '../components/ConfirmModal';
import GuideModal from '../components/localClassRoom/GuideModal';

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
            antCloudMaterialsModalIsShow:false,
            closeScheduleMaterialsModal:false,
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
        this.connectClazz(userId, classCode, classType,account);
        this.setState({userId, account, classCode, classType});
    },

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
        this.refs.guideModal.changeGuideModalVisible(true);
    },

    /**
     * 设置不同的操作指向，用来根据不同的数据源，分别从备课计划和蚁盘中获取文件
     * @param guideType
     */
    setGuideType(guideType){
        if(guideType.key == "schedule"){
            this.setState({schduleMaterialsModalIsShow:true});
        }else{
            this.setState({antCloudMaterialsModalIsShow:true});
        }
        this.refs.guideModal.changeGuideModalVisible(false);
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
        message.success("推送成功!");
    },

    closeAntCloudMaterialsModal(){
        this.setState({antCloudMaterialsModalIsShow:false});
    },

    closeScheduleMaterialsModal(){
        this.setState({schduleMaterialsModalIsShow:false});
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

    /**
     * 下课，断开与课堂的连接
     */
    disConnectClassRoom(){
        var classOverProtocal = {
            'command':'classOver'
        };
        connection.send(classOverProtocal);
        this.closeConfirmModal();
        window.close();
    },

    showConfirmModal(e) {
        this.refs.confirmModal.changeConfirmModalVisible(true);
    },

    closeConfirmModal() {
        this.refs.confirmModal.changeConfirmModalVisible(false);
    },

    render() {

        var classIfream = null;
        if (isEmpty(this.state.classRoomUrl) == false) {
            classIfream = <div className="classroom_draw"><iframe src={this.state.classRoomUrl} style={{width: '100%', height: '100%'}}></iframe></div>;
        }else{
            classIfream = <div className="classroom_welcome">
                <video width="954" height="584" autoPlay="autoPlay" className="center_all" >
                    <source src="https://www.maaee.com/upload2/common/board_welcome2.mp4" type="video/mp4" />
                </video>
            </div>
        }

        return (
            <div className="local_class flex">
                <div className="flex_auto classroom_left">

                    {classIfream}
                    <div className="classroom_btn">
                        <Button className="classroom_btn_b" onClick={this.getPPT} ><img src={require('../components/images/icon_kejian.png')} /></Button>
                        <Button className="classroom_btn_b  add_out" onClick={this.getSubject} ><img src={require('../components/images/icon_timu_class_white.png')} /></Button>
                    </div>
                    <div className="classroom_btn_finish">
                        <Button className="classroom_btn_b add_out" onClick={this.showConfirmModal}><img src={require('../components/images/finish_class.png')} /></Button>
                    </div>
                </div>
                <div className="local_class_right">
                    <LocalClassesMessage ms={ms} classCode={this.state.classCode} classType={this.state.classType}></LocalClassesMessage>
                </div>
                <SelectSubjectModal isShow={this.state.subjectModalIsShow} onCancel={this.closeSubjectModal} pushSubjectToClass={this.pushSubjectToClass}></SelectSubjectModal>
                <SelectAntCloudMaterialsModal isShow={this.state.antCloudMaterialsModalIsShow} onCancel={this.closeAntCloudMaterialsModal} pushMaterialsToClass={this.pushMaterialsToClass}></SelectAntCloudMaterialsModal>
                <SelectScheduleMaterialsModal isShow={this.state.schduleMaterialsModalIsShow} onCancel={this.closeScheduleMaterialsModal} pushMaterialsToClass={this.pushMaterialsToClass}></SelectScheduleMaterialsModal>
                <ConfirmModal ref="confirmModal"
                              title="确定要下课吗?"
                              onConfirmModalCancel={this.closeConfirmModal}
                              onConfirmModalOK={this.disConnectClassRoom}
                ></ConfirmModal>
                <GuideModal ref="guideModal" setGuideType={this.setGuideType}></GuideModal>
            </div>
        );
    },

});

export default LocalClassRoom;

