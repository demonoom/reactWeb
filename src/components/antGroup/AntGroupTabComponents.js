import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,Table} from 'antd';
import { Menu, Dropdown,message,Pagination,Tag , Modal,Popover,Input} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import PersonCenterComponents from './PersonCenterComponents';
import EmotionInputComponents from './EmotionInputComponents';
import {getPageSize} from '../../utils/Const';
import {getLocalTime} from '../../utils/Const';
import {isEmpty} from '../../utils/Const';
import {getAllTopic} from '../../utils/Const';
import {getOnlyTeacherTopic} from '../../utils/Const';
import {MsgConnection} from '../../utils/msg_websocket_connection';
const TabPane = Tabs.TabPane;

var columns = [ {
    title: '联系人',
    dataIndex: 'userContacts',
}];
var antGroup;
var messageList=[];
//消息通信js
var ms;
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
     * 点击表格行时，获取当前行对应的记录信息
     * @param record　当前行的用户信息
     * @param index　当前行的索引顺序，从０开始
     */
    getPersonCenterInfo(record, index){
        console.log("12312"+record.userObj.userName);
        antGroup.getPersonalCenterData(record.key);
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
                antGroup.setState({"optType":"personCenter","currentPerson":userInfo});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    returnAntGroupMainPage(){
        antGroup.getAntGroup();
        antGroup.setState({"optType":"getUserList"});
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
        console.log("machineId:"+machineId);
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
                            console.log("content"+e.content);
                            var fromUser = e.fromUser;
                            var colUtype = fromUser.colUtype;
                            if("SGZH"==colUtype || fromUser.colUid==userId){
                                var uuid = e.uuid;
                                uuidsArray.push(uuid);
                                var message={'fromUser':fromUser,'content':e.content,"messageType":"getMessage"};
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
                        console.log("content"+messageOfSinge.content);
                        var fromUser = messageOfSinge.fromUser;
                        var colUtype = fromUser.colUtype;
                        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
                        if("SGZH"==colUtype || fromUser.colUid!=loginUser.colUid){
                            var uuid = messageOfSinge.uuid;
                            uuidsArray.push(uuid);
                            var messageShow={'fromUser':fromUser,'content':messageOfSinge.content,"messageType":"getMessage"};
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

    sendMessage(){
        var messageContent = antGroup.getEmotionInputById();
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var uuid = antGroup.createUUID();
        var createTime = (new Date()).valueOf();
        var messageJson={'content':messageContent,"createTime":createTime,'fromUser':loginUser,
            "toId":antGroup.state.userIdOfCurrentTalk,"command":"message","hostId":loginUser.colUid,
            "uuid":uuid,"toType":1};
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

    render() {
        var breadMenuTip="蚁群";
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var welcomeTitle = "欢迎"+loginUser.userName+"登录";
        var toolbarExtra;
        var returnToolBar = <div className="ant-tabs-right"><Button onClick={antGroup.returnAntGroupMainPage}>返回</Button></div>;
        var tabComponent;
        if(antGroup.state.optType=="getUserList"){
                tabComponent= tabComponent = <Tabs
                    hideAdd
                    ref = "mainTab"
                    activeKey={this.state.activeKey}
                    defaultActiveKey={this.state.defaultActiveKey}
                    tabBarExtraContent={toolbarExtra}
                    transitionName=""  //禁用Tabs的动画效果
                >
                    <TabPane tab={welcomeTitle} key="loginWelcome" className="topics_rela">
                        <div>
                            <Button　icon="usergroup-add">我的群组</Button>
                            <Table onRowClick={antGroup.getPersonCenterInfo} showHeader={false} scroll={{ x: true, y: 400 }} columns={columns} dataSource={antGroup.state.userContactsData} pagination={false}/>
                        </div>
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
                    <div  style={{'overflow-y':'auto','align':'center'}}>
                        <PersonCenterComponents ref="personCenter" userInfo={antGroup.state.currentPerson} callBackTurnToMessagePage={antGroup.turnToMessagePage}></PersonCenterComponents>
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
                        messageTag =  <li style={{'textAlign':'left'}}>
                            {fromUser}：{content}
                        </li>;
                    }else{
                        messageTag =  <li style={{'textAlign':'right'}}>
                            {fromUser}：{content}
                        </li>;
                    }
                    messageTagArray.push(messageTag);
                })
            }
            welcomeTitle=antGroup.state.currentPerson.user.userName;
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
                        <Card style={{height:'300px',width:'730px'}}>
                            <ul>
                                {messageTagArray}
                            </ul>
                        </Card>
                        <Row>
                            <Col span={18}>
                                <EmotionInputComponents></EmotionInputComponents>
                            </Col>
                            <Col span={4}>
                                <Button onClick={antGroup.sendMessage}>发送</Button>
                            </Col>
                        </Row>
                    </div>
                </TabPane>
            </Tabs>;
        }
        return (
            <div>
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
