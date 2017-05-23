import React from  'react';
import {Menu, Icon, Row, Col} from 'antd';
import MainTabComponents from '../components/MainTabComponents';
import HeaderComponents from '../components/HeaderComponents';
import UserFace from '../components/UserCardModalComponents';
import FloatButton  from '../components/FloatButton';

import StudentPersonCenterMenu from '../components/layOut/StudentPersonCenterMenu';
import StudentPersonCenter  from '../components/studentComponents/StudentPersonCenter';
import moment from 'moment';
import AntNestTabComponents from '../components/antNest/AntNestTabComponents';
import AntGroupTabComponents from '../components/antGroup/AntGroupTabComponents';
import MessageMenu from '../components/layOut/MessageMenu';
import AntGroupMenu from '../components/layOut/AntGroupMenu';
import AntNestMenu from '../components/layOut/AntNestMenu';
import PersonCenterComponents from '../components/antGroup/PersonCenterComponents';
import {LocaleProvider} from 'antd';
import TeachSpace  from '../components/TeachSpaces';
import TeachSpaceGhostMenu from '../components/TeachSpacesGhostMenu';
import {MsgConnection} from '../utils/msg_websocket_connection';
// 推荐在入口文件全局设置 locale
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
import {createStore} from 'redux';
import LiveTV from "../components/LiveTV/LiveTV";


const store = createStore(function () {

});
//消息通信js
var ms;

