import React from 'react';
import {Menu, Icon, Row, Col, Button, notification, Modal} from 'antd';
import MainTabComponents from '../components/MainTabComponents';
import HeaderComponents from '../components/HeaderComponents';
import UserFace from '../components/UserCardModalComponents';
import FloatButton from '../components/FloatButton';
import PersonCenterMenu from '../components/layOut/PersonCenterMenu';
import PersonCenter from '../components/PersonCenter';
import moment from 'moment';
import AntNestTabComponents from '../components/antNest/AntNestTabComponents';
import DingMessageTabComponents from '../components/dingMessage/DingMessageTabComponents';
import AntGroupTabComponents from '../components/antGroup/AntGroupTabComponents';
import MessageMenu from '../components/layOut/MessageMenu';
import AntGroupMenu from '../components/layOut/AntGroupMenu';
import AntNestMenu from '../components/layOut/AntNestMenu';
import DingMessageMenu from '../components/dingMessage/DingMessageMenu';
import PersonCenterComponents from '../components/antGroup/PersonCenterComponents';
import AntCloudMenu from '../components/layOut/AntCloudMenu';
import AntCloudTableComponents from '../components/antCloud/AntCloudTableComponents';
import {LocaleProvider} from 'antd';
import TeachSpace from '../components/TeachSpaces';
import TeachSpaceGhostMenu from '../components/TeachSpacesGhostMenu';
import {MsgConnection} from '../utils/msg_websocket_connection';
import AntCloudClassRoomMenu from '../components/layOut/AntCloudClassRoomMenu';
import AntCloudClassRoomComponents from '../components/cloudClassRoom/AntCloudClassRoomComponents';
import SchoolGroupSettingComponents from '../components/schoolGroupSetting/SchoolGroupSettingComponents';
import SchoolGroupMenu from '../components/schoolGroupSetting/SchoolGroupMenu';
import SystemSettingGhostMenu from '../components/SystemSetting/SystemSettingGhostMenu';
import SystemSettingComponent from '../components/SystemSetting/SystemSettingComponent';
// 推荐在入口文件全局设置 locale
import 'moment/locale/zh-cn';

moment.locale('zh-cn');
import {createStore} from 'redux';


const store = createStore(function () {

});
//消息通信js
window.ms = null;

