import React, { PropTypes } from 'react';
import { Table, Popconfirm, Button,message } from 'antd';
import { Menu, Icon } from 'antd';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

const MiddleMenu = React.createClass({
  getInitialState() {
    return {
      current: '6',
    };
  },
  handleClick(e) {
    //alert(e.key);
    //console.log('click ', e);
    this.setState({
      current: e.key,
    });
    location.hash=e.key;
  },
  openMenu:function (e) {
    alert(e.key);
  },
  render() {
    return (
      <Menu onClick={this.handleClick}
            className="cont_t"
            defaultOpenKeys={[this.props.activeMenu]}
            selectedKeys={[this.state.current]}
            mode="inline"
      >
        <SubMenu key="sub1" title={<span><Icon type="mail" /><span>备课计划</span></span>}>
          <Menu.Item key="1">备课计划 1</Menu.Item>
          <Menu.Item key="2">备课计划 2</Menu.Item>
          <Menu.Item key="3">备课计划 3</Menu.Item>
          <Menu.Item key="4">备课计划 4</Menu.Item>
        </SubMenu>
        <SubMenu key="sub2" title={<span><Icon type="appstore" /><span>题库中心</span></span>}>
          <Menu.Item key="buttons">题库中心 5</Menu.Item>
          <Menu.Item key="6">题库中心 6</Menu.Item>
          <SubMenu key="sub3" title="题库中心子菜单">
            <Menu.Item key="7">课时1</Menu.Item>
            <Menu.Item key="8">课时2</Menu.Item>
            <Menu.Item key="7">课时3</Menu.Item>
            <Menu.Item key="8">课时4</Menu.Item>
          </SubMenu>
        </SubMenu>
        <SubMenu key="sub4" title={<span><Icon type="setting" /><span>备课</span></span>}>
          <Menu.Item key="9">备课 9</Menu.Item>
          <Menu.Item key="10">备课 10</Menu.Item>
          <Menu.Item key="11">备课 11</Menu.Item>
          <Menu.Item key="12">备课 12</Menu.Item>
        </SubMenu>
      </Menu>
    );
  },
});
export default MiddleMenu;
