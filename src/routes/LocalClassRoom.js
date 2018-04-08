import React from 'react';
import {Modal, message, Row, Col, Button, Tabs, Input, Icon} from 'antd';
import LocalClassesMessage from '../components/localClassRoom/LocalClassesMessage'
import {isEmpty} from "../utils/Const";
import SelectSubjectModal from '../components/localClassRoom/SelectSubjectModal';
import SelectAntCloudMaterialsModal from '../components/localClassRoom/SelectAntCloudMaterialsModal';
import SelectScheduleMaterialsModal from '../components/localClassRoom/SelectScheduleMaterialsModal';
import SelectAntCloudSubjectsModal from '../components/localClassRoom/SelectAntCloudSubjectsModal';
import ClazzStatusModal from '../components/localClassRoom/ClazzStatusModal';
import ConfirmModal from '../components/ConfirmModal';
import GuideModal from '../components/localClassRoom/GuideModal';
import SubjectGuideModal from '../components/localClassRoom/SubjectGuideModal';
import SendPicModel from '../components/antGroup/SendPicModel'

var connection = null;
var ms = null;
const LocalClassRoom = React.createClass({
    getInitialState() {
        ms = opener.ms;
        return {
            vid: '',
            account: '',
            classRoomUrl: '',
            messageTagArray: [],
            subjectModalIsShow: false,
            subjectInLibModalIsShow: false,
            antCloudMaterialsModalIsShow: false,
            closeScheduleMaterialsModal: false,
            sendPicModel: false,
            closeIconType: 'double-right',
            closeOrOpen: 'open'
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
        sessionStorage.setItem("userId", userId);
        this.connectClazz(userId, classCode, classType, account);
        this.setState({userId, account, classCode, classType});
    },

    componentDidMount() {
        window.__noomSelectPic__ = this.noomSelectPic;
    },

    noomSelectPic(src, obj) {
        this.setState({sendPicModel: true, pinSrc: src, picFile: obj});
    },

    closeSendPicModel() {
        this.setState({sendPicModel: false});
    },

    sendPicToOthers(url) {
        this.refs.localClassesMessage.sendPicToOthers(url);
    },

    connectClazz(userId, classCode, classType, account) {
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
                debugger
                console.log("=============================================>" + info);
                switch (info.command) {
                    case "teacherLogin":
                        //老师登入课堂成功后，返回新建课堂的vid，以此vid进入课堂
                        var account = data.account;
                        var vid = data.vid;
                        sessionStorage.setItem("vid", vid);
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
        // this.setState({antCloudMaterialsModalIsShow:true});
    },

    /**
     * 设置不同的操作指向，用来根据不同的数据源，分别从备课计划和蚁盘中获取文件
     * @param guideType
     */
    setGuideType(guideType) {
        if (guideType.key == "schedule") {
            this.setState({schduleMaterialsModalIsShow: true});
        } else {
            this.setState({antCloudMaterialsModalIsShow: true});
        }
        this.refs.guideModal.changeGuideModalVisible(false);
    },

    /**
     * 设置不同的操作指向，用来根据不同的数据源，分别从题库和蚁盘中获取题目
     * @param guideType
     */
    setSubjectGuideType(guideType) {
        if (guideType.key == "subjectLib") {
            this.setState({subjectInLibModalIsShow: true});
        } else {
            this.setState({subjectModalIsShow: true});
        }
        this.refs.subjectGuideModal.changeGuideModalVisible(false);
    },
    /**
     * 打开选择题目的modal
     */
    getSubject() {
        this.refs.subjectGuideModal.changeGuideModalVisible(true);
        //this.setState({subjectModalIsShow:true});
    },

    /**
     * 关闭选择题目的modal
     */
    closeSubjectModal() {
        this.setState({subjectModalIsShow: false});
    },

    /**
     * 关闭从资源库选择题目的modal
     */
    closeSubjectInLibModal() {
        this.setState({subjectInLibModalIsShow: false});
    },

    pushSubjectToClass(subjectIdsArray) {
        // var protocal = eval('(' + "{'command':'pushSubjecShowContentUrl','data':{'sids':'"+sids+"'}}" + ')');
        var sids = subjectIdsArray.join(",");
        var pushSubjectProtocal = {
            'command': 'pushSubjecShowContentUrl',
            'data': {'sids': sids}
        };
        connection.send(pushSubjectProtocal);
        message.success("推送成功!");
    },

    closeAntCloudMaterialsModal() {
        this.setState({antCloudMaterialsModalIsShow: false});
    },

    closeScheduleMaterialsModal() {
        this.setState({schduleMaterialsModalIsShow: false});
    },

    pushMaterialsToClass(materials) {
        var htmlPath = materials.htmlPath;
        if(isEmpty(htmlPath)==false){
            var pptURL = htmlPath.replace("60.205.111.227", "www.maaee.com");
            pptURL = pptURL.replace("http", "https");
            var vid = this.state.vid;
            var userId = this.state.userId;
            var classRoomUrl = "https://www.maaee.com/Excoord_For_Education/drawboard/main.html?vid=" + vid + "&userId=" + userId + "&role=manager&ppt=" + pptURL;
            var protocal = eval('(' + "{'command':'class_ppt','data':{'control':1,'html':'" + pptURL + "'}}" + ')');
            connection.send(protocal);

            //让新版的学生端显示ppt
            var p1 = eval('(' + "{'command':'class_ppt','data':{'control':9}}" + ')');
            connection.send(p1);
            this.setState({classRoomUrl});
        }else{
            message.error("该文件暂时无法完成推送");
        }
    },

    /**
     * 下课，断开与课堂的连接
     */
    disConnectClassRoom() {
        var classOverProtocal = {
            'command': 'classOver'
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

    /**
     * 关闭/打开聊天讨论区
     */
    closeOrOpenMessageDiv() {
        if (this.state.closeOrOpen == "open") {
            $("#messageDiv").fadeOut(500);
            $("#closeITag").removeClass('shrinkage');
            $("#closeITag").addClass('shrinkage1');
            this.setState({'closeOrOpen': 'close'});
        } else {
            $("#messageDiv").fadeIn(500);
            $("#closeITag").removeClass('shrinkage1');
            $("#closeITag").addClass('shrinkage');
            this.setState({'closeOrOpen': 'open'});
        }
    },

    /**
     * 获取本节课堂统计
     */
    getClazzStatus() {
        this.setState({clazzStatusModalIsShow: true});
    },

    /**
     * 关闭课堂统计的modal
     */
    closeClazzModal() {
        this.setState({clazzStatusModalIsShow: false});
    },

    sendFilterCloudFile(selectArr) {
        if (isEmpty(selectArr)) {
            message.error('请选择图片;')
            return
        }
        var url = '';
        selectArr.forEach(function (v, i) {
            url += v.path + ',';
        })
        var imgURL = url.replace("60.205.86.217", "www.maaee.com");
        imgURL = imgURL.replace("http", "https");
        var imgsUrl = imgURL.substr(0, imgURL.length - 1);

        var vid = this.state.vid;
        var userId = this.state.userId;
        // var classRoomUrl = "https://www.maaee.com/Excoord_For_Education/drawboard/main.html?vid=" + vid + "&userId=" + userId + "&role=manager&ppt=" + imgsUrl;
        var classRoomUrl = "http://192.168.50.15:8080/Excoord_For_Education/drawboard/main.html?vid=" + vid + "&userId=" + userId + "&role=manager&ppt=" + imgsUrl;

        var protocal = eval('(' + "{'command':'class_ppt','data':{'control':1,'url':'" + imgsUrl + "'}}" + ')');
        connection.send(protocal);

        //让新版的学生端显示ppt
        var p1 = eval('(' + "{'command':'class_ppt','data':{'control':9}}" + ')');
        connection.send(p1);
        this.setState({classRoomUrl});
        this.closeAntCloudMaterialsModal();
    },

    render() {

        var classIfream = null;
        if (isEmpty(this.state.classRoomUrl) == false) {
            classIfream = <div className="classroom_draw">
                <iframe src={this.state.classRoomUrl} style={{width: '100%', height: '100%'}}></iframe>
            </div>;
        } else {
            classIfream = <div className="classroom_welcome">
                <video width="954" height="584" autoPlay="autoPlay" className="center_all">
                    <source src="https://www.maaee.com/upload2/common/board_welcome2.mp4" type="video/mp4"/>
                </video>
            </div>
        }
        return (
            <div className="local_class flex">
                <div className="flex_auto classroom_left">

                    {classIfream}
                    <div className="classroom_btn">
                        <Button className="classroom_btn_b" onClick={this.getPPT}><img
                            src={require('../components/images/icon_kejian.png')}/></Button>
                        <Button className="classroom_btn_b  add_out" onClick={this.getSubject}><img
                            src={require('../components/images/icon_timu_class_white.png')}/></Button>
                        <Button className="classroom_btn_b  add_out" onClick={this.getClazzStatus}><img
                            src={require('../components/images/icon_statistical_section.png')}/></Button>
                    </div>
                    <div className="classroom_btn_finish">
                        <Button className="classroom_btn_b add_out" onClick={this.showConfirmModal}><img
                            src={require('../components/images/finish_class.png')}/></Button>
                    </div>
                    <div><i className="shrinkage" id="closeITag" onClick={this.closeOrOpenMessageDiv}></i></div>
                </div>
                <div className="local_class_right" id="messageDiv">
                    <LocalClassesMessage id="localClassMessageObj" ref="localClassesMessage" ms={ms}
                                         classCode={this.state.classCode}
                                         classType={this.state.classType}></LocalClassesMessage>
                </div>
                <SelectSubjectModal isShow={this.state.subjectInLibModalIsShow} onCancel={this.closeSubjectInLibModal}
                                    pushSubjectToClass={this.pushSubjectToClass}></SelectSubjectModal>
                <ClazzStatusModal isShow={this.state.clazzStatusModalIsShow} onCancel={this.closeClazzModal}
                                  vid={this.state.vid}></ClazzStatusModal>
                <SelectAntCloudMaterialsModal sendFilterCloudFile={this.sendFilterCloudFile}
                                              isShow={this.state.antCloudMaterialsModalIsShow}
                                              onCancel={this.closeAntCloudMaterialsModal}
                                              pushMaterialsToClass={this.pushMaterialsToClass}></SelectAntCloudMaterialsModal>
                <SelectScheduleMaterialsModal isShow={this.state.schduleMaterialsModalIsShow}
                                              onCancel={this.closeScheduleMaterialsModal}
                                              pushMaterialsToClass={this.pushMaterialsToClass}></SelectScheduleMaterialsModal>
                <SelectAntCloudSubjectsModal isShow={this.state.subjectModalIsShow} onCancel={this.closeSubjectModal}
                                             pushSubjectToClass={this.pushSubjectToClass}></SelectAntCloudSubjectsModal>
                <ConfirmModal ref="confirmModal"
                              title="确定要下课吗?"
                              onConfirmModalCancel={this.closeConfirmModal}
                              onConfirmModalOK={this.disConnectClassRoom}
                ></ConfirmModal>
                <GuideModal ref="guideModal" setGuideType={this.setGuideType}></GuideModal>
                <SubjectGuideModal ref="subjectGuideModal" setGuideType={this.setSubjectGuideType}></SubjectGuideModal>
                <SendPicModel
                    isShow={this.state.sendPicModel}
                    closeModel={this.closeSendPicModel}
                    pinSrc={this.state.pinSrc}
                    picFile={this.state.picFile}
                    sendPicToOthers={this.sendPicToOthers}
                />
            </div>
        );
    },

});

export default LocalClassRoom;

