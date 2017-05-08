import React from  'react';
import {Menu, Icon, Row, Col} from 'antd';
import MainTabComponents from '../components/MainTabComponents';
import MiddleMenuComponents from '../components/MiddleMenuComponents';
import HeaderComponents from '../components/HeaderComponents';
import UserCardModalComponents from '../components/UserCardModalComponents';
import FloatButton  from '../components/FloatButton';
import MyMTV  from '../components/MyMTV';
import MyFollows  from '../components/MyFollows';
import MyFavorites  from '../components/Favorites';
import TeachSpace  from '../components/TeachSpaces';
import ResetStudentAccountKey  from '../components/ResetStudentAccountKey';
import HomeWorkTabComponents from '../components/HomeWorkTabComponents';
import TeacherResource from '../components/TeacherInfos/TeacherResource';
import moment from 'moment';
import AntNestTabComponents from '../components/antNest/AntNestTabComponents';
import AntGroupTabComponents from '../components/antGroup/AntGroupTabComponents';
import MessageMenu from '../components/layOut/MessageMenu';
import AntGroupMenu from '../components/layOut/AntGroupMenu';
import PersonCenterMenu from '../components/layOut/PersonCenterMenu';
import AntNestMenu from '../components/layOut/AntNestMenu';
<<<<<<< HEAD
import TeachSpaceGhostMenu from '../components/TeachSpacesGhostMenu';
import {isEmpty} from '../utils/Const';
=======
>>>>>>> bbcf4ff1d28739dc49a0b06034896b349c3b2768
import {LocaleProvider} from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';
// 推荐在入口文件全局设置 locale
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
import {createStore} from 'redux';


const store = createStore(function () {

});

