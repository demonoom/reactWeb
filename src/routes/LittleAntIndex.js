import React from  'react';
import {Menu, Icon, Row, Col} from 'antd';
import MainTabComponents from '../components/MainTabComponents';
import HeaderComponents from '../components/HeaderComponents';
import UserFace from '../components/UserCardModalComponents';
import FloatButton  from '../components/FloatButton';

import PersonCenterMenu from '../components/layOut/PersonCenterMenu';
import PersonCenter  from '../components/PersonCenter';
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
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {Provider, connect} from 'react-redux';


const topState = createStore(function () {

});


//消息通信js
var ms;
class MainLayout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collapse: true,
            ghostMenuVisible: true,
            activeMiddleMenu: '',
            personCenterParams: '',
            currentKey: 'message',
            openKeysStr: '',
            locale: 'zh-cn',
            resouceType: '',
            ifr: {},
        };
        this.changeGhostMenuVisible = this.changeGhostMenuVisible.bind(this);
        this.proxyObj = null;
    }


    onCollapseChange() {
        this.setState({
            collapse: !this.state.collapse,
        })
    }


    toolbarClick(e) {

        toolbarKey = e.key;

        if ('teachSpace' == toolbarKey) {

            if (toolbarKey == this.state.currentKey) {
                this.changeGhostMenuVisible();
            } else {
                this.setState({currentKey: e.key, resouceType: 'B'});
            }
            return;
        }
        this.setState({currentKey: e.key, resouceType: ''});

        if (toolbarKey != "KnowledgeResources") {
            var breadcrumbArray = [{hrefLink: '#/MainLayout', hrefText: "首页"}];
            if (this.refs.mainTabComponents) {
                this.refs.mainTabComponents.buildBreadcrumb(breadcrumbArray, 0);
            }
        }
    }


    //获取备课计划下的课件资源
    getTeachPlans(optContent, breadCrumbArray) {
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
    }

    componentWillMount() {
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
    }


    // 呼叫本组件中的实例任何方法 dapeng
    componentDidUpdate() {
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
    }


    //获取试卷列表
    getExamPagerList(optType) {
        this.refs.examPagerTabComponents.getExamPagerList();
    }

    getStudyEvaluate(optType) {
        this.refs.studyEvaluateTabComponents.getStudyEvaluate();
    }

    callBackKnowledgeMenuBuildBreadCrume(menuText, menuLevel, menuId, openKeysStr) {
        return this.refs.knowledgeMenuComponents.bulidBreadCrumbArray(menuText, menuLevel, menuId, openKeysStr);

    }

    getTeacherResource(params) {
        this.setState({resouceType: '', currentKey: "personCenter", personCenterParams: params});
    }


    getAntNest(optType) {
        var pageNo;
        if ("getAllTopic" == optType) {
            this.refs.antNestTabComponents.getTopics(pageNo, 0);
        } else {
            this.refs.antNestTabComponents.getTopics(pageNo, 1);
        }
    }

    teachSpaceTab(activeMenu, beActive) {
        this.setState({activeMiddleMenu: activeMenu});
        this.changeGhostMenuVisible({visible: false, beActive: beActive});
    }

    changeGhostMenuVisible(obj) {


        if (obj) {
            if (!obj.beActive) return;
            this.setState({ghostMenuVisible: obj.visible});
        } else {

            let visible = !this.state.ghostMenuVisible;
            this.setState({ghostMenuVisible: visible});
        }
    }


    /**
     * 获取个人中心需要的数据,老师和学生可通用,后期需要什么再添加
     */
    getPersonalCenterData(userId) {
        this.refs.personCenterComponents.getPersonalCenterData(userId);
    }


    setFirstPerson(userContactsData) {
        var userJson = userContactsData[0];
        this.setState({"userContactsData": userContactsData});
        this.getPersonalCenterData(userJson.userObj.colUid);
    }


    getGroupInfo() {
        this.refs.personCenterComponents.getUserChatGroup();
    }


    /**
     * 回调发送群组消息
     * @param groupObj
     */
    sendGroupMessage(groupObj) {
        console.log("mainLayout:" + groupObj.name);
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
            userJson
        });
    }


    /**
     * 好友对好友的消息发送
     */
    sendMessage(userInfo) {

        console.log("userInfo:" + userInfo.user.colUid);
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
            userJson
        });
        // this.turnToMessagePage(userInfo.user);

    }


    /**
     * 点击消息动态联系人列表时，进入消息列表
     * 根据当前点击的消息对象不同，分别进入个人消息和群组消息界面
     * @param fromObj
     */
    turnToMessagePage(fromObj) {
        if (fromObj.messageType == 1) {
            // 个人消息
            this.refs.antGroupTabComponents.getUser2UserMessages(fromObj.fromUser);
        } else {
            // 群组消息
            this.refs.antGroupTabComponents.sendGroupMessage(fromObj.toChatGroup);
        }

    }

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
                                               userJson={this.state.userJson}/>;
                tabComponent = <AntGroupTabComponents ref="antGroupTabComponents"
                                                      userInfo={this.state.userInfo}
                                                      groupObj={this.state.groupObj}
                                                      messageType={this.state.messageType}
                                                      messageUtilObj={ms}
                />;
                break;
            case 'antGroup':
                //蚁群
                middleComponent = <AntGroupMenu ref="antGroupMenu" callbackSetFirstPerson={this.setFirstPerson}
                                                callbackPersonCenterData={this.getPersonalCenterData}
                                                callbackGetGroupInfo={this.getGroupInfo}
                ></AntGroupMenu>;
                tabComponent = <PersonCenterComponents ref="personCenterComponents"
                                                       userInfo={this.state.userObj}
                                                       userContactsData={this.state.userContactsData}
                                                       onSendGroupMessage={this.sendGroupMessage}
                                                       onSendMessage={this.sendMessage}
                />;
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
                                         toggleGhostMenu={ this.changeGhostMenuVisible }
                                         changeTabEvent={this.teachSpaceTab}/>;
                tabComponent = <TeachSpace currentItem={this.state.activeMiddleMenu}/>;
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
                            ;
                        </Col>
                    </Row>;
                break;
        }
        //
        //
        //
        return (
            <Provider state={topState}>
                <LocaleProvider locale={this.state.locale}>
                    <div className={collapse ? "ant-layout-aside ant-layout-aside-collapse" : "ant-layout-aside"}>

                        <aside className="ant-layout-sider">
                            <div className="ant-layout-logo">
                                <UserFace callbackParent={this.getTeacherResource}/>
                            </div>
                            <Menu mode="inline" theme="dark"
                                  defaultSelectedKeys={[this.state.currentKey]}
                                  selectedKeys={[this.state.currentKey]}
                                  onClick={this.toolbarClick}>
                                <Menu.Item key="message" className="padding_menu">
                                    <Icon type="message"/>
                                    <div className="tan">动态</div>
                                </Menu.Item>
                                <Menu.Item key="antNest" className="padding_menu">
                                    <i className="icon_yichao"></i>
                                    <div className="tan">蚁巢</div>
                                </Menu.Item>
                                <Menu.Item key="teachSpace" className="padding_menu">
                                    <Icon type="cloud"/>
                                    <div className="tan">教学空间</div>
                                </Menu.Item>
                                <Menu.Item key="antGroup" className="padding_menu">
                                    <Icon type="team"/>
                                    <div className="tan">蚁群</div>
                                </Menu.Item>
                                <FloatButton ref="floatButton"/>
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
                    </div>
                </LocaleProvider>
            </Provider>
        );
    }

}
;

export default MainLayout;