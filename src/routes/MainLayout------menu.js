import React from  'react';
import { Menu, Breadcrumb, Icon ,Button,Progress} from 'antd';
import { BackTop } from 'antd';
import { Row, Col } from 'antd';
import BackTopButton from  '../components/BackTopButton';
import MainTabComponents from '../components/MainTabComponents';
import MiddleMenuComponents from '../components/MiddleMenuComponents';
import HeaderComponents from '../components/HeaderComponents';
import UserCardModalComponents from '../components/UserCardModalComponents';
import FloatButton  from '../components/FloatButton';
import KnowledgeMenuComponents from '../components/KnowledgeMenuComponents';
import HomeWorkMenu from '../components/HomeWorkMenu';
import HomeWorkTabComponents from '../components/HomeWorkTabComponents';
import moment from 'moment';
import StudyEvaluateMenu from '../components/StudyEvaluateMenu';
import StudyEvaluateTabComponents from '../components/StudyEvaluateTabComponents';
import { LocaleProvider } from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';
// 推荐在入口文件全局设置 locale
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
import { createStore } from 'redux';


const store = createStore(function () {

});

var mainLayout;
const MainLayout = React.createClass({
  getInitialState() {
    mainLayout = this;
    return {
      collapse: true,
      activeMiddleMenu:'sub1',
      currentKey:'teachTimes',
      openKeysStr:'',
      // locale: enUS,
      locale: 'zh-cn',
    };
  },


  onCollapseChange() {
    this.setState({
      collapse: !this.state.collapse,
    })
  },
  toolbarClick:function (e) {
    this.setState({currentKey:e.key});
    if(e.key=="teachTimes"){
      var breadcrumbArray = [{hrefLink:'#/MainLayout',hrefText:"首页"}];
      mainLayout.refs.mainTabComponents.buildBreadcrumb(breadcrumbArray);
    }
  },
  //获取备课计划下的课件资源
  getTeachPlans:function (optContent,breadCrumbArray) {
    //点击的菜单标识：teachScheduleId
    if(optContent==null){
      mainLayout.refs.mainTabComponents.buildBreadcrumb(breadCrumbArray);
    }else{

      var optContentArray = optContent.split("#");
      if(optContentArray[1]!="bySubjectId"){
        var breadcrumbArray = [{hrefLink:'#/MainLayout',hrefText:"首页"}];
        mainLayout.refs.mainTabComponents.buildBreadcrumb(breadcrumbArray);
      }else{
        mainLayout.refs.mainTabComponents.buildBreadcrumb(breadCrumbArray);
      }
      mainLayout.refs.mainTabComponents.getTeachPlans(optContent);
    }
  },

  componentWillMount(){
    var userIdent = sessionStorage.getItem("ident");
    if(userIdent==null || userIdent==""){
        location.hash="login";
    }
    //sessionStorage.setItem("ident","23836");
  },

  //获取老师的已布置作业列表
  getTeacherHomeWork:function (optType) {
      mainLayout.refs.homeWorkTabComponents.getTeacherHomeWork(optType);
  },

  getStudyEvaluate:function (optType) {
    mainLayout.refs.studyEvaluateTabComponents.getStudyEvaluate();
  },

  callBackKnowledgeMenuBuildBreadCrume(menuText,menuLevel,menuId,openKeysStr){
    var breadCrumbArray = mainLayout.refs.knowledgeMenuComponents.bulidBreadCrumbArray(menuText,menuLevel,menuId,openKeysStr);
    return breadCrumbArray;
  },



  render() {
    const collapse = this.state.collapse;
    //根据如下判断结果，完成对页面中部位置的渲染，不同情况，渲染不同组件
    var middleComponent;
    var tabComponent=<MainTabComponents ref="mainTabComponents"/>;
    if(this.state.currentKey=="teachTimes"){
      middleComponent = <MiddleMenuComponents activeMenu={this.state.activeMiddleMenu}  callbackParent={this.getTeachPlans}/>;
      tabComponent=<MainTabComponents ref="mainTabComponents" />;
    }else if(this.state.currentKey=="KnowledgeResources"){
      middleComponent = <KnowledgeMenuComponents ref="knowledgeMenuComponents" callbackParent={this.getTeachPlans} ></KnowledgeMenuComponents>;
      tabComponent=<MainTabComponents ref="mainTabComponents" callBackKnowledgeMenuBuildBreadCrume={this.callBackKnowledgeMenuBuildBreadCrume} />;
    }else if(this.state.currentKey=="homeWork"){
      middleComponent = <HomeWorkMenu callbackParent={this.getTeacherHomeWork}  ></HomeWorkMenu>
      tabComponent=<HomeWorkTabComponents ref="homeWorkTabComponents" />;
    }else if(this.state.currentKey =="studyEvaluate"){
      //学习评价
      middleComponent = <StudyEvaluateMenu callbackParent={this.getStudyEvaluate} ></StudyEvaluateMenu>
      tabComponent=<StudyEvaluateTabComponents ref="studyEvaluateTabComponents"/>;
    }

    return (
        <LocaleProvider locale={this.state.locale}>
      <div className={collapse ? "ant-layout-aside ant-layout-aside-collapse" : "ant-layout-aside"}>

        <aside className="ant-layout-sider">
          <div className="ant-layout-logo">
            <UserCardModalComponents/>
          </div>
          <Menu mode="inline" theme="dark" defaultSelectedKeys={[this.state.currentKey]}  onClick={this.toolbarClick}>
            <Menu.Item key="teachTimes" className="padding_menu">
              <div className="menu_left_icon menu_lessons"></div><div className="tan">我的备课</div>
            </Menu.Item>
            <Menu.Item key="KnowledgeResources" className="padding_menu">
              <div className="menu_left_icon menu_resources"></div><div className="tan">资源库</div>
            </Menu.Item>
{/*            <Menu.Item key="teachReady" href="wwww.baidu.com" className="padding_menu">
              <Icon type="edit"/><span className="nav-text">备课</span>
            </Menu.Item>*/}
            <Menu.Item key="homeWork" className="padding_menu">
             <div className="menu_left_icon menu_homework"></div><div className="tan">家庭作业</div>
            </Menu.Item>
            <Menu.Item key="studyEvaluate" className="padding_menu">
              <div className="menu_left_icon menu_evaluation"></div><div className="tan">学习评价</div>
            </Menu.Item>
{/*            <Menu.Item key="folder" className="padding_menu">
              <Icon type="clock-circle-o" /><span className="nav-text">统计+回顾</span>
            </Menu.Item>
            <Menu.Item key="resources" className="padding_menu">
              <Icon type="hdd" /><span className="nav-text">资源中心</span>
            </Menu.Item>*/}
            <FloatButton ref="floatButton"/>
          </Menu>

          <div className="ant-aside-action" > 

          </div>
		
        </aside>

        <div className="ant-layout-main">
          <div className="ant-layout-header">
                <HeaderComponents/>

          </div>

          <div className="ant-layout-operation">
            <Row>
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
            </Row>
          </div>
        
        </div>
      </div>
        </LocaleProvider>
    );
  },
});
export default MainLayout;
  