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
    mMenu.setState({
      currentMenu: e.key,
    });
    var domE = e.domEvent;
    var target = domE.target;
    if(navigator.userAgent.indexOf("Chrome") > -1){
      target=domE.currentTarget;
    }else{
      target = domE.target;
    }
    $("li[style]").each(function(){
      $(this).css("background-color","");
    });
    target.style.backgroundColor="#e5f2fe";
    mMenu.setState({openSubMenu:e.key});
    var optContent = e.key;
    if(e.key=="studyEvaluate"){
      mMenu.props.callbackParent(optContent);
    }
  },

  render() {
    return (
        <div>
          <div className="menu_til">学习评价</div>
          <Menu ref="middleMenu" onClick={this.handleClick}
                className="cont_t"
                defaultOpenKeys={['studyEvaluate']}
                openKeys={[this.state.openSubMenu]}
                selectedKeys={['studyEvaluate']}
                mode="inline"
          >
            <Menu.Item key="studyEvaluate" style={{backgroundColor:'#e5f2fe'}} > <span><Icon type="mail" className='le_1' /><span>学情分析</span></span> </Menu.Item>
          </Menu>
        </div>
    );
  },
});
export default StudyEvaluateMenu;