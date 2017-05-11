import React, {PropTypes} from 'react';
import {Tabs, Breadcrumb, Icon, Card, Button, Row, Col, Table, Transfer} from 'antd';
import {Menu, Dropdown, message, Pagination, Tag, Modal, Popover, Input, Collapse} from 'antd';
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
        /*ms = new MsgConnection();
        var loginUserId = sessionStorage.getItem("ident");
        var machineId = sessionStorage.getItem("machineId");
        var password = sessionStorage.getItem("loginPassword");
        var pro = {
            "command": "messagerConnect",
            "data": {"machineType": "web", "userId": Number.parseInt(loginUserId), "machine": machineId,"password":password,"version":0.1}
        };
        ms.connect(pro);*/
        ms = antGroup.props.messageUtilObj;
        console.log("ms ant:"+ms);
        var messageType = antGroup.props.messageType;
        var propsUserInfo = antGroup.props.userInfo;
        if(isEmpty(messageType)==false){
            if(messageType=="message"){
                antGroup.getUser2UserMessages(propsUserInfo);
            }else{
                antGroup.sendGroupMessage(antGroup.props.groupObj);
            }
        }
        // antGroup.getAntGroup();
    },

    /*componentDidMount(){
        console.log("user did:"+antGroup.props.userInfo);
    },*/

    componentWillReceiveProps(nextProps){
        console.log("rec:"+nextProps.userInfo);
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
        var userId = user.colUid;
        messageList.splice(0);
        ms.msgWsListener = {
            onError: function (errorMsg) {

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

        messageList.splice(0);
        ms.msgWsListener = {
            onError: function (errorMsg) {

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
        antGroup.setState({"messageList": messageList});
    },

    /**
     * 通过id获取文本域对象，并进而获取vaue值
     * @returns {string}
     */
    getEmotionInputById(){
        var emotionInput = "";
        var emotionInputArray = $("textarea[id='emotionInput']");
        if (isEmpty(emotionInputArray) == false) {
            for (var i = 0; i < emotionInputArray.length; i++) {
                var emotionObj = emotionInputArray[i];
                if (isEmpty(emotionObj.value) == false) {
                    emotionInput = emotionObj.value;
                    break;
                }
            }
        }
        return emotionInput;
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
    sendGroupMessage(groupObj){
        antGroup.getChatGroupMessages(groupObj);
        antGroup.turnToChatGroupMessagePage(groupObj);
    },

    /**
     * 获取群聊天信息
     */
    getChatGroupMessages(groupObj){
        var timeNode = (new Date()).valueOf();
        var param = {
            "method": 'getChatGroupMessages',
            "chatGroupId": groupObj.chatGroupId,
            "timeNode": timeNode
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    ret.response.forEach(function (e) {
                        if (e.command == "message") {
                            var messageOfSinge = e;
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
     * 获取群聊天信息
     */
    getUser2UserMessages(userObj){
        antGroup.turnToMessagePage(userObj);
        var timeNode = (new Date()).valueOf();
        var param = {
            "method": 'getUser2UserMessages',
            "user1Id": userObj.colUid,
            "user2Id": sessionStorage.getItem("ident"),
            "timeNode": timeNode
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    ret.response.forEach(function (e) {
                        if (e.command == "message") {
                            var messageOfSinge = e;
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
                        <EmotionInputComponents></EmotionInputComponents>
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
                        <div className="group_talk">
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
                        <div className="group_talk">
                            <ul>
                                {messageTagArray}
                            </ul>
                        </div>
                        <Row className="group_send">
                            <Col className="group_send_talk">
                                <EmotionInputComponents></EmotionInputComponents>
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