var mainLayout;
const MainLayout = React.createClass({
    proxyObj: null,
    getInitialState() {
        mainLayout = this;
        return {
            collapse: true,
            ghostMenuVisible: true,
            activeMiddleMenu: '',
            currentKey: 'message',
            openKeysStr: '',
            locale: 'zh-cn',
            resouceType: '',
            ifr: {},
        };
        this.changeGhostMenuVisible = this.changeGhostMenuVisible.bind(this)
        this.switchSection = this.switchSection.bind(this)
        this.showpanle = this.showpanle.bind(this)
    },


    onCollapseChange() {
        this.setState({
            collapse: !this.state.collapse,
        })
    },
    toolbarClick: function (e) {

        toolbarKey = e.key;
        if ('teachSpace' == toolbarKey) {
            if (toolbarKey == this.state.currentKey  ) {
                this.changeGhostMenuVisible();
            } else {
                this.setState({currentKey: e.key, resouceType: 'teachSpacePanel'});
            }
            return;
        }
        this.setState({currentKey: e.key, resouceType: ''});
        if (e.key != "KnowledgeResources") {
            var breadcrumbArray = [{hrefLink: '#/MainLayout', hrefText: "首页"}];
            if (mainLayout.refs.mainTabComponents != null && typeof(mainLayout.refs.mainTabComponents) != "undefined") {
                mainLayout.refs.mainTabComponents.buildBreadcrumb(breadcrumbArray, 0);
            }
        }
    },
    //获取备课计划下的课件资源
    getTeachPlans: function (optContent, breadCrumbArray) {
        //点击的菜单标识：teachScheduleId
        if (optContent == null) {
            if (mainLayout.refs.mainTabComponents != null && typeof(mainLayout.refs.mainTabComponents) != "undefined") {
                mainLayout.refs.mainTabComponents.buildBreadcrumb(breadCrumbArray);
            }
        } else {

            var optContentArray = optContent.split("#");
            var childrenCount = optContentArray[3];
            //lastClickMenuChildrenCount = childrenCount;
            sessionStorage.setItem("lastClickMenuChildrenCount", childrenCount);
            if (optContentArray[1] != "bySubjectId") {
                var breadcrumbArray = [{hrefLink: '#/MainLayout', hrefText: "首页"}];
                if (mainLayout.refs.mainTabComponents != null && typeof(mainLayout.refs.mainTabComponents) != "undefined") {
                    mainLayout.refs.mainTabComponents.buildBreadcrumb(breadcrumbArray);
                }
            } else {
                if (mainLayout.refs.mainTabComponents != null && typeof(mainLayout.refs.mainTabComponents) != "undefined") {
                    mainLayout.refs.mainTabComponents.buildBreadcrumb(breadCrumbArray, childrenCount);
                }
            }
            if (mainLayout.refs.mainTabComponents != null && typeof(mainLayout.refs.mainTabComponents) != "undefined") {
                mainLayout.refs.mainTabComponents.getTeachPlans(optContent);
            }
        }
    },

    componentWillMount(){
        var userIdent = sessionStorage.getItem("ident");
        if (userIdent == null || userIdent == "") {
            location.hash = "login";
        }
    },
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
    // 切换组件页面
    switchSection(obj){
        if (typeof obj == 'string') {
            this.setState({resouceType: obj});
            return;
        }
        this.proxyObj = obj;
        this.setState({resouceType: obj.resouceType});
    },

    callEvent(param){
        if (!param || !param.linkpart) return;
        let paramref = param.linkpart.shift();
        this.autoeventparam = param;
        this[paramref[0]](paramref[1], param);

    },


    //获取老师的已布置作业列表
    getTeacherHomeWork: function (optType) {
        mainLayout.refs.homeWorkTabComponents.getTeacherHomeWork(optType);
    },

    //获取试卷列表
    getExamPagerList: function (optType) {
        mainLayout.refs.examPagerTabComponents.getExamPagerList();
    },

    getStudyEvaluate: function (optType) {
        mainLayout.refs.studyEvaluateTabComponents.getStudyEvaluate();
    },

    callBackKnowledgeMenuBuildBreadCrume(menuText, menuLevel, menuId, openKeysStr){
        var breadCrumbArray = mainLayout.refs.knowledgeMenuComponents.bulidBreadCrumbArray(menuText, menuLevel, menuId, openKeysStr);
        return breadCrumbArray;
    },

    getTeacherResource(resouceType){
        mainLayout.setState({currentKey: "personCenter"});
    },


    showpanle(obj){
        LP.Start(obj);
    },

    getAntNest(optType){
        var pageNo;
        if("getAllTopic"==optType){
            mainLayout.refs.antNestTabComponents.getTopics(pageNo,0);
        }else{
            mainLayout.refs.antNestTabComponents.getTopics(pageNo,1);
        }
    },
    teachSpaceTab(activeMenu){
        this.changeGhostMenuVisible({visible:false});
        this.setState({activeMiddleMenu: activeMenu});
    },

    changeGhostMenuVisible(obj){
        if (obj) {
            this.setState({ghostMenuVisible: obj.visible});
        } else {
            let visible = !this.state.ghostMenuVisible;
            this.setState({ghostMenuVisible: visible});
        }
    },


    render() {
        const collapse = this.state.collapse;
        //根据如下判断结果，完成对页面中部位置的渲染，不同情况，渲染不同组件
        var middleComponent;
        var mainContent;
        var tabComponent = <MainTabComponents ref="mainTabComponents" showpanle={this.showpanle}/>;

        switch (this.state.currentKey) {

            case 'message':
                //消息动态
                middleComponent = <MessageMenu></MessageMenu>;
                tabComponent = <MainTabComponents ref="mainTabComponents" showpanle={this.showpanle}/>;
                break;
            case 'antGroup':
                //蚁群
                middleComponent = <AntGroupMenu ref="antGroupMenu"/>;
                tabComponent = <MainTabComponents showpanle={this.showpanle} ref="mainTabComponents"
                                                  callBackKnowledgeMenuBuildBreadCrume={this.callBackKnowledgeMenuBuildBreadCrume}/>;
                break;
            case 'personCenter':
                //个人中心
                middleComponent = <PersonCenterMenu ></PersonCenterMenu>
                tabComponent = <HomeWorkTabComponents ref="homeWorkTabComponents"/>;

                break;
            case 'antNest':
                //蚁巢
                middleComponent = <AntNestMenu callbackParent={this.getAntNest}/>;
                tabComponent = <AntNestTabComponents ref="antNestTabComponents" onPreview={ this.showpanle }/>;

                break;
            case 'teachSpace':
                //教学空间
                middleComponent =
                    <TeachSpaceGhostMenu visible={this.state.ghostMenuVisible} toggleGhostMenu={ this.changeGhostMenuVisible }
                               changeTabEvent={this.teachSpaceTab}/>;
                tabComponent = <TeachSpace currentItem={this.state.activeMiddleMenu}/>;


        }
        //
        //
        //
        switch (mainLayout.state.resouceType) {
            case '':
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
            case 'teachSpacePanel':
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
            case 'visitAntNest':
                mainContent = <Row>
                    <Col span={24}>
                        <div className="ant-layout-container">
                            <div className="ant-layout-content">
                                <AntNestTabComponents ref="antNestTabComponents"
                                                      resouceType={mainLayout.state.resouceType}
                                                      onPreview={ this.showpanle }/>
                            </div>
                        </div>
                    </Col>
                </Row>;
                break;

            case 'visitAntGroup':
                mainContent = <Row>
                    <Col span={24}>
                        <div className="ant-layout-container">
                            <div className="ant-layout-content">
                                <AntGroupTabComponents ref="antGroupTabComponents"
                                                       onPreview={ this.showpanle.bind(this) }
                                                       resouceType={mainLayout.state.resouceType}/>
                            </div>
                        </div>
                    </Col>
                </Row>;
                break;
            case 'myFavrites':
                mainContent = <Row>
                    <Col span={24}>
                        <div className="ant-layout-container">
                            <div className="ant-layout-content">
                                <MyFavorites  />
                            </div>
                        </div>
                    </Col>
                </Row>;
                break;
            case 'myMTV':
                mainContent = <Row>
                    <Col span={24}>
                        <div className="ant-layout-container">
                            <div className="ant-layout-content">
                                <MyMTV  />
                            </div>
                        </div>
                    </Col>
                </Row>;
                break;
            case 'resetStudentAccountKey':
                mainContent = <Row>
                    <Col span={24}>
                        <div className="ant-layout-container">
                            <div className="ant-layout-content">
                                <ResetStudentAccountKey resouceType={mainLayout.state.resouceType}/>
                            </div>
                        </div>
                    </Col>
                </Row>;
                break;
            case 'myFollows':
                mainContent = <Row>
                    <Col span={24}>
                        <div className="ant-layout-container">
                            <div className="ant-layout-content">
                                <MyFollows />
                            </div>
                        </div>
                    </Col>
                </Row>;
                break;
            case 'visitMyFavorites':
                mainContent = <Row>
                    <Col span={24}>
                        <div className="ant-layout-container">
                            <div className="ant-layout-content">
                                <MyFavorites />
                            </div>
                        </div>
                    </Col>
                </Row>;

                break;
            case 'visitMyDirect':
                mainContent = <Row>
                    <Col span={24}>
                        <div className="ant-layout-container">
                            <div className="ant-layout-content">
                                <MyFavorites />
                            </div>
                        </div>
                    </Col>
                </Row>;

                break;
            default :
                mainContent = <Row>
                    <Col span={24}>
                        <div className="ant-layout-container">
                            <div className="ant-layout-content">
                                <TeacherResource ref="teacherResource" showpanle={this.showpanle}
                                                 resouceType={mainLayout.state.resouceType}/>
                            </div>
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
                            <UserCardModalComponents callbackParent={this.getTeacherResource}
                                                     callEvent={this.switchSection}/>
                        </div>
                        <Menu mode="inline" theme="dark" defaultSelectedKeys={[this.state.currentKey]}
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
        );
    },

});
export default MainLayout;
