import React from  'react';
import { Menu, Breadcrumb, Icon ,Button} from 'antd';
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
    };
  },
  onCollapseChange() {
    this.setState({
      collapse: !this.state.collapse,
    })
  },
  toolbarClick:function (e) {
      // alert(e.key);
    this.setState({currentKey:e.key});
  },
  //获取教学进度下的课件资源
  getTeachPlans:function (optContent,breadCrumbArray) {
    //点击的菜单标识：teachScheduleId
    //  alert("optContent:mainLayout:"+optContent);
    if(optContent==null){
      // alert("mt:"+breadCrumbArray.length);
      mainLayout.refs.mainTabComponents.buildBreadcrumb(breadCrumbArray);
    }else{

      var optContentArray = optContent.split("#");
      if(optContentArray[1]!="bySubjectId"){
        var breadcrumbArray = [{hrefLink:'#/MainLayout',hrefText:"首页"}];
        mainLayout.refs.mainTabComponents.buildBreadcrumb(breadcrumbArray);
      }
      mainLayout.refs.mainTabComponents.getTeachPlans(optContent);
    }
  },

  //获取老师的已布置作业列表
  getTeacherHomeWork:function (optType) {
      // alert("家庭作业操作："+optType);
      mainLayout.refs.homeWorkTabComponents.getTeacherHomeWork(optType);
  },

  render() {
    const collapse = this.state.collapse;
    //根据如下判断结果，完成对页面中部位置的渲染，不同情况，渲染不同组件
    var middleComponent;
    var tabComponent=<MainTabComponents ref="mainTabComponents"/>;
    if(this.state.currentKey=="teachTimes"){
      middleComponent = <MiddleMenuComponents activeMenu={this.state.activeMiddleMenu}  callbackParent={this.getTeachPlans}/>;
      tabComponent=<MainTabComponents ref="mainTabComponents"/>;
    }else if(this.state.currentKey=="KnowledgeResources"){
      middleComponent = <KnowledgeMenuComponents callbackParent={this.getTeachPlans}></KnowledgeMenuComponents>;
      tabComponent=<MainTabComponents ref="mainTabComponents"/>;
    }else if(this.state.currentKey=="homeWork"){
      middleComponent = <HomeWorkMenu callbackParent={this.getTeacherHomeWork}></HomeWorkMenu>
      tabComponent=<HomeWorkTabComponents ref="homeWorkTabComponents"/>;
    }

    return (
      <div className={collapse ? "ant-layout-aside ant-layout-aside-collapse" : "ant-layout-aside"}>

        <aside className="ant-layout-sider">
          <div className="ant-layout-logo">
            <UserCardModalComponents/>
          </div>
          <Menu mode="inline" theme="dark" defaultSelectedKeys={[this.state.currentKey]}  onClick={this.toolbarClick}>
            <Menu.Item key="teachTimes">
              <Icon type="bar-chart" /><span className="nav-text">教学进度</span>
            </Menu.Item>
            <Menu.Item key="KnowledgeResources">
              <Icon type="book" /><span className="nav-text">资源库</span>
            </Menu.Item>
            <Menu.Item key="teachReady" href="wwww.baidu.com">
              <Icon type="edit"/><span className="nav-text">备课</span>
            </Menu.Item>
            <Menu.Item key="homeWork">
              <Icon type="file" /><span className="nav-text">家庭作业</span>
            </Menu.Item>
            <Menu.Item key="folder">
              <Icon type="clock-circle-o" /><span className="nav-text">统计+回顾</span>
            </Menu.Item>
            <Menu.Item key="resources">
              <Icon type="hdd" /><span className="nav-text">资源中心</span>
            </Menu.Item>
            <FloatButton/>
          </Menu>
          <div className="ant-aside-action" onClick={this.onCollapseChange}>
            {collapse ? <Icon type="right" /> : <Icon type="left" />}
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
          <div className="ant-layout-footer">
            <BackTopButton/>
            小蚂蚁移动教学平台 版权所有 恒坐标教育集团
          </div>
        </div>
      </div>
    );
  },
});
export default MainLayout;
