import React, {PropTypes} from 'react';
import {Tabs, Breadcrumb, Icon, Card, Button, Row, Col, Table, Transfer} from 'antd';
import {Menu, Dropdown, message, Pagination, Tag, Modal, Popover, Input, Collapse} from 'antd';
import {doWebService} from '../WebServiceHelper';
import MyFollowPersonCenter from './MyFollowPersonCenter';
import MyFollowEmotionInput from './MyFollowEmotionInput';
import MyMTV from './MyMTV';
import UseKnowledgeComponents from './UseKnowledgeComponents';
import Favorites from './Favorites';
import {getPageSize} from '../utils/Const';
import {isEmpty} from '../utils/Const';
import {phone} from '../utils/phone';
import {getImgName} from '../utils/Const';
import {MsgConnection} from '../utils/msg_websocket_connection';
import flvjsobj from 'flv';

const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const Panel = Collapse.Panel;

var columns = [{
    title: '头像',
    dataIndex: 'userHeadIcon'
}, {
    title: '联系人',
    dataIndex: 'userContacts',
}];

var userGroupsColumns = [{
    title: '群聊头像',
    dataIndex: 'groupPhoto',
}, {
    title: '群聊名称',
    dataIndex: 'groupName',
}, {
    title: '群聊人数',
    dataIndex: 'userCount',
},];

var groupUserTableColumns = [{
    title: '群成员',
    dataIndex: 'groupUser',
}];

var followUserColumns = [
    {
        title: '头像',
        dataIndex: 'userHeaderIcon'
    },
    {
        title: '姓名',
        dataIndex: 'userName'
    },
    {
        title: '科目',
        dataIndex: 'courseName'
    }
];

var subjectTableColumns = [{
    title: '出题人',
    className: 'ant-table-selection-user2 left-12',
    dataIndex: 'name',
}, {
    title: '内容',
    className: 'ant-table-selection-cont',
    dataIndex: 'content',
}, {
    title: '题型',
    className: 'ant-table-selection-topic',
    dataIndex: 'subjectType',
    filters: [{
        text: '单选题',
        value: '单选题',
    }, {
        text: '多选题',
        value: '多选题',
    }, {
        text: '判断题',
        value: '判断题',
    }, {
        text: '简答题',
        value: '简答题',
    }, {
        text: '材料题',
        value: '材料题',
    },],
    onFilter: (value, record) => record.subjectType.indexOf(value) === 0,
}, {
    title: '分值',
    className: 'ant-table-selection-score',
    dataIndex: 'subjectScore',
}, {
    title: '操作',
    className: 'ant-table-selection-score',
    dataIndex: 'subjectOpt',
},
];

