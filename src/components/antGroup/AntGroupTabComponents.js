import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,Table,Transfer} from 'antd';
import { Menu, Dropdown,message,Pagination,Tag , Modal,Popover,Input,Collapse} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import PersonCenterComponents from './PersonCenterComponents';
import EmotionInputComponents from './EmotionInputComponents';
import UseKnowledgeComponents from '../UseKnowledgeComponents';
import FavoriteSubjectItems from '../FavoriteSubjectItems';
import FavItem from '../FavoriteItem';
import Favorites from '../Favorites';
import {getPageSize} from '../../utils/Const';
import {getLocalTime} from '../../utils/Const';
import {isEmpty} from '../../utils/Const';
import {getAllTopic} from '../../utils/Const';
import {getOnlyTeacherTopic} from '../../utils/Const';
import {phone} from '../../utils/phone';
import {getImgName} from '../../utils/Const';
import {MsgConnection} from '../../utils/msg_websocket_connection';
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const Panel = Collapse.Panel;

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
        title:'头像',
        dataIndex:'userHeaderIcon'
    },
    {
        title:'姓名',
        dataIndex:'userName'
    },
    {
        title:'科目',
        dataIndex:'courseName'
    }
];

var subjectTableColumns  = [{
    title: '出题人',
    className:'ant-table-selection-user',
    dataIndex: 'name',
}, {
    title: '内容',
    className:'ant-table-selection-cont',
    dataIndex: 'content',
},{
        title: '题型',
        className:'ant-table-selection-topic',
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
    },{
        title: '分值',
        className:'ant-table-selection-score',
        dataIndex: 'subjectScore',
    }, {
        title: '操作',
        className:'ant-table-selection-score3',
        dataIndex: 'subjectOpt',
    },
];

