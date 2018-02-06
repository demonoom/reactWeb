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
import {isEmpty} from '../utils/Const'
import SendPicModel from '../components/antGroup/SendPicModel'
// 推荐在入口文件全局设置 locale
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
import {createStore} from 'redux';
import LiveTV from "../components/LiveTV/LiveTV";


const store = createStore(function () {

});
//消息通信js
window.ms = null;

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
            isPersonCenter: false,
            isSearchGroup: false,
            sendPicModel:false,
        };
        this.changeGhostMenuVisible = this.changeGhostMenuVisible.bind(this)
    },


    onCollapseChange() {
        this.setState({
            collapse: !this.state.collapse,
        })
    },

    noomSelectUser(obj) {
        this.sendMessage_noom_group(obj);
    },

    sendMessage_noom_group(groupObj) {
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
        ms =  new MsgConnection();
        ms.connect(pro);
    },

    sendImg(currentUrl, urls) {
        var imgArr = [];
        var num = '';
        var urls = urls.split('#');
        var _this = this;
        //根据urls的length动态创建img
        urls.forEach(function (v, i) {
            var imgId = "img" + i;
            var img = <span className="topics_zan"><img id={imgId} className="topics_zanImg noomSendImg"
                                                        onClick={showLargeImg} src={v}/>
                      </span>;
            imgArr.push(img);
            if (currentUrl == v) {
                num = i;
            }
        });
        this.setState({imgArr});
        //图片已渲染到DOM
        document.querySelectorAll(".noomSendImg")[num].click();   //使用noomSendImg可以区分选择的图片是聊天里的还是审批里的,不会造成混乱
    },

    noomSelectPic(src, obj) {
        this.setState({sendPicModel: true, pinSrc: src, picFile: obj});
    },

    componentDidMount() {
        this.refs.dingMusic.innerHTML = '<source src="../../static/dingmes.mp3" type="audio/mpeg">'
        this.refs.mesMusic.innerHTML = '<source src="../../static/message.mp3" type="audio/mpeg">'
        window.__noomSelect__ = this.noomSelect;
        window.__noomSelectGroup__ = this.noomSelectUser;
        window.__sendImg__ = this.sendImg;
        //定义方法（调用进入哪个聊天人）
        // window.__toWhichCharObj__ = this.toWhichCharObj;
        window.__noomSelectPic__ = this.noomSelectPic;
        // window.__noomShareMbile__ = this.noomShareMbile;
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


/*    getAntNest(optType){
        var pageNo;
        if ("getAllTopic" == optType) {
            this.refs.antNestTabComponents.getTopics(pageNo, 0);
        } else {
            this.refs.antNestTabComponents.getTopics(pageNo, 1);
        }
    },*/

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
            userJson,
            isPersonCenter: true,
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

    changeMesTabClick() {
        this.setState({mesTabClick: false});
    },

    toWhichCharObj() {
        var _this = this;
        var lastClick = this.state.lastClick;
        if (isEmpty(lastClick) == false) {

            setTimeout(function () {
                // _this.turnToMessagePage(lastClick);
                _this.refs.messageMenu.turnToMessagePage(lastClick);
            }, 50)
        } else {

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

    /**
     * 聊天卸载时，将这个js保存的信息清空，下次加载时会调用点击最后的那个方法
     */
    clearEverything() {
        this.setState({userInfo: ''});
        this.setState({messageType: ''});
    },

    getGroupMenu() {
        this.refs.personCenterComponents.getGroupMenu();
    },

    refresh() {
        // var flag = this.state.mesTabClick;
        // if (!flag) {
        // this.refs.messageMenu.getUserRecentMessages();
        // }
        this.refs.messageMenu.componentWillReceiveProps();
    },

    changeIsPersonCenter() {
        this.setState({isPersonCenter: false});
    },

    changeIsSearchGroup() {
        this.setState({isSearchGroup: false});
    },

    closeSendPicModel() {
        this.setState({sendPicModel: false});
    },

    sendPicToOthers(url) {
        this.refs.antGroupTabComponents.sendPicToOthers(url);
    },

    changeIsSearch() {
        this.setState({isSearch: false});
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
                /*middleComponent = <MessageMenu onUserClick={this.turnToMessagePage}
                                               userJson={this.state.userJson}
                                               onLoad={this.turnToMessagePage}/>;*/
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
                                               toWhichCharObj={this.toWhichCharObj}
                                               ref="messageMenu"
                />

                tabComponent = <AntGroupTabComponents ref="antGroupTabComponents"
                                                      userInfo={this.state.userInfo}
                                                      groupObj={this.state.groupObj}
                                                      actionFrom={this.state.actionFrom}
                                                      messageType={this.state.messageType}
                                                      messageUtilObj={ms}
                                                      onNewMessage={this.receiveNewMessage}
                                                      showMesAlert={this.showMesAlert}
                                                      refresh={this.refresh}
                                                      clearEverything={this.clearEverything}
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
                                <b className="ding_alert" ref='msgAlert'></b>
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
                    <div>
                        <audio id="dingMusic" ref='dingMusic'>

                        </audio>
                        <audio id="mesMusic" ref='mesMusic'>

                        </audio>
                    </div>
                    <SendPicModel
                        isShow={this.state.sendPicModel}
                        closeModel={this.closeSendPicModel}
                        pinSrc={this.state.pinSrc}
                        picFile={this.state.picFile}
                        sendPicToOthers={this.sendPicToOthers}
                    />
                </div>
            </LocaleProvider>
        );
    },

});

export default StudentMainLayout;

