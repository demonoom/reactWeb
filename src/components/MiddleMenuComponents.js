import React, { PropTypes,Link } from 'react';
import { Table, Popconfirm, Button,Modal } from 'antd';
import { Menu, Icon,message,Dropdown } from 'antd';
import { Badge,Pagination } from 'antd';
import TeachingComponents from '../components/TeachingComponents';
import { doWebService } from '../WebServiceHelper';
import {getPageSize} from '../utils/Const';
const SubMenu = Menu.SubMenu;
const confirm = Modal.confirm;

// let uuid = 0;


//菜单二级子菜单数组
let lessonData=new Array();
//一级菜单数组
let List=new Array();
//菜单元素，根据构建出来的该对象，对菜单进行生成
let children;
var mMenu;
var scheduleCount=0;
var percent = 0;

const MiddleMenuComponents = React.createClass({
  getInitialState() {
    mMenu = this;
    return {
      currentMenu: 'goSchool',
      currentPage: 1,
      openSubMenu:this.props.activeMenu,
      show: 1,
      lessonCount:0,
      menuList:[],
      selectedKey:''
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
    target.style.backgroundColor="#e5f2fe" ;
    mMenu.setState({openSubMenu:e.key});
    var optContent = e.key+"#"+"bySchedule";
    mMenu.props.callbackParent(optContent);
  },

  getLessonMenu(pageNo){
    var param = {
      "method":'getTeachScheduls',
      "ident":sessionStorage.getItem("ident"),
      "pageNo":pageNo
    };
    doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log(ret.msg);
        List.splice(0,List.length);
        ret.response.forEach(function (e) {
          var scheduleId = e.colTsId;
          var courseName = e.colTitle;
          var courseTimes = 0;//当值为0时，系统不显示具体的子菜单数量（即菜单上无徽标显示）
          List.push([ scheduleId, courseName, courseTimes]);
        });
        mMenu.buildMenuChildren(List);
        var pager = ret.pager;
        mMenu.setState({menuList: List,lessonCount:pager.rsCount});
      },
      onError : function(error) {
        message.error(error);
      }
    });
  },

  componentWillReceiveProps(){
    mMenu.setState({openSubMenu:this.props.activeMenu});
  },

  componentDidMount(){
    mMenu.getLessonMenu(this.state.currentPage);
  },

  /**
   * 备课计划名称右侧的DropDownMenu点击响应处理函数
   * @param key 被点击menu item的key
   */
  menuItemOnClick : function ({ key }) {
    var clickKey = `${key}`;
    var keyArray = clickKey.split("#");
    if(keyArray.length==2){
        //修改
      mMenu.showModal('edit',clickKey);
    }else{
        //删除
      mMenu.deleteTeachSchedule(clickKey);
    }
  },

  /**
   * 构建备课计划菜单对象
   * @param menuList 菜单对象值的数组
   */
  buildMenuChildren:function (menuList) {
    children = menuList.map((e, i)=> {

      const menu = (
          <Menu onClick={mMenu.menuItemOnClick}>
              <Menu.Item key={e[0]+"#"+e[1]} className="popup_i_icon"><Icon className="icon_right" type="edit" />修改</Menu.Item>
              <Menu.Item key={e[0]} className="popup_i_icon"><Icon className="icon_right" type="delete" />删除</Menu.Item>
            </Menu>
      );
      if(i==0){
        mMenu.setState({
          currentMenu: e[0],
        });
        var optContent = e[0]+"#"+"bySchedule";
        mMenu.props.callbackParent(optContent);
        //div显示的内容过长时，使用title提示
        if(e[1].length>10){
          return <Menu.Item key={e[0]} style={{backgroundColor:'#e5f2fe'}}> <div  title={e[1]} className="submenu_left_hidden title_1">{e[1]}</div> <Dropdown overlay={menu}  trigger={['click']}  className='del_right'><i className="iconfont iconfont_more">&#xe60e;</i></Dropdown>
          </Menu.Item>
        }else{
          return <Menu.Item key={e[0]} style={{backgroundColor:'#e5f2fe'}}> <div className="submenu_left_hidden">{e[1]}</div> <Dropdown overlay={menu}  trigger={['click']}  className='del_right'><i className="iconfont iconfont_more">&#xe60e;</i></Dropdown>
          </Menu.Item>
        }
      }else{
        if(e[1].length>10){
          return <Menu.Item key={e[0]} > <div title={e[1]} className="submenu_left_hidden">{e[1]}</div> <Dropdown overlay={menu}  trigger={['click']}  className='del_right'><i className="iconfont iconfont_more">&#xe60e;</i></Dropdown>
          </Menu.Item>
        }else{
          return <Menu.Item key={e[0]} > <div className="submenu_left_hidden">{e[1]}</div> <Dropdown overlay={menu}  trigger={['click']}  className='del_right'><i className="iconfont iconfont_more">&#xe60e;</i></Dropdown>
          </Menu.Item>
        }

      }

    });
  },

  onChange(page) {
    console.log(page);
    mMenu.getLessonMenu(page);
    this.setState({
      currentPage: page,
    });
  },
  /**
   * 删除备课计划
   * @param key 被删除备课计划的id
   */
  deleteTeachSchedule:function (key) {
    confirm({
      title: '确定要删除该备课计划?',
      content: '',
      transitionName:'',
      onOk() {
        var sids = key;
        var param = {
          "method":'deleteTeachSchedules',
          "ident":sessionStorage.getItem("ident"),
          "sids":sids
        };
        doWebService(JSON.stringify(param), {
          onResponse : function(ret) {
            console.log(ret.msg);
            if(ret.msg=="调用成功" && ret.response==true){
              message.success("备课计划删除成功");
            }else{
              message.error("备课计划删除失败");
            }
            mMenu.getLessonMenu(mMenu.state.currentPage);
          },
          onError : function(error) {
            message.error(error);
          }
        });
      },
      onCancel() {},
    });
  },

  /**
   * 新增和修改备课计划的弹窗
   * @param optType 操作方式  add/edit,通过该值区分是新增操作还是修改操作
   * @param editSchuldeId 如果是修改操作，则该值为被修改备课计划的id，不能为空
   */
  showModal:function (optType,editSchuldeId) {
    optType = (optType=="edit"?"edit":"add");
    mMenu.refs.teachingComponents.showModal(optType,editSchuldeId);
  },

  handleMenu(){
    mMenu.getLessonMenu(mMenu.state.currentPage);
  },

  render() {
    return (
      <div>

          <div className="menu_til"><Button type="primary" icon="plus-circle" onClick={this.showModal} className='add_study-d add_study-d-le1'>添加备课计划</Button></div>
          <TeachingComponents ref="teachingComponents" callbackParent={this.handleMenu}/>
          <Menu ref="middleMenu" onClick={this.handleClick}
                className="cont_t2"
                defaultOpenKeys={[mMenu.state.currentMenu]}
                openKeys={[this.state.currentMenu]}
                selectedKeys={[mMenu.state.currentMenu]}
                mode="inline"
          >
            {children}

          </Menu>
          <Pagination size="small" total={this.state.lessonCount} pageSize={getPageSize()} current={this.state.currentPage} onChange={this.onChange}/>
      </div>
    );
  },
});
export default MiddleMenuComponents;
