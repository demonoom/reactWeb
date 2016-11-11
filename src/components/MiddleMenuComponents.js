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
     // alert("11111:"+e.key);
    this.setState({
      currentMenu: e.key,
    });

    //location.hash=e.key;
  },
  //菜单被选择时执行的函数
  subMenuTitleClick(e){
    //alert(e.key);
    this.setState({openSubMenu:e.key});
    this.props.callbackParent(e.key);
  },

  openMenu:function (e) {
    //alert(e.key);
  },

  handleMenu: function(lessonInfo){
    //lessonData.splice(0,lessonData.length);
    List.push([ lessonInfo.scheduleId, lessonInfo.courseName, lessonInfo.courseTimes]);
    this.setState({menuList: List});
    this.buildMenuChildren();
  },

  getLessonMenu(){
    var param = {
      "method":'getTeachScheduleByIdent',
      "ident":'23836'
    };
    this.doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log(ret.msg);
        ret.response.forEach(function (e) {
            var lessonArray = e.split("#");
            var scheduleId = lessonArray[0];
            var courseName = lessonArray[1];
            var courseTimes = 0;//当值为0时，系统不显示具体的子菜单数量（即菜单上无徽标显示）
            //console.log(lessonArray[0]+"-----------"+lessonArray[1]);
          //courseTimes需要作为当前教学进度下的资源数量进行显示（课件和题目的总和）
            var lessonInfo = {"scheduleId":scheduleId,"courseName":courseName,"courseTimes":courseTimes};
            mMenu.handleMenu(lessonInfo);
        });
      },
      onError : function(error) {
        //alert(error);
        //phone.finish();
      }
    });
  },

  componentWillReceiveProps(){
    this.setState({openSubMenu:this.props.activeMenu});
  },

  componentDidMount(){
      this.getLessonMenu();
  },

  // componentWillMount(){
  //   this.getLessonMenu();
  // },

  buildMenuChildren:function () {
    children = this.state.menuList.map((e, i)=> {
      return <SubMenu key={e[0]} onTitleClick={this.subMenuTitleClick} title={<span><Icon type="mail" /><span>{e[1]}</span><Badge count={e[2]}/> <span title={e[0]} onClick={this.editTeachSchedule}><Icon type="edit"/></span>  <span title={e[0]} onClick={this.deleteTeachSchedule}><Icon type="delete"/></span> </span>}>
      </SubMenu>
    });
  },

  onChange(page) {
    console.log(page);
    this.setState({
      currentPage: page,
    });
  },

  editTeachSchedule:function (e) {
        //alert("修改教学进度"+e.currentTarget.title);
    this.showModal('edit',e.currentTarget.title);
  },

  deleteTeachSchedule:function (e) {
    alert("请先删除当前进度下的教学资源，再执行此操作"+e.currentTarget.title);
  },

  showModal:function (optType,editSchuldeId) {
    optType = (optType=="edit"?"edit":"add");
    //alert("oooo:"+optType);
    this.refs.teachingComponents.showModal(optType,editSchuldeId);
  },

  render() {
    return (
      <div>
        <Button type="primary" icon="plus" onClick={this.showModal}>添加教学进度</Button>
        <TeachingComponents ref="teachingComponents" callbackParent={this.handleMenu}/>
        <Menu ref="middleMenu" onClick={this.handleClick}
              style={{ width: 240 }}
              defaultOpenKeys={['goSchool']}
              openKeys={[this.state.openSubMenu]}
              selectedKeys={['LeftNav']}
              mode="inline"
        >
          {/*添加了徽标，用来显示菜单下的课时数*/}
          <SubMenu key="goSchool" onTitleClick={this.subMenuTitleClick} title={<span><Icon type="mail" /><span>示例：上学啦</span><Badge count={4}/> <span title="goSchool" onClick={this.editTeachSchedule}><Icon type="edit"/></span>  <span title="goSchool" onClick={this.deleteTeachSchedule}><Icon type="delete"/></span> </span>}>
          </SubMenu>

          {children}

        </Menu>
        <Pagination size="small" total={100} current={this.state.currentPage} onChange={this.onChange}/>
      </div>
    );
  },
});
export default MiddleMenuComponents;
