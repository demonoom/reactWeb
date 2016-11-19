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
var breadCrumbArray=new Array();
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
    // alert("ekey:"+e.key+",text:"+e.domEvent.target.innerText);
    var menuKeyArray = e.key.split("#");
    var menuId = menuKeyArray[0];
    var childrenCount = menuKeyArray[1];
    var menuLevel = menuKeyArray[2];
    // alert(menuLevel);
    this.setState({openSubMenu:menuId});
    if(childrenCount==0){
      var optContent = menuId+"#"+"bySubjectId";
      this.props.callbackParent(optContent,breadCrumbArray);
    }else{
      this.bulidBreadCrumbArray(e.domEvent.target.innerText,menuLevel);
      this.props.callbackParent(null,breadCrumbArray);
    }
  },

  bulidBreadCrumbArray:function (menuText,menuLevel) {
    var breadJson = { hrefLink: '#/MainLayout', hrefText:menuText ,menuLevel:menuLevel};
    if(menuLevel==0){
      breadCrumbArray=new Array();
      breadCrumbArray.push(breadJson);
    }else{
      this.checkSameLevelBread(breadJson,breadCrumbArray);
      // breadCrumbArray.push(breadJson);
    }
  },

  checkSameLevelBread:function (breadJson,breadCrumbArray) {
      var index=-1;
      for(var i=0;i<breadCrumbArray.length;i++){
          if(breadJson.menuLevel == breadCrumbArray[i].menuLevel){
            index=i;
            break;
          }
      }
      if(index!=-1){
        breadCrumbArray[index]=breadJson;
      }else{
        breadCrumbArray.push(breadJson);
      }
      return breadCrumbArray;
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
          count++;
          List.push([e]);
        });
        mMenu.buildMenuChildren(List);
        mMenu.setState({totalCount:count});
      },
      onError : function(error) {
        alert(error);
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
      const Options = menuContent.children.map(konwledge => <SubMenu key={konwledge.id+"#"+konwledge.children.length+"#"+"1"} isRootMenu="false" onTitleClick={this.subMenuTitleClick} title={<span><Icon type="mail" /><span>{konwledge.content}</span></span>}>
          {/*{this.buildOptions(konwledge.children)}*/}
          {konwledge.children.map(konwledge => <SubMenu key={konwledge.id+"#"+konwledge.children.length+"#"+"2"} isRootMenu="false" onTitleClick={this.subMenuTitleClick} title={<span><Icon type="mail" /><span>{konwledge.content}</span></span>}>
            {konwledge.children.map(konwledge => <SubMenu key={konwledge.id+"#"+konwledge.children.length+"#"+"3"} isRootMenu="false" onTitleClick={this.subMenuTitleClick} title={<span><Icon type="mail" /><span>{konwledge.content}</span></span>}>
              {konwledge.children.map(konwledge => <SubMenu key={konwledge.id+"#"+konwledge.children.length+"#"+"4"} isRootMenu="false" onTitleClick={this.subMenuTitleClick} title={<span><Icon type="mail" /><span>{konwledge.content}</span></span>}>
                {konwledge.children.map(konwledge => <SubMenu key={konwledge.id+"#"+konwledge.children.length+"#"+"5"} isRootMenu="false" onTitleClick={this.subMenuTitleClick} title={<span><Icon type="mail" /><span>{konwledge.content}</span></span>}>
                  {konwledge.children.map(konwledge => <SubMenu key={konwledge.id+"#"+konwledge.children.length+"#"+"6"} isRootMenu="false" onTitleClick={this.subMenuTitleClick} title={<span><Icon type="mail" /><span>{konwledge.content}</span></span>}>
                  </SubMenu>)}
                </SubMenu>)}
              </SubMenu>)}
            </SubMenu>)}
          </SubMenu>)}
      </SubMenu>);
      return <SubMenu key={menuContent.id+"#"+menuContent.children.length+"#"+"0"} isRootMenu="true" onTitleClick={this.subMenuTitleClick} title={<span><Icon type="mail" /><span>{menuContent.content}</span></span>}>
        {Options}
      </SubMenu>
    });
  },

  hasChild:function (menuContent) {
      if(menuContent.children.length!=0){
          //alert(true);
          return true;
      }else{
          // alert(false);
          return false;
      }
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
          <div className="menu_til">知识点资源</div>
          <Menu ref="middleMenu" onClick={this.handleClick}
                className="cont_t"
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
