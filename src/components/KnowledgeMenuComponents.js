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
let childrenSub;
var mMenu;
var subMenu;
var vdom = new Array();
const KnowledgeMenuComponents = React.createClass({
  getInitialState() {
    mMenu = this;
    return {
      currentMenu: 'goSchool',
      currentPage: 1,
      openSubMenu:this.props.activeMenu,
      show: 1,
      lessonCount:0,
      menuList:[],
      totalCount:0,
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
    var optContent = e.key+"#"+"bySubjectId";
    this.props.callbackParent(optContent);
  },

  openMenu:function (e) {
    //alert(e.key);
  },

  handleMenu: function(e){
    //lessonData.splice(0,lessonData.length);
    List.push([e]);
    this.setState({menuList: List});
    // this.buildMenuChildren();
  },

  getLessonMenu(){
    var param = {
      "method":'getAllKnowledgePoints',
    };
    this.doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log(ret.msg);
        var count =0;
        ret.response.forEach(function (e) {
          console.log("eeeee:"+e);
          count++;
          /*var lessonArray = e.split("#");
           var scheduleId = lessonArray[0];
           var courseName = lessonArray[1];
           var courseTimes = 0;//当值为0时，系统不显示具体的子菜单数量（即菜单上无徽标显示）
           //console.log(lessonArray[0]+"-----------"+lessonArray[1]);
           //courseTimes需要作为当前教学进度下的资源数量进行显示（课件和题目的总和）
           var lessonInfo = {"scheduleId":scheduleId,"courseName":courseName,"courseTimes":courseTimes};
           */
          mMenu.handleMenu(e);
        });
        mMenu.buildMenuChildren(mMenu.state.menuList);
        mMenu.setState({totalCount:count});
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

  // componentDidMount(){
  //   this.getLessonMenu();
  // },

  componentWillMount(){
    this.getLessonMenu();
  },

   buildMenuChildren:function (menuList) {
    var menuContent;
    children = menuList.map((e, i)=> {
      menuContent = (e[0]!=null?e[0]:e);
      const Options = menuContent.children.map(konwledge => <SubMenu key={konwledge.id} onTitleClick={this.subMenuTitleClick} title={<span><Icon type="mail" /><span>{konwledge.content}</span></span>}>
          {this.buildOptions(konwledge.children)}
      </SubMenu>);
      return <SubMenu key={menuContent.id} onTitleClick={this.subMenuTitleClick} title={<span><Icon type="mail" /><span>{menuContent.content}</span></span>}>
        {Options}
      </SubMenu>
    });
  },

  hasChild:function (menuContent) {
      if(menuContent.children.length!=0){
          return true;
      }else{
          return false;
      }
  },

  buildOptions:function (children) {
    const Options = children.map(konwledge => <SubMenu key={konwledge.id} onTitleClick={this.subMenuTitleClick} title={<span><Icon type="mail" /><span>{konwledge.content}</span></span>}>
          {konwledge.children.map(konwledge => <SubMenu key={konwledge.id} onTitleClick={this.subMenuTitleClick} title={<span><Icon type="mail" /><span>{konwledge.content}</span></span>}>
              {konwledge.children.map(konwledge => <SubMenu key={konwledge.id} onTitleClick={this.subMenuTitleClick} title={<span><Icon type="mail" /><span>{konwledge.content}</span></span>}>
                  {konwledge.children.map(konwledge => <SubMenu key={konwledge.id} onTitleClick={this.subMenuTitleClick} title={<span><Icon type="mail" /><span>{konwledge.content}</span></span>}>
                    {konwledge.children.map(konwledge => <SubMenu key={konwledge.id} onTitleClick={this.subMenuTitleClick} title={<span><Icon type="mail" /><span>{konwledge.content}</span></span>}>
                    </SubMenu>)}
                  </SubMenu>)}
              </SubMenu>)}
          </SubMenu>)}
      </SubMenu>);
      vdom.push(Options);
      return vdom;
  },


  onChange(page) {
    console.log(page);
    this.setState({
      currentPage: page,
    });
  },

  editTeachSchedule:function (e) {
    this.showModal('edit',e.currentTarget.title);
  },

  deleteTeachSchedule:function (e) {
    alert("请先删除当前进度下的教学资源，再执行此操作"+e.currentTarget.title);
  },

  showModal:function (optType,editSchuldeId) {
    optType = (optType=="edit"?"edit":"add");
    this.refs.teachingComponents.showModal(optType,editSchuldeId);
  },

  render() {
    return (
        <div>
          <TeachingComponents ref="teachingComponents" callbackParent={this.handleMenu}/>
          <Menu ref="middleMenu" onClick={this.handleClick}
                style={{ width: 240 }}
                defaultOpenKeys={['goSchool']}
                selectedKeys={[this.state.openSubMenu]}
                mode="inline"
          >
            {children}
          </Menu>
          <Pagination size="small" total={100} current={this.state.currentPage} onChange={this.onChange}/>
        </div>
    );
  },
});
export default KnowledgeMenuComponents;