var subjectList=[];
var antGroup;
var messageList=[];
//消息通信js
var ms;
var imgTagArray = [];
var showImg="";
var showContent="";//将要显示的内容
var data = [];
var courseWareList;
var activeKey = new Array();
var coursePanelChildren;
var liveInfosPanelChildren;
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
            breadcrumbVisible:true
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

        if(userType=="PAREN" || userType=="EADM" || userType=="SGZH"){
            //家长直接进入聊天窗口
            //蚂蚁君点击进入后，只能接收消息，无法发送消息
            antGroup.setState({"optType":"sendMessage","currentPerson":record.userObj});
            antGroup.turnToMessagePage(record.userObj);
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
    /**
     * 返回系统联系人的主页面
     */
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
    /**
     * 进入收发消息的窗口
     * @param user
     */
    turnToMessagePage(user){
        var userId = user.colUid;
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
        antGroup.setState({"optType":"sendMessage","userIdOfCurrentTalk":userId,"currentUser":user});
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
        antGroup.turnToChatGroupMessagePage(record.groupObj);
    },

    /**
     * 返回当前聊天群组窗口页面（对应tab组件工具栏上的返回按钮）
     */
    returnToChatGroupMessagePage(){
        var currentGroupObj = antGroup.state.currentGroupObj;
        antGroup.turnToChatGroupMessagePage(currentGroupObj);
    },

    /**
     * 显示创建群组的窗口
     */
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
                var userJson = {key:memberId,groupUser:memberName,userInfo:e};
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
    deleteSelectedMember(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var memberIds = target.value;
        confirm({
            title: '确定要移除选中的群成员?',
            onOk() {
                var currentGroupObj = antGroup.state.currentGroupObj;
                // var memberIds = antGroup.state.selectedRowKeysStr;
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
    refreshLocalMembers(memberIds){
        var currentMemberArray = antGroup.state.currentMemberArray;
        //var selectedRowKeys = antGroup.state.selectedRowKeys;
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
                        followsUserArray.push(userJson);
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
        antGroup.setState({"currentUser":user});
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
                        var userId = e.user.colUid;
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
                        antGroup.setState({totalCount:parseInt(pager.rsCount),"optType":"getUserSubjects","activeKey":'userSubjects'});
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
        antGroup.setState({"currentUser":user});
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
                response.forEach(function (e) {
                    var id = e.id;
                    var fileName = e.name;
                    //用户编号，用来判断当前的课件是否是自己上传的，如果是，则支持删除功能
                    var userId = e.userId;
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
                antGroup.setState({courseListState:courseWareList,"optType":"getUserCourseWares","activeKey":'userCourseWares'});
                var pager = ret.pager;
                antGroup.setState({totalCount:parseInt(pager.rsCount)});
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
                                <a href={e[3]} target="_blank" title="下载" download={e[3]} style={{ float:'right'}}><Button icon="download"/></a>
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

    callBackGetLiveInfo(user){
        antGroup.getLiveInfoByUid(user.colUid,1);
        antGroup.setState({"currentUser":user});
    },
    /**
     * 根据用户的id，获取当前用户的直播课
     * @param userId
     * @param pageNo
     */
    getLiveInfoByUid(userId,pageNo){
        var param = {
            "method": 'getLiveInfoByUid',
            "userId": userId,
            "pageNo": pageNo,
        };
        var userLiveData=[];
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg=="调用成功" && ret.success==true){
                    var response = ret.response;
                    response.forEach(function (e) {
                        var liveCover = e.liveCover;
                        var cover = liveCover.cover;
                        var liveVideos = e.liveVideos;
                        var schoolName = e.schoolName;
                        var startTime = antGroup.getLocalTime(e.startTime);
                        var title = e.title;
                        var user = e.user;
                        var userName = user.userName;
                        var courseName = e.courseName;
                        var password = e.password;
                        var id = e.id;
                        var keyIcon;
                        if(isEmpty(password)==false){
                            keyIcon = <Icon type="key" />;
                        }
                        var liveCard = <Card style={{ width: 200 }} bodyStyle={{ padding: 0 }}>
                            <div className="custom-image">
                                <img id={id} onClick={antGroup.turnToLiveInfoShowPage} alt="example" width="100%" src={cover} />
                            </div>
                            <div className="custom-card" value={id} onClick={antGroup.turnToLiveInfoShowPage}>
                                <h3>{title}</h3>
                                <ul>
                                    <li>
                                        <img style={{width:'30px',height:'30px'}} src={user.avatar}></img>
                                        <p>{userName}</p>
                                        <p>{startTime}</p>
                                    </li>
                                    <li>
                                        <p>{schoolName}</p>
                                        <p>{courseName}</p>
                                        <Icon type="lock" />
                                    </li>
                                </ul>
                            </div>
                        </Card>;
                        userLiveData.push(liveCard);
                    });
                }
                antGroup.setState({"userLiveData":userLiveData,"optType":"getLiveInfoByUid","activeKey":"userLiveInfos"});
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
        // navigator.setUserAgent("Mozilla/5.0 (Linux; U; Android %s) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1");
        antGroup.setState({"optType":"turnToLiveInfoShowPage","activeKey":"turnToLiveInfoShowPage","liveInfoId":liveInfoId});
    },

    /**
     * 获取用户的收藏
     * @param user
     */
    callBackGetUserFavorite(user){
        antGroup.setState({"optType":"userFavorite","studentId":user.colUid,"activeKey":"1"});
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
                                messageTag =  <li style={{'textAlign':'left'}}>
								    <div className="u-name"><span>{fromUser}</span></div>
                                    <div className="talk-cont"><span className="name "  >{userPhoneIcon}</span><span className="borderballoon_le">{e.content}</span></div>
                                </li>;
                            }else if(e.messageReturnJson.messageType=="imgTag"){
                                messageTag =  <li style={{'textAlign':'left'}}>
								<div className="u-name"><span>{fromUser}</span></div>
                                <div className="talk-cont"><span className="name " >{userPhoneIcon}</span><span  className="borderballoon_le ">{e.imgTagArray}</span></div>
                                </li>;
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
            var topButton;
            var dissolutionChatGroupButton;
            if(antGroup.state.currentGroupObj.owner.colUid==sessionStorage.getItem("ident")){
                topButton = <div>
                    <Button type="primary" onClick={this.showUpdateChatGroupNameModal}
                            loading={loading}
                    >修改群名称</Button>
                    <Button type="primary" onClick={this.showAddMembersModal}
                            loading={loading}
                    >添加群成员</Button>
                    {/*<Button type="primary" onClick={this.deleteAllSelectedMembers}
                     disabled={!hasSelected} loading={loading}
                     >移除群成员</Button>
                     <span style={{ marginLeft: 8 }}>{hasSelected ? `已选中 ${selectedRowKeys.length} 条记录` : ''}</span>*/}
                </div>;
                dissolutionChatGroupButton = <Button onClick={antGroup.dissolutionChatGroup}>解散该群</Button>;
            }else{
                topButton = <div>
                    <Button type="primary" onClick={this.showAddMembersModal}
                            loading={loading}
                    >添加群成员</Button>
                </div>;
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
                    userHeaderIcon=<img src={require('../images/maaee_face.png')}></img>;
                }
                var liTag = <li>
                        <span>{userHeaderIcon}{groupUser}</span>
                        <span><Button　value={memberId} onClick={antGroup.deleteSelectedMember}>移出群聊</Button></span>
                    </li>;
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
                    <div style={{'overflow':'auto'}}>
                        <ul>
                          <img src={antGroup.state.currentGroupObj.owner.avatar} className="person_user"/>
                          <span className="person_ri_name">{antGroup.state.currentGroupObj.name}</span>
                        </ul>
                        <ul>
                            <li>群聊成员{antGroup.state.currentMemberArray.length}人</li>
                            <li>
                                {topButton}
                                {memberLiTag}
                                {/*<Table  style={{width:'300px'}} rowSelection={rowSelection} columns={groupUserTableColumns} dataSource={antGroup.state.currentMemberArray} scroll={{ x: true, y: 400 }} ></Table>*/}
                            </li>
                        </ul>
                        <ul>
                            <li>群聊名称{antGroup.state.currentGroupObj.name}人</li>
                            <li>
                                {dissolutionChatGroupButton}
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
                                messageTag =  <li style={{'textAlign':'left'}}>
								    <div className="u-name"><span>{fromUser}</span></div>
                                    <div className="talk-cont"><span >{userPhoneIcon}</span><span className="borderballoon_le">{e.content}</span></div>
                                </li>;
                            }else if(e.messageReturnJson.messageType=="imgTag"){
                                messageTag =  <li style={{'textAlign':'left'}}>
								 <div className="u-name"><span>{fromUser}</span></div>
								 <div className="talk-cont"><span >{userPhoneIcon}</span><span className="borderballoon_le">{e.imgTagArray}</span></div>
                                </li>;
                            }

                        }
                    }else{
                        messageTag =  <li className="right" style={{'textAlign':'right'}}>
						<div className="u-name"><span>{fromUser}</span></div>
						<div className="talk-cont"><span className="name">{userPhoneIcon}</span><span className="borderballoon">{content}</span></div>
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
            var currentPageLink = "http://www.maaee.com:80/Excoord_PhoneService/quiz/getUserAskedQuiz/" + antGroup.state.currentUser.colUid;
            welcomeTitle="我发起过的提问";
            tabComponent = <Tabs
                hideAdd
                ref = "studentAskTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnPersonCenterToolBar}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab="我发起过的提问" key="我发起过的提问">
                    <iframe ref="study" src={currentPageLink} className="analyze_iframe"></iframe>
                </TabPane>
            </Tabs>;
        }
        else if(antGroup.state.optType=="turnStudyTrack"){
            var currentPageLink = "http://www.maaee.com:80/Excoord_PhoneService/user/studytrack/" + antGroup.state.currentUser.colUid;
            welcomeTitle="我的学习轨迹";
            tabComponent = <Tabs
                hideAdd
                ref = "studentStudyTrackTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnPersonCenterToolBar}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab="学习轨迹" key="studyTrack">
                    <iframe ref="study" src={currentPageLink} className="analyze_iframe"></iframe>
                </TabPane>
            </Tabs>;
        }else if(antGroup.state.optType=="getMyFollows"){
            welcomeTitle=antGroup.state.currentUser.userName+"的关注";
            tabComponent= <Tabs
                hideAdd
                ref = "mainTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnPersonCenterToolBar}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab={welcomeTitle} key="userFollows" className="topics_rela">
                    <div className="person_attention">
                        <Table onRowClick={antGroup.getPersonCenterInfo} showHeader={true} scroll={{ x: true, y: 400 }} columns={followUserColumns} dataSource={antGroup.state.followsUserArray} pagination={false}/>
                    </div>
                </TabPane>
            </Tabs>;
        }else if(antGroup.state.optType=="getUserSubjects"){
            welcomeTitle=antGroup.state.currentUser.userName+"的题目";
            var returnPersonCenterToolBar = <div className="ant-tabs-right"><Button onClick={antGroup.returnPersonCenter}>返回</Button></div>;
            tabComponent= <Tabs
                hideAdd
                ref = "mainTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnPersonCenterToolBar}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab={welcomeTitle} key="userSubjects" className="topics_rela">
                    <div>
                        <Table columns={subjectTableColumns} dataSource={data} pagination={{ total:antGroup.state.totalCount,pageSize: getPageSize(),onChange:antGroup.pageOnChange }} scroll={{ y: 400}}/>
                    </div>
                </TabPane>
            </Tabs>;
        }else if(antGroup.state.optType=="getUserCourseWares"){
            welcomeTitle=antGroup.state.currentUser.userName+"的资源";
            var returnPersonCenterToolBar = <div className="ant-tabs-right"><Button onClick={antGroup.returnPersonCenter}>返回</Button></div>;
            tabComponent= <Tabs
                hideAdd
                ref = "mainTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnPersonCenterToolBar}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab={welcomeTitle} key="userCourseWares" className="topics_rela">
                    <div className='ant-tabs ant-tabs-top ant-tabs-line'>
                        <div className='ant-tabs-tabpane ant-tabs-tabpane-active'>
                            <Collapse defaultActiveKey={activeKey} activeKey={activeKey} ref="collapse">
                                {coursePanelChildren}
                            </Collapse>
                        </div>
                        <Pagination total={antGroup.state.totalCount} pageSize={getPageSize()} current={antGroup.state.currentPage} onChange={this.onChange}/>
                    </div>
                </TabPane>
            </Tabs>;
        }else if(antGroup.state.optType=="getLiveInfoByUid"){
            welcomeTitle=antGroup.state.currentUser.userName+"的直播课";
            var returnPersonCenterToolBar = <div className="ant-tabs-right"><Button onClick={antGroup.returnPersonCenter}>返回</Button></div>;
            tabComponent= <Tabs
                hideAdd
                ref = "mainTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnPersonCenterToolBar}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab={welcomeTitle} key="userLiveInfos" className="topics_rela">
                    <div className='ant-tabs ant-tabs-top ant-tabs-line' style={{'overflow':'auto'}}>
                        {antGroup.state.userLiveData}
                        <Pagination total={antGroup.state.totalCount} pageSize={getPageSize()} current={antGroup.state.currentPage} onChange={this.onChange}/>
                    </div>
                </TabPane>
            </Tabs>;
        }else if(antGroup.state.optType=="getScoreOrLevelPage"){
            var currentPageLink;
            if(antGroup.state.urlType=="score"){
                currentPageLink = "http://www.maaee.com:80/Excoord_PhoneService/user/getUserScores/" + antGroup.state.currentUser.user.colUid;
            }else{
                currentPageLink = "http://www.maaee.com:80/Excoord_PhoneService/user/personalGrade/" + antGroup.state.currentUser.user.colUid;
            }

            welcomeTitle="我的积分";
            tabComponent = <Tabs
                hideAdd
                ref = "studentStudyTrackTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnPersonCenterToolBar}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab="我的积分" key="userScores">
                    <iframe ref="study" src={currentPageLink} className="analyze_iframe"></iframe>
                </TabPane>
            </Tabs>;
        }else if(antGroup.state.optType=="turnToLiveInfoShowPage"){
            var currentPageLink = "http://www.maaee.com:80/Excoord_PC/liveinfo/show/" + sessionStorage.getItem("ident")+"/"+antGroup.state.liveInfoId;
            var liveInfoShowIframe = <iframe id="liveInfoIframe" ref="study" src={currentPageLink} className="analyze_iframe"></iframe>;
            tabComponent = <Tabs
                hideAdd
                ref = "studentStudyTrackTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnToolBar}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab="直播课" key="turnToLiveInfoShowPage">
                    {liveInfoShowIframe}
                </TabPane>
            </Tabs>;
        }else if(antGroup.state.optType=="userFavorite"){
            tabComponent = <Favorites userid={antGroup.state.studentId} breadcrumbVisible={false}></Favorites>;
        }else if(antGroup.state.optType=="getPlatformRulePage"){
            userPhoneCard=<div>
                <span>
                    <img style={{width:'100px',height:'100px'}} src={antGroup.state.currentUser.user.avatar}></img>
                </span>
                <span>
                    {antGroup.state.currentUser.user.userName}
                </span>
                <span>
                    <Button onClick={antGroup.turnToScoreDetailPage}>{antGroup.state.currentUser.score}积分</Button>
                </span>
            </div>;
            //学生和老师的升级攻略不同
            var upgradeRaiders;
            if(antGroup.state.currentUser.user.colUtype=="STUD"){
                upgradeRaiders=<ul>
                    <li>课中</li>
                    <li>
                        <span><Icon type="minus-circle-o" />逃课一次</span>
                        <span style={{align:'right'}}>-10积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />课堂练习答错一题</span>
                        <span style={{align:'right'}}>＋1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />课堂练习答对一题</span>
                        <span style={{align:'right'}}>＋3积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />被送花一次</span>
                        <span style={{align:'right'}}>＋5积分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle-o" />被批评一次</span>
                        <span style={{align:'right'}}>-3积分</span>
                    </li>

                    <li>课下</li>
                    <li>
                        <span><Icon type="plus-circle-o" />评论教师话题说说（>10字/条）</span>
                        <span style={{align:'right'}}>+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />发布蚁巢内容被老师点赞一次</span>
                        <span style={{align:'right'}}>＋1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />课后作业答错一次</span>
                        <span style={{align:'right'}}>+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />课后作业答对一次</span>
                        <span style={{align:'right'}}>+3积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />看微课一个（≥70%）</span>
                        <span style={{align:'right'}}>+2积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />看PPT一个（≥70%）</span>
                        <span style={{align:'right'}}>+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />提问获教师解答（16蚁币/个）</span>
                        <span style={{align:'right'}}>+50积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />表扬一次（≤2/科/天）</span>
                        <span style={{align:'right'}}>+10积分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle-o" />批评一次（≤2/科/天）</span>
                        <span style={{align:'right'}}>-3积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />自主做题错一题（3个/科/天）</span>
                        <span style={{align:'right'}}>+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />自主做题对一题（3个/科/天）</span>
                        <span style={{align:'right'}}>+难度分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />用装备做错一题（3蚁币/个）</span>
                        <span style={{align:'right'}}>+2积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />用装备做对一题（同上）</span>
                        <span style={{align:'right'}}>难度分＊2积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />装备换题错一题（1蚁币/个）</span>
                        <span style={{align:'right'}}>+2积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />装备换题对一题（同上）</span>
                        <span style={{align:'right'}}>难度分＊2积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />翻倍道具做题（3蚁币/个）</span>
                        <span style={{align:'right'}}>总分翻倍</span>
                    </li>

                    <li>技能</li>
                    <li>
                        <span><Icon type="plus-circle-o" />每个技能使用一次</span>
                        <span style={{align:'right'}}>+2积分</span>
                    </li>

                    <li>斗转星移（1次/人/天）</li>
                    <li>
                        <span><Icon type="plus-circle-o" />使用装备不做题(1蚁币/个)</span>
                        <span style={{align:'right'}}>不扣分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle-o" />不用装备不做题</span>
                        <span style={{align:'right'}}>-2积分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle-o" />不用装备做错一题</span>
                        <span style={{align:'right'}}>-1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />不用装备做对一题</span>
                        <span style={{align:'right'}}>+难度分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />不用装备做对一题，发起人得</span>
                        <span style={{align:'right'}}>+难度分</span>
                    </li>

                    <li>决斗（2蚁币/次）</li>
                    <li>
                        <span><Icon type="minus-circle-o" />发起人不做题</span>
                        <span style={{align:'right'}}>-使用技能所得积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />对手使用防守装备不做题</span>
                        <span style={{align:'right'}}>不扣分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle-o" />对手不使用防守装备不做题</span>
                        <span style={{align:'right'}}>-2积分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle-o" />对手不使用防守装备且做错</span>
                        <span style={{align:'right'}}>-1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />发起人做对，对手错，发起人</span>
                        <span style={{align:'right'}}>＋2倍难度分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />发起人做错，对手对，发起人</span>
                        <span style={{align:'right'}}>＋0积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />发起人做错，对手对，对手</span>
                        <span style={{align:'right'}}>＋难度分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />两人都做对</span>
                        <span style={{align:'right'}}>＋难度分/人</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />两人都做错，发起人</span>
                        <span style={{align:'right'}}>＋0积分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle-o" />两人都做错，对手，发起人</span>
                        <span style={{align:'right'}}>-1积分</span>
                    </li>
                    <li>万箭齐发</li>
                    <li>
                        <span><Icon type="minus-circle-o" />发起人不做题</span>
                        <span style={{align:'right'}}>-使用技能所得积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />对手使用防守装备不做题</span>
                        <span style={{align:'right'}}>不扣分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle-o" />对手不使用防守装备不做题</span>
                        <span style={{align:'right'}}>-2积分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle-o" />对手不使用防守装备且做错</span>
                        <span style={{align:'right'}}>-1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />全班正确率&lt;30%,对手对</span>
                        <span style={{align:'right'}}>难度分+平摊扣分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />全班正确率&lt;30%，发起人</span>
                        <span style={{align:'right'}}>＋5倍难度分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />全班正确率&lt;30%，发起人</span>
                        <span style={{align:'right'}}>＋5倍难度分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />全班正确率>30%，对手对</span>
                        <span style={{align:'right'}}>＋难度分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />正确率>30%，发起人对</span>
                        <span style={{align:'right'}}>难度分＋扣分</span>
                    </li>

                </ul>;
            }else{
                upgradeRaiders=<ul>
                    <li>升级攻略</li>
                    <li>
                        <span><Icon type="plus-circle-o" />上传教案,每一个</span>
                        <span style={{align:'right'}}>+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />课外使用课件</span>
                        <span style={{align:'right'}}>+10积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />发布话题,分享教学资源,每一条</span>
                        <span style={{align:'right'}}>+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />学生参与此话题,并评论</span>
                        <span style={{align:'right'}}>+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />上传微课,每一个</span>
                        <span style={{align:'right'}}>+2积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />微课校内点击</span>
                        <span style={{align:'right'}}>+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />微课校外点击</span>
                        <span style={{align:'right'}}>+10积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />上传题目,每一个</span>
                        <span style={{align:'right'}}>+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />校内使用此题,每次</span>
                        <span style={{align:'right'}}>+5积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />校外使用此题,每次</span>
                        <span style={{align:'right'}}>+3积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />课后布置作业,每题</span>
                        <span style={{align:'right'}}>+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />开课一次</span>
                        <span style={{align:'right'}}>+50积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle-o" />在线解决学生提问</span>
                        <span style={{align:'right'}}>+20积分</span>
                    </li>
                </ul>;
            }

            tabComponent = <Tabs
                hideAdd
                ref = "studentStudyTrackTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnPersonCenterToolBar}
                transitionName=""  //禁用Tabs的动画效果
                onChange={antGroup.platformRulePageChange}
            >
                <TabPane tab="平台规则" key="platformRulePage">
                    <ul>
                        <li>禁言</li>
                        <li><Icon type="plus-circle-o" />课前蚁巢刷屏、发布不良话题或评论</li>
                        <li><Icon type="plus-circle-o" />视频开课弹幕刷屏或无关言论、老师可关闭弹幕</li>
                        <li>视频开课被踢出课堂</li>
                        <li><Icon type="plus-circle-o" />视频开课中公屏或弹幕刷屏或发布不良言论、多次警告无效、可踢出课堂</li>
                        <li>封号</li>
                        <li><Icon type="plus-circle-o" />被踢出课堂或禁言1次、封号3天</li>
                        <li><Icon type="plus-circle-o" />连续被踢出课堂或禁言>=2次、封号1个周</li>
                        <li><Icon type="plus-circle-o" />连续被踢出课堂或禁言>=5次、封号1个月</li>
                        <li><Icon type="plus-circle-o" />在校期间出现严重警告、违纪、盗号、不服从老师管理、故意损坏小蚂蚁设备(平板、充电柜、无线AP)等封号1个月</li>
                    </ul>
                </TabPane>
                <TabPane tab="升级攻略" key="upgradeRaiders">
                    <div style={{'overflow':'auto'}}>
                        {upgradeRaiders}
                    </div>
                </TabPane>
            </Tabs>;
        }

        var breadCrumb;
        var isVisible=false;
        if(isEmpty(antGroup.props.breadcrumbVisible)==false){
            isVisible=antGroup.props.breadcrumbVisible;
        }else{
            isVisible=antGroup.state.breadcrumbVisible;
        }
        if(isVisible){
           breadCrumb = <Breadcrumb separator=">">
               <Breadcrumb.Item><Icon type="home" /></Breadcrumb.Item>
               <Breadcrumb.Item href="#/MainLayout">个人中心</Breadcrumb.Item>
               <Breadcrumb.Item href="#/MainLayout">{breadMenuTip}</Breadcrumb.Item>
           </Breadcrumb>;
        }

        return (
            <div>
                <UseKnowledgeComponents ref="useKnowledgeComponents"></UseKnowledgeComponents>
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

                {breadCrumb}
                {userPhoneCard}
                {tabComponent}
            </div>
        );
    },
});

export default AntGroupTabComponents;
