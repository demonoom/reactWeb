import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon } from 'antd';
import { Menu, Dropdown } from 'antd';
import CourseWareComponents from './CourseWareComponents';
import SubjectTable from './SubjectTableComponents';
import UseKnowledgeComponents from './UseKnowledgeComponents';
import CourseWareUploadComponents from './CourseWareUploadComponents';
import SubjectUploadTabComponents from './SubjectUploadTabComponents';

const TabPane = Tabs.TabPane;
//定义js函数，完成删除前的确认提示操作
function deleteConfirm() {
    var count =5;
    var rs = confirm("确定要删除这"+count+"条记录吗？");
}

var mt;
let breadcrumbChildren;
var breadCrumbArray=[];
const MainTabComponents = React.createClass({

    getInitialState() {
        return {
            currentIdent:0,
            currentTeachScheduleId:'',
            currentSubjectId:'',
            currentOptType:'',
            defaultActiveKey:'课件',
            activeKey:'课件',
            subjectParams:'',
            breadcrumbArray:[],
            currentKnowledgeName:'',
            dataFilter:'self',
            currentMenuChildrenCount:-1,
        };
    },
    getTeachPlans(optContent){
        var optContentArray = optContent.split("#");
        var teachScheduleId = optContentArray[0];
        var optType =optContentArray[1];
        var knowledgeName = optContentArray[2];
        var pageNo = 1;
        this.refs.courseWare.getTeachPlans(sessionStorage.getItem("ident"),teachScheduleId,optType,pageNo,knowledgeName,this.state.dataFilter);
        this.setState({currentOptType:optType});
        this.setState({currentTeachScheduleId:teachScheduleId});
        this.setState({currentKnowledgeName:knowledgeName});
        this.setState({activeKey:'课件'});
        this.setState({subjectParams:sessionStorage.getItem("ident")+"#"+teachScheduleId+"#"+1+"#"+optType+"#"+knowledgeName+"#"+this.state.dataFilter});
    },

    onChange(activeKey) {
        if(activeKey=="题目"){
            this.setState({activeKey:'题目'});
            this.setState({subjectParams:sessionStorage.getItem("ident")+"#"+this.state.currentTeachScheduleId+"#"+1+"#"+this.state.currentOptType+"#"+this.state.currentKnowledgeName+"#"+this.state.dataFilter});
        }else{
            this.setState({activeKey:'课件'});
        }
    },

    showModal:function () {
        this.refs.useKnowledgeComponents.showModal();
    },

    breadClick(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var idStr = target.id;
        var keyArray = idStr.split("*");
        var menuId = keyArray[0];
        var menuLevel = keyArray[1];
        var openKeysStr = keyArray[2];
        var optContent = keyArray[0]+"#"+"bySubjectId"+"#"+target.textContent;
        this.getTeachPlans(optContent);
        var breadCrumbArray = this.props.callBackKnowledgeMenuBuildBreadCrume(target.textContent,menuLevel,menuId,openKeysStr);
        this.buildBreadcrumb(breadCrumbArray);
    },

    //生成面包屑导航
    buildBreadcrumb:function (breadcrumbArray,childrenCount) {
        if(childrenCount!=null && typeof(childrenCount)!="undefined"){
              this.setState({currentMenuChildrenCount:childrenCount});
        }
        breadcrumbChildren = breadcrumbArray.map((e, i)=> {
            return <Breadcrumb.Item key={e.menuId}><a id={e.menuId+"*"+e.menuLevel+"*"+e.openKeysStr} onClick={this.breadClick}>{e.hrefText}</a></Breadcrumb.Item>
        });
        this.setState({activeKey:'课件'});
        this.setState({breadcrumbArray:breadcrumbArray});
        this.setState({currentOptType:"bySchedule"});
    },

    componentWillMount(){
        var breadcrumbArray = [{hrefLink:'#/MainLayout',hrefText:"首页"}];
        this.buildBreadcrumb(breadcrumbArray);
    },

    /**
     * 课件tab名称右侧的DropDownMenu点击响应处理函数
     * @param key 被点击menu item的key
     */
    menuItemOnClick : function ({ key }) {
        var clickKey = `${key}`;
        this.setState({dataFilter:clickKey});
        if(this.state.activeKey=="课件"){
            this.refs.courseWare.getTeachPlans(sessionStorage.getItem("ident"),this.state.currentTeachScheduleId,this.state.currentOptType,1,this.state.currentKnowledgeName,clickKey);
        }else{
            this.setState({subjectParams:sessionStorage.getItem("ident")+"#"+this.state.currentTeachScheduleId+"#"+1+"#"+this.state.currentOptType+"#"+this.state.currentKnowledgeName+"#"+clickKey});
        }
    },
    /**
     * 课件上传成功后的回调函数
     */
    courseUploadCallBack(){
        this.refs.courseWare.getTeachPlans(sessionStorage.getItem("ident"),this.state.currentTeachScheduleId,this.state.currentOptType,1,this.state.currentKnowledgeName,this.state.dataFilter);
    },

    render() {

        var toolbarExtra;
        var tabPanel;
        var subjectTabPanel;
        const menu = (
            <Menu onClick={this.menuItemOnClick}>
                <Menu.Item key="self">只看自己</Menu.Item>
                <Menu.Item key="other">查看他人</Menu.Item>
            </Menu>
        );
        if(this.state.currentOptType=="bySubjectId" && this.state.currentMenuChildrenCount==0){
            toolbarExtra = <div className="ant-tabs-right"><CourseWareUploadComponents courseUploadCallBack={this.courseUploadCallBack} params={this.state.subjectParams}></CourseWareUploadComponents><SubjectUploadTabComponents courseUploadCallBack={this.courseUploadCallBack} params={this.state.subjectParams}></SubjectUploadTabComponents></div>;
            tabPanel=<TabPane tab={<span>课件<Dropdown overlay={menu}  trigger={['click']}  className='del_right'><a className="ant-dropdown-link icon_filter" href="#"><Icon type="filter"/></a></Dropdown></span>} key="课件"><CourseWareComponents ref="courseWare"/></TabPane>;
            subjectTabPanel=<TabPane tab={<span>题目<Dropdown overlay={menu}  trigger={['click']}  className='del_right'><a className="ant-dropdown-link icon_filter" href="#"><Icon type="filter" /></a></Dropdown></span>} key="题目"><SubjectTable  ref="subTable" params={this.state.subjectParams}/></TabPane>;
        }else if(this.state.currentOptType=="bySubjectId"){
            toolbarExtra = <div className="ant-tabs-right"></div>;
            tabPanel=<TabPane tab={<span>课件<Dropdown overlay={menu}  trigger={['click']}  className='del_right'><a className="ant-dropdown-link icon_filter" href="#"><Icon type="filter"/></a></Dropdown></span>} key="课件"><CourseWareComponents ref="courseWare"/></TabPane>;
            subjectTabPanel=<TabPane tab={<span>题目<Dropdown overlay={menu}  trigger={['click']}  className='del_right'><a className="ant-dropdown-link icon_filter" href="#"><Icon type="filter" /></a></Dropdown></span>} key="题目"><SubjectTable  ref="subTable" params={this.state.subjectParams}/></TabPane>;
        }else{
            toolbarExtra = <div className="ant-tabs-right"></div>;
            tabPanel=<TabPane tab="课件" key="课件"><CourseWareComponents ref="courseWare"/></TabPane>;
            subjectTabPanel=<TabPane tab="题目" key="题目"><SubjectTable  ref="subTable" params={this.state.subjectParams}/></TabPane>
        }

        return (
            <div>
                <UseKnowledgeComponents ref="useKnowledgeComponents"></UseKnowledgeComponents>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item><Icon type="home" /></Breadcrumb.Item>
                    {breadcrumbChildren}
                </Breadcrumb>
                <Tabs
                    hideAdd
                    onChange={this.onChange}
                    /*type="editable-card"     启用该属性，会使Tab上带有删除的图标*/
                    onEdit={this.onEdit}
                    ref = "mainTab"
                    activeKey={this.state.activeKey}
                    defaultActiveKey={this.state.defaultActiveKey}
                    tabBarExtraContent={toolbarExtra}
                    transitionName=""  //禁用Tabs的动画效果
                >
                    {tabPanel}
                    {subjectTabPanel}
                </Tabs>
            </div>
        );
    },
});

export default MainTabComponents;
