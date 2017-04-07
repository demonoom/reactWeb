import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,Table,Transfer} from 'antd';
import { Menu, Dropdown,message,Pagination,Tag , Modal,Popover,Input} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import PersonCenterComponents from './PersonCenterComponents';
import EmotionInputComponents from './EmotionInputComponents';
import {getPageSize} from '../../utils/Const';
import {getLocalTime} from '../../utils/Const';
import {isEmpty} from '../../utils/Const';
import {getAllTopic} from '../../utils/Const';
import {getOnlyTeacherTopic} from '../../utils/Const';
import {getImgName} from '../../utils/Const';
import {MsgConnection} from '../../utils/msg_websocket_connection';
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;

var columns = [ {
    title: '联系人',
    dataIndex: 'userContacts',
}];

var userGroupsColumns = [ {
    title: '群聊头像',
    dataIndex: 'groupPhoto',
},{
    title: '群聊名称',
    dataIndex: 'groupName',
}];

var groupUserTableColumns = [ {
    title: '群成员',
    dataIndex: 'groupUser',
}];

var followUserColumns=[
    {
        title:'姓名',
        dataIndex:'userName'
    },
    {
        title:'科目',
        dataIndex:'courseName'
    }
];


var antGroup;
var messageList=[];
//消息通信js
var ms;
var imgTagArray = [];
var showImg="";
var showContent="";//将要显示的内容
const AntGroupTabComponents = React.createClass({

    getInitialState() {
        antGroup = this;
        return {
            defaultActiveKey:'loginWelcome',
            activeKey:'loginWelcome',
            optType:'getUserList',
            userContactsData:[],
            currentPerson:-1,
            messageList:'',
            userIdOfCurrentTalk:'',
            userGroupsData:[],
            createChatGroupModalVisible:false,
            mockData: [],       //联系人穿梭框左侧备选数据
            targetKeys: [],     //联系人穿梭框右侧已选数据
            chatGroupTitle:'',
            updateGroupId:'',
            currentMemberArray:[],
            selectedRowKeys: [],  // Check here to configure the default column
            selectedRowKeysStr:'',
            memberData:[],  //添加群成员时，待添加群成员的数组
            memberTargetKeys:[],    //添加群成员时，已选中待添加群成员的数组
            updateChatGroupTitle:'',
            followsUserArray:[],
        };
    },
    /**
     * 话题tab切换响应函数
     * @param activeKey
     */
    onChange(activeKey) {
        this.setState({activeKey:activeKey});
    },

    componentDidMount(){
        antGroup.getAntGroup();
    },

    /**
     * 获取联系人列表
     */
    getAntGroup(){
        var userContactsData=[];
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
                    console.log("userInfo======》"+userId+"=="+e.userName+"=="+e.colUtype);
                    var userJson = {key:userId,userContacts:userName,userObj:e};
                    userContactsData.push(userJson);
                });
                antGroup.setState({"userContactsData":userContactsData});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 点击联系人列表表格行时，获取当前行对应的记录信息
     * @param record　当前行的用户信息
     * @param index　当前行的索引顺序，从０开始
     */
    getPersonCenterInfo(record, index){
        var userType = record.userObj.colUtype;
        console.log("12312"+record.userObj.userName);
        if(userType=="PAREN" || userType=="EADM" || userType=="SGZH"){
            //家长直接进入聊天窗口
            //蚂蚁君点击进入后，只能接收消息，无法发送消息
            antGroup.setState({"optType":"sendMessage","currentPerson":record.userObj});
            antGroup.turnToMessagePage(record.key);
        }else {
            antGroup.getPersonalCenterData(record.key);
        }
    },

    /**
     * 获取个人中心需要的数据,老师和学生可通用,后期需要什么再添加
     */
    getPersonalCenterData(userId){
        var param = {
            "method": 'getPersonalCenterData',
            "userId": userId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var userInfo = ret.response;
                antGroup.setState({"optType":"personCenter","currentPerson":userInfo,"activeKey":"loginWelcome"});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    returnAntGroupMainPage(){
        antGroup.getAntGroup();
        antGroup.setState({"optType":"getUserList","activeKey":'loginWelcome'});
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

    turnToMessagePage(userId){
        ms = new MsgConnection();
        messageList.splice(0);
        var loginUserId = sessionStorage.getItem("ident");
        var machineId = sessionStorage.getItem("machineId");
        var pro = {"command":"messagerConnect","data":{"machineType":"ios","userId":Number.parseInt(loginUserId),"machine":machineId}};
        ms.msgWsListener={onError:function(errorMsg){
            console.log("error:"+errorMsg);
        },onWarn:function(warnMsg){
            console.log("warn:"+warnMsg);
        },onMessage:function(info){
            if(antGroup.state.optType=="sendMessage"){
                //获取messageList
                var command = info.command;
                console.log("success:"+command);
                if(isEmpty(command)==false){
                    if(command=="messageList"){
                        var data = info.data;
                        var messageArray = data.messages;
                        var uuidsArray = [];
                        messageArray.forEach(function (e) {
                            var fromUser = e.fromUser;
                            var colUtype = fromUser.colUtype;
                            if(("SGZH"==colUtype || fromUser.colUid==userId) && e.toType==1){
                                var uuid = e.uuid;
                                uuidsArray.push(uuid);
                                imgTagArray.splice(0);
                                showImg="";
                                var content = e.content;
                                /*var imgTagArrayReturn = antGroup.getImgTag(e.content);*/
                                var imgTagArrayReturn=[];
                                var messageReturnJson = antGroup.getImgTag(e.content);
                                if(messageReturnJson.messageType=="text"){
                                    content=messageReturnJson.textMessage;
                                }else if(messageReturnJson.messageType=="imgTag"){
                                    imgTagArrayReturn = messageReturnJson.imgMessage;
                                }
                                var message={'fromUser':fromUser,'content':content,"messageType":"getMessage","imgTagArray":imgTagArrayReturn,"messageReturnJson":messageReturnJson};
                                messageList.push(message);
                            }
                        });
                        if(uuidsArray.length!=0){
                            var receivedCommand = {"command":"messageRecievedResponse","data":{"uuids":uuidsArray}};
                            ms.send(receivedCommand);
                        }
                        antGroup.setState({"messageList":messageList});
                    }else if(command=="message"){
                        var data = info.data;
                        var messageOfSinge = data.message;
                        var uuidsArray = [];
                        var fromUser = messageOfSinge.fromUser;
                        var colUtype = fromUser.colUtype;
                        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
                        if(("SGZH"==colUtype || fromUser.colUid!=loginUser.colUid) && messageOfSinge.toType==1){
                            var uuid = messageOfSinge.uuid;
                            uuidsArray.push(uuid);
                            var content=messageOfSinge.content;
                            imgTagArray.splice(0);
                            showImg="";
                            //var imgTagArrayReturn = antGroup.getImgTag(messageOfSinge.content);
                            var imgTagArrayReturn=[];
                            var messageReturnJson = antGroup.getImgTag(messageOfSinge.content);
                            if(messageReturnJson.messageType=="text"){
                                content=messageReturnJson.textMessage;
                            }else if(messageReturnJson.messageType=="imgTag"){
                                imgTagArrayReturn = messageReturnJson.imgMessage;
                            }
                            var messageShow={'fromUser':fromUser,'content':content,"messageType":"getMessage","imgTagArray":imgTagArrayReturn,"messageReturnJson":messageReturnJson};
                            messageList.push(messageShow);
                            if(uuidsArray.length!=0){
                                var receivedCommand = {"command":"messageRecievedResponse","data":{"uuids":uuidsArray}};
                                ms.send(receivedCommand);
                            }
                        }
                        antGroup.setState({"messageList":messageList});
                    }
                }
            }
        }
        };
        ms.connect(pro);
        antGroup.setState({"optType":"sendMessage","userIdOfCurrentTalk":userId});
    },

    turnToChatGroupMessagePage(groupObj){
        ms = new MsgConnection();
        messageList.splice(0);
        var loginUserId = sessionStorage.getItem("ident");
        var machineId = sessionStorage.getItem("machineId");
        console.log("turnToChatGroupMessagePage machineId:"+machineId)
        var pro = {"command":"messagerConnect","data":{"machineType":"ios","userId":Number.parseInt(loginUserId),"machine":machineId}};
        ms.msgWsListener={onError:function(errorMsg){
            console.log("ChatGroup Message error:"+errorMsg);
        },onWarn:function(warnMsg){
            console.log("ChatGroup Message warn:"+warnMsg);
        },onMessage:function(info){
            //获取messageList
            var command = info.command;
            console.log("ChatGroup Message success:"+command);
            if(antGroup.state.optType=="sendGroupMessage"){
                if(isEmpty(command)==false){
                    if(command=="messageList"){
                        var data = info.data;
                        var messageArray = data.messages;
                        var uuidsArray = [];
                        messageArray.forEach(function (e) {
                            var fromUser = e.fromUser;
                            var colUtype = fromUser.colUtype;
                            //处理聊天的群组消息
                            if(("SGZH"==colUtype || groupObj.chatGroupId==e.toId ) && e.toType==4){
                                var uuid = e.uuid;
                                uuidsArray.push(uuid);
                                imgTagArray.splice(0);
                                showImg="";
                                var content = e.content;
                                var imgTagArrayReturn=[];
                                var messageReturnJson = antGroup.getImgTag(e.content);
                                if(messageReturnJson.messageType=="text"){
                                    content=messageReturnJson.textMessage;
                                }else if(messageReturnJson.messageType=="imgTag"){
                                    imgTagArrayReturn = messageReturnJson.imgMessage;
                                }
                                var message={'fromUser':fromUser,'content':content,"messageType":"getMessage","imgTagArray":imgTagArrayReturn,"messageReturnJson":messageReturnJson};
                                messageList.push(message);
                            }
                        });
                        if(uuidsArray.length!=0){
                            var receivedCommand = {"command":"messageRecievedResponse","data":{"uuids":uuidsArray}};
                            ms.send(receivedCommand);
                        }
                        antGroup.setState({"messageList":messageList});
                    }else if(command=="message"){
                        var data = info.data;
                        var messageOfSinge = data.message;
                        var uuidsArray = [];
                        var fromUser = messageOfSinge.fromUser;
                        var colUtype = fromUser.colUtype;
                        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
                        if(("SGZH"==colUtype || fromUser.colUid!=loginUser.colUid) && messageOfSinge.toType==4){
                            var uuid = messageOfSinge.uuid;
                            uuidsArray.push(uuid);
                            var content=messageOfSinge.content;
                            imgTagArray.splice(0);
                            showImg="";
                            //var imgTagArrayReturn = antGroup.getImgTag(messageOfSinge.content);
                            var imgTagArrayReturn=[];
                            var messageReturnJson = antGroup.getImgTag(messageOfSinge.content);
                            if(messageReturnJson.messageType=="text"){
                                content=messageReturnJson.textMessage;
                            }else if(messageReturnJson.messageType=="imgTag"){
                                imgTagArrayReturn = messageReturnJson.imgMessage;
                            }
                            var messageShow={'fromUser':fromUser,'content':content,"messageType":"getMessage","imgTagArray":imgTagArrayReturn,"messageReturnJson":messageReturnJson};
                            messageList.push(messageShow);
                            if(uuidsArray.length!=0){
                                var receivedCommand = {"command":"messageRecievedResponse","data":{"uuids":uuidsArray}};
                                ms.send(receivedCommand);
                            }
                        }
                        antGroup.setState({"messageList":messageList});
                    }
                }
            }
        }
        };
        ms.connect(pro);
        antGroup.setState({"optType":"sendGroupMessage","currentGroupObj":groupObj});
    },

    getImgTag(str){
        var imgTags = [];
        var messageReturnJson={};
        //imgTags = antGroup.changeImgTextToTag(str,imgTags,messageReturnJson);
        messageReturnJson = antGroup.changeImgTextToTag(str,imgTags,messageReturnJson);
        return messageReturnJson;
    },

    /**
     * 将表情的标记转为表情的图片
     * 需要按点替换，被替换的位置需要打上标记，之后再将原内容，以imgTag的形式替换回去
     */
    changeImgTextToTag(str,imgTags,messageReturnJson){
        showContent = str;
        var start = str.indexOf("[bexp_");
        if(start!=-1){
            //
            var end = str.indexOf("]");
            var subStr = str.substring(start,end+1);
            showContent = showContent.replace(subStr,"~");
            var imgUrl = getImgName(subStr);
            var localUrl = "../src/components/images/emotions/"+imgUrl;
            var subStrReplace = <span className='antnest_user'><img src={localUrl}/></span> ;
            imgTags.push(subStrReplace);
            var otherStr = str.substring(end+1);
            if(otherStr.indexOf("[bexp_")!=-1){
                antGroup.changeImgTextToTag(otherStr,imgTags);
            }else{
                showImg+=otherStr;
            }
            messageReturnJson={messageType:"imgTag",imgMessage:imgTags};
            console.log("showContent:"+showContent);
        }else{
            //不存在表情，为单纯性的文字消息
            messageReturnJson={messageType:"text",textMessage:str};
        }
        return messageReturnJson;
    },

    sendMessage(){
        var messageContent = antGroup.getEmotionInputById();
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var uuid = antGroup.createUUID();
        var createTime = (new Date()).valueOf();
        var messageJson={'content':messageContent,"createTime":createTime,'fromUser':loginUser,
            "toId":antGroup.state.userIdOfCurrentTalk,"command":"message","hostId":loginUser.colUid,
            "uuid":uuid,"toType":1};
        if(antGroup.state.optType=="sendGroupMessage"){
            messageJson.toId=antGroup.state.currentGroupObj.chatGroupId;
            messageJson.toType=4;
        }
        var commandJson ={"command":"message","data":{"message":messageJson}};
        ms.send(commandJson);
        messageList.push(messageJson);
        antGroup.initMyEmotionInput();
        antGroup.setState({"messageList":messageList});
    },

    /**
     * 通过id获取文本域对象，并进而获取vaue值
     * @returns {string}
     */
    getEmotionInputById(){
        var emotionInput="";
        var emotionInputArray = $("textarea[id='emotionInput']");
        if(isEmpty(emotionInputArray)==false){
            for(var i=0;i<emotionInputArray.length;i++){
                var emotionObj = emotionInputArray[i];
                if(isEmpty(emotionObj.value)==false){
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
        if(isEmpty(emotionArray)==false){
            for(var i=0;i<emotionArray.length;i++){
                emotionArray[i].innerHTML="";
                emotionArray[i].innerText="";
            }
        }
    },

    /**
     * 获取当前用户的群组
     */
    getUserChatGroup(){
        var param = {
            "method": 'getUserChatGroup',
            "userId": sessionStorage.getItem("ident"),
            "pageNo":1
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg=="调用成功" && ret.success==true){
                    var response = ret.response;
                    var charGroupArray = [];
                    response.forEach(function (e) {
                        var chatGroupId = e.chatGroupId;
                        var chatGroupName = e.name;
                        var membersCount = e.members.length;
                        var ownerPhoto = e.owner.avatar;
                        var imgTag = <span className='antnest_user'><img src={ownerPhoto}></img></span>;
                        var groupName = chatGroupName+""+membersCount+"人";
                        var chatGroupJson = {key:chatGroupId,groupPhoto:imgTag,'groupName':groupName,"groupObj":e};
                        charGroupArray.push(chatGroupJson);
                    });
                    antGroup.setState({"userGroupsData":charGroupArray});
                }
                antGroup.setState({"optType":"getUserChatGroup"});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 点击群组列表表格行时，获取当前行对应的记录信息
     * @param record　当前行的群组信息
     * @param index　当前行的索引顺序，从０开始
     */
    sendGroupMessage(record, index){
        console.log("key："+record.key);
        antGroup.setState({"optType":"sendGroupMessage","currentGroupObj":record.groupObj});
        antGroup.turnToChatGroupMessagePage(record.groupObj);
    },


    showCreateChatGroup(){
        antGroup.getUserContactsMockData();
        antGroup.setState({"createChatGroupModalVisible":true,"updateGroupId":''});
    },
    /**
     * 创建群组时，获取当前用户的联系人列表
     */
    getUserContactsMockData(){
        const mockData = [];
        var targetKeys = [];
        var param = {
            "method": 'getUserContacts',
            "ident": sessionStorage.getItem("ident"),
        };
        doWebService(JSON.stringify(param), {
            onResponse : function(ret) {
                console.log(ret.msg);
                var response = ret.response;
                response.forEach(function (e) {
                    var userId = e.colUid;
                    var userName = e.userName;
                    const data = {
                        key: userId,
                        title: userName,
                    };
                    mockData.push(data);
                });
                antGroup.setState({ mockData, targetKeys });
            },
            onError : function(error) {
                message.error(error);
            }
        });
    },
    /**
     * 添加群成员时，获取未在群成员列表中的联系人
     */
    getNotMemberUser(){
        const memberData = [];
        memberData.splice(0);
        var memberTargetKeys = [];
        var param = {
            "method": 'getUserContacts',
            "ident": sessionStorage.getItem("ident"),
        };
        doWebService(JSON.stringify(param), {
            onResponse : function(ret) {
                console.log(ret.msg);
                var response = ret.response;
                response.forEach(function (e) {
                    var userId = e.colUid;
                    var userName = e.userName;
                    var isExist = antGroup.checkMemberIsExist(userId);
                    if(isExist==false){
                        const data = {
                            key: userId,
                            title: userName,
                        };
                        memberData.push(data);
                    }
                });
                antGroup.setState({ memberData, memberTargetKeys });
            },
            onError : function(error) {
                message.error(error);
            }
        });
    },

    createChatGroupModalHandleCancel(){
        antGroup.setState({"createChatGroupModalVisible":false,"updateGroupId":''});
    },
    /**
     * 获取页面数据，创建聊天群组
     */
    createChatGroup(){
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var memberIds =antGroup.state.targetKeys.join(",");
        var updateGroupId = antGroup.state.updateGroupId;
        var currentGroupObj = antGroup.state.currentGroupObj;
        if(isEmpty(updateGroupId)==false){

        }else{
            var param = {
                "method": 'createChatGroup',
                "groupAvatar": loginUser.avatar,
                "groupName": antGroup.state.chatGroupTitle,
                "ownerId": sessionStorage.getItem("ident"),
                "memberIds":memberIds
            };
            doWebService(JSON.stringify(param), {
                onResponse: function (ret) {
                    var response = ret.response;
                    if(ret.msg=="调用成功" && ret.success==true && isEmpty(response.chatGroupId)==false && response.chatGroupId>0){
                        message.success("聊天群组创建成功");
                    }else{
                        message.success("聊天群组创建失败");
                    }
                },
                onError: function (error) {
                    message.error(error);
                }
            });
        }
        antGroup.setState({"createChatGroupModalVisible":false,"updateGroupId":'',"chatGroupTitle":''});
    },

    transferHandleChange(targetKeys){
        antGroup.setState({ targetKeys });
    },

    chatGroupTitleOnChange(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var chatGroupTitle = target.value;
        antGroup.setState({"chatGroupTitle":chatGroupTitle});
    },
    /**
     * 设置群组
     * @param e
     */
    setChatGroup(e){
        var currentGroupObj = antGroup.state.currentGroupObj;
        if(isEmpty(currentGroupObj)==false){
            var groupTitle = currentGroupObj.name;
            var groupId = currentGroupObj.chatGroupId;
            var members = currentGroupObj.members;
            var membersArray=[];
            members.forEach(function (e) {
                var memberId = e.colUid;
                var memberName = e.userName;
                var userJson = {key:memberId,groupUser:memberName};
                membersArray.push(userJson);
            });
            antGroup.setState({"optType":'showGroupInfo',"currentMemberArray":membersArray});
        }
    },
    /**
     * 检查群组成员是否已经存在
     */
    checkMemberIsExist(memberId){
        var isExist = false;
        var currentGroupObj = antGroup.state.currentGroupObj;
        if(isEmpty(currentGroupObj)==false){
            var groupTitle = currentGroupObj.name;
            var groupId = currentGroupObj.chatGroupId;
            var targetKeysParam=[];
            var members = currentGroupObj.members;
            if(isEmpty(members)==false && members.length!=0){
                for(var i=0;i<members.length;i++){
                    var member = members[i];
                    var memberIdInCurrent = member.colUid;
                    if(memberId==memberIdInCurrent){
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
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        var selectedRowKeysStr =selectedRowKeys.join(",");
        console.log("selectedRowKeysStr:"+selectedRowKeysStr);
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
     * 刷新本地的群组成员列表
     */
    refreshLocalMembers(){
        var currentMemberArray = antGroup.state.currentMemberArray;
        var selectedRowKeys = antGroup.state.selectedRowKeys;
        currentMemberArray = antGroup.array_diff(currentMemberArray,selectedRowKeys);
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
                antGroup.getUserChatGroup();
                antGroup.setState({"addGroupMemberModalVisible":false,"currentMemberArray":currentMemberArray});
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
        confirm({
            title: '确定要解散该群组?',
            onOk() {
                var currentGroupObj = antGroup.state.currentGroupObj;
                var memberIds = antGroup.getCurrentMemberIds();
                var optType="dissolution";
                antGroup.deleteChatGroupMember(currentGroupObj.chatGroupId,memberIds,optType);
            },
            onCancel() {
            },
        });
    },
    /**
     * 删除并退出群组
     */
    exitChatGroup(){
        confirm({
            title: '确定要退出该群组?',
            onOk() {
                var currentGroupObj = antGroup.state.currentGroupObj;
                var memberIds = sessionStorage.getItem("ident");
                var optType="exitChatGroup";
                antGroup.deleteChatGroupMember(currentGroupObj.chatGroupId,memberIds,optType);
            },
            onCancel() {
            },
        });
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
                    antGroup.refreshLocalMembers();
                    antGroup.setState({selectedRowKeysStr:'',selectedRowKeys:[]});
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
    callBackTurnToAsk(userId){
        antGroup.setState({"optType":"turnToAsk","studentId":userId,"activeKey":"我发起过的提问"});
    },

    /**
     * 学生的学习轨迹
     */
    callBackStudyTrack(userId){
        antGroup.setState({"optType":"turnStudyTrack","studentId":userId,"activeKey":"studyTrack"});
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
                        /*var liTag = <li>
                            <span onClick={antGroup.followUserPersonCenter} value={followUser.colUid}>{userName}</span><br/>
                            <span onClick={antGroup.followUserPersonCenter} value={followUser.colUid}>{courseName}</span>
                        </li>;*/
                        var userJson = {key:followUser.colUid,"userName":userName,"courseName":courseName,"userObj":followUser};
                        followsUserArray.push(userJson);
                    });
                    antGroup.setState({"optType":"getMyFollows","activeKey":"userFollows","currentFollowUser":user,"followsUserArray":followsUserArray});
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
        console.log("userId===>"+userId);
        antGroup.getPersonalCenterData(userId);
    },
    /**
     * 返回个人中心页面
     *
     */
    returnPersonCenter(){
        var userId = antGroup.state.currentFollowUser.colUid;
        antGroup.getPersonalCenterData(userId);
    },
    /**
     * 获取用户的收藏
     * @param user
     */
    callBackGetUserFavorite(user){
        console.log("favorite"+user.colUid+"=="+user.userName);
    },

    render() {
        var breadMenuTip="蚁群";
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var welcomeTitle = "欢迎"+loginUser.userName+"登录";
        var toolbarExtra = <div className="ant-tabs-right"><Button onClick={antGroup.showCreateChatGroup}>创建群聊</Button></div>;

        var returnToolBar = <div className="ant-tabs-right"><Button onClick={antGroup.returnAntGroupMainPage}>返回</Button></div>;
        var tabComponent;
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
                            <p className="group_double"　icon="usergroup-add" onClick={antGroup.getUserChatGroup}>我的群组</p>
                            <Table onRowClick={antGroup.getPersonCenterInfo} showHeader={false} scroll={{ x: true, y: 430}} columns={columns} dataSource={antGroup.state.userContactsData} pagination={false}/>
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
                                                callBackTurnToMessagePage={antGroup.turnToMessagePage}
                                                callBackTurnToAsk={antGroup.callBackTurnToAsk}
                                                callBackStudyTrack={antGroup.callBackStudyTrack}
                                                callBackGetMyFollows={antGroup.getMyFollows}
                                                callBackGetUserFavorite={antGroup.callBackGetUserFavorite}
                        ></PersonCenterComponents>
                    </div>
                </TabPane>
            </Tabs>;
        }else if(antGroup.state.optType=="sendMessage"){
            var messageTagArray=[];
            var messageList = antGroup.state.messageList;
            if(isEmpty(messageList)==false && messageList.length>0){
                messageList.forEach(function (e) {
                    var content = e.content;
                    var fromUser = e.fromUser.userName;
                    var messageType = e.messageType;
                    var messageTag;
                    if(isEmpty(messageType)==false && messageType=="getMessage"){
                        if(isEmpty(e.messageReturnJson)==false && isEmpty(e.messageReturnJson.messageType)==false){
                            if(e.messageReturnJson.messageType=="text"){
                                messageTag =  <li style={{'textAlign':'left'}}>
                                    {fromUser}：{e.content}
                                </li>;
                            }else if(e.messageReturnJson.messageType=="imgTag"){
                                messageTag =  <li style={{'textAlign':'left'}}>
                                    {fromUser}：{e.imgTagArray}
                                </li>;
                            }

                        }
                    }else{
                        messageTag =  <li style={{'textAlign':'right'}}>
                            {fromUser}：{content}
                        </li>;
                    }
                    messageTagArray.push(messageTag);
                })
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
                            <Table onRowClick={antGroup.sendGroupMessage} showHeader={false} scroll={{ x: true, y: 500 }} columns={userGroupsColumns} dataSource={antGroup.state.userGroupsData} pagination={false}/>
                        </ul>
                    </div>
                </TabPane>
            </Tabs>;
        }if(antGroup.state.optType=="showGroupInfo"){
            welcomeTitle = "群设置";
            const { loading, selectedRowKeys } = this.state;
            const rowSelection = {
                selectedRowKeys,
                onChange: this.onGroupUserTableSelectChange,
            };
            const hasSelected = selectedRowKeys.length > 0;
            var topButton = <div>
                <Button type="primary" onClick={this.showUpdateChatGroupNameModal}
                        loading={loading}
                >修改群名称</Button>
                <Button type="primary" onClick={this.showAddMembersModal}
                        loading={loading}
                >添加群成员</Button>
                <Button type="primary" onClick={this.deleteAllSelectedMembers}
                                  disabled={!hasSelected} loading={loading}
            >移除群成员</Button>
                <span style={{ marginLeft: 8 }}>{hasSelected ? `已选中 ${selectedRowKeys.length} 条记录` : ''}</span></div>;
            tabComponent = <Tabs
                hideAdd
                ref = "mainTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnToolBar}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab={welcomeTitle} key="loginWelcome" className="topics_rela">
                    <div style={{'overflow':'auto'}}>
                        <ul>
                          <img src={antGroup.state.currentGroupObj.owner.avatar} className="person_user"/>
                          <span className="person_ri_name">{antGroup.state.currentGroupObj.name}</span>
                        </ul>
                        <ul>
                            <li>群聊成员{antGroup.state.currentMemberArray.length}人</li>
                            <li>
                                {topButton}
                                <Table  style={{width:'300px'}} rowSelection={rowSelection} columns={groupUserTableColumns} dataSource={antGroup.state.currentMemberArray} scroll={{ x: true, y: 400 }} ></Table>
                            </li>
                        </ul>
                        <ul>
                            <li>群聊名称{antGroup.state.currentGroupObj.name}人</li>
                            <li>
                                <Button onClick={antGroup.dissolutionChatGroup}>解散该群</Button>
                            </li>
                        </ul>
                        <ul>
                            <li>
                                <Button onClick={antGroup.exitChatGroup}>删除并退出</Button>
                            </li>
                        </ul>
                    </div>
                </TabPane>
            </Tabs>;
        }else if(antGroup.state.optType=="sendGroupMessage"){
            returnToolBar = <div className="ant-tabs-right">
                <Button onClick={antGroup.setChatGroup} className="antnest_talk">设置</Button>
                <Button onClick={antGroup.returnAntGroupMainPage}>返回</Button>
            </div>;
            welcomeTitle=antGroup.state.currentGroupObj.name;
            var messageTagArray=[];
            var messageList = antGroup.state.messageList;
            if(isEmpty(messageList)==false && messageList.length>0){
                messageList.forEach(function (e) {
                    var content = e.content;
                    var fromUser = e.fromUser.userName;
                    var messageType = e.messageType;
                    var messageTag;
                    if(isEmpty(messageType)==false && messageType=="getMessage"){
                        if(isEmpty(e.messageReturnJson)==false && isEmpty(e.messageReturnJson.messageType)==false){
                            if(e.messageReturnJson.messageType=="text"){
                                messageTag =  <li style={{'textAlign':'left'}}>
                                    {fromUser}：{e.content}
                                </li>;
                            }else if(e.messageReturnJson.messageType=="imgTag"){
                                messageTag =  <li style={{'textAlign':'left'}}>
                                    {fromUser}：{e.imgTagArray}
                                </li>;
                            }

                        }
                    }else{
                        messageTag =  <li style={{'textAlign':'right'}}>
                            {content}：{fromUser}
                        </li>;
                    }
                    messageTagArray.push(messageTag);
                })
            }
            tabComponent = <Tabs
                hideAdd
                ref = "personGroupTab"
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
                                <Button onClick={antGroup.sendMessage}>发送</Button>
                            </Col>
                        </Row>
                    </div>
                </TabPane>
            </Tabs>;
        }else if(antGroup.state.optType=="turnToAsk"){
            var currentPageLink = "http://www.maaee.com:80/Excoord_PhoneService/quiz/getUserAskedQuiz/" + antGroup.state.studentId;
            welcomeTitle="我发起过的提问";
            tabComponent = <Tabs
                hideAdd
                ref = "studentAskTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnToolBar}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab="我发起过的提问" key="我发起过的提问">
                    <iframe ref="study" src={currentPageLink} className="analyze_iframe"></iframe>
                </TabPane>
            </Tabs>;
        }
        else if(antGroup.state.optType=="turnStudyTrack"){
            var currentPageLink = "http://www.maaee.com:80/Excoord_PhoneService/user/studytrack/" + antGroup.state.studentId;
            welcomeTitle="我的学习轨迹";
            tabComponent = <Tabs
                hideAdd
                ref = "studentStudyTrackTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnToolBar}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab="学习轨迹" key="studyTrack">
                    <iframe ref="study" src={currentPageLink} className="analyze_iframe"></iframe>
                </TabPane>
            </Tabs>;
        }else if(antGroup.state.optType=="getMyFollows"){
            welcomeTitle=antGroup.state.currentFollowUser.userName+"的关注";
            var returnPersonCenterToolBar = <div className="ant-tabs-right"><Button onClick={antGroup.returnPersonCenter}>返回</Button></div>;
            tabComponent= <Tabs
                hideAdd
                ref = "mainTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnPersonCenterToolBar}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab={welcomeTitle} key="userFollows" className="topics_rela">
                    <div>
                        <Table onRowClick={antGroup.getPersonCenterInfo} showHeader={true} scroll={{ x: true, y: 400 }} columns={followUserColumns} dataSource={antGroup.state.followsUserArray} pagination={false}/>
                    </div>
                </TabPane>
            </Tabs>;
        }

        return (
            <div>
                <Modal
                    visible={antGroup.state.createChatGroupModalVisible}
                    title="创建群组"
                    onCancel={antGroup.createChatGroupModalHandleCancel}
                    //className="modol_width"
                    transitionName=""  //禁用modal的动画效果
                    footer={[
                        <button type="primary" htmlType="submit" className="ant-btn-primary ant-btn" onClick={antGroup.createChatGroup}  >确定</button>,
                        <button type="ghost" htmlType="reset" className="ant-btn ant-btn-ghost login-form-button" onClick={antGroup.createChatGroupModalHandleCancel} >取消</button>
                    ]}
                >
                    <Row className="ant-form-item">
                        <span>群名称：</span>
                        <span>
                            <Input value={antGroup.state.chatGroupTitle} defaultValue={antGroup.state.chatGroupTitle} onChange={antGroup.chatGroupTitleOnChange}/>
                        </span>
                    </Row>
                    <Row className="ant-form-item">
                        <Col span={24}>
                            <Transfer
                                dataSource={antGroup.state.mockData}
                                showSearch
                                listStyle={{
                                    width: 268,
                                    height: 320,
                                }}
                                titles={['待选联系人','已选联系人']}
                                operations={['', '']}
                                targetKeys={antGroup.state.targetKeys}
                                onChange={antGroup.transferHandleChange}
                                render={item => `${item.title}`}
                            />
                        </Col>
                    </Row>

                </Modal>

                <Modal
                    visible={antGroup.state.updateChatGroupNameModalVisible}
                    title="修改群名称"
                    onCancel={antGroup.updateChatGroupNameModalHandleCancel}
                    //className="modol_width"
                    transitionName=""  //禁用modal的动画效果
                    footer={[
                        <button type="primary" htmlType="submit" className="login-form-button" onClick={antGroup.updateChatGroupName}  >确定</button>,
                        <button type="ghost" htmlType="reset" className="login-form-button" onClick={antGroup.updateChatGroupNameModalHandleCancel} >取消</button>
                    ]}
                >
                    <Row className="ant-form-item">
                        <Col span={3}>群名称：</Col>
                        <Col span={13}>
                            <Input value={antGroup.state.updateChatGroupTitle} defaultValue={antGroup.state.updateChatGroupTitle} onChange={antGroup.updateChatGroupTitleOnChange}/>
                        </Col>
                    </Row>
                </Modal>

                <Modal
                    visible={antGroup.state.addGroupMemberModalVisible}
                    title="添加群成员"
                    onCancel={antGroup.addGroupMemberModalHandleCancel}
                    //className="modol_width"
                    transitionName=""  //禁用modal的动画效果
                    footer={[
                        <button type="primary" htmlType="submit" className="login-form-button" onClick={antGroup.addGroupMember}  >确定</button>,
                        <button type="ghost" htmlType="reset" className="login-form-button" onClick={antGroup.addGroupMemberModalHandleCancel} >取消</button>
                    ]}
                >
                    <Row className="ant-form-item">
                        <Col span={24}>
                            <Transfer
                                dataSource={antGroup.state.memberData}
                                showSearch
                                listStyle={{
                                    width: 268,
                                    height: 320,
                                }}
                                titles={['待选联系人','已选联系人']}
                                operations={['', '']}
                                targetKeys={antGroup.state.memberTargetKeys}
                                onChange={antGroup.addMemberTransferHandleChange}
                                render={item => `${item.title}`}
                            />
                        </Col>
                    </Row>
                </Modal>

                <Breadcrumb separator=">">
                    <Breadcrumb.Item><Icon type="home" /></Breadcrumb.Item>
                    <Breadcrumb.Item href="#/MainLayout">个人中心</Breadcrumb.Item>
                    <Breadcrumb.Item href="#/MainLayout">{breadMenuTip}</Breadcrumb.Item>
                </Breadcrumb>
                {tabComponent}
            </div>
        );
    },
});

export default AntGroupTabComponents;
