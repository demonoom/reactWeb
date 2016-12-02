import React, { PropTypes,Link } from 'react';
import { Table, Popconfirm } from 'antd';
import { Menu, Icon } from 'antd';
import { Badge,Pagination } from 'antd';
const SubMenu = Menu.SubMenu;

var mMenu;
const HomeWorkMenu = React.createClass({
  getInitialState() {
    mMenu = this;
    return {
      currentMenu: 'goSchool',
      currentPage: 1,
      openSubMenu:this.props.activeMenu,
      show: 1,
      lessonCount:0,
      menuList:[],
    };
  },

  handleClick(e) {
    this.setState({
      currentMenu: e.key,
    });
  },
  //菜单被选择时执行的函数
  subMenuTitleClick(e){
    var domE = e.domEvent;
    var target = domE.target;
    if(navigator.userAgent.indexOf("Chrome") > -1){
      target=domE.currentTarget;
    }else{
      target = domE.target;
    }
    $("div[style]").each(function(){
      $(this).css("background-color","");
    });
    target.style.backgroundColor="#d4edff";
    this.setState({openSubMenu:e.key});
    var optContent = e.key;
    if(e.key=="assignHomeWork"){
      this.props.callbackParent(optContent);
    }
  },

  onChange(page) {
    console.log(page);
    this.setState({
      currentPage: page,
    });
  },

  render() {
    return (
        <div>
          <div className="menu_til">作业</div>
          <Menu ref="middleMenu" onClick={this.handleClick}
                className="cont_t"
                defaultOpenKeys={['goSchool']}
                openKeys={[this.state.openSubMenu]}
                selectedKeys={['assignHomeWork']}
                mode="inline"
          >
            <SubMenu key="assignHomeWork" onTitleClick={this.subMenuTitleClick} title={<span><Icon type="mail" className='le_1' /><span>布置作业</span></span>}>
            </SubMenu>
{/*            <SubMenu key="homeWorkCount" onTitleClick={this.subMenuTitleClick} title={<span><Icon type="mail" className='le_1' /><span>作业统计</span></span>}>
            </SubMenu>
            <SubMenu key="correctHomeWork" onTitleClick={this.subMenuTitleClick} title={<span><Icon type="mail" className='le_1' /><span>批改作业</span></span>}>
            </SubMenu>*/}


          </Menu>
        </div>
    );
  },
});
export default HomeWorkMenu;