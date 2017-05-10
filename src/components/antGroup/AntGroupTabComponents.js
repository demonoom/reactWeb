import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,Table,Transfer} from 'antd';
import { Menu, Dropdown,message,Pagination,Tag , Modal,Popover,Input,Collapse} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import PersonCenterComponents from './PersonCenterComponents';
import EmotionInputComponents from './EmotionInputComponents';
import UseKnowledgeComponents from '../UseKnowledgeComponents';
import Favorites from '../Favorites';
import {getPageSize} from '../../utils/Const';
import {isEmpty} from '../../utils/Const';
import {phone} from '../../utils/phone';
import {getImgName} from '../../utils/Const';
import {MsgConnection} from '../../utils/msg_websocket_connection';
import ConfirmModal from '../ConfirmModal';

const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const Panel = Collapse.Panel;

var columns = [ {
    title:'头像',
    dataIndex:'userHeadIcon'
},{
    title: '联系人',
    dataIndex: 'userContacts',
}];

var userGroupsColumns = [ {
    title: '群聊头像',
    dataIndex: 'groupPhoto',
},{
    title: '群聊名称',
    dataIndex: 'groupName',
},{
    title: '群聊人数',
    dataIndex: 'userCount',
},];

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
            isreader:true,
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
            breadcrumbVisible:true,
            totalLiveCount:0,   //直播课页面的直播课总数
            currentLivePage:1,  //直播课页面的当前页码
            currentCourseWarePage:1,    //资源页面的当前页码
            totalCourseWareCount:0,     //资源页面的资源总数
            currentSubjectPage:1,    //题目页面的当前页码
            totalSubjectCount:0,     //题目页面的资源总数
            totalChatGroupCount:0,  //当前用户的群组总数
            currentChatGroupPage:1,    //群组列表页面的当前页码
        };

    },
    /**
     * 话题tab切换响应函数
     * @param activeKey
     */
    onChange(activeKey) {
        this.setState({activeKey:activeKey});
    },

    componentWillMount(){
        ms = new MsgConnection();
        var loginUserId = sessionStorage.getItem("ident");
        var machineId = sessionStorage.getItem("machineId");
        var pro = {"command":"messagerConnect","data":{"machineType":"web","userId":Number.parseInt(loginUserId),"machine":machineId}};
        ms.connect(pro);
        antGroup.getAntGroup();
    },
    shouldComponentUpdate(){
      if(this.state.isreader){
          return true;
      }  else{
          return false;
      }
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
                    var imgTag = <div><img src={e.avatar}  className="antnest_38_img" height="38" ></img></div>;
                    var userJson = {key:userId,userContacts:userName,userObj:e,"userHeadIcon":imgTag};
                    if(userId != sessionStorage.getItem("ident")){
                        userContactsData.push(userJson);
                    }
                });
                antGroup.setState({"userContactsData":userContactsData,"optType":"getUserList","activeKey":'loginWelcome'});
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

        antGroup.turnToPersonCenter(record.userObj);
    },

    turnToPersonCenter(followUser){
        var userType = followUser.colUtype;
        if(userType=="PAREN" || userType=="EADM" || userType=="SGZH"){
            //家长直接进入聊天窗口
            //蚂蚁君点击进入后，只能接收消息，无法发送消息
            antGroup.setState({"optType":"sendMessage","currentPerson":followUser});
            antGroup.getUser2UserMessages(followUser);
        }else {
            antGroup.getPersonalCenterData(followUser.colUid);
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
        messageList.splice(0);
        ms.msgWsListener={onError:function(errorMsg){

        },onWarn:function(warnMsg){

        },onMessage:function(info){
            if(antGroup.state.optType=="sendMessage"){
                //获取messageList
                var command = info.command;

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
                                // messageList.splice(0,0,message);
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
                            var imgTagArrayReturn=[];
                            var messageReturnJson = antGroup.getImgTag(messageOfSinge.content);
                            if(messageReturnJson.messageType=="text"){
                                content=messageReturnJson.textMessage;
                            }else if(messageReturnJson.messageType=="imgTag"){
                                imgTagArrayReturn = messageReturnJson.imgMessage;
                            }
                            var messageShow={'fromUser':fromUser,'content':content,"messageType":"getMessage","imgTagArray":imgTagArrayReturn,"messageReturnJson":messageReturnJson};
                            messageList.splice(0,0,messageShow);
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

        antGroup.setState({"optType":"sendMessage","userIdOfCurrentTalk":userId,"currentUser":user});
    },

    turnToChatGroupMessagePage(groupObj){

        messageList.splice(0);
        ms.msgWsListener={onError:function(errorMsg){

        },onWarn:function(warnMsg){

        },onMessage:function(info){
            //获取messageList
            var command = info.command;

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
                                // messageList.push(message);
                                messageList.splice(0,0,message);
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
                            // messageList.splice(0,0,messageShow);
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

        antGroup.setState({"optType":"sendGroupMessage","currentGroupObj":groupObj});
    },

    getImgTag(str){
        var imgTags = [];
        var messageReturnJson={};
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
            var subStrReplace = <span className='attention_img'><img src={localUrl}/></span> ;
            imgTags.push(subStrReplace);
            var otherStr = str.substring(end+1);
            if(otherStr.indexOf("[bexp_")!=-1){
                antGroup.changeImgTextToTag(otherStr,imgTags);
            }else{
                showImg+=otherStr;
            }
            messageReturnJson={messageType:"imgTag",imgMessage:imgTags};

        }else{
            //不存在表情，为单纯性的文字消息
            messageReturnJson={messageType:"text",textMessage:str};
        }
        return messageReturnJson;
    },

    sendMessage(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var sendType = target.value;
        var messageContent = antGroup.getEmotionInputById();
        if(isEmpty(messageContent)){
            message.error("消息内容不允许为空!");
            return;
        }
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
        if(isEmpty(sendType)==false && sendType=="groupSend"){
            messageList.push(messageJson);
        }else{
            messageList.splice(0,0,messageJson);
        }
        ms.send(commandJson);
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

    getUserChatGroup(){
        antGroup.getUserChatGroupById(antGroup.state.currentChatGroupPage);
    },

    /**
     * 获取当前用户的群组
     */
    getUserChatGroupById(pageNo){
        var param = {
            "method": 'getUserChatGroup',
            "userId": sessionStorage.getItem("ident"),
            "pageNo": pageNo
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
                        var groupMemebersPhoto=[];
                        for(var i=0;i<e.members.length;i++){
                            var member = e.members[i];
                            var memberAvatarTag = <img src={member.avatar} ></img>;
                            groupMemebersPhoto.push(memberAvatarTag);
                            if(i>=3){
                                break;
                            }
                        }
                        //var imgTag = <div ><img src={ownerPhoto}  className="antnest_38_img" ></img></div>;
                        var imgTag = <div className="maaee_group_face">{groupMemebersPhoto}</div>;
                        switch (groupMemebersPhoto.length){
                            case 1:
                                imgTag = <div className="maaee_group_face1">{groupMemebersPhoto}</div>;
                                break;
                            case 2:
                                imgTag = <div className="maaee_group_face2">{groupMemebersPhoto}</div>;
                                break;
                            case 3:
                                imgTag = <div className="maaee_group_face3">{groupMemebersPhoto}</div>;
                                break;
                            case 4:
                                imgTag = <div className="maaee_group_face">{groupMemebersPhoto}</div>;
                                break;
                        }
                        var groupName = chatGroupName;
                        var chatGroupJson = {key:chatGroupId,groupPhoto:imgTag,'groupName':groupName,"groupObj":e,"userCount":membersCount+"人"};
                        charGroupArray.push(chatGroupJson);
                    });
                    antGroup.setState({"userGroupsData":charGroupArray});
                }
                var pager = ret.pager;
                antGroup.setState({"optType":"getUserChatGroup","totalChatGroupCount":parseInt(pager.rsCount)});
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
        antGroup.getChatGroupMessages(record.groupObj);
        antGroup.turnToChatGroupMessagePage(record.groupObj);
    },

    /**
     * 获取群聊天信息
     */
    getChatGroupMessages(groupObj){
        var timeNode = (new Date()).valueOf();
        var param = {
            "method": 'getChatGroupMessages',
            "chatGroupId": groupObj.chatGroupId,
            "timeNode":timeNode
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg=="调用成功" && ret.success==true){
                    ret.response.forEach(function (e) {
                        if(e.command=="message"){
                            var messageOfSinge = e;
                            var uuidsArray = [];
                            var fromUser = messageOfSinge.fromUser;
                            var colUtype = fromUser.colUtype;
                            var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
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
                                // messageList.push(message);
                                messageList.splice(0,0,message);
                            }
                            antGroup.setState({"messageList":messageList});
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
            "user1Id":userObj.colUid,
            "user2Id":sessionStorage.getItem("ident"),
            "timeNode":timeNode
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg=="调用成功" && ret.success==true){
                    ret.response.forEach(function (e) {
                        if(e.command=="message"){
                            var messageOfSinge = e;
                            var uuidsArray = [];
                            var fromUser = messageOfSinge.fromUser;
                            var colUtype = fromUser.colUtype;
                            var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
                            if(messageOfSinge.toType==1){
                                var uuid = messageOfSinge.uuid;
                                uuidsArray.push(uuid);
                                var content=messageOfSinge.content;
                                imgTagArray.splice(0);
                                showImg="";
                                var imgTagArrayReturn=[];
                                var messageReturnJson = antGroup.getImgTag(messageOfSinge.content);
                                if(messageReturnJson.messageType=="text"){
                                    content=messageReturnJson.textMessage;
                                }else if(messageReturnJson.messageType=="imgTag"){
                                    imgTagArrayReturn = messageReturnJson.imgMessage;
                                }
                                var messageShow={'fromUser':fromUser,'content':content,"messageType":"getMessage","imgTagArray":imgTagArrayReturn,"messageReturnJson":messageReturnJson};
                                messageList.push(messageShow);
                            }
                            antGroup.setState({"messageList":messageList});
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
                    var userType = e.colUtype;
                    if(userType!="SGZH" && parseInt(userId) != sessionStorage.getItem("ident")){
                        const data = {
                            key: userId,
                            title: userName,
                        };
                        mockData.push(data);
                    }
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
                    var userType = e.colUtype;
                    if(isExist==false && userType!="SGZH" && parseInt(userId) != sessionStorage.getItem("ident")){
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
            var title = antGroup.state.chatGroupTitle.trim();
            if(title.length==0){
                message.error("请输入群组名称");
                return;
            }
            if(title.length>10){
                message.error("群组名称不能超过10个字符");
                return;
            }
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
                                <Button value="groupSend" onClick={antGroup.sendMessage}>发送</Button>
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
                    <div className="person_attention favorite_pa_le" >
                        {antGroup.state.followsUserArray}
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
                        <Table columns={subjectTableColumns} dataSource={data} pagination={{ total:antGroup.state.totalSubjectCount,pageSize: getPageSize(),onChange:antGroup.onSubjectPageChange }} scroll={{ y: 400}}/>
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
                        <Pagination total={antGroup.state.totalCourseWareCount} pageSize={getPageSize()} current={antGroup.state.currentCourseWarePage} onChange={this.onCourseWareChange}/>
                    </div>
                </TabPane>
            </Tabs>;
        }else if(antGroup.state.optType=="getLiveInfoByUid"){
            welcomeTitle=antGroup.state.currentUser.userName+"的直播课";
            var returnPersonCenterBar;
            if(isVisible){
                returnPersonCenterBar = <div className="ant-tabs-right"><Button onClick={antGroup.returnPersonCenter}>返回</Button></div>;
            }
            tabComponent= <Tabs
                hideAdd
                ref = "mainTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnPersonCenterBar}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab={welcomeTitle} key="userLiveInfos" className="topics_rela ">
                    <div className='ant-tabs ant-tabs-top ant-tabs-line topics_calc favorite_pa_le' style={{'overflow':'auto'}}>
                        {antGroup.state.userLiveData}
                    </div>
					<Pagination total={antGroup.state.totalLiveCount} pageSize={getPageSize()} current={antGroup.state.currentLivePage} onChange={this.onLiveInfoPageChange}/>
                </TabPane>
            </Tabs>;
        }else if(antGroup.state.optType=="getScoreOrLevelPage"){
            var currentPageLink;
            returnPersonCenterToolBar = <div className="ant-tabs-right"><Button onClick={antGroup.callBackTurnToPlatformRulePage.bind(antGroup,antGroup.state.currentUser,"score")}>返回</Button></div>;
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
                    <div className="topics_le"><iframe ref="study" src={currentPageLink} className="analyze_iframe"></iframe></div>
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
            tabComponent = <Favorites userid={antGroup.state.studentId} breadcrumbVisible={false}  onPreview={ this.props.onPreview }></Favorites>;
        }else if(antGroup.state.optType=="getPlatformRulePage"){
            userPhoneCard=<div className="integral_top">
                <span className="integral_face">
                    <img className="person_user" src={antGroup.state.currentUser.user.avatar}></img>
                </span>
                <div className="class_right integral_name">
                    {antGroup.state.currentUser.user.userName}
                </div>
                <div className="class_right">
                    <Button onClick={antGroup.turnToScoreDetailPage} className="yellow_btn">{antGroup.state.currentUser.score}积分</Button>
                </div>
				<div className="integral_line"></div>
            </div>;
            //学生和老师的升级攻略不同
            var upgradeRaiders;
            if(antGroup.state.currentUser.user.colUtype=="STUD"){
                upgradeRaiders=<ul className="topics_le integral integral_scroll">
                    <li className="til">课中</li>
                    <li>
                        <span><Icon type="minus-circle" />逃课一次</span>
                        <span className="right_ri">-10积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />课堂练习答错一题</span>
                        <span className="right_ri">＋1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />课堂练习答对一题</span>
                        <span className="right_ri">＋3积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />被送花一次</span>
                        <span className="right_ri">＋5积分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle" />被批评一次</span>
                        <span className="right_ri">-3积分</span>
                    </li>

                    <li className="til">课下</li>
                    <li>
                        <span><Icon type="plus-circle" />评论教师话题说说（>10字/条）</span>
                        <span className="right_ri">+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />发布蚁巢内容被老师点赞一次</span>
                        <span className="right_ri">＋1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />课后作业答错一次</span>
                        <span className="right_ri">+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />课后作业答对一次</span>
                        <span className="right_ri">+3积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />看微课一个（≥70%）</span>
                        <span className="right_ri">+2积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />看PPT一个（≥70%）</span>
                        <span className="right_ri">+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />提问获教师解答（16蚁币/个）</span>
                        <span className="right_ri">+50积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />表扬一次（≤2/科/天）</span>
                        <span className="right_ri">+10积分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle" />批评一次（≤2/科/天）</span>
                        <span className="right_ri">-3积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />自主做题错一题（3个/科/天）</span>
                        <span className="right_ri">+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />自主做题对一题（3个/科/天）</span>
                        <span className="right_ri">+难度分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />用装备做错一题（3蚁币/个）</span>
                        <span className="right_ri">+2积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />用装备做对一题（同上）</span>
                        <span className="right_ri">难度分＊2积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />装备换题错一题（1蚁币/个）</span>
                        <span className="right_ri">+2积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />装备换题对一题（同上）</span>
                        <span className="right_ri">难度分＊2积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />翻倍道具做题（3蚁币/个）</span>
                        <span className="right_ri">总分翻倍</span>
                    </li>

                    <li className="til">技能</li>
                    <li>
                        <span><Icon type="plus-circle" />每个技能使用一次</span>
                        <span className="right_ri">+2积分</span>
                    </li>

                    <li className="til">斗转星移（1次/人/天）</li>
                    <li>
                        <span><Icon type="plus-circle" />使用装备不做题(1蚁币/个)</span>
                        <span className="right_ri">不扣分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle" />不用装备不做题</span>
                        <span className="right_ri">-2积分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle" />不用装备做错一题</span>
                        <span className="right_ri">-1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />不用装备做对一题</span>
                        <span className="right_ri">+难度分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />不用装备做对一题，发起人得</span>
                        <span className="right_ri">+难度分</span>
                    </li>

                    <li className="til">决斗（2蚁币/次）</li>
                    <li>
                        <span><Icon type="minus-circle" />发起人不做题</span>
                        <span className="right_ri">-使用技能所得积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />对手使用防守装备不做题</span>
                        <span className="right_ri">不扣分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle" />对手不使用防守装备不做题</span>
                        <span className="right_ri">-2积分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle" />对手不使用防守装备且做错</span>
                        <span className="right_ri">-1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />发起人做对，对手错，发起人</span>
                        <span className="right_ri">＋2倍难度分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />发起人做错，对手对，发起人</span>
                        <span className="right_ri">＋0积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />发起人做错，对手对，对手</span>
                        <span className="right_ri">＋难度分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />两人都做对</span>
                        <span className="right_ri">＋难度分/人</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />两人都做错，发起人</span>
                        <span className="right_ri">＋0积分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle" />两人都做错，对手，发起人</span>
                        <span className="right_ri">-1积分</span>
                    </li>
                    <li className="til">万箭齐发</li>
                    <li>
                        <span><Icon type="minus-circle" />发起人不做题</span>
                        <span className="right_ri">-使用技能所得积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />对手使用防守装备不做题</span>
                        <span className="right_ri">不扣分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle" />对手不使用防守装备不做题</span>
                        <span className="right_ri">-2积分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle" />对手不使用防守装备且做错</span>
                        <span className="right_ri">-1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />全班正确率&lt;30%,对手对</span>
                        <span className="right_ri">难度分+平摊扣分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />全班正确率&lt;30%，发起人</span>
                        <span className="right_ri">＋5倍难度分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />全班正确率&lt;30%，发起人</span>
                        <span className="right_ri">＋5倍难度分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />全班正确率>30%，对手对</span>
                        <span className="right_ri">＋难度分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />正确率>30%，发起人对</span>
                        <span className="right_ri">难度分＋扣分</span>
                    </li>

                </ul>;
            }else{
                upgradeRaiders=<ul className="topics_le integral ">
                    <li className="til">升级攻略</li>
                    <li>
                        <span><Icon type="plus-circle" />上传教案,每一个</span>
                        <span className="right_ri">+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />课外使用课件</span>
                        <span className="right_ri">+10积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />发布话题,分享教学资源,每一条</span>
                        <span className="right_ri">+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />学生参与此话题,并评论</span>
                        <span className="right_ri">+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />上传微课,每一个</span>
                        <span className="right_ri">+2积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />微课校内点击</span>
                        <span className="right_ri">+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />微课校外点击</span>
                        <span className="right_ri">+10积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />上传题目,每一个</span>
                        <span className="right_ri">+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />校内使用此题,每次</span>
                        <span className="right_ri">+5积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />校外使用此题,每次</span>
                        <span className="right_ri">+3积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />课后布置作业,每题</span>
                        <span className="right_ri">+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />开课一次</span>
                        <span className="right_ri">+50积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle" />在线解决学生提问</span>
                        <span className="right_ri">+20积分</span>
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
                    <ul className="topics_le integral integral_scroll">
                        <li className="til">禁言</li>
                        <li><Icon type="plus-circle" />课前蚁巢刷屏、发布不良话题或评论</li>
                        <li><Icon type="plus-circle" />视频开课弹幕刷屏或无关言论、老师可关闭弹幕</li>
                        <li className="til">视频开课被踢出课堂</li>
                        <li><Icon type="plus-circle" />视频开课中公屏或弹幕刷屏或发布不良言论、多次警告无效、可踢出课堂</li>
                        <li className="til">封号</li>
                        <li><Icon type="plus-circle" />被踢出课堂或禁言1次、封号3天</li>
                        <li><Icon type="plus-circle" />连续被踢出课堂或禁言>=2次、封号1个周</li>
                        <li><Icon type="plus-circle" />连续被踢出课堂或禁言>=5次、封号1个月</li>
                        <li><Icon type="plus-circle" />在校期间出现严重警告、违纪、盗号、不服从老师管理、故意损坏小蚂蚁设备(平板、充电柜、无线AP)等封号1个月</li>
                    </ul>
                </TabPane>
                <TabPane tab="升级攻略" key="upgradeRaiders">
                    <div>
                        {upgradeRaiders}
                    </div>
                </TabPane>
            </Tabs>;
        }

        return (
            <div>
                <ConfirmModal ref="confirmModal"
                              title="确定要移除选中的群成员?"
                              onConfirmModalCancel={antGroup.closeConfirmModal}
                              onConfirmModalOK={antGroup.deleteSelectedMember}
                ></ConfirmModal>
                <ConfirmModal ref="dissolutionChatGroupConfirmModal"
                    title="确定要解散该群组?"
                    onConfirmModalCancel={antGroup.closeDissolutionChatGroupConfirmModal}
                    onConfirmModalOK={antGroup.dissolutionChatGroup}
                ></ConfirmModal>
                <ConfirmModal ref="exitChatGroupConfirmModal"
                    title="确定要退出该群组?"
                    onConfirmModalCancel={antGroup.closeExitChatGroupConfirmModal}
                    onConfirmModalOK={antGroup.exitChatGroup}
                ></ConfirmModal>
                <ConfirmModal ref="deleteLiveVideosConfirmModal"
                              title="确定要删除该直播课?"
                              onConfirmModalCancel={antGroup.closeDeleteLiveVideosConfirmModal}
                              onConfirmModalOK={antGroup.deleteLiveVideos}
                ></ConfirmModal>

                <UseKnowledgeComponents ref="useKnowledgeComponents"></UseKnowledgeComponents>
                <Modal
                    visible={antGroup.state.createChatGroupModalVisible}
                    title="创建群组"
                    onCancel={antGroup.createChatGroupModalHandleCancel}
                    transitionName=""  //禁用modal的动画效果
                    maskClosable={false} //设置不允许点击蒙层关闭
                    footer={[
                        <button type="primary" htmlType="submit" className="ant-btn-primary ant-btn" onClick={antGroup.createChatGroup}  >确定</button>,
                        <button type="ghost" htmlType="reset" className="ant-btn ant-btn-ghost login-form-button" onClick={antGroup.createChatGroupModalHandleCancel} >取消</button>
                    ]}
                >
                    <Row className="ant-form-item">
                        <span >
                            <Input placeholder="请输入群名称" value={antGroup.state.chatGroupTitle} defaultValue={antGroup.state.chatGroupTitle} onChange={antGroup.chatGroupTitleOnChange} />
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

                <Modal className="modol_width"
                    visible={antGroup.state.updateChatGroupNameModalVisible}
                    title="修改群名称"
                    onCancel={antGroup.updateChatGroupNameModalHandleCancel}
                    transitionName=""  //禁用modal的动画效果
                    maskClosable={false} //设置不允许点击蒙层关闭
                    footer={[
                        <button type="primary" htmlType="submit" className="ant-btn ant-btn-primary ant-btn-lg" onClick={antGroup.updateChatGroupName}  >确定</button>,
                        <button type="ghost" htmlType="reset" className="ant-btn ant-btn-ghost login-form-button" onClick={antGroup.updateChatGroupNameModalHandleCancel} >取消</button>
                    ]}
                >
                    <Row className="ant-form-item">
                        <Col span={6} className="right_look">群名称：</Col>
                        <Col span={14}>
                            <Input value={antGroup.state.updateChatGroupTitle} defaultValue={antGroup.state.updateChatGroupTitle} onChange={antGroup.updateChatGroupTitleOnChange}/>
                        </Col>
                    </Row>
                </Modal>

                <Modal
                    visible={antGroup.state.addGroupMemberModalVisible}
                    title="添加群成员"
                    onCancel={antGroup.addGroupMemberModalHandleCancel}
                    transitionName=""  //禁用modal的动画效果
                    maskClosable={false} //设置不允许点击蒙层关闭
                    footer={[
                        <button type="primary" htmlType="submit" className="ant-btn ant-btn-primary ant-btn-lg" onClick={antGroup.addGroupMember}  >确定</button>,
                        <button type="ghost" htmlType="reset" className="ant-btn ant-btn-ghost login-form-button" onClick={antGroup.addGroupMemberModalHandleCancel} >取消</button>
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
			<div className="group_cont">
                    {userPhoneCard}
                    {tabComponent}
				</div>
            </div>
        );
    },
});

export default AntGroupTabComponents;
