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
        ms = new MsgConnection();
        var loginUserId = sessionStorage.getItem("ident");
        var machineId = sessionStorage.getItem("machineId");
        var password = sessionStorage.getItem("loginPassword");
        var pro = {
            "command": "messagerConnect",
            "data": {"machineType": "web", "userId": Number.parseInt(loginUserId), "machine": machineId,"password":password,"version":0.1}
        };
        ms.connect(pro);
        console.log("user:"+antGroup.props.userInfo);
        var propsUserInfo = antGroup.props.userInfo;
        if(isEmpty(propsUserInfo)==false){
            antGroup.getUser2UserMessages(antGroup.props.userInfo);
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
            returnToolBar = <div className="ant-tabs-right">
                <Button onClick={antGroup.setChatGroup} className="antnest_talk">设置</Button>
                <Button onClick={antGroup.getUserChatGroup}>返回</Button>
            </div>;
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
<<<<<<< HEAD
                }
            }
        }
        return isExist;
    },

    /**
     * 群组成员列表选中事件
     */
    onGroupUserTableSelectChange(selectedRowKeys){
        var selectedRowKeysStr =selectedRowKeys.join(",");
        this.setState({ selectedRowKeys,selectedRowKeysStr });
    },

    /**
     * 移除选中的群组成员
     */
    deleteAllSelectedMembers(){
        confirm({
            title: '确定要移除选中的群成员?',
            onOk() {
                var currentGroupObj = antGroup.state.currentGroupObj;
                var memberIds = antGroup.state.selectedRowKeysStr;
                var optType="removeMember";
                antGroup.deleteChatGroupMember(currentGroupObj.chatGroupId,memberIds,optType);
            },
            onCancel() {
            },
        });
    },

    /**
     * 移除选中的群组成员
     */
    deleteSelectedMember(){
        var currentGroupObj = antGroup.state.currentGroupObj;
        var memberIds = antGroup.state.delMemberIds;
        var optType="removeMember";
        antGroup.deleteChatGroupMember(currentGroupObj.chatGroupId,memberIds,optType);
        antGroup.closeConfirmModal();
    },

    deleteSelectedMemberById(memberIds){
        var currentGroupObj = antGroup.state.currentGroupObj;
        var optType="removeMember";
        antGroup.deleteChatGroupMember(currentGroupObj.chatGroupId,memberIds,optType);
    },

    /**
     * 刷新本地的群组成员列表
     */
    refreshLocalMembers(memberIds){
        var currentMemberArray = antGroup.state.currentMemberArray;
        var memberIdsArray=[];
        memberIdsArray.push(memberIds);
        currentMemberArray = antGroup.array_diff(currentMemberArray,memberIdsArray);
        antGroup.setState({"currentMemberArray":currentMemberArray});
    },

    array_diff(a, b) {
        for(var i=0;i<b.length;i++)
        {
            for(var j=0;j<a.length;j++)
            {
                if(a[j].key==b[i]){
                    a.splice(j,1);
                    j=j-1;
                }
            }
        }
        return a;
    },
    /**
     * 显示群成员添加Modal窗口
     */
    showAddMembersModal(){
        antGroup.getNotMemberUser();
        antGroup.setState({"addGroupMemberModalVisible":true});
    },
    /**
     * 关闭添加群成员Modal窗口
     */
    addGroupMemberModalHandleCancel(){
        antGroup.setState({"addGroupMemberModalVisible":false});
    },
    /**
     * 添加群成员的Tranfer组件内容改变事件
     * @param targetKeys
     */
    addMemberTransferHandleChange(targetKeys){
        antGroup.setState({ "memberTargetKeys":targetKeys });
    },
    /**
     * 添加群成员
     */
    addGroupMember(){
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var memberTargetkeys = antGroup.state.memberTargetKeys;
        var memberIds =memberTargetkeys.join(",");
        var currentGroupObj = antGroup.state.currentGroupObj;
        var param = {
            "method": 'addChatGroupMember',
            "chatGroupId": currentGroupObj.chatGroupId,
            "memberIds":memberIds
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if(ret.msg=="调用成功" && ret.success==true && response==true){
                    message.success("群成员添加成功");
                }else{
                    message.success("群成员添加失败");
                }
                var currentMemberArray = antGroup.state.currentMemberArray;
                currentMemberArray = currentMemberArray.concat(memberTargetkeys);
                antGroup.setState({"addGroupMemberModalVisible":false,"currentMemberArray":currentMemberArray});
                antGroup.getUserChatGroup();
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    getCurrentMemberIds(){
        var memberIds="";
        var currentGroupObj = antGroup.state.currentGroupObj;
        if(isEmpty(currentGroupObj)==false){
            var groupTitle = currentGroupObj.name;
            var groupId = currentGroupObj.chatGroupId;
            var members = currentGroupObj.members;
            var membersArray=[];
            members.forEach(function (e) {
                var memberId = e.colUid;
                memberIds+=memberId+",";
            });
        }
        return memberIds;
    },

    /**
     * 解散聊天群
     */
    dissolutionChatGroup(){
        var currentGroupObj = antGroup.state.currentGroupObj;
        var memberIds = antGroup.getCurrentMemberIds();
        var optType="dissolution";
        antGroup.deleteChatGroupMember(currentGroupObj.chatGroupId,memberIds,optType);
        antGroup.closeDissolutionChatGroupConfirmModal();
    },
    /**
     * 删除并退出群组
     */
    exitChatGroup(){
        var currentGroupObj = antGroup.state.currentGroupObj;
        var memberIds = sessionStorage.getItem("ident");
        var optType="exitChatGroup";
        antGroup.deleteChatGroupMember(currentGroupObj.chatGroupId,memberIds,optType);
        antGroup.closeExitChatGroupConfirmModal();
    },

    deleteChatGroupMember(chatGroupId,memberIds,optType){
        var successTip = "";
        var errorTip="";
        if(optType=="dissolution"){
            successTip = "群组解散成功";
            errorTip="群组解散失败";
        }else if(optType=="removeMember"){
            successTip = "群成员移出成功";
            errorTip="群成员移出失败";
        }else if(optType=="exitChatGroup"){
            successTip = "您已成功退出该群组";
            errorTip="退出群组失败";
        }
        var param = {
            "method": 'deleteChatGroupMember',
            "chatGroupId": chatGroupId,
            "memberIds": memberIds
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if(ret.msg=="调用成功" && ret.success==true && response==true){
                    message.success(successTip);
                }else{
                    message.success(errorTip);
                }
                if(optType=="dissolution" || optType=="exitChatGroup"){
                    antGroup.getUserChatGroup();
                }else if(optType=="removeMember"){
                    antGroup.refreshLocalMembers(memberIds);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 显示修改群名称的窗口
     */
    showUpdateChatGroupNameModal(){
        var currentGroupObj = antGroup.state.currentGroupObj;
        var updateChatGroupTitle = currentGroupObj.name;
        antGroup.setState({"updateChatGroupNameModalVisible":true,"updateChatGroupTitle":updateChatGroupTitle});
    },

    /**
     * 关闭修改群名称的窗口
     */
    updateChatGroupNameModalHandleCancel(){
        antGroup.setState({"updateChatGroupNameModalVisible":false});
    },

    /**
     * 修改群名称
     */
    updateChatGroupName(){
        //更新(判断和当前的groupObj信息是否一致)
        var currentGroupObj = antGroup.state.currentGroupObj;
        if(isEmpty(antGroup.state.updateChatGroupTitle)==false){
            var param = {
                "method": 'updateChatGroupName',
                "chatGroupId": currentGroupObj.chatGroupId,
                "name": antGroup.state.updateChatGroupTitle,
                "userId": sessionStorage.getItem("ident"),
            };
            doWebService(JSON.stringify(param), {
                onResponse: function (ret) {
                    var response = ret.response;
                    if(ret.msg=="调用成功" && ret.success==true && response==true){
                        message.success("聊天群组修改成功");
                    }else{
                        message.success("聊天群组修改失败");
                    }
                    antGroup.getUserChatGroup();
                    antGroup.setState({"updateChatGroupNameModalVisible":false});
                },
                onError: function (error) {
                    message.error(error);
                }
            });
        }
    },
    /**
     * 修改群组名称时，名称内容改变的响应函数
     * @param e
     */
    updateChatGroupTitleOnChange(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var updateChatGroupTitle = target.value;
        antGroup.setState({"updateChatGroupTitle":updateChatGroupTitle});
    },

    /**
     * 学生的提问
     */
    callBackTurnToAsk(user){
        antGroup.setState({"optType":"turnToAsk","currentUser":user,"activeKey":"我发起过的提问"});
    },

    /**
     * 学生的学习轨迹
     */
    callBackStudyTrack(user){
        antGroup.setState({"optType":"turnStudyTrack","currentUser":user,"activeKey":"studyTrack"});
    },
    /**
     * 获取关注列表
     * @param userId
     */
    getMyFollows(user){

        var param = {
            "method": 'getMyFollows',
            "userId": user.colUid,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg=="调用成功" && ret.success==true){
                    var response = ret.response;
                    var followsUserArray=[];
                    response.forEach(function (e) {
                        var followUser = e.user;
                        var course = e.course;
                        var userName = followUser.userName;
                        var courseName = course.colCourse;
                        var userHeaderIcon = <img src={followUser.avatar}></img>;
                        var userJson = {key:followUser.colUid,"userName":userName,"courseName":courseName,userHeaderIcon:userHeaderIcon,"userObj":followUser};
                        // followsUserArray.push(userJson);
                        var followsCard = <Card key={followUser.colUid} id={followUser} className="focus" onClick={antGroup.turnToPersonCenter.bind(antGroup,followUser)}>
                            <span className="person_user_bg upexam_float">
                                <a target="_blank"><img
                                    alt={userName + '头像'} width="100%" src={e.user.avatar}
                                    className="person_user"/></a>
                            </span>
                            <div className="custom-card focus_2">
                                <div className="focus_1">
                                    <span className="antnest_name focus_3">{e.user.userName}</span>
                                </div>
                                <div className="focus_3">学校：{e.user.schoolName}</div>
                                <div className="focus_3">科目：{courseName}</div>
                            </div>
                        </Card>;
                        followsUserArray.push(followsCard);
                    });
                    antGroup.setState({"optType":"getMyFollows","activeKey":"userFollows","currentUser":user,"followsUserArray":followsUserArray});
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 关注用户的个人中心
     */
    followUserPersonCenter(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var userId = target.value;
        antGroup.getPersonalCenterData(userId);
    },
    /**
     * 返回个人中心页面
     *
     */
    returnPersonCenter(){
        var userInfo = antGroup.state.currentUser;
        var userId = userInfo.colUid;
        var userType = userInfo.colUtype;
        if(isEmpty(userId)){
            userId = userInfo.user.colUid;
            userType = userInfo.user.colUtype;
        }
        if(userType=="PAREN" || userType=="EADM" || userType=="SGZH"){
            //1.家长直接进入聊天窗口
            //2.蚂蚁君点击进入后，只能接收消息，无法发送消息
            //以上1/2操作完成后，如果要返回，只能返回用户列表
            antGroup.returnAntGroupMainPage();
        }else {
            antGroup.getPersonalCenterData(userId);
        }
    },

    /**
     * 获取老师用户的题目
     */
    callBackGetMySubjects(user){

        antGroup.getUserSubjectsByUid(user.colUid,1);
    },

    getUserSubjectsByUid:function (ident,pageNo) {
        var param = {
            "method":'getUserSubjectsByUid',
            "userId":ident,
            "pageNo":pageNo
        };

        doWebService(JSON.stringify(param), {
            onResponse : function(ret) {
                subjectList.splice(0);
                data.splice(0);
                var response = ret.response;
                if(response==null || response.length==0){
                    antGroup.setState({totalCount:0});
                }else {
                    response.forEach(function (e) {
                        var key = e.id;
                        var name=e.user.userName;
                        var popOverContent = '<div><span class="answer_til answer_til_1">题目：</span>'+e.content+'<hr/><span class="answer_til answer_til_2">答案：</span>'+e.answer+'</div>';
                        var content=<Popover placement="rightTop" content={<article id='contentHtml' className='content Popover_width' dangerouslySetInnerHTML={{__html: popOverContent}}></article>}><article id='contentHtml' className='content' dangerouslySetInnerHTML={{__html: e.content}}></article></Popover>;
                        var subjectType=e.typeName;
                        var subjectScore=e.score;
                        if(parseInt(e.score)<0)
                        {
                            subjectScore='--';
                        }
                        var answer = e.answer;
                        var subjectOpt=<div><Button style={{ }} type=""  value={e.id} onClick={antGroup.showModal}  icon="export" title="使用" className="score3_i"></Button></div>;
                        data.push({
                            key: key,
                            name: name,
                            content: content,
                            subjectType:subjectType,
                            subjectScore:subjectScore,
                            subjectOpt:subjectOpt,
                            answer:answer
                        });
                        var pager = ret.pager;
                        antGroup.setState({
                            totalSubjectCount: parseInt(pager.rsCount),
                            "currentUser": e.user,
                            "optType": "getUserSubjects",
                            "activeKey": 'userSubjects'
                        });
                    });
                }
            },
            onError : function(error) {
                message.error(error);
            }

        });
    },

    //弹出题目使用至备课计划的窗口
    showModal:function (e) {
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var currentKnowledge = target.value;
        antGroup.refs.useKnowledgeComponents.showModal(currentKnowledge,"TeacherAllSubjects",antGroup.state.knowledgeName);
    },

    callBackGetMyCourseWares(user){
        antGroup.getTeachPlans(user.colUid,1);
    },

    getTeachPlans(ident,pageNo){
        antGroup.setState({
            ident:ident,
        })
        var param = {
            "method":'getMaterialsByUid',
            "userId":ident,
            "mtype":"-1",
            "pageNo":pageNo,
        };
        doWebService(JSON.stringify(param), {
            onResponse : function(ret) {
                courseWareList=new Array();
                courseWareList.splice(0);
                var response = ret.response;
                let user;
                response.forEach(function (e) {
                    var id = e.id;
                    var fileName = e.name;
                    //用户编号，用来判断当前的课件是否是自己上传的，如果是，则支持删除功能
                    var userId = e.userId;
                    user = e.user;
                    var userName = e.user.userName;
                    var path = e.path;
                    var pdfPath = e.pdfPath;
                    var fileType=fileName.substring(fileName.lastIndexOf(".")+1);
                    var pointId = e.pointId;
                    var pointContent = '';

                    if(!pointId){
                        pointContent = '其它';
                    }else{
                        pointContent = e.point.content;
                    }

                    var createTime = antGroup.getLocalTime(e.createTime);
                    var fileTypeLogo;
                    var type = e.type;
                    var htmlPath="";
                    var collectCount = e.collectCount; //收藏次数即现今的点赞次数
                    if(fileType=="ppt"){
                        fileTypeLogo = "icon_geshi icon_ppt";
                        htmlPath = e.htmlPath;
                    }else if(fileType=="mp4"){
                        fileTypeLogo = "icon_geshi icon_mp4";
                    }else if(fileType=="flv"){
                        fileTypeLogo = "icon_geshi icon_flv";
                    }else if(fileType=="pdf"){
                        fileTypeLogo = "icon_geshi icon_pdf";
                    }else if(fileType=="pptx"){
                        fileTypeLogo = "icon_geshi icon_pptx";
                        htmlPath = e.htmlPath;
                    }else if(fileType=="mp3"){
                        fileTypeLogo = "icon_geshi icon_mp3";
                    }
                    activeKey.push(fileName+"#"+createTime+"#"+id);
                    courseWareList.push([id,fileName,userName,path,pdfPath,fileType,pointContent,createTime,fileTypeLogo,htmlPath,type,collectCount,userId]);
                });
                antGroup.buildKonwledgePanels(courseWareList);
                antGroup.setState({
                    courseListState: courseWareList,
                    "currentUser": user,
                    "optType": "getUserCourseWares",
                    "activeKey": 'userCourseWares',
                    totalCourseWareCount: parseInt(ret.pager.rsCount)
                });
            },
            onError : function(error) {
                message.error(error);
            }

        });
    },

    //显示使用至备课计划的弹窗
    showUseKnowledgeModal:function (e) {
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var currentSchedule = target.value;
        antGroup.refs.useKnowledgeComponents.showModal(currentSchedule,"TeacherAllCourseWare",antGroup.state.knowledgeName);
    },

    buildKonwledgePanels:function (courseWareList) {
        if(courseWareList.length==0){
            coursePanelChildren = <img  className="noDataTipImg" src={require('../images/noDataTipImg.png')} />;
        }else{
            coursePanelChildren = courseWareList.map((e, i)=> {
                var eysOnButton ;
                var delButton;
                if(e[9]!=null && e[9]!=""){
                    eysOnButton = <a href={e[9]} target="_blank" title="查看"  style={{ float:'right'}} ><Button icon="eye-o"/></a>
                }
                return <Panel header={<span><span type="" className={e[8]}></span><span className="name_file">{e[1]}</span> </span>}  key={e[1]+"#"+e[7]+"#"+e[0]}>
                    <pre>
					<div className="bnt2_tex">
                         <span className="col1">文件类型：{e[5]}</span>
                         <span className="col1">课件名称：{e[1]}</span>
                         <span className="col1">所在知识点：{e[6]}</span>
                         <span className="col1">创建人：{e[2]}</span>
                         <span className="col1">上传时间：{e[7]}</span>
                         <span className="col1">点赞次数：{e[11]}</span>
                      </div>

                            <div className="bnt2_right">
                                <a href={e[3]} target="_blank" title="下载" download={e[3]} className="te_download_a"><Button icon="download"/></a>
                                <Button style={{ float:'right'}} type=""  icon="export" title="使用"  value={e[0]} onClick={antGroup.showUseKnowledgeModal}></Button>
                                {eysOnButton}
                            </div>

                    </pre>
                </Panel>
            });
        }
    },

    getLocalTime:function (nS) {
        var newDate = new Date(parseInt(nS)).toLocaleString().replace(/:\d{1,2}$/,' ');
        return newDate;
    },

    callBackGetLiveInfo(obj){


        var user;
        var isVisible;
        if(isEmpty(obj.user)==false){
            user = obj.user;
            isVisible = obj.visiable;
        }else{
            user = obj;
        }
        antGroup.getLiveInfoByUid(user.colUid,1);
        antGroup.setState({"currentUser":obj.user,returnBtnIsShow:isVisible});
    },
    gitUserLiveInfo(obj){

      this.getLiveInfoByUid(obj.user.colUid,obj.pageNo);
    },


    view: function (objref) {
        debugger
        if (!objref.liveVideos[0]) {
            message.info("无效的视频！");
            return;
        }

        let obj = {
            title: objref.title,
            url: "",
            param: objref.liveVideos,
            htmlMode: true,
            width: '400px',

        }

        antGroup.props.onPreview(obj)

    },

    /**
     * 删除指定的直播课（用户可以删除自己的直播课）
     * @param id
     */
    deleteLiveVideos(){
        var param = {
            "method": 'delLiveInfo',
            "userId": sessionStorage.getItem("ident"),
            "liveIds":antGroup.state.delLiveVideoIds
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg=="调用成功" && ret.success==true){
                    message.success("直播课删除成功");
                }else{
                    message.error("直播课删除失败");
                }
                antGroup.closeDeleteLiveVideosConfirmModal();
                antGroup.getLiveInfoByUid(sessionStorage.getItem("ident"),1);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    videoPwdModalHandleOk: function (pwd, obj) {

        if (pwd == $('#tmppwd').val()) {
            this.view(obj);
        } else {
            message.warn('密码错误!')
        }

    },

    confirmVideoPwd: function (obj) {
        debugger;
        if (parseInt(sessionStorage.getItem("ident")) == antGroup.state.currentUser.colUid) {
            return antGroup.view(obj);
        }
        var password = obj.password;

        if (password) {
            let _this = this;
            Modal.confirm({
                title: '请输入密码',
                content: <Input id="tmppwd"  />,
                okText: '确定',
                cancelText: '取消',
                onOk: antGroup.videoPwdModalHandleOk.bind(_this, password, obj),
            });
        } else {
            antGroup.view(obj);
        }


    },

    /**
     * 根据用户的id，获取当前用户的直播课
     * @param userId
     * @param pageNo
     */
    getLiveInfoByUid(userId,pageNo){
        let _this =this;
        var param = {
            "method": 'getLiveInfoByUid',
            "userId": userId,
            "pageNo": pageNo,
        };
        var userLiveData=[];
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg=="调用成功" && ret.success==true){
                    let user;
                    var response = ret.response;

                    response.forEach(function (e) {

                        var liveCover = e.liveCover;
                        var cover = liveCover.cover;
                        var liveVideos = e.liveVideos;
                        var schoolName = e.schoolName;
                        var startTime = antGroup.getLocalTime(e.startTime);
                        var title = e.title;
                        user = e.user;
                        var userName = user.userName;
                        var courseName = e.courseName;
                        var id = e.id;
                        var keyIcon='';
                        if(e.password){
                            keyIcon = <span className="right_ri focus_btn key_span"><i className="iconfont key">&#xe621;</i></span>;
                        }
                        var delButton;
                        if(user.colUid == sessionStorage.getItem("ident")){
                             //如果是当前用户，可以删除自己的直播课
                            delButton = <Button icon="delete" className="right_ri star_del" onClick={antGroup.showDeleteLiveVideosConfirmModal.bind(antGroup,id)}></Button>
                        }
                        var liveCard = <Card className="live" >
							<p className="h3">{title}</p>
                            <div className="live_img"  id={id} onClick={antGroup.confirmVideoPwd.bind(antGroup, e) }  >
                                <img className="attention_img"    width="100%" src={cover} />
								<div className="live_green"><span>{schoolName}</span></div>
                            </div>
                            <div className="custom-card"  >
                                <ul className="live_cont">
                                    <li className="li_live_span_3">
                                        <span className="attention_img2"><img src={user.avatar}></img></span>
                                        <span className="live_span_1 live_span_3">{userName}</span>
                                        <span className="right_ri live_span_2">{startTime}</span>
                                    </li>
                                    <li>
                                        <span className="live_color live_orange">{courseName}</span>
                                        {keyIcon}
                                        {delButton}
                                    </li>
                                </ul>
                            </div>
                        </Card>;
                        userLiveData.push(liveCard);
                    });

                    antGroup.setState({
                        "totalLiveCount": parseInt(ret.pager.rsCount),
                        "currentUser": user, "userLiveData": userLiveData,
                        "optType": "getLiveInfoByUid",
                        "activeKey": "userLiveInfos"
                    });
                }


            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 进入平台规则说明页面
     */
    callBackTurnToPlatformRulePage(userInfo,urlType){
        if(isEmpty(urlType)==false && urlType=="level"){
            antGroup.setState({"optType":"getScoreOrLevelPage","currentUser":userInfo,"activeKey":"userScores","urlType":urlType});
        }else{
            antGroup.setState({"optType":"getPlatformRulePage","currentUser":userInfo,"activeKey":"platformRulePage"});
        }
    },
    /**
     * 平台规则页面tab切换响应函数
     * @param key
     */
    platformRulePageChange(key){
        antGroup.setState({"optType":"getPlatformRulePage","activeKey":key});
    },
    /**
     * 跳转到积分详情或等级说明的页面
     * @param e
     */
    turnToScoreDetailPage(){
        antGroup.setState({"optType":"getScoreOrLevelPage","activeKey":"userScores","urlType":"score"});
    },
    /**
     * 跳转到直播详情页面
     */
    turnToLiveInfoShowPage(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var liveInfoId = target.id;
        antGroup.setState({"optType":"turnToLiveInfoShowPage","activeKey":"turnToLiveInfoShowPage","liveInfoId":liveInfoId});
    },

    /**
     * 获取用户的收藏
     * @param user
     */
    callBackGetUserFavorite(user){
        antGroup.setState({"optType":"userFavorite","currentUser":user,"studentId":user.colUid,"activeKey":"1"});
    },

    /**
     * 直播页面的分页响应函数
     */
    onLiveInfoPageChange(page){
        var userId = antGroup.state.currentUser.colUid;
        antGroup.getLiveInfoByUid(userId,page);
        antGroup.setState({
            currentLivePage: page,
        });
    },
    /**
     * 资源页面的分页响应函数
     */
    onCourseWareChange(page){
        var userId = antGroup.state.currentUser.colUid;
        antGroup.getTeachPlans(userId,page);
        antGroup.setState({
            currentCourseWarePage: page,
        });
    },

    onSubjectPageChange(page){
        var userId = antGroup.state.currentUser.colUid;
        antGroup.getUserSubjectsByUid(userId,page);
        antGroup.setState({
            currentSubjectPage: page,
        });
    },

    onChatGroupPageChange(page){
        antGroup.getUserChatGroupById(page);
        antGroup.setState({
            currentChatGroupPage: page,
        });
    },

    showConfirmModal(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var memberIds = target.value;
        antGroup.setState({"delMemberIds":memberIds});
        antGroup.refs.confirmModal.changeConfirmModalVisible(true);
    },

    /**
     * 关闭移出群聊按钮对应的confirm窗口
     */
    closeConfirmModal(){
        antGroup.refs.confirmModal.changeConfirmModalVisible(false);
    },

    showDissolutionChatGroupConfirmModal(){
        antGroup.refs.dissolutionChatGroupConfirmModal.changeConfirmModalVisible(true);
    },

    /**
     * 关闭解散群聊按钮对应的confirm窗口
     */
    closeDissolutionChatGroupConfirmModal(){
        antGroup.refs.dissolutionChatGroupConfirmModal.changeConfirmModalVisible(false);
    },

    showExitChatGroupConfirmModal(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var memberIds = target.value;
        antGroup.setState({"delMemberIds":memberIds});
        antGroup.refs.exitChatGroupConfirmModal.changeConfirmModalVisible(true);
    },

    closeExitChatGroupConfirmModal(){
        antGroup.refs.exitChatGroupConfirmModal.changeConfirmModalVisible(false);
    },

    showDeleteLiveVideosConfirmModal(id){
        antGroup.setState({"delLiveVideoIds":id});
        antGroup.refs.deleteLiveVideosConfirmModal.changeConfirmModalVisible(true);
    },

    closeDeleteLiveVideosConfirmModal(){
        antGroup.refs.deleteLiveVideosConfirmModal.changeConfirmModalVisible(false);
    },

    render() {

        var breadMenuTip="蚁群";
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var welcomeTitle = "欢迎"+loginUser.userName+"登录";
        var toolbarExtra = <div className="ant-tabs-right"><Button onClick={antGroup.showCreateChatGroup}>创建群聊</Button></div>;

        var returnToolBar = <div className="ant-tabs-right"><Button onClick={antGroup.returnAntGroupMainPage}>返回</Button></div>;
        var returnPersonCenterToolBar = <div className="ant-tabs-right"><Button onClick={antGroup.returnPersonCenter}>返回</Button></div>;
        var returnChatGroupMessagePageToolBar = <div className="ant-tabs-right"><Button onClick={antGroup.returnToChatGroupMessagePage}>返回</Button></div>;
        var tabComponent;
        var userPhoneCard;
        var breadCrumb;
        var isVisible=false;
        if(antGroup.state.returnBtnIsShow==false){
            isVisible=antGroup.state.returnBtnIsShow;
        }else{
            isVisible=antGroup.state.breadcrumbVisible;
        }
        if(isVisible){
            breadCrumb = <Breadcrumb separator=">">
                <Breadcrumb.Item><Icon type="home" /></Breadcrumb.Item>
                <Breadcrumb.Item href="#/MainLayout">个人中心</Breadcrumb.Item>
                <Breadcrumb.Item href="#/MainLayout">{breadMenuTip}</Breadcrumb.Item>
            </Breadcrumb>;
        }else{
            breadCrumb = <Breadcrumb separator=">">
                <Breadcrumb.Item><Icon type="home" /></Breadcrumb.Item>
                <Breadcrumb.Item href="#/MainLayout">个人中心</Breadcrumb.Item>
                <Breadcrumb.Item href="#/MainLayout">我的直播课</Breadcrumb.Item>
            </Breadcrumb>;
        }
        if(antGroup.state.optType=="getUserList"){
                tabComponent= <Tabs
                    hideAdd
                    ref = "mainTab"
                    activeKey={this.state.activeKey}
                    defaultActiveKey={this.state.defaultActiveKey}
                    tabBarExtraContent={toolbarExtra}
                    transitionName=""  //禁用Tabs的动画效果
                >
                    <TabPane tab={welcomeTitle} key="loginWelcome" className="topics_rela">
                            <div className="maaee_group" onClick={antGroup.getUserChatGroup}>
                                <img src={require('../images/groupTitle.png')} className="antnest_38_img" />
                                <span className=""　icon="usergroup-add">我的群组</span>
                            </div>
                            <Table className="maaeegroup" onRowClick={antGroup.getPersonCenterInfo} showHeader={false} scroll={{ x: true, y: 480}} columns={columns} dataSource={antGroup.state.userContactsData} pagination={false}/>
                    </TabPane>
                </Tabs>;
        }else if(antGroup.state.optType=="personCenter"){
            welcomeTitle=antGroup.state.currentPerson.user.userName+"的个人中心";
            tabComponent = <Tabs
                hideAdd
                ref = "personCenterTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnToolBar}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab={welcomeTitle} key="loginWelcome" className="topics_rela">
                    <div className="person_padding" >
                        <PersonCenterComponents ref="personCenter"
                                                userInfo={antGroup.state.currentPerson}
                                                userContactsData={antGroup.state.userContactsData}
                                                callBackTurnToMessagePage={antGroup.getUser2UserMessages}
                                                callBackTurnToAsk={antGroup.callBackTurnToAsk}
                                                callBackStudyTrack={antGroup.callBackStudyTrack}
                                                callBackGetMyFollows={antGroup.getMyFollows}
                                                callBackGetUserFavorite={antGroup.callBackGetUserFavorite}
                                                callBackGetMySubjects={antGroup.callBackGetMySubjects}
                                                callBackGetMyCourseWares={antGroup.callBackGetMyCourseWares}
                                                callBackGetLiveInfo={antGroup.callBackGetLiveInfo}
                                                callBackTurnToPlatformRulePage={antGroup.callBackTurnToPlatformRulePage}
                        ></PersonCenterComponents>
                    </div>
                </TabPane>
            </Tabs>;
        }else if(antGroup.state.optType=="sendMessage"){
            var messageTagArray=[];
            messageTagArray.splice(0);
            var messageList = antGroup.state.messageList;
            if(isEmpty(messageList)==false && messageList.length>0){
                for(var i=messageList.length-1;i>=0;i--){
                    var e = messageList[i];
                    var content = e.content;
                    var fromUser = e.fromUser.userName;
                    var userPhoneIcon;
                    if(isEmpty(e.fromUser.avatar)){
                        userPhoneIcon=<img src={require('../images/maaee_face.png')}></img>;
                    }else{
                        userPhoneIcon=<img src={e.fromUser.avatar}></img>;
                    }
                    var messageType = e.messageType;
                    var messageTag;
                    if(isEmpty(messageType)==false && messageType=="getMessage"){
                        if(isEmpty(e.messageReturnJson)==false && isEmpty(e.messageReturnJson.messageType)==false){
                            if(e.messageReturnJson.messageType=="text"){
                                if(e.fromUser.colUid==sessionStorage.getItem("ident")){
                                    messageTag =  <li  className="right" style={{'textAlign':'right'}}>
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont"><span className="name">{userPhoneIcon}</span><span className="borderballoon">{e.content}</span></div>
                                    </li>;
                                }else{
                                    messageTag =  <li style={{'textAlign':'left'}}>
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont"><span className="name">{userPhoneIcon}</span><span className="borderballoon_le">{e.content}</span></div>
                                    </li>;
                                }
                            }else if(e.messageReturnJson.messageType=="imgTag"){
                                if(e.fromUser.colUid==sessionStorage.getItem("ident")){
                                    messageTag =  <li  className="right" style={{'textAlign':'right'}}>
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont"><span className="name">{userPhoneIcon}</span><span  className="borderballoon ">{e.imgTagArray}</span></div>
                                    </li>;
                                }else{
                                    messageTag =  <li style={{'textAlign':'left'}}>
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont"><span className="name">{userPhoneIcon}</span><span  className="borderballoon_le ">{e.imgTagArray}</span></div>
                                    </li>;
                                }
                            }
                        }
                    }else{
                        messageTag =  <li  className="right" style={{'textAlign':'right'}}>
                            <div className="u-name"><span>{fromUser}</span></div>
                            <div className="talk-cont">
                                <span className="name">{userPhoneIcon}</span><span className="borderballoon">{content}</span>
                            </div>
                        </li>;
                    }
                    messageTagArray.push(messageTag);
                }
            }
            if(isEmpty(antGroup.state.currentPerson.userName)==false){
                welcomeTitle=antGroup.state.currentPerson.userName;
            }else {
                welcomeTitle=antGroup.state.currentPerson.user.userName;
            }
            var emotionInput;
            if(antGroup.state.currentPerson.colUtype!="SGZH"){
                emotionInput = <Row className="group_send">
                    <Col className="group_send_talk">
                        <EmotionInputComponents></EmotionInputComponents>
                    </Col>
                    <Col  className="group_send_btn">
                        <Button onClick={antGroup.sendMessage}>发送</Button>
                    </Col>
                </Row>;
            }
            tabComponent = <Tabs
                hideAdd
                ref = "personCenterTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnPersonCenterToolBar}
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
        }if(antGroup.state.optType=="getUserChatGroup"){
            welcomeTitle = "我的群聊";
            tabComponent= <Tabs 
                hideAdd
                ref = "mainTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnToolBar}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab={welcomeTitle} key="loginWelcome" className="topics_rela">
                    <div>
                        <ul className="group_table">
                            <Table className="group_table_u" onRowClick={antGroup.sendGroupMessage} showHeader={false} scroll={{ x: true, y: 500 }} columns={userGroupsColumns} dataSource={antGroup.state.userGroupsData} pagination={{ total:antGroup.state.totalChatGroupCount,pageSize: getPageSize(),onChange:antGroup.onChatGroupPageChange }}/>
                        </ul>
                    </div>
                </TabPane>
            </Tabs>;
        }if(antGroup.state.optType=="showGroupInfo"){
            welcomeTitle = "群设置";
            const { loading, selectedRowKeys } = this.state;
            var topButton;
            var dissolutionChatGroupButton;
            if(antGroup.state.currentGroupObj.owner.colUid==sessionStorage.getItem("ident")){
                topButton = <span className="right_ri">
                    <Button type="primary" onClick={this.showUpdateChatGroupNameModal}
                            loading={loading}
                    >修改群名称</Button>
                    <span className="toobar"><Button type="primary" onClick={this.showAddMembersModal}
                            loading={loading}
                    >添加群成员</Button></span>
                </span>;
                dissolutionChatGroupButton = <Button onClick={antGroup.showDissolutionChatGroupConfirmModal} className="group_red_font"><i className="iconfont">&#xe616;</i>解散该群</Button>;
            }else{
                topButton = <span className="right_ri">
                    <Button type="primary" onClick={this.showAddMembersModal}
                            loading={loading}
                    >添加群成员</Button>
                </span>;
            }
            var memberLiTag=[];
            antGroup.state.currentMemberArray.forEach(function (e) {
                var memberId = e.key;
                var groupUser = e.groupUser;
                var userInfo = e.userInfo;
                var userHeaderIcon;
                if(isEmpty(userInfo)==false){
                    userHeaderIcon = <img src={userInfo.avatar}></img>;
                }else{
                    userHeaderIcon=<span className="attention_img"><img src={require('../images/maaee_face.png')}></img></span>;
                }
                var liTag = <div className="group_fr">
                        <span className="attention_img">{userHeaderIcon}</span><span>{groupUser}</span>
                        <Button　value={memberId} onClick={antGroup.showConfirmModal} className="group_del"><Icon type="close-circle-o" /></Button>
                    </div>;
                memberLiTag.push(liTag);
            });

            tabComponent = <Tabs
                hideAdd
                ref = "mainTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnChatGroupMessagePageToolBar}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab={welcomeTitle} key="loginWelcome" className="topics_rela">
                    <div className="del_out">
                        <ul className="integral_top">
                          <span className="integral_face"><img src={antGroup.state.currentGroupObj.owner.avatar} className="person_user"/></span>
                          <div className="class_right color_gary_f">{antGroup.state.currentGroupObj.name}</div>
						  <div className="integral_line"></div>
                        </ul>
                        <ul className="group_fr_ul">
                            <li className="color_gary_f"><span>群聊成员：{antGroup.state.currentMemberArray.length}人</span>{topButton}</li>
                            <li className="user_hei">
                                {memberLiTag}
                                {/*<Table  style={{width:'300px'}} rowSelection={rowSelection} columns={groupUserTableColumns} dataSource={antGroup.state.currentMemberArray} scroll={{ x: true, y: 400 }} ></Table>*/}
                            </li>
							<li className="color_gary_f">群聊名称：{antGroup.state.currentGroupObj.name}</li>
							<li className="btm"><Button onClick={antGroup.showExitChatGroupConfirmModal} className="group_red_btn">删除并退出</Button>{dissolutionChatGroupButton}</li>
                        </ul>
                    </div>
                </TabPane>
            </Tabs>;
        }else if(antGroup.state.optType=="sendGroupMessage"){
            returnToolBar = <div className="ant-tabs-right">
                <Button onClick={antGroup.setChatGroup} className="antnest_talk">设置</Button>
                <Button onClick={antGroup.getUserChatGroup}>返回</Button>
            </div>;
            welcomeTitle=antGroup.state.currentGroupObj.name;
            var messageTagArray=[];
            var messageList = antGroup.state.messageList;
            if(isEmpty(messageList)==false && messageList.length>0){
                messageList.forEach(function (e) {
                    var content = e.content;
                    var fromUser = e.fromUser.userName;
                    var userPhoneIcon;
                    if(isEmpty(e.fromUser.avatar)){
                        userPhoneIcon=<img src={require('../images/maaee_face.png')}></img>;
                    }else{
                        userPhoneIcon=<img src={e.fromUser.avatar}></img>;
                    }
                    var messageType = e.messageType;
                    var messageTag;
                    if(isEmpty(messageType)==false && messageType=="getMessage"){
                        if(isEmpty(e.messageReturnJson)==false && isEmpty(e.messageReturnJson.messageType)==false){
                            if(e.messageReturnJson.messageType=="text"){
                                if(e.fromUser.colUid==sessionStorage.getItem("ident")){
                                    messageTag =  <li className="right" style={{'textAlign':'right'}}>
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont"><span  className="name">{userPhoneIcon}</span><span className="borderballoon">{e.content}</span></div>
                                    </li>;
                                }else{
                                    messageTag =  <li style={{'textAlign':'left'}}>
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont"><span  className="name">{userPhoneIcon}</span><span className="borderballoon_le">{e.content}</span></div>
                                    </li>;
                                }
                            }else if(e.messageReturnJson.messageType=="imgTag"){
                                if(e.fromUser.colUid==sessionStorage.getItem("ident")){
                                    messageTag =  <li className="right" style={{'textAlign':'right'}}>
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont"><span  className="name">{userPhoneIcon}</span><span className="borderballoon">{e.imgTagArray}</span></div>
                                    </li>;
                                }else{
                                    messageTag =  <li style={{'textAlign':'left'}}>
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont"><span  className="name">{userPhoneIcon}</span><span className="borderballoon_le">{e.imgTagArray}</span></div>
                                    </li>;
                                }
                            }

                        }
                    }else{
                        messageTag =  <li className="right" style={{'textAlign':'right'}}>
						<div className="u-name"><span>{fromUser}</span></div>
						<div className="talk-cont"><span className="name">{userPhoneIcon}</span><span className="borderballoon">{content}</span></div>
                        </li>;
                    }
=======
>>>>>>> 09e5508e89ff8ad54dc648f477f0f9e81d716959
                    messageTagArray.push(messageTag);
                })
            }
            tabComponent = <Tabs
                hideAdd
                ref="personGroupTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnToolBar}
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
