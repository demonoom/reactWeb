import React, { PropTypes,Link } from 'react';
import { Table, Popconfirm } from 'antd';
import { Menu, Icon } from 'antd';
import { Badge,Pagination } from 'antd';
const SubMenu = Menu.SubMenu;

var mMenu;
const StudyEvaluateMenu = React.createClass({
  getInitialState() {
    mMenu = this;
    return {
      currentMenu: 'studyEvaluate',
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
    this.setState({openSubMenu:e.key});
    var optContent = e.key;
    if(e.key=="studyEvaluate"){
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
          <div className="menu_til">学习评价</div>
          <Menu ref="middleMenu" onClick={this.handleClick}
                className="cont_t"
                defaultOpenKeys={['goSchool']}
                openKeys={[this.state.openSubMenu]}
                selectedKeys={['assignHomeWork']}
                mode="inline"
          >
            <SubMenu key="studyEvaluate" onTitleClick={this.subMenuTitleClick} title={<span><Icon type="mail" className='le_1' /><span>学情分析</span></span>}>

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
export default StudyEvaluateMenu;