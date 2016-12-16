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
import KnowledgeComponents from '../components/KnowledgeComponents';

import { createStore } from 'redux';


const store = createStore(function () {

});

const MainLayout = React.createClass({
  getInitialState() {
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
    //alert(this.state.activeMiddleMenu);
    // this.state.activeMiddleMenu='sub1';
    //location.hash = e.key;  //Menu 的key值实际上是指向一个Router path，通过location.hash完成页面的跳转访问
    this.setState({currentKey:e.key});

     if(e.key=="teachTimes"){
       // this.setState({activeMiddleMenu:'sub1'});
       this.refs.middleMenu.activeMenu='goSchool';
     }else{
         // this.setState({activeMiddleMenu: 'sub4'});
       //this.refs.middleMenu.activeMenu='sub4';

     }
  },
  render() {
    const collapse = this.state.collapse;
    //根据如下判断结果，完成对页面中部位置的渲染，不同情况，渲染不同组件
    var middleComponent;
    if(this.state.currentKey=="teachTimes"){
      middleComponent = <MiddleMenuComponents activeMenu={this.state.activeMiddleMenu}/>;
    }else if(this.state.currentKey=="KnowledgeResources"){
      middleComponent = <KnowledgeComponents></KnowledgeComponents>;
    }

    return (
      <div className={collapse ? "ant-layout-aside ant-layout-aside-collapse" : "ant-layout-aside"}>

        <aside className="ant-layout-sider">
          <div className="ant-layout-logo">
            <UserCardModalComponents/>
          </div>
          <Menu mode="inline" theme="dark" defaultSelectedKeys={['teachTimes']}  onClick={this.toolbarClick}>
            <Menu.Item key="teachTimes">
              <Icon type="bar-chart" /><span className="nav-text">备课计划</span>
            </Menu.Item>
            <Menu.Item key="KnowledgeResources">
              <Icon type="book" /><span className="nav-text">资源库</span>
            </Menu.Item>
            <Menu.Item key="teachReady" href="wwww.baidu.com">
              <Icon type="edit"/><span className="nav-text">备课</span>
            </Menu.Item>
            <Menu.Item key="notification">
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

          <div>
            <Row>
              <Col span={5}>
                <div style={{width:240}}>
                  {middleComponent}
                </div>
              </Col>
              <Col span={19}>
                <div>
                  <div className="ant-layout-container">
                    <div className="ant-layout-content">
                      <div>
                        <MainTabComponents/>
                      </div>
                    </div>
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
