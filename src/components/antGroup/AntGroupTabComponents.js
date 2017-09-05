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
import {formatMD} from '../../utils/utils';
import {formatHM} from '../../utils/utils';
import {isToday} from '../../utils/utils';
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
var receiveMessageArray=[];
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
        var actionFrom = antGroup.props.actionFrom;
        var timeNode = (new Date()).valueOf();
        if(isEmpty(messageType)==false){
            if(messageType=="message"){
                antGroup.setState({"optType":"sendMessage"});
                antGroup.getUser2UserMessages(propsUserInfo,timeNode);
                if(isEmpty(actionFrom)==false){
                    antGroup.turnToMessagePage(propsUserInfo,messageType);
                }
            }else{
                antGroup.setState({"optType":"sendGroupMessage"});
                antGroup.sendGroupMessage(antGroup.props.groupObj,timeNode);
                if(isEmpty(actionFrom)==false){
                    // antGroup.turnToChatGroupMessagePage(antGroup.props.groupObj);
                    antGroup.turnToMessagePage(antGroup.props.groupObj,messageType);
                }
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
        this.turnToMessagePage(sessionStorage.getItem("loginUser"),"message","noTurnPage");
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
        if(scrollTop <= 1  ){
            antGroup.setState({"isDirectToBottom":false});
            if(antGroup.state.messageComeFrom=="groupMessage"){
                antGroup.getChatGroupMessages(antGroup.state.currentGroupObj,antGroup.state.firstMessageCreateTime);
                // antGroup.reGetChatMessage(antGroup.state.currentGroupObj,antGroup.state.firstMessageCreateTime);
            }else{
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

    checkSameMessageIsExist(currentUUID){
        var isExits = false;
        for(var i=0;i<receiveMessageArray.length;i++){
            var messageUUId = receiveMessageArray[i];
            if(currentUUID == messageUUId){
                isExits= true;
                break;
            }
        }
        return isExits;
    },

    /**
     * 进入收发消息的窗口
     * @param user
     */
    turnToMessagePage(operatorObj,messageType,isTurnPage){
        var _this = this;
        var userId;
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
                            //sessionStorage.removeItem("machineId");
                            location.hash="Login";
                            window.ms = null;
                            LP.delAll();
                        },
                    });
                }
            }, onWarn: function (warnMsg) {

            }, onMessage: function (info) {
                var groupObj;
                if (antGroup.state.optType == "sendMessage") {
                    //如果是个人消息通信，传入的对象应该是用户对象
                    userId = operatorObj.colUid;
                }else{
                    //如果是群组消息通信，传入的对象应该是群组对象
                    groupObj = operatorObj;
                }
                //获取messageList
                var command = info.command;
                if (isEmpty(command) == false) {
                    if (command == "messageList") {
                        showImg = "";
                        var data = info.data;
                        var messageArray = data.messages;
                        var uuidsArray = [];
                        messageArray.forEach(function (e) {
                            var fromUser = e.fromUser;
                            var colUtype = fromUser.colUtype;
                            var content = e.content;
                            var uuid = e.uuid;
                            uuidsArray.push(uuid);
                            var messageReturnJson = antGroup.getImgTag(content);
                            var imgTagArrayReturn = [];
                            if (messageReturnJson.messageType == "text") {
                                content = messageReturnJson.textMessage;
                            } else if (messageReturnJson.messageType == "imgTag") {
                                imgTagArrayReturn = messageReturnJson.imgMessage;
                            }
                            if(e.toType == 1){
                                //个人消息
                                if (("SGZH" == colUtype || fromUser.colUid == userId)) {
                                    imgTagArray.splice(0);
                                    var message = {
                                        'fromUser': fromUser,
                                        'content': content,
                                        "messageType": "getMessage",
                                        "imgTagArray": imgTagArrayReturn,
                                        "messageReturnJson": messageReturnJson
                                    };
                                    messageList.push(message);
                                }
                            }else if(e.toType == 4){
                                //处理聊天的群组消息
                                if (("SGZH" == colUtype || isEmpty(groupObj)==false && groupObj.chatGroupId == e.toId )) {
                                    imgTagArray.splice(0);
                                    var message = {
                                        'fromUser': fromUser,
                                        'content': content,
                                        "messageType": "getMessage",
                                        "imgTagArray": imgTagArrayReturn,
                                        "messageReturnJson": messageReturnJson
                                    };
                                    messageList.push(message);
                                }
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
                        showImg = "";
                        var messageOfSinge = data.message;
                        var fromUser = messageOfSinge.fromUser;
                        var colUtype = fromUser.colUtype;
                        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
                        var content = messageOfSinge.content;
                        var uuidsArray = [];
                        var uuid = messageOfSinge.uuid;
                        uuidsArray.push(uuid);
                        var isExist = antGroup.checkSameMessageIsExist(uuid);
                        if(isExist){
                            return;
                        }else{
                            receiveMessageArray.push(uuid);
                        }
                        if (uuidsArray.length != 0) {
                            var receivedCommand = {
                                "command": "messageRecievedResponse",
                                "data": {"uuids": uuidsArray}
                            };
                            ms.send(receivedCommand);
                        }
                        var isCurrentDay = isToday(messageOfSinge.createTime);
                        var createTime;
                        if(isCurrentDay){
                            //如果是当天的消息，只显示时间
                            createTime = formatHM(messageOfSinge.createTime);
                        }else{
                            //非当天时间，显示的是月-日
                            createTime = formatMD(messageOfSinge.createTime);
                        }
                        var contentJson = {"content": content, "createTime":createTime};
                        var contentArray = [contentJson];
                        if(messageOfSinge.toType == 1 && typeof (content)!='undefined'){
                            //个人单条消息
                            if (isEmpty(antGroup.state.currentUser) == false && messageOfSinge.fromUser.colUid == antGroup.state.currentUser.colUid) {
                                imgTagArray.splice(0);
                                var imgTagArrayReturn = [];
                                var messageReturnJson = antGroup.getImgTag(content);
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
                                // messageList.push(messageShow);
                                var userJson = {
                                    key: messageOfSinge.toUser.colUid,
                                    "fromUser": messageOfSinge.toUser,
                                    contentArray: contentArray,
                                    "messageToType": 1
                                };
                                if(isEmpty(isTurnPage)){
                                    antGroup.props.onNewMessage(userJson);
                                }
                            }else{
                                var userJson = {
                                    key: messageOfSinge.toUser.colUid,
                                    "fromUser": messageOfSinge.toUser,
                                    contentArray: contentArray,
                                    "messageToType": 1
                                };
                                if(isEmpty(isTurnPage)) {
                                    antGroup.props.onNewMessage(userJson);
                                }
                            }
                        }else if(messageOfSinge.toType == 4 && typeof (content)!='undefined'){
                            //群组单条消息
                            if (isEmpty(antGroup.state.currentGroupObj)==false
                                && antGroup.state.currentGroupObj.chatGroupId == messageOfSinge.toChatGroup.chatGroupId) {
                                imgTagArray.splice(0);
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
                                var userJson = {
                                    key: messageOfSinge.toChatGroup.chatGroupId,
                                    "fromUser": fromUser,
                                    "toChatGroup":messageOfSinge.toChatGroup,
                                    contentArray: contentArray,
                                    "messageToType": 4
                                };
                                if(isEmpty(isTurnPage)) {
                                    antGroup.props.onNewMessage(userJson);
                                }
                            }else{
                                var userJson = {
                                    key: messageOfSinge.toChatGroup.chatGroupId,
                                    "fromUser": fromUser,
                                    "toChatGroup":messageOfSinge.toChatGroup,
                                    contentArray: contentArray,
                                    "messageToType": 4
                                };
                                if(isEmpty(isTurnPage)) {
                                    antGroup.props.onNewMessage(userJson);
                                }
                            }
                        }
                        antGroup.setState({"messageList": messageList});
                    }
                }
            }
        };
        if(isEmpty(isTurnPage)){
            if (messageType=="message") {
                //如果是个人消息通信，传入的对象应该是用户对象
                antGroup.setState({"optType": "sendMessage", "userIdOfCurrentTalk": operatorObj.colUid, "currentUser": operatorObj});
            }else{
                //如果是个人消息通信，传入的对象应该是群组对象
                antGroup.setState({"optType": "sendGroupMessage", "currentGroupObj": operatorObj});
            }
        }

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
        if(isEmpty(str)==false){
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
        ms.send(commandJson);
        antGroup.initMyEmotionInput();
        if (isEmpty(sendType) == false && sendType == "groupSend") {
            antGroup.setState({"isDirectToBottom":true});
        } else {
            messageList.splice(0, 0, messageJson);
            // 更新左侧消息动态列表
            var showCreateTime = formatHM(createTime);
            var contentJson = {"content": messageContent, "createTime":showCreateTime};
            var contentArray = [contentJson];
            var userJson = {
                key: antGroup.state.currentUser.colUid,
                "fromUser": antGroup.state.currentUser,
                contentArray: contentArray,
                "messageToType": 1
            };
            antGroup.props.onNewMessage(userJson);
            antGroup.setState({"messageList": messageList,"isDirectToBottom":true});
        }
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

        messageList.splice(0);
        scrollType="auto";
        antGroup.setState({"isDirectToBottom":true,"messageComeFrom":"groupMessage","currentUser":''});
        antGroup.reGetChatMessage(groupObj,timeNode);
    },

    reGetChatMessage(groupObj,timeNode){

        antGroup.getChatGroupMessages(groupObj,timeNode);
        // antGroup.turnToChatGroupMessagePage(groupObj);
        var messageType = "groupMessage";
        antGroup.turnToMessagePage(groupObj,messageType);
    },

    /**
     * 弹出消息提示
     * 当获取不到更早的消息列表时，给出提示信息
     * @param response
     */
    tipNotic(response){
        if(typeof(response)!="undefined" && response.length==0){
			notification.open({
    		message: '',
   			description: '没有更多消息了',
    		icon: <Icon type="meh"  style={{ color: '#108ee9' , top:'-7px', position:'relative' }}/>,

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
                                messageList.push(message);
                            }
                        }
                    });
                    antGroup.setState({"messageList": messageList});
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
        antGroup.setState({"isDirectToBottom":true,"messageComeFrom":"personMessage","currentGroupObj":''});
        antGroup.getUser2UserMessages(userObj,timeNode);
        var messageType = "message";
        antGroup.turnToMessagePage(userObj,messageType);
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
                /*var gt = $('#groupTalk');
                if(typeof(gt)==="object" && typeof(gt).length==="number" && gt.length!=0){
                    topScrollHeight = gt[0].scrollHeight;
                    console.log("getUser--------->"+topScrollHeight);
                    if(antGroup.state.isDirectToBottom==false){
                        gt.scrollTop(parseInt(gt[0].scrollHeight)*2-10);
                    }
                }*/
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
        var messageType="groupMessage";
        antGroup.turnToMessagePage(currentGroupObj,messageType);
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
        if (antGroup.state.optType == "sendMessage" || antGroup.state.optType == "sendGroupMessage") {
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
            var sendBtn;
            var emotionInput;
            if (antGroup.state.optType == "sendMessage" && isEmpty(antGroup.state.currentUser.userName) == false) {
                welcomeTitle = antGroup.state.currentUser.userName;
                sendBtn = <Button onClick={antGroup.sendMessage}><div>发送<p className="password_ts">(Ctrl+Enter)</p></div></Button>;
                if (antGroup.state.currentUser.colUtype != "SGZH") {
                    emotionInput = <Row className="group_send">
                        <Col className="group_send_talk">
                            <EmotionInputComponents onKeyDown={this.checkKeyType}></EmotionInputComponents>
                        </Col>
                        <Col className="group_send_btn">
                            {sendBtn}
                        </Col>
                    </Row>;
                }
            }else{
                welcomeTitle = antGroup.state.currentGroupObj.name;
                sendBtn = <Button value="groupSend" onClick={antGroup.sendMessage}><div>发送<p className="password_ts">(Ctrl+Enter)</p></div></Button>
                emotionInput = <Row className="group_send">
                    <Col className="group_send_talk">
                        <EmotionInputComponents onKeyDown={this.checkKeyType}></EmotionInputComponents>
                    </Col>
                    <Col className="group_send_btn">
                        {sendBtn}
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
        }else{
            tabComponent=<div className="userinfo_bg_1"><span>科技改变未来，教育成就梦想</span></div>;
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
