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
import ExamMenu from '../components/exam/ExamMenu';
import HomeWorkTabComponents from '../components/HomeWorkTabComponents';
import ExamPagerTabComponents from '../components/exam/ExamPagerTabComponents';
import TeacherResource from '../components/TeacherInfos/TeacherResource';
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
      resouceType:'',
    };
  },


  onCollapseChange() {
    this.setState({
      collapse: !this.state.collapse,
    })
  },
  toolbarClick:function (e) {
    toolbarKey=e.key;
    this.setState({currentKey:e.key,resouceType:''});
    if(e.key!="KnowledgeResources"){
      var breadcrumbArray = [{hrefLink:'#/MainLayout',hrefText:"首页"}];
      if(mainLayout.refs.mainTabComponents!=null && typeof(mainLayout.refs.mainTabComponents)!="undefined" ){
          mainLayout.refs.mainTabComponents.buildBreadcrumb(breadcrumbArray,0);
      }
    }

    /*if(mainLayout.refs.mainTabComponents!=null && typeof(mainLayout.refs.mainTabComponents)!="undefined" ) {
      mainLayout.refs.mainTabComponents.setCurrentOptType(e.key);
    }*/
  },
  //获取备课计划下的课件资源
  getTeachPlans:function (optContent,breadCrumbArray) {
    //点击的菜单标识：teachScheduleId
    if(optContent==null){
      if(mainLayout.refs.mainTabComponents!=null && typeof(mainLayout.refs.mainTabComponents)!="undefined" ){
        mainLayout.refs.mainTabComponents.buildBreadcrumb(breadCrumbArray);
      }
    }else{

      var optContentArray = optContent.split("#");
      var childrenCount = optContentArray[3];
      //lastClickMenuChildrenCount = childrenCount;
      sessionStorage.setItem("lastClickMenuChildrenCount",childrenCount);
      if(optContentArray[1]!="bySubjectId"){
        var breadcrumbArray = [{hrefLink:'#/MainLayout',hrefText:"首页"}];
        if(mainLayout.refs.mainTabComponents!=null && typeof(mainLayout.refs.mainTabComponents)!="undefined" ){
          mainLayout.refs.mainTabComponents.buildBreadcrumb(breadcrumbArray);
        }
      }else{
        if(mainLayout.refs.mainTabComponents!=null && typeof(mainLayout.refs.mainTabComponents)!="undefined" ){
          mainLayout.refs.mainTabComponents.buildBreadcrumb(breadCrumbArray,childrenCount);
        }
      }
      if(mainLayout.refs.mainTabComponents!=null && typeof(mainLayout.refs.mainTabComponents)!="undefined" ){
        mainLayout.refs.mainTabComponents.getTeachPlans(optContent);
      }
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

  //获取试卷列表
  getExamPagerList:function (optType) {
      mainLayout.refs.examPagerTabComponents.getExamPagerList();
  },

  getStudyEvaluate:function (optType) {
    mainLayout.refs.studyEvaluateTabComponents.getStudyEvaluate();
  },

  callBackKnowledgeMenuBuildBreadCrume(menuText,menuLevel,menuId,openKeysStr){
    var breadCrumbArray = mainLayout.refs.knowledgeMenuComponents.bulidBreadCrumbArray(menuText,menuLevel,menuId,openKeysStr);
    return breadCrumbArray;
  },

  getTeacherResource(resouceType){
    mainLayout.setState({resouceType:resouceType});
  },



  render() {
    const collapse = this.state.collapse;
    //根据如下判断结果，完成对页面中部位置的渲染，不同情况，渲染不同组件
    var middleComponent;
    var mainContent;
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
    }else if(this.state.currentKey =="exam"){
      //考试
      middleComponent = <ExamMenu callbackParent={this.getExamPagerList}></ExamMenu>
      tabComponent=<ExamPagerTabComponents ref="examPagerTabComponents" />;
    }
    if(mainLayout.state.resouceType==null || mainLayout.state.resouceType==''){
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
    }else{
      mainContent = <Row>
        <Col span={24}>
          <div className="ant-layout-container">
            <div className="ant-layout-content">
              <TeacherResource ref="teacherResource" resouceType={mainLayout.state.resouceType}/>
            </div>
          </div>
        </Col>
      </Row>;
    }


    return (
        <LocaleProvider locale={this.state.locale}>
      <div className={collapse ? "ant-layout-aside ant-layout-aside-collapse" : "ant-layout-aside"}>

        <aside className="ant-layout-sider">
          <div className="ant-layout-logo">
            <UserCardModalComponents callbackParent={this.getTeacherResource}/>
          </div>
          <Menu mode="inline" theme="dark" defaultSelectedKeys={[this.state.currentKey]}  onClick={this.toolbarClick}>
            <Menu.Item key="teachTimes" className="padding_menu">
              <Icon type="bar-chart" /><div className="tan">我的备课</div>
            </Menu.Item>
            <Menu.Item key="KnowledgeResources" className="padding_menu">
              <Icon type="book" /><div className="tan">资源库</div>
            </Menu.Item>
{/*            <Menu.Item key="teachReady" href="wwww.baidu.com" className="padding_menu">
              <Icon type="edit"/><span className="nav-text">备课</span>
            </Menu.Item>*/}
            <Menu.Item key="homeWork" className="padding_menu">
              <i className="iconfont">&#xe65e;</i><div className="tan">家庭作业</div>
            </Menu.Item>
            <Menu.Item key="studyEvaluate" className="padding_menu">
              <Icon type="clock-circle-o" /><div className="tan">学习评价</div>
            </Menu.Item>
            <Menu.Item key="exam" className="padding_menu">
              <Icon type="file-text" /><div className="tan">考试</div>
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
            {mainContent}
          </div>

        </div>
      </div>
        </LocaleProvider>
    );
  },
});
export default MainLayout;