const MainLayout = React.createClass({
    proxyObj: null,
    getInitialState() {
        return {
            collapse: true,
            ghostMenuVisible: true,
            systemSettingGhostMenuVisible: true,
            activeMiddleMenu: '',
            selectedKeys: '',
            personCenterParams: '',
            currentKey: 'message',
            openKeysStr: '',
            locale: 'zh-cn',
            resouceType: '',
            ifr: {},
            cloudRoomMenuItem: 'mulitiClass',
            antCloudKey: 'fileManager',
            activeSystemSettingMiddleMenu: '',
            mesTabClick: false,
            isSearch: false,
            isSearchGroup: false,
            isPersonCenter: false,
        };
        this.changeGhostMenuVisible = this.changeGhostMenuVisible.bind(this)
    },

    openNotification() {
        notification.open({
            // message: 'Notification Title',
            description: '你有一条新的叮消息，请及时查看.',
        });
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

        if ('systemSetting' == e.key) {
            // if (this.state.vipKey) {
            //     return;
            // }
            // console.log(this.state.vipKey);
            if (e.key == this.state.currentKey) {
                this.changeSystemGhostMenuVisible();
            } else {
                this.setState({currentKey: e.key, resouceType: 'B'});
            }
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

    componentDidMount() {
        this.refs.dingMusic.innerHTML = '<source src="../../static/dingmes.mp3" type="audio/mpeg">'
        this.refs.mesMusic.innerHTML = '<source src="../../static/message.mp3" type="audio/mpeg">'
        window.__noomSelect__ = this.noomSelect;
        window.__noomSelectGroup__ = this.noomSelectUser;
    },

    componentWillMount() {
        // alert('componentWillMount');
        var userIdent = sessionStorage.getItem("ident");
        if (userIdent == null || userIdent == "") {
            location.hash = "login";
        }

        var loginUserId = sessionStorage.getItem("ident");
        var machineId = localStorage.getItem("machineId");
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
        ms = new MsgConnection();
        ms.connect(pro);

    },

    // 不用了
    // 呼叫本组件中的实例任何方法 dapeng
    componentDidUpdate() {
        // alert('componentDidUpdate');
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

    noomSelect(obj) {
        this.sendMessage_noom_user(obj);
    },

    sendMessage_noom_user(userInfo) {
        var contentJson = {"content": '', "createTime": ''};
        var contentArray = [contentJson];
        var userJson = {
            key: userInfo.colUid,
            "fromUser": userInfo,
            contentArray: contentArray,
            "messageToType": 1,
        };
        this.setState({
            currentKey: 'message',
            resouceType: '',
            "userInfo": userInfo,
            "messageType": 'message',
            "actionFrom": "search",
            userJson,
            isSearch: true
        });
    },

    noomSelectUser(obj) {
        this.sendMessage_noom_group(obj);
    },

    sendMessage_noom_group(groupObj) {
        console.log(groupObj);
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
            userJson,
            isSearchGroup: true
        });
    },

    //获取试卷列表
    getExamPagerList: function (optType) {
        this.refs.examPagerTabComponents.getExamPagerList();
    },

    getStudyEvaluate: function (optType) {
        this.refs.studyEvaluateTabComponents.getStudyEvaluate();
    },

    callBackKnowledgeMenuBuildBreadCrume(menuText, menuLevel, menuId, openKeysStr) {
        return this.refs.knowledgeMenuComponents.bulidBreadCrumbArray(menuText, menuLevel, menuId, openKeysStr);

    },

    getTeacherResource(params) {

        this.setState({resouceType: '', currentKey: "personCenter", personCenterParams: params});
    },


    getAntNest(optType) {
        //onlyTeacherTopic或者getAllTopic
        var pageNo;
        var fromTap = true;
        if ("getAllTopic" == optType) {
            this.refs.antNestTabComponents.getTopics(pageNo, 0, true, fromTap);
        } else {
            this.refs.antNestTabComponents.getTopics(pageNo, 1, true, fromTap);
        }
    },

    getDingMessage(optType) {
        var pageNo = 1;
        if ("myReceive" == optType) {
            this.refs.dingMessageTabComponents.getDList(pageNo, 1);
        } else {
            this.refs.dingMessageTabComponents.getDList(pageNo, 2);
        }
        this.refs.dingMessageTabComponents.mesListLev();
    },
    /**
     * 收到叮消息的回调
     * @param flag
     */
    showAlert(flag) {
        if (flag) {
            //控制小红点的显示与隐藏
            this.refs.dingAlert.className = 'ding_alert_show';
            //控制提示框
            this.openNotification();
            //控制提示音播放
            var audio = document.getElementById("dingMusic");
            audio.play();
            // document.title = '您有新的叮消息';

        } else {
            this.refs.dingAlert.className = 'ding_alert';
        }

    },
    /**
     * 收到普通消息的回调
     */
    showMesAlert(flag) {
        if (flag) {
            //控制提示音播放
            var audio = document.getElementById("mesMusic");
            audio.play();
            //控制小红点的显示与隐藏
            this.refs.msgAlert.className = 'ding_alert_show';
        } else {
            this.refs.msgAlert.className = 'ding_alert';
        }
    },

    refresh() {
        // var flag = this.state.mesTabClick;
        // if (!flag) {
        // this.refs.messageMenu.getUserRecentMessages();
        // }
        this.refs.messageMenu.componentWillReceiveProps();
    },

    teachSpaceTab(activeMenu, beActive) {
        let _this = this;
        // 2
        this.changeGhostMenuVisible({visible: false, beActive: beActive});
        this.setState({activeMiddleMenu: activeMenu});
    },

    systemSettingTab(activeMenu, beActive, selectedKeys) {
        //activeMenu就是区别用的那个字符串
        //beActive为true，ghost就会拉进去，否则不会进去
        this.changeSystemGhostMenuVisible({visible: false, beActive: beActive});
        this.setState({activeSystemSettingMiddleMenu: activeMenu});
        this.setState({selectedKeys: selectedKeys});
    },
    checkVip(a) {
        this.setState({vipKey: a});
        console.log('啥啥啥');
        console.log(a);
    },

    /**
     * 设置教学空间的Ghost Menu的显示和关闭
     * @param obj
     */
    changeGhostMenuVisible(obj) {
        if (obj) {
            if (!obj.beActive) return;
            this.setState({ghostMenuVisible: obj.visible});
        } else {
            let visible = !this.state.ghostMenuVisible;
            this.setState({ghostMenuVisible: visible});
        }
    },

    /**
     * 设置系统设置的Ghost Menu的显示和关闭
     * @param obj
     */
    changeSystemGhostMenuVisible(obj) {
        if (obj) {
            if (!obj.beActive) return;
            this.setState({systemSettingGhostMenuVisible: obj.visible});
        } else {
            let visible = !this.state.systemSettingGhostMenuVisible;
            if (this.state.vipKey) {
                return;
            }
            console.log(this.state.vipKey);
            this.setState({systemSettingGhostMenuVisible: visible});
        }
    },


    /**
     * 获取个人中心需要的数据,老师和学生可通用,后期需要什么再添加
     */
    getPersonalCenterData(userId) {
        this.refs.personCenterComponents.getPersonalCenterData(userId);
    },

    setFirstPerson(userContactsData) {
        var userJson = userContactsData[0];
        this.setState({"userContactsData": userContactsData});
        this.getPersonalCenterData(userJson.userObj.colUid);
    },

    getGroupInfo() {
        this.refs.personCenterComponents.getUserChatGroup();
    },

    getGroupMenu() {
        this.refs.personCenterComponents.getGroupMenu();
    },
    /**
     * 回调发送群组消息
     * @param groupObj
     */
    sendGroupMessage(groupObj) {
        console.log(groupObj);
        var contentJson = {"content": '', "createTime": ''};
        var contentArray = [contentJson];
        var userJson = {
            key: groupObj.chatGroupId,
            // key: groupObj.ownerId,
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
    sendMessage(userInfo) {
        var contentJson = {"content": '', "createTime": ''};
        var contentArray = [contentJson];
        var userJson = {
            key: userInfo.user.colUid,
            "fromUser": userInfo.user,
            contentArray: contentArray,
            "messageToType": 1
        };
        console.log(userJson);
        this.setState({
            currentKey: 'message',
            resouceType: '',
            "userInfo": userInfo.user,
            "messageType": 'message',
            "actionFrom": "personCenter",
            userJson,
            isPersonCenter: true
        });
    },

    /**
     * 好友对好友的消息发送
     */
    receiveNewMessage(userJson) {
        // console.log(userJson);
        // console.log(947);
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
    turnToMessagePage(fromObj) {
        console.log(fromObj);
        console.log('fromObj');
        var timeNode = (new Date()).valueOf();
        if (fromObj.messageType == 1) {
            // 个人消息
            this.refs.antGroupTabComponents.getPersonMessage(fromObj.fromUser, timeNode);
        } else {
            // 群组消息
            this.refs.antGroupTabComponents.sendGroupMessage(fromObj.toChatGroup, timeNode);
        }
        this.setState({mesTabClick: true});
    },

    changeMesTabClick() {
        this.setState({mesTabClick: false});
    },

    getAntCloud(optType) {
        this.setState({"antCloudKey": optType});
    },

    getSubGroup(structureId, structure) {
        this.setState({structureId, rootStructure: structure});
    },

    /**
     * 获取云课堂的操作
     * @param menuItemKey
     */
    getCloudClassRoom(menuItemKey) {
        console.log("menuItemKey:" + menuItemKey);
        this.setState({"cloudRoomMenuItem": menuItemKey});
    },
    search() {
        //打开littlepanel
        var loginUserId = sessionStorage.getItem("ident");
        let obj = {
                mode: 'teachingAdmin',
                url: 'http://www.maaee.com//Excoord_PhoneService/antSearch/indexSearch/' + loginUserId,
                title: '搜索'
            }
        ;
        LP.Start(obj);
    },

    changeIsSearch() {
        this.setState({isSearch: false});
    },

    changeIsSearchGroup() {
        this.setState({isSearchGroup: false});
    },

    changeIsPersonCenter() {
        this.setState({isPersonCenter: false});
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
                                               isSearch={this.state.isSearch}
                                               isSearchGroup={this.state.isSearchGroup}
                                               isPersonCenter={this.state.isPersonCenter}
                                               changeIsSearch={this.changeIsSearch}
                                               changeIsSearchGroup={this.changeIsSearchGroup}
                                               changeIsPersonCenter={this.changeIsPersonCenter}
                                               onLoad={this.turnToMessagePage}
                                               changeMesTabClick={this.changeMesTabClick}
                                               ref="messageMenu"
                />;
                tabComponent = <AntGroupTabComponents ref="antGroupTabComponents"
                                                      userInfo={this.state.userInfo}
                                                      groupObj={this.state.groupObj}
                                                      actionFrom={this.state.actionFrom}
                                                      messageType={this.state.messageType}
                                                      messageUtilObj={ms}
                                                      onNewMessage={this.receiveNewMessage}
                                                      showAlert={this.showAlert}
                                                      showMesAlert={this.showMesAlert}
                                                      refresh={this.refresh}
                />;
                break;
            case 'antGroup':
                //蚁群
                middleComponent = <AntGroupMenu ref="antGroupMenu" callbackSetFirstPerson={this.setFirstPerson}
                                                callbackPersonCenterData={this.getPersonalCenterData}
                                                callbackGetGroupInfo={this.getGroupInfo}
                                                callbackGetGroupMenu={this.getGroupMenu}
                />;
                tabComponent = <PersonCenterComponents ref="personCenterComponents"
                                                       userInfo={this.state.userObj}
                                                       userContactsData={this.state.userContactsData}
                                                       onSendGroupMessage={this.sendGroupMessage}
                                                       onSendMessage={this.sendMessage}/>;
                break;
            case 'personCenter':
                //个人中心
                middleComponent = <PersonCenterMenu callbackParent={this.getTeacherResource}/>;
                tabComponent = <PersonCenter params={this.state.personCenterParams}/>;

                break;
            case 'antNest':
                //蚁巢
                middleComponent = <AntNestMenu callbackParent={this.getAntNest}/>;
                tabComponent = <AntNestTabComponents ref="antNestTabComponents"/>;

                break;
            case 'teachSpace':
                //教学空间
                middleComponent =
                    <TeachSpaceGhostMenu visible={this.state.ghostMenuVisible}
                                         toggleGhostMenu={this.changeGhostMenuVisible}
                                         changeTabEvent={this.teachSpaceTab}/>;
                tabComponent = <TeachSpace currentItem={this.state.activeMiddleMenu}/>;
                break;
            case 'antCloud':
                //蚁盘
                middleComponent = <AntCloudMenu callbackParent={this.getAntCloud}/>;
                tabComponent = <AntCloudTableComponents antCloudKey={this.state.antCloudKey}
                                                        messageUtilObj={ms}
                ></AntCloudTableComponents>;
                // tabComponent = <nAntCloudTableComponents antCloudKey={this.state.antCloudKey}
                //                                         messageUtilObj={ms}
                // ></nAntCloudTableComponents>;
                break;
            case 'antCloudClassRoom':
                //云课堂
                middleComponent = <AntCloudClassRoomMenu callbackParent={this.getCloudClassRoom}/>;
                tabComponent = <AntCloudClassRoomComponents currentItem={this.state.cloudRoomMenuItem}/>;

                break;

            case 'systemSetting':
                //教学管理
                middleComponent =
                    <SystemSettingGhostMenu visible={this.state.systemSettingGhostMenuVisible}
                                            toggleGhostMenu={this.changeSystemGhostMenuVisible}
                                            changeTabEvent={this.systemSettingTab}
                                            checkVip={this.checkVip}
                    />;
                tabComponent = <SystemSettingComponent currentItem={this.state.activeSystemSettingMiddleMenu}
                                                       changeTab={this.systemSettingTab}></SystemSettingComponent>;

                break;
            case 'dingMessage':
                //叮消息
                middleComponent = <DingMessageMenu callbackParent={this.getDingMessage}/>;
                tabComponent = <DingMessageTabComponents ref="dingMessageTabComponents" showAlert={this.showAlert}/>;

                break;
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
        }
        //
        //
        //
        return (
            <LocaleProvider locale={this.state.locale}>
                <div className={collapse ? "ant-layout-aside ant-layout-aside-collapse" : "ant-layout-aside"}>

                    <aside className="ant-layout-sider">
                        <div className="ant-layout-logo">
                            <UserFace callbackParent={this.getTeacherResource}/>
                        </div>
                        <Menu mode="inline" theme="dark"
                              defaultSelectedKeys={[this.state.currentKey]}
                              selectedKeys={[this.state.currentKey]}
                            // onClick={this.toolbarClick.bind(this,event,this.state.vipKey)}>
                              onClick={this.toolbarClick}>
                            <Menu.Item key="message" className="padding_menu">
                                <i className="icon_menu_ios icon_message"></i>
                                <b className="ding_alert" ref='msgAlert'></b>
                                <div className="tan">动态</div>

                            </Menu.Item>
                            <Menu.Item key="antNest" className="padding_menu">
                                <i className="icon_menu_ios icon_yichao1"></i>
                                <div className="tan">蚁巢</div>
                            </Menu.Item>
                            <Menu.Item key="teachSpace" className="padding_menu">
                                <i className="icon_menu_ios icon_jiaoxue"></i>
                                <div className="tan">教学空间</div>
                            </Menu.Item>
                            <Menu.Item key="antGroup" className="padding_menu">
                                <i className="icon_menu_ios icon_antgroup"></i>
                                <div className="tan">蚁群</div>
                            </Menu.Item>
                            <Menu.Item key="antCloudClassRoom" className="padding_menu">
                                <i className="icon_menu_ios icon_cloud"></i>
                                <div className="tan">云课堂</div>
                            </Menu.Item>
                            <Menu.Item key="antCloud" className="padding_menu">
                                <i className="icon_menu_ios icon_antdisk"></i>
                                <div className="tan">蚁盘</div>
                            </Menu.Item>
                            <Menu.Item key="systemSetting" className="padding_menu">
                                <i className="icon_menu_ios icon_schoolGroup"></i>
                                <div className="tan">教学管理</div>
                            </Menu.Item>
                            <Menu.Item key="dingMessage" className="padding_menu">
                                <i className="icon_menu_ios icon_ding"></i>
                                <b className="ding_alert" ref='dingAlert'></b>
                                <div className="tan">叮一下</div>
                            </Menu.Item>
                            <FloatButton ref="floatButton" messageUtilObj={ms}/>
                        </Menu>

                        <div className="ant-aside-action">

                        </div>

                    </aside>

                    <div className="ant-layout-main">
                        <div className="ant-layout-header">
                            <HeaderComponents search={this.search}/>
                        </div>

                        <div className="ant-layout-operation">
                            {mainContent}
                        </div>
                    </div>
                    <div className="panleArea"></div>
                    <div className="downloadArea"></div>
                    <div>
                        <audio id="dingMusic" ref='dingMusic'>

                        </audio>
                        <audio id="mesMusic" ref='mesMusic'>

                        </audio>
                    </div>
                </div>
            </LocaleProvider>
        );
    },

});

export default MainLayout;