var subjectList = [];
var messageList = [];
//消息通信js
var ms;
var imgTagArray = [];
var showImg = "";
var showContent = "";//将要显示的内容
var data = [];
var courseWareList;
var activeKey = [];
var coursePanelChildren;
const MyFollowExtend = React.createClass({

    getInitialState() {
        return {
            ident: sessionStorage.getItem("ident"),
            isreader: true,
            defaultActiveKey: 'loginWelcome',
            activeKey: 'loginWelcome',
            optType: 'getUserList',
            userContactsData: [],
            currentPerson: -1,
            currentUser: this.props.userinfo.colUid,
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

    componentWillReceiveProps: function(nextProps) {

        let user = nextProps.userinfo;
        this.setState({ optType:'personCenter', currentUser : user });

    },
    /**
     * 话题tab切换响应函数
     * @param activeKey
     */
    onChange(activeKey) {
        this.setState({activeKey: activeKey});
    },

    componentWillMount(){
        this.getPersonalCenterData(this.props.userinfo.user.colUid);
    },
    shouldComponentUpdate(){
        if (this.state.isreader) {
            return true;
        } else {
            return false;
        }
    },


    /**
     * 点击联系人列表表格行时，获取当前行对应的记录信息
     * @param record　当前行的用户信息
     * @param index　当前行的索引顺序，从０开始
     */
    getPersonCenterInfo(record, index){
        this.turnToPersonCenter(record.userObj);
    },

    turnToPersonCenter(followUser){
        var userType = followUser.colUtype;
        if (userType == "PAREN" || userType == "EADM" || userType == "SGZH") {
            //家长直接进入聊天窗口
            //蚂蚁君点击进入后，只能接收消息，无法发送消息
            this.setState({optType: "sendMessage", currentPerson: followUser});
            this.getUser2UserMessages(followUser);
        } else {
            this.getPersonalCenterData(followUser.colUid);
        }
    },

    /**
     * 进入他人的个人中心
     * @param param
     */
    getOtherPersonalCenterPage(param){
        let uid = param.colUid || param.userId;
        this.getPersonalCenterData(uid);
    },

    /**
     * 获取个人中心数据
     */
    getPersonalCenterData(userid){
        let _this = this;
        var param = {
            "method": 'getPersonalCenterData',
            "userId": userid || this.state.currentUser,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var userInfo = ret.response;
                _this.setState({
                    optType: "personCenter",
                    currentPerson: userInfo,
                    currentUser: userInfo,
                    activeKey: "loginWelcome"
                });
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 返回系统联系人的主页面
     */
    returnAntGroupMainPage(){
        this.getAntGroup();
        this.setState({optType: "getUserList", activeKey: 'loginWelcome'});
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
        var loginUserId = sessionStorage.getItem("ident");
        var machineId = sessionStorage.getItem("machineId");
        var pro = {
            "command": "messagerConnect",
            "data": {"machineType": "ios", "userId": Number.parseInt(loginUserId), "machine": machineId}
        };
        ms.msgWsListener = {
            onError: function (errorMsg) {

            }, onWarn: function (warnMsg) {

            }, onMessage: function (info) {
                if (this.state.optType == "sendMessage") {
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
                                    /*var imgTagArrayReturn = this.getImgTag(e.content);*/
                                    var imgTagArrayReturn = [];
                                    var messageReturnJson = this.getImgTag(e.content);
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
                            this.setState({"messageList": messageList});
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
                                //var imgTagArrayReturn = this.getImgTag(messageOfSinge.content);
                                var imgTagArrayReturn = [];
                                var messageReturnJson = this.getImgTag(messageOfSinge.content);
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
                                // messageList.push(messageShow);
                                messageList.splice(0, 0, messageShow);
                                if (uuidsArray.length != 0) {
                                    var receivedCommand = {
                                        "command": "messageRecievedResponse",
                                        "data": {"uuids": uuidsArray}
                                    };
                                    ms.send(receivedCommand);
                                }
                            }
                            this.setState({"messageList": messageList});
                        }
                    }
                }
            }
        };
        ms.connect(pro);
        this.setState({optType: "sendMessage", userIdOfCurrentTalk: userId, currentUser: user});
    },

    turnToChatGroupMessagePage(groupObj){

        messageList.splice(0);
        var loginUserId = sessionStorage.getItem("ident");
        var machineId = sessionStorage.getItem("machineId");

        var pro = {
            "command": "messagerConnect",
            "data": {"machineType": "ios", "userId": Number.parseInt(loginUserId), "machine": machineId}
        };
        ms.msgWsListener = {
            onError: function (errorMsg) {

            }, onWarn: function (warnMsg) {

            }, onMessage: function (info) {
                //获取messageList
                var command = info.command;

                if (this.state.optType == "sendGroupMessage") {
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
                                    var messageReturnJson = this.getImgTag(e.content);
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
                            this.setState({"messageList": messageList});
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
                                //var imgTagArrayReturn = this.getImgTag(messageOfSinge.content);
                                var imgTagArrayReturn = [];
                                var messageReturnJson = this.getImgTag(messageOfSinge.content);
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
                            this.setState({"messageList": messageList});
                        }
                    }
                }
            }
        };
        ms.connect(pro);
        this.setState({"optType": "sendGroupMessage", "currentGroupObj": groupObj});
    },

    getImgTag(str){
        var imgTags = [];
        var messageReturnJson = {};
        messageReturnJson = this.changeImgTextToTag(str, imgTags, messageReturnJson);
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
                this.changeImgTextToTag(otherStr, imgTags);
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
        var messageContent = this.getEmotionInputById();
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var uuid = this.createUUID();
        var createTime = (new Date()).valueOf();
        var messageJson = {
            'content': messageContent, "createTime": createTime, 'fromUser': loginUser,
            "toId": this.state.userIdOfCurrentTalk, "command": "message", "hostId": loginUser.colUid,
            "uuid": uuid, "toType": 1
        };
        if (this.state.optType == "sendGroupMessage") {
            messageJson.toId = this.state.currentGroupObj.chatGroupId;
            messageJson.toType = 4;
        }
        var commandJson = {"command": "message", "data": {"message": messageJson}};
        if (isEmpty(sendType) == false && sendType == "groupSend") {
            messageList.push(messageJson);
        } else {
            messageList.splice(0, 0, messageJson);
        }
        ms.send(commandJson);
        this.initMyEmotionInput();
        this.setState({"messageList": messageList});
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


    /**
     * 点击群组列表表格行时，获取当前行对应的记录信息
     * @param record　当前行的群组信息
     * @param index　当前行的索引顺序，从０开始
     */
    sendGroupMessage(record, index){
        this.getChatGroupMessages(record.groupObj);
        this.turnToChatGroupMessagePage(record.groupObj);
    },

    /**
     * 获取群聊天信息
     */
    getChatGroupMessages(groupObj){
        let _this = this;
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
                                var messageReturnJson = this.getImgTag(e.content);
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
                                messageList.splice(0, 0, message);
                            }
                            _this.setState({"messageList": messageList});
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
        let _this = this;
        this.turnToMessagePage(userObj);
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
                                var messageReturnJson = this.getImgTag(messageOfSinge.content);
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
                            _this.setState({"messageList": messageList});
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
        var currentGroupObj = this.state.currentGroupObj;
        this.turnToChatGroupMessagePage(currentGroupObj);
    },

    /**
     * 显示创建群组的窗口
     */
    showCreateChatGroup(){
        this.getUserContactsMockData();
        this.setState({"createChatGroupModalVisible": true, "updateGroupId": ''});
    },
    /**
     * 创建群组时，获取当前用户的联系人列表
     */
    getUserContactsMockData(){
        let _this = this;
        const mockData = [];
        var targetKeys = [];
        var param = {
            "method": 'getUserContacts',
            "ident": sessionStorage.getItem("ident"),
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                response.forEach(function (e) {
                    var userId = e.colUid;
                    var userName = e.userName;
                    var userType = e.colUtype;
                    if (userType != "SGZH" && parseInt(userId) != sessionStorage.getItem("ident")) {
                        const data = {
                            key: userId,
                            title: userName,
                        };
                        mockData.push(data);
                    }
                });
                _this.setState({mockData, targetKeys});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 添加群成员时，获取未在群成员列表中的联系人
     */
    getNotMemberUser(){
        let _this = this;
        const memberData = [];
        memberData.splice(0);
        var memberTargetKeys = [];
        var param = {
            "method": 'getUserContacts',
            "ident": sessionStorage.getItem("ident"),
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                response.forEach(function (e) {
                    var userId = e.colUid;
                    var userName = e.userName;
                    var isExist = this.checkMemberIsExist(userId);
                    var userType = e.colUtype;
                    if (isExist == false && userType != "SGZH" && parseInt(userId) != sessionStorage.getItem("ident")) {
                        const data = {
                            key: userId,
                            title: userName,
                        };
                        memberData.push(data);
                    }
                });
                _this.setState({memberData, memberTargetKeys});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    createChatGroupModalHandleCancel(){
        this.setState({createChatGroupModalVisible: false, updateGroupId: ''});
    },


    transferHandleChange(targetKeys){
        this.setState({targetKeys});
    },

    chatGroupTitleOnChange(e){
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var chatGroupTitle = target.value;
        this.setState({"chatGroupTitle": chatGroupTitle});
    },
    /**
     * 设置群组
     * @param e
     */
    setChatGroup(e){
        var currentGroupObj = this.state.currentGroupObj;
        if (isEmpty(currentGroupObj) == false) {
            var groupTitle = currentGroupObj.name;
            var groupId = currentGroupObj.chatGroupId;
            var members = currentGroupObj.members;
            var membersArray = [];
            members.forEach(function (e) {
                var memberId = e.colUid;
                var memberName = e.userName;
                var userJson = {key: memberId, groupUser: memberName, userInfo: e};
                membersArray.push(userJson);
            });
            this.setState({"optType": 'showGroupInfo', "currentMemberArray": membersArray});
        }
    },
    /**
     * 检查群组成员是否已经存在
     */
    checkMemberIsExist(memberId){
        var isExist = false;
        var currentGroupObj = this.state.currentGroupObj;
        if (isEmpty(currentGroupObj) == false) {
            var members = currentGroupObj.members;
            if (isEmpty(members) == false && members.length != 0) {
                for (var i = 0; i < members.length; i++) {
                    var member = members[i];
                    var memberIdInCurrent = member.colUid;
                    if (memberId == memberIdInCurrent) {
                        isExist = true;
                        break;
                    }
                }
            }
        }
        return isExist;
    },

    /**
     * 群组成员列表选中事件
     */
    onGroupUserTableSelectChange(selectedRowKeys){
        var selectedRowKeysStr = selectedRowKeys.join(",");
        this.setState({selectedRowKeys, selectedRowKeysStr});
    },

    /**
     * 移除选中的群组成员
     */
    deleteAllSelectedMembers(){
        confirm({
            title: '确定要移除选中的群成员?',
            onOk() {
                var currentGroupObj = this.state.currentGroupObj;
                var memberIds = this.state.selectedRowKeysStr;
                var optType = "removeMember";
                this.deleteChatGroupMember(currentGroupObj.chatGroupId, memberIds, optType);
            },
            onCancel() {
            },
        });
    },

    /**
     * 移除选中的群组成员
     */
    deleteSelectedMember(){
        var currentGroupObj = this.state.currentGroupObj;
        var memberIds = this.state.delMemberIds;
        var optType = "removeMember";
        this.deleteChatGroupMember(currentGroupObj.chatGroupId, memberIds, optType);
        this.closeConfirmModal();
    },

    deleteSelectedMemberById(memberIds){
        var currentGroupObj = this.state.currentGroupObj;
        var optType = "removeMember";
        this.deleteChatGroupMember(currentGroupObj.chatGroupId, memberIds, optType);
    },

    /**
     * 刷新本地的群组成员列表
     */
    refreshLocalMembers(memberIds){
        var currentMemberArray = this.state.currentMemberArray;
        //var selectedRowKeys = this.state.selectedRowKeys;
        var memberIdsArray = [];
        memberIdsArray.push(memberIds);
        currentMemberArray = this.array_diff(currentMemberArray, memberIdsArray);
        this.setState({"currentMemberArray": currentMemberArray});
    },

    array_diff(a, b) {
        for (var i = 0; i < b.length; i++) {
            for (var j = 0; j < a.length; j++) {
                if (a[j].key == b[i]) {
                    a.splice(j, 1);
                    j = j - 1;
                }
            }
        }
        return a;
    },
    /**
     * 显示群成员添加Modal窗口
     */
    showAddMembersModal(){
        this.getNotMemberUser();
        this.setState({"addGroupMemberModalVisible": true});
    },
    /**
     * 关闭添加群成员Modal窗口
     */
    addGroupMemberModalHandleCancel(){
        this.setState({"addGroupMemberModalVisible": false});
    },
    /**
     * 添加群成员的Tranfer组件内容改变事件
     * @param targetKeys
     */
    addMemberTransferHandleChange(targetKeys){
        this.setState({"memberTargetKeys": targetKeys});
    },
    /**
     * 添加群成员
     */
    addGroupMember(){
        let _this = this;
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var memberTargetkeys = this.state.memberTargetKeys;
        var memberIds = memberTargetkeys.join(",");
        var currentGroupObj = this.state.currentGroupObj;
        var param = {
            "method": 'addChatGroupMember',
            "chatGroupId": currentGroupObj.chatGroupId,
            "memberIds": memberIds
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (ret.msg == "调用成功" && ret.success == true && response == true) {
                    message.success("群成员添加成功");
                } else {
                    message.success("群成员添加失败");
                }
                var currentMemberArray = this.state.currentMemberArray;
                currentMemberArray = currentMemberArray.concat(memberTargetkeys);
                _this.setState({"addGroupMemberModalVisible": false, "currentMemberArray": currentMemberArray});
                _this.getUserChatGroup();
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    getCurrentMemberIds(){
        var memberIds = "";
        var currentGroupObj = this.state.currentGroupObj;
        if (isEmpty(currentGroupObj) == false) {
            var members = currentGroupObj.members;
            members.forEach(function (e) {
                var memberId = e.colUid;
                memberIds += memberId + ",";
            });
        }
        return memberIds;
    },

    /**
     * 解散聊天群
     */
    dissolutionChatGroup(){
        var currentGroupObj = this.state.currentGroupObj;
        var memberIds = this.getCurrentMemberIds();
        var optType = "dissolution";
        this.deleteChatGroupMember(currentGroupObj.chatGroupId, memberIds, optType);
        this.closeDissolutionChatGroupConfirmModal();
    },


    deleteChatGroupMember(chatGroupId, memberIds, optType){
        let _this = this;
        var successTip = "";
        var errorTip = "";
        if (optType == "dissolution") {
            successTip = "群组解散成功";
            errorTip = "群组解散失败";
        } else if (optType == "removeMember") {
            successTip = "群成员移出成功";
            errorTip = "群成员移出失败";
        } else if (optType == "exitChatGroup") {
            successTip = "您已成功退出该群组";
            errorTip = "退出群组失败";
        }
        var param = {
            "method": 'deleteChatGroupMember',
            "chatGroupId": chatGroupId,
            "memberIds": memberIds
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (ret.success) {
                    message.success(successTip);
                } else {
                    message.success(errorTip);
                }
                if (optType == "dissolution" || optType == "exitChatGroup") {
                    _this.getUserChatGroup();
                } else if (optType == "removeMember") {
                    _this.refreshLocalMembers(memberIds);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },


    /**
     * 修改群组名称时，名称内容改变的响应函数
     * @param e
     */
    updateChatGroupTitleOnChange(e){
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var updateChatGroupTitle = target.value;
        this.setState({"updateChatGroupTitle": updateChatGroupTitle});
    },

    /**
     * 学生的提问
     */
    callBackTurnToAsk(user){
        this.setState({"optType": "turnToAsk", "currentUser": user, "activeKey": "我发起过的提问"});
    },

    /**
     * 学生的学习轨迹
     */
    callBackStudyTrack(user){
        this.setState({"optType": "turnStudyTrack", "currentUser": user, "activeKey": "studyTrack"});
    },

    getMyFollows(user){
        this.props.returnMyFollows(user);
    },

    /**
     * 关注用户的个人中心
     */
    followUserPersonCenter(e){
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var userId = target.value;
        this.getPersonalCenterData(userId);
    },
    /**
     * 返回个人中心页面
     *
     */
    returnPersonCenter(){
        var userInfo = this.state.currentUser;
        var userId = userInfo.colUid;
        var userType = userInfo.colUtype;
        if (!userId) {
            userId = userInfo.user.colUid;
            userType = userInfo.user.colUtype;
        }
        if (userType == "PAREN" || userType == "EADM" || userType == "SGZH") {
            //1.家长直接进入聊天窗口
            //2.蚂蚁君点击进入后，只能接收消息，无法发送消息
            //以上1/2操作完成后，如果要返回，只能返回用户列表
            //this.returnAntGroupMainPage();
            this.props.returnMyFollows();
        } else {
            this.getPersonalCenterData(userId);
        }
    },

    /**
     * 获取老师用户的题目
     */
    callBackGetMySubjects(user){

        this.getUserSubjectsByUid(user.colUid, 1);
    },

    getUserSubjectsByUid: function (ident, pageNo) {
        let _this = this;
        var param = {
            "method": 'getUserSubjectsByUid',
            "userId": ident,
            "pageNo": pageNo
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {

                subjectList.splice(0);
                data.splice(0);
                var response = ret.response;
                if (ret.success && !response.length) {
                    message.info('没有题库内容！');
                    return;
                }
                response.forEach(function (e) {
                    var key = e.id;
                    var name = e.user.userName;
                    var popOverContent = '<div><span class="answer_til answer_til_1">题目：</span>' + e.content + '<hr/><span class="answer_til answer_til_2">答案：</span>' + e.answer + '</div>';
                    var content = <Popover placement="rightTop"
                                           content={<article id='contentHtml' className='content Popover_width'
                                                             dangerouslySetInnerHTML={{__html: popOverContent}}></article>}>
                        <article id='contentHtml' className='content'
                                 dangerouslySetInnerHTML={{__html: e.content}}></article>
                    </Popover>;
                    var subjectType = e.typeName;
                    var subjectScore = e.score;
                    if (parseInt(e.score) < 0) {
                        subjectScore = '--';
                    }
                    var answer = e.answer;
                    var userId = e.user.colUid;
                    var subjectOpt = <div><Button style={{}} type="" value={e.id} onClick={_this.showModal}
                                                  icon="export" title="使用" className="score3_i"></Button></div>;
                    data.push({
                        key: key,
                        name: name,
                        content: content,
                        subjectType: subjectType,
                        subjectScore: subjectScore,
                        subjectOpt: subjectOpt,
                        answer: answer
                    });
                    var pager = ret.pager;
                    _this.setState({
                        totalSubjectCount: parseInt(pager.rsCount),
                        currentUser: e.user,
                        optType: "getUserSubjects",
                        activeKey: 'userSubjects'
                    });
                });

            },
            onError: function (error) {
                message.error(error);
            }

        });
    },

    //弹出题目使用至备课计划的窗口
    showModal: function (e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var currentKnowledge = target.value;
        this.refs.useKnowledgeComponents.showModal(currentKnowledge, "TeacherAllSubjects", this.state.knowledgeName);
    },

    callBackGetMyCourseWares(user){
        this.getTeachPlans(user.colUid, 1);
    },

    getTeachPlans(ident, pageNo){
        let _this = this;

        var param = {
            "method": 'getMaterialsByUid',
            "userId": ident,
            "mtype": "-1",
            "pageNo": pageNo,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                courseWareList = [];

                let user;
                if (!ret.success) {
                    message.info(ret.msg);
                    return;
                }
                if (!ret.response.length) {
                    message.info('没有数据！');
                    return;
                }

                ret.response.forEach(function (e) {
                    var id = e.id;
                    var fileName = e.name;
                    //用户编号，用来判断当前的课件是否是自己上传的，如果是，则支持删除功能
                    var userId = e.userId;
                    user = e.user;
                    var userName = e.user.userName;
                    var path = e.path;
                    var pdfPath = e.pdfPath;
                    var fileType = fileName.substring(fileName.lastIndexOf(".") + 1);
                    var pointId = e.pointId;
                    var pointContent = '';

                    if (!pointId) {
                        pointContent = '其它';
                    } else {
                        pointContent = e.point.content;
                    }

                    var createTime = _this.getLocalTime(e.createTime);
                    var fileTypeLogo;
                    var type = e.type;
                    var htmlPath = "";
                    var collectCount = e.collectCount; //收藏次数即现今的点赞次数
                    if (fileType == "ppt") {
                        fileTypeLogo = "icon_geshi icon_ppt";
                        htmlPath = e.htmlPath;
                    } else if (fileType == "mp4") {
                        fileTypeLogo = "icon_geshi icon_mp4";
                    } else if (fileType == "flv") {
                        fileTypeLogo = "icon_geshi icon_flv";
                    } else if (fileType == "pdf") {
                        fileTypeLogo = "icon_geshi icon_pdf";
                    } else if (fileType == "pptx") {
                        fileTypeLogo = "icon_geshi icon_pptx";
                        htmlPath = e.htmlPath;
                    } else if (fileType == "mp3") {
                        fileTypeLogo = "icon_geshi icon_mp3";
                    }
                    activeKey.push(fileName + "#" + createTime + "#" + id);
                    courseWareList.push([id, fileName, userName, path, pdfPath, fileType, pointContent, createTime, fileTypeLogo, htmlPath, type, collectCount, userId]);
                });

                _this.buildKonwledgePanels(courseWareList);
                _this.setState({
                    courseListState: courseWareList,
                    currentUser: user,
                    ident: ident,
                    optType: "getUserCourseWares",
                    activeKey: 'userCourseWares',
                    totalCourseWareCount: parseInt(ret.pager.rsCount)
                });
            },
            onError: function (error) {
                message.error(error);
            }

        });
    },

    //显示使用至备课计划的弹窗
    showUseKnowledgeModal: function (e) {

        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var currentSchedule = target.value;
        this.refs.useKnowledgeComponents.showModal(currentSchedule, "TeacherAllCourseWare", this.state.knowledgeName);
    },

    buildKonwledgePanels: function (courseWareList) {
        if (courseWareList.length == 0) {
            coursePanelChildren = <img className="noDataTipImg" src={require('./images/noDataTipImg.png')}/>;
        } else {
            coursePanelChildren = courseWareList.map((e, i) => {
                let keyRef = e[1] + "#" + e[7] + "#" + e[0];
                var eysOnButton;
                if (e[9] != null && e[9] != "") {
                    eysOnButton =
                        <a href={e[9]} target="_blank" title="查看" style={{float: 'right'}}><Button icon="eye-o"/></a>
                }
                return <Panel key={ keyRef } header={<span key={ keyRef }><span type="" className={e[8]}></span><span
                    className="name_file">{e[1]}</span> </span>}>
                    <pre>
					<div className="bnt2_tex">
                         <span className="bai"><span className="col1">知识点：{e[6]}</span></span>
                         <span className="col1">创建人：{e[2]}</span>
                         <span className="col1">上传时间：{e[7]}</span>
                         <span className="col1">点赞次数：{e[11]}</span>
                      </div>

                            <div className="bnt2_right">
                                <a href={e[3]} target="_blank" title="下载" download={e[3]}
                                   className="te_download_a"><Button icon="download"/></a>
                                <Button style={{float: 'right'}} type="" icon="export" title="使用" value={e[0]}
                                        onClick={this.showUseKnowledgeModal}></Button>
                                {eysOnButton}
                            </div>

                    </pre>
                </Panel>
            });
        }
    },

    getLocalTime: function (nS) {
        var newDate = new Date(parseInt(nS)).toLocaleString().replace(/:\d{1,2}$/, ' ');
        return newDate;
    },


    gitUserLiveInfo(obj){

        this.getLiveInfoByUid(obj.colUid, 1);
    },

    onPreview (e, videosObj, title) {

        let obj = {mode: 'flv', param: videosObj, title: title}
        LP.Start(obj);
    },

    view(obj){
        LP.Start(obj);
    },


    /**
     * 根据用户的id，获取当前用户的直播课
     */
    getLiveInfoByUid(userId, pageNo){

        let _this = this;
        var param = {
            "method": 'getLiveInfoByUid',
            "userId": userId,
            "pageNo": pageNo,
        };
        var userLiveData = [];
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (!ret.response || !ret.response.length ) {
                    message.info('没有直播内容！');
                    return;
                }

                let user;
                var response = ret.response;
                response.forEach(function (e) {
                    var liveCover = e.liveCover;
                    var cover = liveCover.cover;
                    var liveVideos = e.liveVideos;
                    var schoolName = e.schoolName;
                    var startTime = _this.getLocalTime(e.startTime);
                    var title = e.title;
                    user = e.user;
                    var userName = user.userName;
                    var courseName = e.courseName;
                    var password = e.password;
                    var id = e.id;
                    var keyIcon;
                    if (isEmpty(password) == false) {
                        keyIcon = <Icon type="key"/>;
                    }

                        var liveCard = <Card className="live">
                            <p className="h3">{title}</p>
                            <div className="live_img" id={id} onClick={event => {
                                _this.onPreview(event, liveVideos, title)
                            } }>
                                <img className="attention_img" width="100%" src={cover}/>
                                <div className="live_green"><span>{schoolName}</span></div>
                            </div>
                            <div className="custom-card">
                                <ul className="live_cont">
                                    <li className="li_live_span_3">
                                        <span className="attention_img2"><img src={user.avatar}></img></span>
                                        <span className="live_span_1 live_span_3">{userName}</span>
										<span className="live_color live_orange right_ri live_span_2">{courseName}</span>
                                        
                                    </li>
                                    <li> 
                                        <span className="key_span"><i className="iconfont key">&#xe621;</i></span>
										<span className="time right_ri">{startTime}</span>
                                    </li>
                                </ul>
                            </div>
                        </Card>;
                        userLiveData.push(liveCard);
                    });




                _this.setState({
                    totalLiveCount: parseInt(ret.pager.rsCount),
                    currentUser: user,
                    userLiveData: userLiveData,
                    optType: "getLiveInfoByUid",
                    activeKey: "userLiveInfos",
                    returnBtnIsShow: true,
                    isVisible: true,
                });


            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 进入平台规则说明页面
     */
    callBackTurnToPlatformRulePage(urlType){

        let userInfo = this.props.userinfo;

        let url
        let title;
        if (urlType == "level") {
            url = "http://www.maaee.com/Excoord_PhoneService/user/personalGrade/" + this.state.currentUser.user.colUid;
            title = userInfo.user.userName + "的等级";
            //  this.setState({ "optType": "getScoreOrLevelPage", "currentUser": userInfo, "activeKey": "userScores", "urlType": 'level' });
        } else {
            url = "http://www.maaee.com/Excoord_PhoneService/user/getUserScores/" + this.state.currentUser.user.colUid;
            title = userInfo.user.userName + "的积分";
            // this.setState({"optType": "getPlatformRulePage", "currentUser": userInfo, "activeKey": "platformRulePage", "urlType": 'score'});
        }
        this.view({mode: 'html', url: url, title: title});
    },

    /**
     * 平台规则页面tab切换响应函数
     * @param key
     */
    platformRulePageChange(key){
        this.setState({"optType": "getPlatformRulePage", "activeKey": key});
    },

    /**
     * 跳转到直播详情页面
     */
    turnToLiveInfoShowPage(e){
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var liveInfoId = target.id;
        this.setState({
            "optType": "turnToLiveInfoShowPage",
            "activeKey": "turnToLiveInfoShowPage",
            "liveInfoId": liveInfoId
        });
    },

    /**
     * 获取用户的收藏
     * @param user
     */
    callBackGetUserFavorite(user){
        this.setState({"optType": "userFavorite", "currentUser": user, "studentId": user.colUid, "activeKey": "1"});
    },

    /**
     * 直播页面的分页响应函数
     */
    onLiveInfoPageChange(page){
        var userId = this.state.currentUser.colUid;
        this.getLiveInfoByUid(userId, page);
        this.setState({
            currentLivePage: page,
        });
    },
    /**
     * 资源页面的分页响应函数
     */
    onCourseWareChange(page){
        var userId = this.state.currentUser.colUid;
        this.getTeachPlans(userId, page);
        this.setState({
            currentCourseWarePage: page,
        });
    },

    onSubjectPageChange(page){
        var userId = this.state.currentUser.colUid;
        this.getUserSubjectsByUid(userId, page);
        this.setState({
            currentSubjectPage: page,
        });
    },

    onChatGroupPageChange(page){
        this.getUserChatGroupById(page);
        this.setState({
            currentChatGroupPage: page,
        });
    },

    showConfirmModal(e){
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var memberIds = target.value;
        this.setState({"delMemberIds": memberIds});
        this.refs.confirmModal.changeConfirmModalVisible(true);
    },

    /**
     * 关闭移出群聊按钮对应的confirm窗口
     */
    closeConfirmModal(){
        this.refs.confirmModal.changeConfirmModalVisible(false);
    },

    showDissolutionChatGroupConfirmModal(){
        this.refs.dissolutionChatGroupConfirmModal.changeConfirmModalVisible(true);
    },

    /**
     * 关闭解散群聊按钮对应的confirm窗口
     */
    closeDissolutionChatGroupConfirmModal(){
        this.refs.dissolutionChatGroupConfirmModal.changeConfirmModalVisible(false);
    },

    showExitChatGroupConfirmModal(e){
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var memberIds = target.value;
        this.setState({"delMemberIds": memberIds});
        this.refs.exitChatGroupConfirmModal.changeConfirmModalVisible(true);
    },

    closeExitChatGroupConfirmModal(){
        this.refs.exitChatGroupConfirmModal.changeConfirmModalVisible(false);
    },

    changeMyCenter(){
        this.setState({optType: "personCenter"});
    },

    stuUpgrade(){
        return <ul className="topics_le integral integral_scroll">
            <li className="til">课中</li>
            <li>
                <span><Icon type="minus-circle"/>逃课一次</span>
                <span className="right_ri">-10积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>课堂练习答错一题</span>
                <span className="right_ri">＋1积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>课堂练习答对一题</span>
                <span className="right_ri">＋3积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>被送花一次</span>
                <span className="right_ri">＋5积分</span>
            </li>
            <li>
                <span><Icon type="minus-circle"/>被批评一次</span>
                <span className="right_ri">-3积分</span>
            </li>

            <li className="til">课下</li>
            <li>
                <span><Icon type="plus-circle"/>评论教师话题说说（>10字/条）</span>
                <span className="right_ri">+1积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>发布蚁巢内容被老师点赞一次</span>
                <span className="right_ri">＋1积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>课后作业答错一次</span>
                <span className="right_ri">+1积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>课后作业答对一次</span>
                <span className="right_ri">+3积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>看微课一个（≥70%）</span>
                <span className="right_ri">+2积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>看PPT一个（≥70%）</span>
                <span className="right_ri">+1积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>提问获教师解答（16蚁币/个）</span>
                <span className="right_ri">+50积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>表扬一次（≤2/科/天）</span>
                <span className="right_ri">+10积分</span>
            </li>
            <li>
                <span><Icon type="minus-circle"/>批评一次（≤2/科/天）</span>
                <span className="right_ri">-3积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>自主做题错一题（3个/科/天）</span>
                <span className="right_ri">+1积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>自主做题对一题（3个/科/天）</span>
                <span className="right_ri">+难度分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>用装备做错一题（3蚁币/个）</span>
                <span className="right_ri">+2积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>用装备做对一题（同上）</span>
                <span className="right_ri">难度分＊2积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>装备换题错一题（1蚁币/个）</span>
                <span className="right_ri">+2积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>装备换题对一题（同上）</span>
                <span className="right_ri">难度分＊2积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>翻倍道具做题（3蚁币/个）</span>
                <span className="right_ri">总分翻倍</span>
            </li>

            <li className="til">技能</li>
            <li>
                <span><Icon type="plus-circle"/>每个技能使用一次</span>
                <span className="right_ri">+2积分</span>
            </li>

            <li className="til">斗转星移（1次/人/天）</li>
            <li>
                <span><Icon type="plus-circle"/>使用装备不做题(1蚁币/个)</span>
                <span className="right_ri">不扣分</span>
            </li>
            <li>
                <span><Icon type="minus-circle"/>不用装备不做题</span>
                <span className="right_ri">-2积分</span>
            </li>
            <li>
                <span><Icon type="minus-circle"/>不用装备做错一题</span>
                <span className="right_ri">-1积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>不用装备做对一题</span>
                <span className="right_ri">+难度分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>不用装备做对一题，发起人得</span>
                <span className="right_ri">+难度分</span>
            </li>

            <li className="til">决斗（2蚁币/次）</li>
            <li>
                <span><Icon type="minus-circle"/>发起人不做题</span>
                <span className="right_ri">-使用技能所得积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>对手使用防守装备不做题</span>
                <span className="right_ri">不扣分</span>
            </li>
            <li>
                <span><Icon type="minus-circle"/>对手不使用防守装备不做题</span>
                <span className="right_ri">-2积分</span>
            </li>
            <li>
                <span><Icon type="minus-circle"/>对手不使用防守装备且做错</span>
                <span className="right_ri">-1积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>发起人做对，对手错，发起人</span>
                <span className="right_ri">＋2倍难度分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>发起人做错，对手对，发起人</span>
                <span className="right_ri">＋0积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>发起人做错，对手对，对手</span>
                <span className="right_ri">＋难度分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>两人都做对</span>
                <span className="right_ri">＋难度分/人</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>两人都做错，发起人</span>
                <span className="right_ri">＋0积分</span>
            </li>
            <li>
                <span><Icon type="minus-circle"/>两人都做错，对手，发起人</span>
                <span className="right_ri">-1积分</span>
            </li>
            <li className="til">万箭齐发</li>
            <li>
                <span><Icon type="minus-circle"/>发起人不做题</span>
                <span className="right_ri">-使用技能所得积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>对手使用防守装备不做题</span>
                <span className="right_ri">不扣分</span>
            </li>
            <li>
                <span><Icon type="minus-circle"/>对手不使用防守装备不做题</span>
                <span className="right_ri">-2积分</span>
            </li>
            <li>
                <span><Icon type="minus-circle"/>对手不使用防守装备且做错</span>
                <span className="right_ri">-1积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>全班正确率&lt;30%,对手对</span>
                <span className="right_ri">难度分+平摊扣分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>全班正确率&lt;30%，发起人</span>
                <span className="right_ri">＋5倍难度分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>全班正确率&lt;30%，发起人</span>
                <span className="right_ri">＋5倍难度分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>全班正确率>30%，对手对</span>
                <span className="right_ri">＋难度分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>正确率>30%，发起人对</span>
                <span className="right_ri">难度分＋扣分</span>
            </li>

        </ul>;

    },
    tedUpgrade(){
        return <ul className="topics_le integral integral_scroll">
            <li className="til">升级攻略</li>
            <li>
                <span><Icon type="plus-circle"/>上传教案,每一个</span>
                <span className="right_ri">+1积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>课外使用课件</span>
                <span className="right_ri">+10积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>发布话题,分享教学资源,每一条</span>
                <span className="right_ri">+1积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>学生参与此话题,并评论</span>
                <span className="right_ri">+1积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>上传微课,每一个</span>
                <span className="right_ri">+2积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>微课校内点击</span>
                <span className="right_ri">+1积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>微课校外点击</span>
                <span className="right_ri">+10积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>上传题目,每一个</span>
                <span className="right_ri">+1积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>校内使用此题,每次</span>
                <span className="right_ri">+5积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>校外使用此题,每次</span>
                <span className="right_ri">+3积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>课后布置作业,每题</span>
                <span className="right_ri">+1积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>开课一次</span>
                <span className="right_ri">+50积分</span>
            </li>
            <li>
                <span><Icon type="plus-circle"/>在线解决学生提问</span>
                <span className="right_ri">+20积分</span>
            </li>
        </ul>;
    },
    render() {

        var welcomeTitle;
        var returnToolBar = <div className="ant-tabs-right talk_ant_btn1"><Button onClick={this.props.returnMyFollows }>返回</Button>
        </div>;
        var returnPersonCenterToolBar = <div className="ant-tabs-right talk_ant_btn1">
            <button onClick={this.returnPersonCenter}>返回</button>
        </div>;
        var tabComponent;
        var userPhoneCard;
        let returnBtn = null;

        switch (this.state.optType) {

            case 'personCenter':

                returnBtn = <h3 className="public—til—blue">
                    <div className="ant-tabs-right">
                        <button onClick={this.props.returnParentPersonCenter} className="affix_bottom_tc"><Icon
                            type="left"/></button>
                    </div>
                    {this.props.userinfo.user.userName + "的个人中心"}</h3>;
                tabComponent = <MyFollowPersonCenter userInfo={this.props.userinfo}
                                                     userContactsData={this.state.userContactsData}
                                                     callBackTurnToMessagePage={this.getUser2UserMessages}
                                                     callBackTurnToAsk={this.callBackTurnToAsk}
                                                     callBackStudyTrack={this.callBackStudyTrack}
                                                     intoMyFollows={this.props.intoMyFollows}
                                                     callBackGetUserFavorite={this.callBackGetUserFavorite}
                                                     callBackGetMySubjects={this.callBackGetMySubjects}
                                                     callBackGetMyCourseWares={this.callBackGetMyCourseWares}
                                                     callBackGetLiveInfo={this.gitUserLiveInfo}
                                                     callBackTurnToPlatformRulePage={this.callBackTurnToPlatformRulePage}
                />;
                break;

            case 'sendMessage':
                var messageTagArray = [];
                var messageList = this.state.messageList;
                if (isEmpty(messageList) == false && messageList.length > 0) {
                    for (var i = messageList.length - 1; i >= 0; i--) {
                        var e = messageList[i];
                        var content = e.content;
                        var fromUser = e.fromUser.userName;
                        var userPhoneIcon;
                        if (isEmpty(e.fromUser.avatar)) {
                            userPhoneIcon = <img src={require('./images/maaee_face.png')}></img>;
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
                                            <div className="talk-cont"><span
                                                className="name">{userPhoneIcon}</span><span
                                                className="borderballoon">{e.content}</span></div>
                                        </li>;
                                    } else {
                                        messageTag = <li style={{'textAlign': 'left'}}>
                                            <div className="u-name"><span>{fromUser}</span></div>
                                            <div className="talk-cont"><span
                                                className="name">{userPhoneIcon}</span><span
                                                className="borderballoon_le">{e.content}</span></div>
                                        </li>;
                                    }
                                } else if (e.messageReturnJson.messageType == "imgTag") {
                                    if (e.fromUser.colUid == sessionStorage.getItem("ident")) {
                                        messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                            <div className="u-name"><span>{fromUser}</span></div>
                                            <div className="talk-cont"><span
                                                className="name">{userPhoneIcon}</span><span
                                                className="borderballoon ">{e.imgTagArray}</span></div>
                                        </li>;
                                    } else {
                                        messageTag = <li style={{'textAlign': 'left'}}>
                                            <div className="u-name"><span>{fromUser}</span></div>
                                            <div className="talk-cont"><span
                                                className="name">{userPhoneIcon}</span><span
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
                if (isEmpty(this.state.currentPerson.userName) == false) {
                    welcomeTitle = this.state.currentPerson.userName;
                } else {
                    welcomeTitle = this.state.currentPerson.user.userName;
                }
                var emotionInput;
                if (this.state.currentPerson.colUtype != "SGZH") {
                    emotionInput = <Row className="group_send">
                        <Col className="group_send_talk">
                            <MyFollowEmotionInput/>
                        </Col>
                        <Col className="group_send_btn">
                            <Button onClick={this.sendMessage}>发送</Button>
                        </Col>
                    </Row>;
                }
                tabComponent = <Tabs
                    hideAdd
                    ref="personCenterTab"
                    activeKey={this.state.activeKey}
                    defaultActiveKey={this.state.defaultActiveKey}
                    tabBarExtraContent={returnPersonCenterToolBar}
                    transitionName=""  //禁用Tabs的动画效果
                >
                    <TabPane tab={welcomeTitle} key="loginWelcome" className="topics_rela">
                        <div>
                            <div className="group_talk">
                                <ul>
                                    {messageTagArray}
                                </ul>
                            </div>
                            {emotionInput}
                        </div>
                    </TabPane>
                </Tabs>;
                break;

            case 'getUserChatGroup':
                welcomeTitle = "我的群聊";
                tabComponent = <Tabs
                    hideAdd
                    ref="mainTab"
                    activeKey={this.state.activeKey}
                    defaultActiveKey={this.state.defaultActiveKey}
                    tabBarExtraContent={returnToolBar}
                    transitionName=""  //禁用Tabs的动画效果
                >
                    <TabPane tab={welcomeTitle} key="loginWelcome" className="topics_rela">
                        <div>
                            <ul className="group_table">
                                <Table className="group_table_u" onRowClick={this.sendGroupMessage} showHeader={false}
                                       scroll={{x: true, y: 500}} columns={userGroupsColumns}
                                       dataSource={this.state.userGroupsData} pagination={{
                                    total: this.state.totalChatGroupCount,
                                    pageSize: getPageSize(),
                                    onChange: this.onChatGroupPageChange
                                }}/>
                            </ul>
                        </div>
                    </TabPane>
                </Tabs>;
                break;

            case 'sendGroupMessage':
                returnToolBar = <div className="ant-tabs-right">
                    <Button onClick={this.setChatGroup} className="antnest_talk">设置</Button>
                    <Button onClick={this.getUserChatGroup}>返回</Button>
                </div>;
                welcomeTitle = this.state.currentGroupObj.name;
                var messageTagArray = [];
                var messageList = this.state.messageList;
                if (isEmpty(messageList) == false && messageList.length > 0) {
                    messageList.forEach(function (e) {
                        var content = e.content;
                        var fromUser = e.fromUser.userName;
                        var userPhoneIcon;
                        if (isEmpty(e.fromUser.avatar)) {
                            userPhoneIcon = <img src={require('./images/maaee_face.png')}></img>;
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
                                            <div className="talk-cont"><span
                                                className="name">{userPhoneIcon}</span><span
                                                className="borderballoon">{e.content}</span></div>
                                        </li>;
                                    } else {
                                        messageTag = <li style={{'textAlign': 'left'}}>
                                            <div className="u-name"><span>{fromUser}</span></div>
                                            <div className="talk-cont"><span
                                                className="name">{userPhoneIcon}</span><span
                                                className="borderballoon_le">{e.content}</span></div>
                                        </li>;
                                    }
                                } else if (e.messageReturnJson.messageType == "imgTag") {
                                    if (e.fromUser.colUid == sessionStorage.getItem("ident")) {
                                        messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                            <div className="u-name"><span>{fromUser}</span></div>
                                            <div className="talk-cont"><span
                                                className="name">{userPhoneIcon}</span><span
                                                className="borderballoon">{e.imgTagArray}</span></div>
                                        </li>;
                                    } else {
                                        messageTag = <li style={{'textAlign': 'left'}}>
                                            <div className="u-name"><span>{fromUser}</span></div>
                                            <div className="talk-cont"><span
                                                className="name">{userPhoneIcon}</span><span
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
                                    <MyFollowEmotionInput/>
                                </Col>
                                <Col className="group_send_btn">
                                    <Button value="groupSend" onClick={this.sendMessage}>发送</Button>
                                </Col>
                            </Row>
                        </div>
                    </TabPane>
                </Tabs>;
                break;

            case 'turnToAsk':
                var currentPageLink = "http://www.maaee.com:80/Excoord_PhoneService/quiz/getUserAskedQuiz/" + this.state.currentUser.colUid;
                welcomeTitle = "我发起过的提问";
                tabComponent = <Tabs
                    hideAdd
                    ref="studentAskTab"
                    activeKey={this.state.activeKey}
                    defaultActiveKey={this.state.defaultActiveKey}
                    tabBarExtraContent={returnPersonCenterToolBar}
                    transitionName=""  //禁用Tabs的动画效果
                >
                    <TabPane tab="我发起过的提问" key="我发起过的提问">
                        <iframe ref="study" src={currentPageLink} className="analyze_iframe"></iframe>
                    </TabPane>
                </Tabs>;
                break;

            case 'turnStudyTrack':
                var currentPageLink = "http://www.maaee.com:80/Excoord_PhoneService/user/studytrack/" + this.state.currentUser.colUid;
                welcomeTitle = "我的学习轨迹";
                tabComponent = <Tabs
                    hideAdd
                    ref="studentStudyTrackTab"
                    activeKey={this.state.activeKey}
                    defaultActiveKey={this.state.defaultActiveKey}
                    tabBarExtraContent={returnPersonCenterToolBar}
                    transitionName=""  //禁用Tabs的动画效果
                >
                    <TabPane tab="学习轨迹" key="studyTrack">
                        <iframe ref="study" src={currentPageLink} className="analyze_iframe"></iframe>
                    </TabPane>
                </Tabs>;
                break;

            case 'getMyFollows':
                welcomeTitle = this.state.currentUser.userName + "的关注";
                tabComponent = <Tabs
                    hideAdd
                    ref="mainTab"
                    activeKey={this.state.activeKey}
                    defaultActiveKey={this.state.defaultActiveKey}
                    tabBarExtraContent={returnPersonCenterToolBar}
                    transitionName=""  //禁用Tabs的动画效果
                >
                    <TabPane tab={welcomeTitle} key="userFollows" className="topics_rela">
                        <div className="person_attention favorite_pa_le">
                            {this.state.followsUserArray}
                        </div>
                    </TabPane>
                </Tabs>;
                break;

            case 'getUserSubjects':

                tabComponent = <div className="follow_my">
                    <h3 className="public—til—blue">
                        <div className="ant-tabs-right">
                            <button onClick={this.changeMyCenter} className="affix_bottom_tc"><Icon type="left"/>
                            </button>
                        </div>
                        {this.state.currentPerson.user.userName + "的题库"}</h3>
                    <Table columns={subjectTableColumns} dataSource={data} pagination={{
                        total: this.state.totalSubjectCount,
                        pageSize: getPageSize(),
                        onChange: this.onSubjectPageChange
                    }} scroll={{y: 400}}/>
                </div>;
                break;

            case 'getUserCourseWares':

                tabComponent = <div className="follow_my">
                    <h3 className="public—til—blue">
                        <div className="ant-tabs-right">
                            <button onClick={this.changeMyCenter} className="affix_bottom_tc"><Icon type="left"/>
                            </button>
                        </div>
                        {this.state.currentPerson.user.userName + "的资源"}</h3>
                    <div className='ant-tabs-tabpane ant-tabs-tabpane-active topics_calc favorite_up favorite_le_h'>
                        <Collapse defaultActiveKey={activeKey} activeKey={activeKey} ref="collapse">
                            {coursePanelChildren}
                        </Collapse>
                    </div>
                    <Pagination total={this.state.totalCourseWareCount} pageSize={getPageSize()}
                                current={this.state.currentCourseWarePage} onChange={this.onCourseWareChange}/>
                </div>;


                break;

            case 'getLiveInfoByUid':

                tabComponent = <div className="follow_my">
                    <h3 className="public—til—blue">
                        <div className="ant-tabs-right">
                            <button onClick={this.changeMyCenter} className="affix_bottom_tc"><Icon type="left"/>
                            </button>
                        </div>
                        {this.state.currentPerson.user.userName + "的直播课"}</h3>
                    <div className='ant-tabs ant-tabs-top ant-tabs-line topics_calc favorite_up favorite_le_h'>
                        {this.state.userLiveData}
                    </div>
                    <Pagination total={this.state.totalLiveCount} pageSize={getPageSize()}
                                current={this.state.currentLivePage} onChange={this.onLiveInfoPageChange}/>
                </div>;
                break;


            case 'turnToLiveInfoShowPage':

                var currentPageLink = "http://www.maaee.com:80/Excoord_PC/liveinfo/show/" + sessionStorage.getItem("ident") + "/" + this.state.liveInfoId;
                var liveInfoShowIframe = <iframe id="liveInfoIframe" ref="study" src={currentPageLink}
                                                 className="analyze_iframe"/>;
                tabComponent = <Tabs
                    hideAdd
                    ref="studentStudyTrackTab"
                    activeKey={this.state.activeKey}
                    defaultActiveKey={this.state.defaultActiveKey}
                    tabBarExtraContent={returnToolBar}
                    transitionName=""  //禁用Tabs的动画效果
                >
                    <TabPane tab="直播课" key="turnToLiveInfoShowPage">
                        {liveInfoShowIframe}
                    </TabPane>
                </Tabs>;
                break;

            case 'userFavorite':
                tabComponent = <Favorites userid={this.state.studentId} breadcrumbVisible={false}/>;
                break;

            case 'getPlatformRulePage':

                userPhoneCard = <div className="integral_top">
                <span className="integral_face">
                    <img className="person_user" src={this.state.currentUser.user.avatar}></img>
                </span>
                    <div className="class_right integral_name">
                        {this.state.currentUser.user.userName}
                    </div>
                    <div className="class_right">
                        <Button onClick={ () => {
                            this.callBackTurnToPlatformRulePage('score')
                        } }
                                className="yellow_btn">{this.state.currentUser.score}积分</Button>
                    </div>
                    <div className="integral_line"></div>
                </div>;
                //学生和老师的升级攻略不同
                var upgradeRaiders;
                if (this.state.currentUser.user.colUtype == "STUD") {
                    upgradeRaiders = this.stuUpgrade();
                } else {
                    upgradeRaiders = this.tedUpgrade();
                }

                tabComponent = <Tabs
                    hideAdd
                    ref="studentStudyTrackTab"
                    activeKey={this.state.activeKey}
                    defaultActiveKey={this.state.defaultActiveKey}
                    tabBarExtraContent={returnPersonCenterToolBar}
                    transitionName=""  //禁用Tabs的动画效果
                    onChange={this.platformRulePageChange}
                >
                    <TabPane tab="平台规则" key="platformRulePage">
                        <ul className="topics_le integral integral_scroll">
                            <li className="til">禁言</li>
                            <li><Icon type="plus-circle"/>课前蚁巢刷屏、发布不良话题或评论</li>
                            <li><Icon type="plus-circle"/>视频开课弹幕刷屏或无关言论、老师可关闭弹幕</li>
                            <li className="til">视频开课被踢出课堂</li>
                            <li><Icon type="plus-circle"/>视频开课中公屏或弹幕刷屏或发布不良言论、多次警告无效、可踢出课堂</li>
                            <li className="til">封号</li>
                            <li><Icon type="plus-circle"/>被踢出课堂或禁言1次、封号3天</li>
                            <li><Icon type="plus-circle"/>连续被踢出课堂或禁言>=2次、封号1个周</li>
                            <li><Icon type="plus-circle"/>连续被踢出课堂或禁言>=5次、封号1个月</li>
                            <li><Icon type="plus-circle"/>在校期间出现严重警告、违纪、盗号、不服从老师管理、故意损坏小蚂蚁设备(平板、充电柜、无线AP)等封号1个月</li>
                        </ul>
                    </TabPane>
                    <TabPane tab="升级攻略" key="upgradeRaiders">
                        <div>
                            {upgradeRaiders}
                        </div>
                    </TabPane>
                </Tabs>;
                break;

        }

        return (<div className="follow_my">
                {returnBtn}
                <div className="favorite_scroll">
                    <UseKnowledgeComponents ref="useKnowledgeComponents"/>
                    <div className="group_cont">
                        {userPhoneCard}
                        {tabComponent}
                    </div>
                </div>
            </div>
        );
    },
});

export default MyFollowExtend;