const StudentMainLayout = React.createClass({
    proxyObj: null,
    getInitialState() {
        return {
            collapse: true,
            ghostMenuVisible: true,
            activeMiddleMenu: '',
            personCenterParams: '',
            currentKey: 'classRoom',
            openKeysStr: '',
            locale: 'zh-cn',
            resouceType: 'C',
            ifr: {},
        };
        this.changeGhostMenuVisible = this.changeGhostMenuVisible.bind(this)
    },


    onCollapseChange() {
        this.setState({
            collapse: !this.state.collapse,
        })
    },
    toolbarClick: function (e) {


        if ('teachSpace' == e.key) {

            if (e.key == this.state.currentKey) {
                this.changeGhostMenuVisible();
            } else {
                this.setState({currentKey: e.key, resouceType: 'B'});
            }
            return;
        }
        if ('classRoom' == e.key) {
            this.setState({currentKey: e.key, resouceType: 'C'});
            return;
        }

        this.setState({currentKey: e.key, resouceType: ''});

        if (e.key != "KnowledgeResources") {
            var breadcrumbArray = [{hrefLink: '#/MainLayout', hrefText: "首页"}];
            if (this.refs.mainTabComponents) {
                this.refs.mainTabComponents.buildBreadcrumb(breadcrumbArray, 0);
            }
        }
    },


    // 不用了
    //获取备课计划下的课件资源
    getTeachPlans: function (optContent, breadCrumbArray) {
        //点击的菜单标识：teachScheduleId
        if (optContent == null) {
            if (this.refs.mainTabComponents) {
                this.refs.mainTabComponents.buildBreadcrumb(breadCrumbArray);
            }
        } else {

            var optContentArray = optContent.split("#");
            var childrenCount = optContentArray[3];
            //lastClickMenuChildrenCount = childrenCount;
            sessionStorage.setItem("lastClickMenuChildrenCount", childrenCount);
            if (optContentArray[1] != "bySubjectId") {
                var breadcrumbArray = [{hrefLink: '#/MainLayout', hrefText: "首页"}];
                if (this.refs.mainTabComponents) {
                    this.refs.mainTabComponents.buildBreadcrumb(breadcrumbArray);
                }
            }

            if (this.refs.mainTabComponents) {
                this.refs.mainTabComponents.buildBreadcrumb(breadCrumbArray, childrenCount);

            }
            if (this.refs.mainTabComponents) {
                this.refs.mainTabComponents.getTeachPlans(optContent);
            }
        }
    },

    componentWillMount(){
        var userIdent = sessionStorage.getItem("ident");
        if (userIdent == null || userIdent == "") {
            location.hash = "login";
        }
        ms = new MsgConnection();
        var loginUserId = sessionStorage.getItem("ident");
        var machineId = sessionStorage.getItem("machineId");
        var password = sessionStorage.getItem("loginPassword");
        var pro = {
            "command": "messagerConnect",
            "data": {
                "machineType": "web",
                "userId": Number.parseInt(loginUserId),
                "machine": machineId,
                "password": password,
                "version": 0.1
            }
        };
        ms.connect(pro);
    },
    // 不用了
    // 呼叫本组件中的实例任何方法 dapeng
    componentDidUpdate(){
        if (this.autoeventparam) {
            // ['antGroupTabComponents', 'param', 'antGroupTabComponents'],
            let param = this.autoeventparam.linkpart.shift();
            if (param[2]) {
                let param = this.autoeventparam;
                let componentPart = this.refs[param[2]];
                componentPart[param[0]](param[1], param);
            }

            this.autoeventparam = null;
        } else {
            let obj = this.proxyObj;
            if (!obj) return;

            this.refs[obj.ref][obj.methond].call(this.refs[obj.ref], obj.param);
            this.proxyObj = null;
        }
    },


    //获取试卷列表
    getExamPagerList: function (optType) {
        this.refs.examPagerTabComponents.getExamPagerList();
    },

    getStudyEvaluate: function (optType) {
        this.refs.studyEvaluateTabComponents.getStudyEvaluate();
    },

    callBackKnowledgeMenuBuildBreadCrume(menuText, menuLevel, menuId, openKeysStr){
        return this.refs.knowledgeMenuComponents.bulidBreadCrumbArray(menuText, menuLevel, menuId, openKeysStr);

    },

    getStudentResource(params){

        this.setState({resouceType: '', currentKey: "personCenter", personCenterParams: params});
    },


    getAntNest(optType){
        var pageNo;
        if ("getAllTopic" == optType) {
            this.refs.antNestTabComponents.getTopics(pageNo, 0);
        } else {
            this.refs.antNestTabComponents.getTopics(pageNo, 1);
        }
    },
    teachSpaceTab(activeMenu, beActive){

        // 2
        this.changeGhostMenuVisible({visible: false, beActive: beActive});
        this.setState({activeMiddleMenu: activeMenu});
    },

    changeGhostMenuVisible(obj){


        if (obj) {
            if (!obj.beActive) return;
            this.setState({ghostMenuVisible: obj.visible});
        } else {

            let visible = !this.state.ghostMenuVisible;
            this.setState({ghostMenuVisible: visible});
        }
    },


    /**
     * 获取个人中心需要的数据,老师和学生可通用,后期需要什么再添加
     */
    getPersonalCenterData(userId){
        this.refs.personCenterComponents.getPersonalCenterData(userId);
    },

    setFirstPerson(userContactsData){
        var userJson = userContactsData[0];
        this.setState({"userContactsData": userContactsData});
        this.getPersonalCenterData(userJson.userObj.colUid);
    },

    getGroupInfo(){
        this.refs.personCenterComponents.getUserChatGroup();
    },
    /**
     * 回调发送群组消息
     * @param groupObj
     */
    sendGroupMessage(groupObj){
        var contentJson = {"content": '', "createTime": ''};
        var contentArray = [contentJson];
        var userJson = {
            key: groupObj.chatGroupId,
            "fromUser": groupObj,
            contentArray: contentArray,
            "messageToType": 4,
            "toChatGroup": groupObj
        };
        this.setState({
            currentKey: 'message',
            resouceType: '',
            "groupObj": groupObj,
            "messageType": 'groupMessage',
            "actionFrom": "personCenterGroupList",
            userJson
        });
    },

    /**
     * 好友对好友的消息发送
     */
    sendMessage(userInfo){
        var contentJson = {"content": '', "createTime": ''};
        var contentArray = [contentJson];
        var userJson = {
            key: userInfo.user.colUid,
            "fromUser": userInfo.user,
            contentArray: contentArray,
            "messageToType": 1
        };
        this.setState({
            currentKey: 'message',
            resouceType: '',
            "userInfo": userInfo.user,
            "messageType": 'message',
            "actionFrom": "personCenter",
            userJson
        });
    },

    /**
     * 好友对好友的消息发送
     */
    receiveNewMessage(userJson){
        this.setState({
            currentKey: 'message',
            resouceType: '',
            "userInfo": userJson.fromUser,
            "messageType": 'message',
            "actionFrom": "backgroudMessage",
            "userJson": userJson
        });
    },

    /**
     * 点击消息动态联系人列表时，进入消息列表
     * 根据当前点击的消息对象不同，分别进入个人消息和群组消息界面
     * @param fromObj
     */
    turnToMessagePage(fromObj){
        var timeNode = (new Date()).valueOf();
        if (fromObj.messageType == 1) {
            // 个人消息
            this.refs.antGroupTabComponents.getPersonMessage(fromObj.fromUser, timeNode);
        } else {
            // 群组消息
            this.refs.antGroupTabComponents.sendGroupMessage(fromObj.toChatGroup, timeNode);
        }

    },

    render() {

        const collapse = this.state.collapse;
        //根据如下判断结果，完成对页面中部位置的渲染，不同情况，渲染不同组件
        var middleComponent;
        var mainContent;
        var tabComponent;

        switch (this.state.currentKey) {
            default:
                tabComponent = <MainTabComponents ref="mainTabComponents"/>;
            case 'message':
                //消息动态
                middleComponent = <MessageMenu onUserClick={this.turnToMessagePage}
                                               userJson={this.state.userJson}
                                               onLoad={this.turnToMessagePage}/>;
                tabComponent = <AntGroupTabComponents ref="antGroupTabComponents"
                                                      userInfo={this.state.userInfo}
                                                      groupObj={this.state.groupObj}
                                                      actionFrom={this.state.actionFrom}
                                                      messageType={this.state.messageType}
                                                      messageUtilObj={ms}
                                                      onNewMessage={this.receiveNewMessage}
                />;
                break;
            case 'antGroup':
                //蚁群
                middleComponent = <AntGroupMenu ref="antGroupMenu" callbackSetFirstPerson={this.setFirstPerson}
                                                callbackPersonCenterData={this.getPersonalCenterData}
                                                callbackGetGroupInfo={this.getGroupInfo}/>;
                tabComponent = <PersonCenterComponents ref="personCenterComponents"
                                                       userInfo={this.state.userObj}
                                                       userContactsData={this.state.userContactsData}
                                                       onSendGroupMessage={this.sendGroupMessage}
                                                       onSendMessage={this.sendMessage}/>;
                break;
            case 'personCenter':
                //个人中心
                middleComponent = <StudentPersonCenterMenu callbackParent={this.getStudentResource}/>;
                tabComponent = <StudentPersonCenter params={this.state.personCenterParams}/>;

                break;
            case 'antNest':
                //蚁巢
                middleComponent = <AntNestMenu callbackParent={this.getAntNest}/>;
                tabComponent = <AntNestTabComponents ref="antNestTabComponents"/>;

                break;
            case 'classRoom':
                //教学空间
                tabComponent = <LiveTV/>;
        }
        //
        //
        //
        /*
         就是页面右侧的结构，目前只有两种默认左右分
         */
        switch (this.state.resouceType) {
            default :
                mainContent = <Row>
                    <Col span={5}>
                        {middleComponent}
                    </Col>
                    <Col span={19}>
                        <div className="ant-layout-container">
                            <div className="ant-layout-content">
                                {tabComponent}
                            </div>
                        </div>
                    </Col>
                </Row>;
                break;
            case 'B':
                mainContent =
                    <Row>
                        <Col span={24}>
                            <div className="ant-layout-container teachSpacePanel">
                                {tabComponent}
                                {middleComponent}
                            </div>
                        </Col>
                    </Row>;
                break;
            case 'C':
                mainContent = <div className={this.state.currentKey + ' ant-layout-container'}>
                    {tabComponent}
                </div>
                break;
        }
        //
        //
        //
        return (
            <LocaleProvider locale={this.state.locale}>
                <div className={collapse ? "ant-layout-aside ant-layout-aside-collapse" : "ant-layout-aside"}>

                    <aside className="ant-layout-sider">
                        <div className="ant-layout-logo">
                            <UserFace callbackParent={this.getStudentResource}/>
                        </div>
                        <Menu mode="inline" theme="dark"
                              defaultSelectedKeys={[this.state.currentKey]}
                              selectedKeys={[this.state.currentKey]}
                              onClick={this.toolbarClick}>
                            <Menu.Item key="message" className="padding_menu">
                                <i className="icon_menu_ios icon_message"></i>
                                <div className="tan">动态</div>
                            </Menu.Item>
                            <Menu.Item key="antNest" className="padding_menu">
                                <i className="icon_menu_ios icon_yichao1"></i>
                                <div className="tan">蚁巢</div>
                            </Menu.Item>
                            <Menu.Item key="classRoom" className="padding_menu">
                                <i className="icon_menu_ios icon_jiaoxue"></i>
                                <div className="tan">营养池</div>
                            </Menu.Item>
                            <Menu.Item key="antGroup" className="padding_menu">
                                <i className="icon_menu_ios icon_antgroup"></i>
                                <div className="tan">蚁群</div>
                            </Menu.Item>
                            <FloatButton ref="floatButton" messageUtilObj={ms}/>
                        </Menu>

                        <div className="ant-aside-action">

                        </div>

                    </aside>

                    <div className="ant-layout-main">
                        <div className="ant-layout-header">
                            <HeaderComponents/>
                        </div>
                        <div className="ant-layout-operation">
                            {mainContent}
                        </div>
                    </div>
                    <div className="panleArea"></div>
                    <div className="downloadArea"></div>
                </div>
            </LocaleProvider>
        );
    },

});

export default StudentMainLayout;

