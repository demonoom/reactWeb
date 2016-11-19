import React, { PropTypes } from 'react';
import { Table, Popconfirm, Button } from 'antd';
import { Menu, Icon } from 'antd';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

const HomeWorkMenu = React.createClass({
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
        <SubMenu key="sub1" title={<span><Icon type="assignHomeWork" /><span>布置作业</span></span>}>
        </SubMenu>
        <SubMenu key="sub2" title={<span><Icon type="homeWorkCount" /><span>作业统计</span></span>}>
        </SubMenu>
        <SubMenu key="sub4" title={<span><Icon type="correctHomeWork" /><span>批改作业</span></span>}>
        </SubMenu>
      </Menu>
    );
  },
});
export default HomeWorkMenu;
