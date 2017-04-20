import React from  'react';
import { Menu,  Icon,Row, Col  } from 'antd';
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
import {isEmpty} from '../utils/Const';
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
    proxyObj:null,
  getInitialState() {
    mainLayout = this;
    return {
      collapse: true,
      activeMiddleMenu:'sub1',
      currentKey:'teachTimes',
      openKeysStr:'',
      locale: 'zh-cn',
      resouceType:'',
        ifr:{},
    };
    this.switchSection = this.switchSection.bind(this)
    this.showpanle = this.showpanle.bind(this)
    this.foceClosePanle = this.foceClosePanle.bind(this)
  },


  onCollapseChange() {
    this.setState({
      collapse: !this.state.collapse,
    })
  },
  toolbarClick:function (e) {
    toolbarKey=e.key;
    this.setState({currentKey:e.key,resouceType:''});
    if(toolbarKey=="antNest"){
      //蚁巢
      mainLayout.setState({resouceType:"visitAntNest"});
    }else{
      if(e.key!="KnowledgeResources"){
        var breadcrumbArray = [{hrefLink:'#/MainLayout',hrefText:"首页"}];
        if(mainLayout.refs.mainTabComponents!=null && typeof(mainLayout.refs.mainTabComponents)!="undefined" ){
          mainLayout.refs.mainTabComponents.buildBreadcrumb(breadcrumbArray,0);
        }
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
  },
    // 呼叫任何本组件实例的任何方法，前提最终访问的方法只能接受一个对象类型的参数 dapeng
    componentDidUpdate(){
        let obj = this.proxyObj;
        if(!obj) return;
         this.refs[obj.ref][obj.methond].call(this,obj.param);
        this.proxyObj=null;
    },
    // 切换组件页面
    switchSection(obj){
      this.proxyObj = obj;
        this.setState({resouceType:obj.resouceType});

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
    if(resouceType=="visitAntGroup" && isEmpty(mainLayout.refs.antGroupTabComponents)==false){
      mainLayout.refs.antGroupTabComponents.getAntGroup();
    }
    mainLayout.setState({resouceType:resouceType});
  },


  showpanle(obj){
     // this.refs.laifr.closepanle();
    //  this.setState({ifr: obj});
      LP.GetLP(obj);
  },

  foceClosePanle(){
      this.refs.laifr.closepanle(true);
  },

  render() {
    const collapse = this.state.collapse;
    //根据如下判断结果，完成对页面中部位置的渲染，不同情况，渲染不同组件
    var middleComponent;
    var mainContent;
    var tabComponent=<MainTabComponents ref="mainTabComponents" showpanle={this.showpanle}/>;
    if(this.state.currentKey=="teachTimes"){
      middleComponent = <MiddleMenuComponents activeMenu={this.state.activeMiddleMenu}  callbackParent={this.getTeachPlans}/>;
      tabComponent=<MainTabComponents ref="mainTabComponents" showpanle={this.showpanle}/>;
    }else if(this.state.currentKey=="KnowledgeResources"){
      middleComponent = <KnowledgeMenuComponents ref="knowledgeMenuComponents" callbackParent={this.getTeachPlans} ></KnowledgeMenuComponents>;
      tabComponent=<MainTabComponents  showpanle={this.showpanle} ref="mainTabComponents" callBackKnowledgeMenuBuildBreadCrume={this.callBackKnowledgeMenuBuildBreadCrume} />;
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
    //
      switch (mainLayout.state.resouceType){
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
          case 'visitAntNest':
              mainContent = <Row>
                <Col span={24}>
                  <div className="ant-layout-container">
                    <div className="ant-layout-content">
                      <AntNestTabComponents ref="antNestTabComponents" resouceType={mainLayout.state.resouceType}/>
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
                      <AntGroupTabComponents ref="antGroupTabComponents" resouceType={mainLayout.state.resouceType}/>
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
                      <MyFavorites resouceType={mainLayout.state.resouceType} onPreview={ this.showpanle.bind(this) } />
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
                      <MyMTV  resouceType={mainLayout.state.resouceType} />
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
                      <ResetStudentAccountKey resouceType={mainLayout.state.resouceType} />
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
                      <MyFollows resouceType={mainLayout.state.resouceType} callEvent={this.switchSection} />
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
                      <TeacherResource ref="teacherResource" showpanle={this.showpanle} resouceType={mainLayout.state.resouceType}/>
                    </div>
                  </div>
                </Col>
              </Row>;
              break;

      }



    return (
        <LocaleProvider locale={this.state.locale} >
      <div className={collapse ? "ant-layout-aside ant-layout-aside-collapse" : "ant-layout-aside"}>

        <aside className="ant-layout-sider"  onClick={this.foceClosePanle.bind(this)} >
          <div className="ant-layout-logo">
            <UserCardModalComponents callbackParent={this.getTeacherResource} callEvent={this.switchSection}/>
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
              <i className="iconfont">&#xe60b;</i><div className="tan">家庭作业</div>
            </Menu.Item>
            <Menu.Item key="studyEvaluate" className="padding_menu">
              <Icon type="clock-circle-o" /><div className="tan">学习评价</div>
            </Menu.Item>
            <Menu.Item key="antNest" className="padding_menu">
              <i className="icon_yichao"></i><div className="tan">蚁巢</div>
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

        <div className="ant-layout-main" onClick={this.foceClosePanle} >
          <div className="ant-layout-header">

                <HeaderComponents/>

          </div>

          <div className="ant-layout-operation">
            {mainContent}
          </div>

        </div>

        <div className="panleArea" ></div>
          <Asidepanel  param={this.state.ifr} ref="laifr"  />


      </div>
        </LocaleProvider>
    );
  },
});
export default MainLayout;
