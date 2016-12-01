import React, { PropTypes,Link } from 'react';
import { Table, Popconfirm, Button } from 'antd';
import ReactDOM from 'react-dom';
import { Menu, Icon } from 'antd';
import { Badge,Pagination } from 'antd';
import TeachingComponents from '../components/TeachingComponents';
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

  doWebService : function(data,listener) {
    var service = this;
    //this.WEBSERVICE_URL = "http://192.168.2.103:8080/Excoord_For_Education/webservice";
    this.WEBSERVICE_URL = "http://www.maaee.com/Excoord_For_Education/webservice";
    // this.WEBSERVICE_URL = "http://192.168.1.115:8080/Excoord_For_Education/webservice";
    if (service.requesting) {
      return;
    }
    service.requesting = true;
    $.post(service.WEBSERVICE_URL, {
      params : data
    }, function(result, status) {
      service.requesting = false;
      if (status == "success") {
        listener.onResponse(result);
      } else {
        listener.onError(result);
      }
    }, "json");
  },

  handleClick(e) {
    mMenu.setState({
      currentMenu: e.key,
    });

    //location.hash=e.key;
  },
  //菜单被选择时执行的函数
  subMenuTitleClick(e){
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
    this.doWebService(JSON.stringify(param), {
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

  // componentWillMount(){
  //   this.getLessonMenu();
  // },

  buildMenuChildren:function (menuList) {
    children = menuList.map((e, i)=> {
      return <SubMenu key={e[0]} onTitleClick={this.subMenuTitleClick} title={<span><span>{e[1]}</span><Badge count={e[2]}/> <span id={e[0]+"#"+e[1]} onClick={this.editTeachSchedule} className='write_right'><Icon type="edit"/></span><span id={e[0]} onClick={this.deleteTeachSchedule} className='del_right'><Icon type="delete"/></span> </span>}>

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

  editTeachSchedule:function (e) {
        // alert("修改教学进度"+e.currentTarget.id);
    mMenu.showModal('edit',e.currentTarget.id);
  },

  deleteTeachSchedule:function (e) {
    //alert("请先删除当前进度下的教学资源，再执行此操作"+e.currentTarget.title);
    var confirmResult = confirm("确定要删除该教学进度?");
    if(confirmResult){
      var sids = e.currentTarget.id;
      var param = {
        "method":'deleteTeachSchedules',
        "ident":sessionStorage.getItem("ident"),
        "sids":sids
      };
      this.doWebService(JSON.stringify(param), {
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

  showModal:function (optType,editSchuldeId) {
    optType = (optType=="edit"?"edit":"add");
    // alert("editSchuldeId:"+editSchuldeId);
    // alert(optType);
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
