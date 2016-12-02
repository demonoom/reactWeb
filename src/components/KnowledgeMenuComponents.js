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
      fatherMenuName:'',
      breadCrumbArray:[],
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
  //菜单被选择时执行的函数
  subMenuTitleClick(e){
    // alert("ekey:"+e.key);
    var menuKeyArray = e.key.split("#");
    var menuId = menuKeyArray[0];
    var childrenCount = menuKeyArray[1];
    var menuLevel = menuKeyArray[2];
    var menuName = menuKeyArray[3];
    var fatherMenuName = menuKeyArray[4];
    this.setState({openSubMenu:[e.key]});
    if(menuLevel!=0 && childrenCount==0){
      this.bulidBreadCrumbArray(fatherMenuName,menuLevel-1,menuId);
    }else{
      this.bulidBreadCrumbArray(menuName,menuLevel,menuId);
    }
    var optContent = menuId+"#"+"bySubjectId"+"#"+menuName;
    this.props.callbackParent(optContent,breadCrumbArray);
  },

  bulidBreadCrumbArray:function (menuText,menuLevel,menuId) {
    var breadJson = { hrefLink: '#/MainLayout', hrefText:menuText ,menuLevel:menuLevel,menuId:menuId};
    if(menuLevel==0){
      breadCrumbArray=new Array();
      breadCrumbArray.push(breadJson);
    }else{
      this.checkSameLevelBread(breadJson,breadCrumbArray);
      // breadCrumbArray.push(breadJson);
    }
    this.setState({breadCrumbArray:breadCrumbArray});
  },

  checkIsFatherLevel(breadJson,breadCrumbArray){
      var index=-1;
      for(var i=0;i<breadCrumbArray.length;i++){
        //如果是相同层次的菜单，则返回当前的菜单索引位置
        if(breadJson.menuLevel == breadCrumbArray[i].menuLevel){
          index=i;
          break;
        }
      }
      if(index!=-1){
        //如果点击的是同级菜单，则替换当前的菜单，并删除之后的所有菜单项目
        breadCrumbArray[index]=breadJson;
        for(var i=0;i<breadCrumbArray.length;i++){
          if(i>index){
            breadCrumbArray.splice(i,1);
          }
        }
        breadCrumbArray.push(breadJson);
      }else{
        breadCrumbArray.push(breadJson);
      }
      return breadCrumbArray;
  },

  checkSameLevelBread:function (breadJson,breadCrumbArray) {
      var index=-1;
      for(var i=0;i<breadCrumbArray.length;i++){
          //如果是相同层次的菜单，则返回当前的菜单索引位置
          if(breadJson.menuLevel == breadCrumbArray[i].menuLevel){
            index=i;
            break;
          }
      }
      var removeArray=[];
      if(index!=-1){
        //如果点击的是同级菜单，则替换当前的菜单，并删除之后的所有菜单项目
        breadCrumbArray[index]=breadJson;
        for(var i=0;i<breadCrumbArray.length;i++){
          if(i>index){
            removeArray.push(i);
            //breadCrumbArray.splice(i,1);
          }
        }
        for(var i=0;i<removeArray.length;i++){
          breadCrumbArray.splice(removeArray[i],1);
        }

      }else{
        breadCrumbArray.push(breadJson);
      }

      return breadCrumbArray;
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

  componentWillMount(){
    this.getLessonMenu();
  },

  buildMenuChildren:function (menuList) {
    var menuContent;
    children = menuList.map((e, i)=> {
      menuContent = (e[0]!=null?e[0]:e);
      // const Options =
      return <SubMenu key={menuContent.id+"#"+menuContent.children.length+"#"+"0"+"#"+menuContent.content+"#"+""} isRootMenu="true" onTitleClick={this.subMenuTitleClick} title={<span>{menuContent.content}</span>}>
        {
          menuContent.children.map(konwledge1 => <SubMenu key={konwledge1.id+"#"+konwledge1.children.length+"#"+"1"+"#"+konwledge1.content+"#"+menuContent.content} isRootMenu="false" onTitleClick={this.subMenuTitleClick} title={<span>{konwledge1.content}</span>}>
            {konwledge1.children.map(konwledge2 => <SubMenu key={konwledge2.id+"#"+konwledge2.children.length+"#"+"2"+"#"+konwledge2.content+"#"+konwledge1.content} isRootMenu="false" onTitleClick={this.subMenuTitleClick} title={<span>{konwledge2.content}</span>}>
              {konwledge2.children.map(konwledge3 => <SubMenu key={konwledge3.id+"#"+konwledge3.children.length+"#"+"3"+"#"+konwledge3.content+"#"+konwledge2.content} isRootMenu="false" onTitleClick={this.subMenuTitleClick} title={<span>{konwledge3.content}</span>}>
                {konwledge3.children.map(konwledge4 => <SubMenu key={konwledge4.id+"#"+konwledge4.children.length+"#"+"4"+"#"+konwledge4.content+"#"+konwledge3.content} isRootMenu="false" onTitleClick={this.subMenuTitleClick} title={<span>{konwledge4.content}</span>}>
                  {konwledge4.children.map(konwledge5 => <SubMenu key={konwledge5.id+"#"+konwledge5.children.length+"#"+"5"+"#"+konwledge5.content+"#"+konwledge4.content} isRootMenu="false" onTitleClick={this.subMenuTitleClick} title={<span>{konwledge5.content}</span>}>
                    {konwledge5.children.map(konwledge6 => <SubMenu key={konwledge6.id+"#"+konwledge6.children.length+"#"+"6"+"#"+konwledge6.content+"#"+konwledge5.content} isRootMenu="false" onTitleClick={this.subMenuTitleClick} title={<span>{konwledge6.content}</span>}>
                    </SubMenu>)}
                  </SubMenu>)}
                </SubMenu>)}
              </SubMenu>)}
            </SubMenu>)}
          </SubMenu>)
        }
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

  render() {
    return (
        <div>
          <div className="menu_til">知识点资源</div>
          <Menu ref="middleMenu"
                defaultOpenKeys={['goSchool']}
                selectedKeys={[this.state.openSubMenu]}
				 className="cont_t"
				mode="inline"

          >
            {children}
          </Menu>
          {/*<Pagination size="small" total={100} current={this.state.currentPage} onChange={this.onChange}/>*/}
        </div>
    );
  },
});
export default KnowledgeMenuComponents;
