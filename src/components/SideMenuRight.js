import React, { PropTypes } from 'react';
import { Table, Popconfirm, Button } from 'antd';
import { Menu, Icon } from 'antd';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

var divStyle = {
      width:'350px',
      height:'500px',
      background:'#999999',
      position:'absolute',
      right:'-350px',//0时完全显示
      zIndex:'999',
      top:'53px',
      height:'100%'
};

var spanStyle = {
      width:'20px',
      height:'70px',
      lineHeight:'23px',
      background:'#09C',
      position:'absolute',
      right:'350px',
      top:'200px',
      float:'right',
};

var timer=null;
const SideMenuRight = React.createClass({
  getInitialState() {
    return {
      current: '6',
    };
  },

  startmove:function (target,speed) {
      var odiv = this.refs.div1;
      console.log(odiv.style.right);
      odiv.style.right='0px';
  },

  openDiv:function (e) {
    this.startmove(0,10);
  },

  closeDiv:function (e) {
      var odiv = this.refs.div1;
      odiv.style.right='-350px';
  },

  render() {
    return (
      <div ref="div1" style={divStyle}  onMouseLeave={this.closeDiv}>
        <ul>
            <li><a href="#">Menu1</a></li>
            <li><a href="#">Menu2</a></li>
            <li><a href="#">Menu3</a></li>
            <li><a href="#">Menu4</a></li>
            <li><a href="#">Menu5</a></li>
        </ul>
        <span onClick={this.openDiv} style={spanStyle}>侧边栏</span>
      </div>
    );
  },
});
export default SideMenuRight;
