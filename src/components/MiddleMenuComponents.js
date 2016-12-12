import React, { PropTypes,Link } from 'react';
import { Table, Popconfirm, Button } from 'antd';
import { Menu, Icon,message,Dropdown } from 'antd';
import { Badge,Pagination } from 'antd';
import TeachingComponents from '../components/TeachingComponents';
import { doWebService } from '../WebServiceHelper';
const SubMenu = Menu.SubMenu;

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
    };
  },

  handleClick(e) {
    mMenu.setState({
      currentMenu: e.key,
    });

    //location.hash=e.key;
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
          // var lessonArray = e.split("#");
          var scheduleId = e.colTsId;
          var courseName = e.colTitle;
          var courseTimes = 0;//当值为0时，系统不显示具体的子菜单数量（即菜单上无徽标显示）
          // scheduleCount++;
          List.push([ scheduleId, courseName, courseTimes]);
        });
        mMenu.buildMenuChildren(List);
        var pager = ret.pager;
        mMenu.setState({menuList: List,lessonCount:pager.rsCount});
      },
      onError : function(error) {
        alert(error);
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
   * 教学进度名称右侧的DropDownMenu点击响应处理函数
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
   * 构建教学进度菜单对象
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
      return <SubMenu key={e[0]} onTitleClick={this.subMenuTitleClick} style={{backgroundColor:'red'}} title={<span><span>{e[1]}</span><Badge count={e[2]}/> <Dropdown overlay={menu}  trigger={['click']}  className='del_right'><a className="ant-dropdown-link" href="#"><Icon type="ellipsis" className="icon_more" /></a></Dropdown> </span>}>
      </SubMenu>
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
   * 删除教学进度
   * @param key 被删除教学进度的id
   */
  deleteTeachSchedule:function (key) {
    //alert("请先删除当前进度下的教学资源，再执行此操作"+e.currentTarget.title);
    var confirmResult = confirm("确定要删除该教学进度?");
    if(confirmResult){
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
            alert("教学进度删除成功");
          }else{
            alert("教学进度删除失败");
          }
          mMenu.getLessonMenu(mMenu.state.currentPage);
        },
        onError : function(error) {
          alert(error);
        }
      });
    }
  },

  /**
   * 新增和修改教学进度的弹窗
   * @param optType 操作方式  add/edit,通过该值区分是新增操作还是修改操作
   * @param editSchuldeId 如果是修改操作，则该值为被修改教学进度的id，不能为空
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
          <div className="menu_til"><Button type="primary" icon="plus" onClick={this.showModal} className='add_study'>添加教学进度</Button></div>
          <TeachingComponents ref="teachingComponents" callbackParent={this.handleMenu}/>
          <Menu ref="middleMenu" onClick={this.handleClick}
                className="cont_t2"
                defaultOpenKeys={['goSchool']}
                openKeys={[this.state.openSubMenu]}
                selectedKeys={['LeftNav']}
                mode="inline"
          >
            {children}

          </Menu>
          <Pagination size="small" total={this.state.lessonCount} pageSize="15" current={this.state.currentPage} onChange={this.onChange}/>
      </div>
    );
  },
});
export default MiddleMenuComponents;
