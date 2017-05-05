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
import ResetStudentAccountKey  from '../components/ResetStudentAccountKey';
import KnowledgeMenuComponents from '../components/KnowledgeMenuComponents';
import HomeWorkMenu from '../components/HomeWorkMenu';
import ExamMenu from '../components/exam/ExamMenu';
import HomeWorkTabComponents from '../components/HomeWorkTabComponents';
import ExamPagerTabComponents from '../components/exam/ExamPagerTabComponents';
import TeacherResource from '../components/TeacherInfos/TeacherResource';
import moment from 'moment';
import StudyEvaluateMenu from '../components/StudyEvaluateMenu';
import Asidepanel from '../components/Asidepanel';
import StudyEvaluateTabComponents from '../components/StudyEvaluateTabComponents';
import AntNestTabComponents from '../components/antNest/AntNestTabComponents';
import AntGroupTabComponents from '../components/antGroup/AntGroupTabComponents';
import MessageMenu from '../components/layOut/MessageMenu';
import AntGroupMenu from '../components/layOut/AntGroupMenu';
import PersonCenterMenu from '../components/layOut/PersonCenterMenu';
import AntNestMenu from '../components/layOut/AntNestMenu';
import {isEmpty} from '../utils/Const';
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
            activeMiddleMenu: 'sub1',
            currentKey: 'message',
            openKeysStr: '',
            locale: 'zh-cn',
            resouceType: '',
            ifr: {},
        };
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
                    componentPart[param[0]]( param[1],param);
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
       if(typeof obj == 'string'){
           this.setState({resouceType:obj});
           return;
       }
            this.proxyObj = obj;
            this.setState({resouceType: obj.resouceType});
    },

    callEvent(param){
        if (!param || !param.linkpart) return;
        let paramref = param.linkpart.shift();
        this.autoeventparam = param;
        this[paramref[0]](paramref[1],param);
       // this.setState({resouceType: obj.resouceType});


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
        /*if (resouceType == "visitAntGroup" && isEmpty(mainLayout.refs.antGroupTabComponents) == false) {
            mainLayout.refs.antGroupTabComponents.getAntGroup();
        }
        mainLayout.setState({resouceType: resouceType});*/
        mainLayout.setState({currentKey:"personCenter"});
    },


    showpanle(obj){
        LP.Start(obj);
    },

    foceClosePanle(){
        // this.refs.laifr.closepanle(true);
    },

    getAntNest(optType){
        console.log(optType+"===");
        if("getAllTopic"==optType){
            mainLayout.refs.antNestTabComponents.getTopics(1,0);
        }else{
            mainLayout.refs.antNestTabComponents.getTopics(1,1);
        }
    },

    render() {
        const collapse = this.state.collapse;
        //根据如下判断结果，完成对页面中部位置的渲染，不同情况，渲染不同组件
        var middleComponent;
        var mainContent;
        var tabComponent = <MainTabComponents ref="mainTabComponents" showpanle={this.showpanle}/>;
        //消息动态
        if (this.state.currentKey == "message") {
            middleComponent =<MessageMenu></MessageMenu>;
                tabComponent = <MainTabComponents ref="mainTabComponents" showpanle={this.showpanle}/>;
        } else if (this.state.currentKey == "antGroup") {
            //蚁群
            middleComponent = <AntGroupMenu ref="antGroupMenu"></AntGroupMenu>;
            tabComponent = <MainTabComponents showpanle={this.showpanle} ref="mainTabComponents"
                                              callBackKnowledgeMenuBuildBreadCrume={this.callBackKnowledgeMenuBuildBreadCrume}/>;
        } else if (this.state.currentKey == "personCenter") {
            //个人中心
            middleComponent = <PersonCenterMenu ></PersonCenterMenu>
            tabComponent = <HomeWorkTabComponents ref="homeWorkTabComponents"/>;
        } else if (this.state.currentKey == "antNest") {
            //蚁巢
            middleComponent = <AntNestMenu callbackParent={this.getAntNest}></AntNestMenu>;
            tabComponent = <AntNestTabComponents ref="antNestTabComponents"
                                                 onPreview={ this.showpanle }/>;
        } else if (this.state.currentKey == "teachSpace") {
            //教学空间
            middleComponent =
                <MiddleMenuComponents activeMenu={this.state.activeMiddleMenu} callbackParent={this.getTeachPlans}/>;
            tabComponent = <MainTabComponents ref="mainTabComponents" showpanle={this.showpanle}/>;
        }
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
            case null:
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
            case 'visitAntGroup':
                mainContent = <Row>
                    <Col span={24}>
                        <div className="ant-layout-container">
                            <div className="ant-layout-content">
                                <AntGroupTabComponents ref="antGroupTabComponents"  onPreview={ this.showpanle.bind(this) } resouceType={mainLayout.state.resouceType}  />
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
                                <MyFavorites  onPreview={ this.showpanle.bind(this) }/>
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
                                <MyMTV resouceType={mainLayout.state.resouceType}/>
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


        return (
            <LocaleProvider locale={this.state.locale}>
                <div className={collapse ? "ant-layout-aside ant-layout-aside-collapse" : "ant-layout-aside"}>

                    <aside className="ant-layout-sider">
                        <div className="ant-layout-logo">
                            <UserCardModalComponents callbackParent={this.getTeacherResource} callEvent={this.switchSection}/>
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
                                <Icon type="cloud" />
                                <div className="tan">教学空间</div>
                            </Menu.Item>
                            <Menu.Item key="antGroup" className="padding_menu">
                                <Icon type="team"/>
                                <div className="tan">蚁群</div>
                            </Menu.Item>
                            {/*<Menu.Item key="personCenter" className="padding_menu">
                                <Icon type="user"/>
                                <div className="tan">个人中心</div>
                            </Menu.Item>*/}
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
                    <Asidepanel param={this.state.ifr} ref="laifr"/>


                </div>
            </LocaleProvider>
        );
    },

});
export default MainLayout;
