import React, {PropTypes} from 'react';
import {Tabs, Breadcrumb, Icon, Card, Button, Row, Col, Table, Transfer} from 'antd';
import {Menu, Dropdown, message, Pagination, Tag, Modal, Popover, Input, Collapse,notification} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import PersonCenterComponents from './PersonCenterComponents';
import EmotionInputComponents from './EmotionInputComponents';
import UseKnowledgeComponents from '../UseKnowledgeComponents';
import Favorites from '../Favorites';
import {getPageSize} from '../../utils/Const';
import {getLocalTime} from '../../utils/utils';
import {isEmpty} from '../../utils/Const';
import {phone} from '../../utils/phone';
import {getImgName} from '../../utils/Const';
import {MsgConnection} from '../../utils/msg_websocket_connection';
import ConfirmModal from '../ConfirmModal';

const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const Panel = Collapse.Panel;

var antGroup;
var messageList = [];
//消息通信js
var ms;
var imgTagArray = [];
var showImg = "";
var showContent = "";//将要显示的内容
var data = [];
var courseWareList;
var activeKey = new Array();
var coursePanelChildren;
var liveInfosPanelChildren;
// var errorModalIsShow = false;
var topScrollHeight=0;
var scrollType="auto";
const AntGroupTabComponents = React.createClass({

    getInitialState() {
        antGroup = this;
        return {
            isreader: true,
            defaultActiveKey: 'loginWelcome',
            activeKey: 'loginWelcome',
            optType: 'getUserList',
            userContactsData: [],
            currentPerson: -1,
            messageList: '',
            userIdOfCurrentTalk: '',
            userGroupsData: [],
            createChatGroupModalVisible: false,
            mockData: [],       //联系人穿梭框左侧备选数据
            targetKeys: [],     //联系人穿梭框右侧已选数据
            chatGroupTitle: '',
            updateGroupId: '',
            currentMemberArray: [],
            selectedRowKeys: [],  // Check here to configure the default column
            selectedRowKeysStr: '',
            memberData: [],  //添加群成员时，待添加群成员的数组
            memberTargetKeys: [],    //添加群成员时，已选中待添加群成员的数组
            updateChatGroupTitle: '',
            followsUserArray: [],
            breadcrumbVisible: true,
            totalLiveCount: 0,   //直播课页面的直播课总数
            currentLivePage: 1,  //直播课页面的当前页码
            currentCourseWarePage: 1,    //资源页面的当前页码
            totalCourseWareCount: 0,     //资源页面的资源总数
            currentSubjectPage: 1,    //题目页面的当前页码
            totalSubjectCount: 0,     //题目页面的资源总数
            totalChatGroupCount: 0,  //当前用户的群组总数
            currentChatGroupPage: 1,    //群组列表页面的当前页码
            errorModalIsShow:false,
            isDirectToBottom:true
        };

    },
    /**
     * 话题tab切换响应函数
     * @param activeKey
     */
    onChange(activeKey) {
        this.setState({activeKey: activeKey});
    },

    componentWillMount(){
        ms = antGroup.props.messageUtilObj;
        var messageType = antGroup.props.messageType;
        var propsUserInfo = antGroup.props.userInfo;
        if(isEmpty(messageType)==false){
            if(messageType=="message"){
                antGroup.getUser2UserMessages(propsUserInfo);
            }else{
                antGroup.sendGroupMessage(antGroup.props.groupObj);
            }
        }
    },

    componentDidUpdate(){
        var gt = $('#groupTalk');
        if(typeof(gt)==="object" && typeof(gt).length==="number" && gt.length!=0){
            topScrollHeight = gt[0].scrollHeight;
            if(antGroup.state.isDirectToBottom){
                gt.scrollTop(parseInt(gt[0].scrollHeight));
            }
        }
    },

    componentDidMount(){
        // document.onkeydown=this.checkKeyType;
        /*$("#emotionInput").bind("keydown",antGroup.checkKeyType);
        $(".emoji-wysiwyg-editor").bind("keydown",antGroup.checkKeyType);*/
    },

    handleScroll(e){
        if(scrollType=="auto"){
            return;
        }
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var scrollTop = target.scrollTop;
        if(scrollTop == 0){
            antGroup.setState({"isDirectToBottom":false});
            if(antGroup.state.messageComeFrom=="groupMessage"){
                debugger
                antGroup.reGetChatMessage(antGroup.state.currentGroupObj,antGroup.state.firstMessageCreateTime);
            }else{
                debugger
                antGroup.getUser2UserMessages(antGroup.state.currentUser,antGroup.state.firstMessageCreateTime);
            }
        }
    },

    handleScrollType(e){
        scrollType="defined";
    },

    checkKeyType(){
        var sendType;
        if(antGroup.state.messageComeFrom=="groupMessage"){
            sendType="groupSend";
        }else{
            sendType="";
        }
        antGroup.messageSendByType(sendType);
    },

    showpanle(obj){
        LP.Start(obj);
    },


    shouldComponentUpdate(){
        if (this.state.isreader) {
            return true;
        } else {
            return false;
        }
    },

    createUUID() {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        var uuid = s.join("");
        return uuid;
    },

    /**
     * 进入收发消息的窗口
     * @param user
     */
    turnToMessagePage(user){
        var _this = this;
        var userId = user.colUid;
        messageList.splice(0);
        ms.msgWsListener = {
            onError: function (errorMsg) {
                if(_this.state.errorModalIsShow==false){
                    _this.setState({"errorModalIsShow":true});
                    ms.closeConnection();
                    Modal.error({
                        transitionName:"",  //禁用modal的动画效果
                        title: '系统异常通知',
                        content: errorMsg,
                        onOk() {
                            sessionStorage.removeItem("ident");
                            sessionStorage.removeItem("loginUser");
                            sessionStorage.removeItem("machineId");
                            location.hash="Login";
                            LP.delAll();
                        },
                    });
                }
            }, onWarn: function (warnMsg) {

            }, onMessage: function (info) {
                if (antGroup.state.optType == "sendMessage") {
                    //获取messageList
                    var command = info.command;

                    if (isEmpty(command) == false) {
                        if (command == "messageList") {
                            var data = info.data;
                            var messageArray = data.messages;
                            var uuidsArray = [];
                            messageArray.forEach(function (e) {
                                var fromUser = e.fromUser;
                                var colUtype = fromUser.colUtype;
                                if (("SGZH" == colUtype || fromUser.colUid == userId) && e.toType == 1) {
                                    var uuid = e.uuid;
                                    uuidsArray.push(uuid);
                                    imgTagArray.splice(0);
                                    showImg = "";
                                    var content = e.content;
                                    /*var imgTagArrayReturn = antGroup.getImgTag(e.content);*/
                                    var imgTagArrayReturn = [];
                                    var messageReturnJson = antGroup.getImgTag(e.content);
                                    if (messageReturnJson.messageType == "text") {
                                        content = messageReturnJson.textMessage;
                                    } else if (messageReturnJson.messageType == "imgTag") {
                                        imgTagArrayReturn = messageReturnJson.imgMessage;
                                    }
                                    var message = {
                                        'fromUser': fromUser,
                                        'content': content,
                                        "messageType": "getMessage",
                                        "imgTagArray": imgTagArrayReturn,
                                        "messageReturnJson": messageReturnJson
                                    };
                                    messageList.push(message);
                                    // messageList.splice(0,0,message);
                                }
                            });
                            if (uuidsArray.length != 0) {
                                var receivedCommand = {
                                    "command": "messageRecievedResponse",
                                    "data": {"uuids": uuidsArray}
                                };
                                ms.send(receivedCommand);
                            }
                            antGroup.setState({"messageList": messageList});
                        } else if (command == "message") {
                            var data = info.data;
                            var messageOfSinge = data.message;
                            var uuidsArray = [];
                            var fromUser = messageOfSinge.fromUser;
                            var colUtype = fromUser.colUtype;
                            var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
                            if (("SGZH" == colUtype || fromUser.colUid != loginUser.colUid) && messageOfSinge.toType == 1) {
                                var uuid = messageOfSinge.uuid;
                                uuidsArray.push(uuid);
                                var content = messageOfSinge.content;
                                imgTagArray.splice(0);
                                showImg = "";
                                var imgTagArrayReturn = [];
                                var messageReturnJson = antGroup.getImgTag(messageOfSinge.content);
                                if (messageReturnJson.messageType == "text") {
                                    content = messageReturnJson.textMessage;
                                } else if (messageReturnJson.messageType == "imgTag") {
                                    imgTagArrayReturn = messageReturnJson.imgMessage;
                                }
                                var messageShow = {
                                    'fromUser': fromUser,
                                    'content': content,
                                    "messageType": "getMessage",
                                    "imgTagArray": imgTagArrayReturn,
                                    "messageReturnJson": messageReturnJson
                                };
                                messageList.splice(0, 0, messageShow);
                                if (uuidsArray.length != 0) {
                                    var receivedCommand = {
                                        "command": "messageRecievedResponse",
                                        "data": {"uuids": uuidsArray}
                                    };
                                    ms.send(receivedCommand);
                                }
                            }
                            antGroup.setState({"messageList": messageList});
                        }
                    }
                }
            }
        };

        antGroup.setState({"optType": "sendMessage", "userIdOfCurrentTalk": userId, "currentUser": user});
    },

    turnToChatGroupMessagePage(groupObj){
        var _this = this;
        //messageList.splice(0);
        ms.msgWsListener = {
            onError: function (errorMsg) {
                if(_this.state.errorModalIsShow==false){
                    _this.setState({"errorModalIsShow":true});
                    ms.closeConnection();
                    Modal.error({
                        transitionName:"",  //禁用modal的动画效果
                        title: '系统异常通知',
                        content: errorMsg,
                        onOk() {
                            sessionStorage.removeItem("ident");
                            sessionStorage.removeItem("loginUser");
                            sessionStorage.removeItem("machineId");
                            LP.delAll();
                            location.hash="Login";
                        },
                    });
                }
            }, onWarn: function (warnMsg) {

            }, onMessage: function (info) {
                //获取messageList
                var command = info.command;

                if (antGroup.state.optType == "sendGroupMessage") {
                    if (isEmpty(command) == false) {
                        if (command == "messageList") {
                            var data = info.data;
                            var messageArray = data.messages;
                            var uuidsArray = [];
                            messageArray.forEach(function (e) {
                                var fromUser = e.fromUser;
                                var colUtype = fromUser.colUtype;
                                //处理聊天的群组消息
                                if (("SGZH" == colUtype || groupObj.chatGroupId == e.toId ) && e.toType == 4) {
                                    var uuid = e.uuid;
                                    uuidsArray.push(uuid);
                                    imgTagArray.splice(0);
                                    showImg = "";
                                    var content = e.content;
                                    var imgTagArrayReturn = [];
                                    var messageReturnJson = antGroup.getImgTag(e.content);
                                    if (messageReturnJson.messageType == "text") {
                                        content = messageReturnJson.textMessage;
                                    } else if (messageReturnJson.messageType == "imgTag") {
                                        imgTagArrayReturn = messageReturnJson.imgMessage;
                                    }
                                    var message = {
                                        'fromUser': fromUser,
                                        'content': content,
                                        "messageType": "getMessage",
                                        "imgTagArray": imgTagArrayReturn,
                                        "messageReturnJson": messageReturnJson
                                    };
                                    // messageList.push(message);
                                    messageList.splice(0, 0, message);
                                }
                            });
                            if (uuidsArray.length != 0) {
                                var receivedCommand = {
                                    "command": "messageRecievedResponse",
                                    "data": {"uuids": uuidsArray}
                                };
                                ms.send(receivedCommand);
                            }
                            antGroup.setState({"messageList": messageList});
                        } else if (command == "message") {
                            var data = info.data;
                            var messageOfSinge = data.message;
                            var uuidsArray = [];
                            var fromUser = messageOfSinge.fromUser;
                            var colUtype = fromUser.colUtype;
                            var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
                            if (("SGZH" == colUtype || fromUser.colUid != loginUser.colUid) && messageOfSinge.toType == 4) {
                                var uuid = messageOfSinge.uuid;
                                uuidsArray.push(uuid);
                                var content = messageOfSinge.content;
                                imgTagArray.splice(0);
                                showImg = "";
                                //var imgTagArrayReturn = antGroup.getImgTag(messageOfSinge.content);
                                var imgTagArrayReturn = [];
                                var messageReturnJson = antGroup.getImgTag(messageOfSinge.content);
                                if (messageReturnJson.messageType == "text") {
                                    content = messageReturnJson.textMessage;
                                } else if (messageReturnJson.messageType == "imgTag") {
                                    imgTagArrayReturn = messageReturnJson.imgMessage;
                                }
                                var messageShow = {
                                    'fromUser': fromUser,
                                    'content': content,
                                    "messageType": "getMessage",
                                    "imgTagArray": imgTagArrayReturn,
                                    "messageReturnJson": messageReturnJson
                                };
                                messageList.push(messageShow);
                                // messageList.splice(0,0,messageShow);
                                if (uuidsArray.length != 0) {
                                    var receivedCommand = {
                                        "command": "messageRecievedResponse",
                                        "data": {"uuids": uuidsArray}
                                    };
                                    ms.send(receivedCommand);
                                }
                            }
                            antGroup.setState({"messageList": messageList});
                        }
                    }
                }
            }
        };

        antGroup.setState({"optType": "sendGroupMessage", "currentGroupObj": groupObj});
    },

    getImgTag(str){
        var imgTags = [];
        var messageReturnJson = {};
        messageReturnJson = antGroup.changeImgTextToTag(str, imgTags, messageReturnJson);
        return messageReturnJson;
    },

    /**
     * 将表情的标记转为表情的图片
     * 需要按点替换，被替换的位置需要打上标记，之后再将原内容，以imgTag的形式替换回去
     */
    changeImgTextToTag(str, imgTags, messageReturnJson){
        showContent = str;
        var start = str.indexOf("[bexp_");
        if (start != -1) {
            //
            var end = str.indexOf("]");
            var subStr = str.substring(start, end + 1);
            showContent = showContent.replace(subStr, "~");
            var imgUrl = getImgName(subStr);
            var localUrl = "../src/components/images/emotions/" + imgUrl;
            var subStrReplace = <span className='attention_img'><img src={localUrl}/></span>;
            imgTags.push(subStrReplace);
            var otherStr = str.substring(end + 1);
            if (otherStr.indexOf("[bexp_") != -1) {
                antGroup.changeImgTextToTag(otherStr, imgTags);
            } else {
                showImg += otherStr;
            }
            messageReturnJson = {messageType: "imgTag", imgMessage: imgTags};

        } else {
            //不存在表情，为单纯性的文字消息
            messageReturnJson = {messageType: "text", textMessage: str};
        }
        return messageReturnJson;
    },

    sendMessage(e){
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var sendType = target.value;
        antGroup.messageSendByType(sendType);
    },

    messageSendByType(sendType){
        var messageContent = antGroup.getEmotionInputById();
        if (isEmpty(messageContent)) {
            message.error("消息内容不允许为空!");
            return;
        }
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var uuid = antGroup.createUUID();
        var createTime = (new Date()).valueOf();
        var messageJson = {
            'content': messageContent, "createTime": createTime, 'fromUser': loginUser,
            "toId": antGroup.state.userIdOfCurrentTalk, "command": "message", "hostId": loginUser.colUid,
            "uuid": uuid, "toType": 1
        };
        if (antGroup.state.optType == "sendGroupMessage") {
            messageJson.toId = antGroup.state.currentGroupObj.chatGroupId;
            messageJson.toType = 4;
        }
        var commandJson = {"command": "message", "data": {"message": messageJson}};
        if (isEmpty(sendType) == false && sendType == "groupSend") {
            messageList.push(messageJson);
        } else {
            messageList.splice(0, 0, messageJson);
        }
        ms.send(commandJson);
        antGroup.initMyEmotionInput();
        antGroup.setState({"messageList": messageList,"isDirectToBottom":true});
    },

    /**
     * 通过id获取文本域对象，并进而获取vaue值
     * @returns {string}
     */
    getEmotionInputById(){
        var messageContent = $(".emoji-wysiwyg-editor")[0].innerHTML;
        if(messageContent.indexOf("emojiPicker")!=-1){
            messageContent = $("#emotionInput")[0].value;
        }else{
            messageContent = $(".emoji-wysiwyg-editor")[0].innerText;
        }
        return messageContent;
    },

    /**
     * 初始化表情输入框
     * 清空话题标题输入框
     */
    initMyEmotionInput(){
        $("#emotionInput").val("");
        var emotionArray = $(".emoji-wysiwyg-editor");
        if (isEmpty(emotionArray) == false) {
            for (var i = 0; i < emotionArray.length; i++) {
                emotionArray[i].innerHTML = "";
                emotionArray[i].innerText = "";
                emotionArray[i].onKeyDown = this.checkKeyType;
            }
        }
    },

    getUserChatGroup(){
        antGroup.getUserChatGroupById(antGroup.state.currentChatGroupPage);
    },

    /**
     * 点击群组列表表格行时，获取当前行对应的记录信息
     * @param record　当前行的群组信息
     * @param index　当前行的索引顺序，从０开始
     */
    sendGroupMessage(groupObj,timeNode){
        debugger
        messageList.splice(0);
        scrollType="auto";
        antGroup.setState({"isDirectToBottom":true,"messageComeFrom":"groupMessage"});
        antGroup.reGetChatMessage(groupObj,timeNode);
    },

    reGetChatMessage(groupObj,timeNode){
        debugger
        antGroup.getChatGroupMessages(groupObj,timeNode);
        antGroup.turnToChatGroupMessagePage(groupObj);
    },

    /**
     * 弹出消息提示
     * 当获取不到更早的消息列表时，给出提示信息
     * @param response
     */
    tipNotic(response){
        if(typeof(response)!="undefined" && response.length==0){
            notification['warning']({
                description: '没有更多消息了',
                style: {
                    top:120,
                    width: 600,
                    marginLeft: 35 - 600,
                },
            });
        }
    },

    /**
     * 获取群聊天信息
     */
    getChatGroupMessages(groupObj,timeNode){
        var param = {
            "method": 'getChatGroupMessages',
            "chatGroupId": groupObj.chatGroupId,
            "timeNode": timeNode
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    var i=0;
                    antGroup.tipNotic(ret.response);
                    ret.response.forEach(function (e) {
                        if (e.command == "message") {
                            var messageOfSinge = e;
                            if(i==ret.response.length-1){
                                antGroup.setState({"firstMessageCreateTime": messageOfSinge.createTime});
                            }
                            i++;
                            var uuidsArray = [];
                            var fromUser = messageOfSinge.fromUser;
                            var colUtype = fromUser.colUtype;
                            var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
                            if (("SGZH" == colUtype || groupObj.chatGroupId == e.toId ) && e.toType == 4) {
                                var uuid = e.uuid;
                                uuidsArray.push(uuid);
                                imgTagArray.splice(0);
                                showImg = "";
                                var content = e.content;
                                var imgTagArrayReturn = [];
                                var messageReturnJson = antGroup.getImgTag(e.content);
                                if (messageReturnJson.messageType == "text") {
                                    content = messageReturnJson.textMessage;
                                } else if (messageReturnJson.messageType == "imgTag") {
                                    imgTagArrayReturn = messageReturnJson.imgMessage;
                                }
                                var message = {
                                    'fromUser': fromUser,
                                    'content': content,
                                    "messageType": "getMessage",
                                    "imgTagArray": imgTagArrayReturn,
                                    "messageReturnJson": messageReturnJson
                                };
                                // messageList.push(message);
                                messageList.splice(0, 0, message);
                            }
                            antGroup.setState({"messageList": messageList});
                        }
                    });
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 点击消息列表，进入消息的列表窗口
     * @param userObj
     * @param timeNode
     */
    getPersonMessage(userObj,timeNode){
        messageList.splice(0);
        antGroup.setState({"isDirectToBottom":true,"messageComeFrom":"personMessage"});
        antGroup.getUser2UserMessages(userObj,timeNode);
        antGroup.turnToMessagePage(userObj);
    },

    /**
     * 获取个人的聊天信息
     */
    getUser2UserMessages(userObj,timeNode){
        var param = {
            "method": 'getUser2UserMessages',
            "user1Id": userObj.colUid,
            "user2Id": sessionStorage.getItem("ident"),
            "timeNode": timeNode
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    var i = 0;
                    antGroup.tipNotic(ret.response);
                    ret.response.forEach(function (e) {
                        if (e.command == "message") {
                            var messageOfSinge = e;
                            if(i==ret.response.length-1){
                                antGroup.setState({"firstMessageCreateTime": messageOfSinge.createTime});
                            }
                            i++;
                            var uuidsArray = [];
                            var fromUser = messageOfSinge.fromUser;
                            var colUtype = fromUser.colUtype;
                            var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
                            if (messageOfSinge.toType == 1) {
                                var uuid = messageOfSinge.uuid;
                                uuidsArray.push(uuid);
                                var content = messageOfSinge.content;
                                imgTagArray.splice(0);
                                showImg = "";
                                var imgTagArrayReturn = [];
                                var messageReturnJson = antGroup.getImgTag(messageOfSinge.content);
                                if (messageReturnJson.messageType == "text") {
                                    content = messageReturnJson.textMessage;
                                } else if (messageReturnJson.messageType == "imgTag") {
                                    imgTagArrayReturn = messageReturnJson.imgMessage;
                                }
                                var messageShow = {
                                    'fromUser': fromUser,
                                    'content': content,
                                    "messageType": "getMessage",
                                    "imgTagArray": imgTagArrayReturn,
                                    "messageReturnJson": messageReturnJson
                                };
                                messageList.push(messageShow);
                            }
                            antGroup.setState({"messageList": messageList});
                        }
                    });
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 返回当前聊天群组窗口页面（对应tab组件工具栏上的返回按钮）
     */
    returnToChatGroupMessagePage(){
        var currentGroupObj = antGroup.state.currentGroupObj;
        //返回群组窗口时，重新获取最近的聊天记录
        antGroup.getChatGroupMessages(currentGroupObj);
        antGroup.turnToChatGroupMessagePage(currentGroupObj);
    },

    render() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var welcomeTitle;
        var returnToolBar = <div className="ant-tabs-right"><Button
            onClick={antGroup.returnAntGroupMainPage}>返回</Button></div>;
        var tabComponent;
        var userPhoneCard;
        var breadCrumb = <Breadcrumb separator=">">
            <Breadcrumb.Item><Icon type="home"/></Breadcrumb.Item>
            <Breadcrumb.Item href="#/MainLayout">动态</Breadcrumb.Item>
        </Breadcrumb>;
        if (antGroup.state.optType == "sendMessage") {
            var messageTagArray = [];
            messageTagArray.splice(0);
            var messageList = antGroup.state.messageList;
            if (isEmpty(messageList) == false && messageList.length > 0) {
                for (var i = messageList.length - 1; i >= 0; i--) {
                    var e = messageList[i];
                    var content = e.content;
                    var fromUser = e.fromUser.userName;
                    var userPhoneIcon;
                    if (isEmpty(e.fromUser.avatar)) {
                        userPhoneIcon = <img src={require('../images/maaee_face.png')}></img>;
                    } else {
                        userPhoneIcon = <img src={e.fromUser.avatar}></img>;
                    }
                    var messageType = e.messageType;
                    var messageTag;
                    if (isEmpty(messageType) == false && messageType == "getMessage") {
                        if (isEmpty(e.messageReturnJson) == false && isEmpty(e.messageReturnJson.messageType) == false) {
                            if (e.messageReturnJson.messageType == "text") {
                                if (e.fromUser.colUid == sessionStorage.getItem("ident")) {
                                    messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont"><span className="name">{userPhoneIcon}</span><span
                                            className="borderballoon">{e.content}</span></div>
                                    </li>;
                                } else {
                                    messageTag = <li style={{'textAlign': 'left'}}>
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont"><span className="name">{userPhoneIcon}</span><span
                                            className="borderballoon_le">{e.content}</span></div>
                                    </li>;
                                }
                            } else if (e.messageReturnJson.messageType == "imgTag") {
                                if (e.fromUser.colUid == sessionStorage.getItem("ident")) {
                                    messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont"><span className="name">{userPhoneIcon}</span><span
                                            className="borderballoon ">{e.imgTagArray}</span></div>
                                    </li>;
                                } else {
                                    messageTag = <li style={{'textAlign': 'left'}}>
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont"><span className="name">{userPhoneIcon}</span><span
                                            className="borderballoon_le ">{e.imgTagArray}</span></div>
                                    </li>;
                                }
                            }
                        }
                    } else {
                        messageTag = <li className="right" style={{'textAlign': 'right'}}>
                            <div className="u-name"><span>{fromUser}</span></div>
                            <div className="talk-cont">
                                <span className="name">{userPhoneIcon}</span><span
                                className="borderballoon">{content}</span>
                            </div>
                        </li>;
                    }
                    messageTagArray.push(messageTag);
                }
            }
            if (isEmpty(antGroup.state.currentUser.userName) == false) {
                welcomeTitle = antGroup.state.currentUser.userName;
            }
            var emotionInput;
            if (antGroup.state.currentUser.colUtype != "SGZH") {
                emotionInput = <Row className="group_send">
                    <Col className="group_send_talk">
                        <EmotionInputComponents onKeyDown={this.checkKeyType}></EmotionInputComponents>
                    </Col>
                    <Col className="group_send_btn">
                        <Button onClick={antGroup.sendMessage}>发送</Button>
                    </Col>
                </Row>;
            }
            tabComponent = <Tabs
                hideAdd
                ref="personCenterTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab={welcomeTitle} key="loginWelcome" className="topics_rela">
                    <div id="personTalk">
                        <div className="group_talk" id="groupTalk" onMouseOver={this.handleScrollType.bind(this,Event)} onScroll={this.handleScroll}>
                            <ul>
                                {messageTagArray}
                            </ul>
                        </div>
                        {emotionInput}
                    </div>
                </TabPane>
            </Tabs>;
        } else if (antGroup.state.optType == "sendGroupMessage") {
            /*returnToolBar = <div className="ant-tabs-right">
                <Button onClick={antGroup.setChatGroup} className="antnest_talk">设置</Button>
                <Button onClick={antGroup.getUserChatGroup}>返回</Button>
            </div>;*/
            welcomeTitle = antGroup.state.currentGroupObj.name;
            var messageTagArray = [];
            var messageList = antGroup.state.messageList;
            if (isEmpty(messageList) == false && messageList.length > 0) {
                messageList.forEach(function (e) {
                    var content = e.content;
                    var fromUser = e.fromUser.userName;
                    var userPhoneIcon;
                    if (isEmpty(e.fromUser.avatar)) {
                        userPhoneIcon = <img src={require('../images/maaee_face.png')}></img>;
                    } else {
                        userPhoneIcon = <img src={e.fromUser.avatar}></img>;
                    }
                    var messageType = e.messageType;
                    var messageTag;
                    if (isEmpty(messageType) == false && messageType == "getMessage") {
                        if (isEmpty(e.messageReturnJson) == false && isEmpty(e.messageReturnJson.messageType) == false) {
                            if (e.messageReturnJson.messageType == "text") {
                                if (e.fromUser.colUid == sessionStorage.getItem("ident")) {
                                    messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont"><span className="name">{userPhoneIcon}</span><span
                                            className="borderballoon">{e.content}</span></div>
                                    </li>;
                                } else {
                                    messageTag = <li style={{'textAlign': 'left'}}>
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont"><span className="name">{userPhoneIcon}</span><span
                                            className="borderballoon_le">{e.content}</span></div>
                                    </li>;
                                }
                            } else if (e.messageReturnJson.messageType == "imgTag") {
                                if (e.fromUser.colUid == sessionStorage.getItem("ident")) {
                                    messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont"><span className="name">{userPhoneIcon}</span><span
                                            className="borderballoon">{e.imgTagArray}</span></div>
                                    </li>;
                                } else {
                                    messageTag = <li style={{'textAlign': 'left'}}>
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont"><span className="name">{userPhoneIcon}</span><span
                                            className="borderballoon_le">{e.imgTagArray}</span></div>
                                    </li>;
                                }
                            }

                        }
                    } else {
                        messageTag = <li className="right" style={{'textAlign': 'right'}}>
                            <div className="u-name"><span>{fromUser}</span></div>
                            <div className="talk-cont"><span className="name">{userPhoneIcon}</span><span
                                className="borderballoon">{content}</span></div>
                        </li>;
                    }
                    messageTagArray.push(messageTag);
                })
            }
            tabComponent = <Tabs
                hideAdd
                ref="personGroupTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab={welcomeTitle} key="loginWelcome" className="topics_rela">
                    <div>
                        <div className="group_talk" id="groupTalk" onMouseOver={this.handleScrollType.bind(this,Event)}  onScroll={this.handleScroll}>
                            <ul>
                                {messageTagArray}
                            </ul>
                        </div>
                        <Row className="group_send">
                            <Col className="group_send_talk">
                                <EmotionInputComponents onKeyDown={this.checkKeyType}></EmotionInputComponents>
                            </Col>
                            <Col className="group_send_btn">
                                <Button value="groupSend" onClick={antGroup.sendMessage}>发送</Button>
                            </Col>
                        </Row>
                    </div>
                </TabPane>
            </Tabs>;
        }

        return (
            <div>
                <div className="group_cont">
                    {userPhoneCard}
                    {tabComponent}
                </div>
            </div>
        );
    },
});

export default AntGroupTabComponents;
