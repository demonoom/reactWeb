import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon } from 'antd';
import { Menu, Dropdown } from 'antd';
import CourseWareComponents from './CourseWareComponents';
import SubjectTable from './SubjectTableComponents';
import UseKnowledgeComponents from './UseKnowledgeComponents';
import CourseWareUploadComponents from './CourseWareUploadComponents';
import SubjectUploadByTextboxio from './SubjectUploadByTextboxio';

const TabPane = Tabs.TabPane;
//定义js函数，完成删除前的确认提示操作
function deleteConfirm() {
    var count =5;
    var rs = confirm("确定要删除这"+count+"条记录吗？");
}


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
            subjectDataFilter:'self',
            currentMenuChildrenCount:-1,
            toolbarExtenderDisplay:false
        };

        this.breadcrumbChildren=null;
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
            var subjectParams = sessionStorage.getItem("ident")+"#"+this.state.currentTeachScheduleId+"#"+1+"#"+this.state.currentOptType+"#"+this.state.currentKnowledgeName+"#"+this.state.subjectDataFilter;
            this.refs.subTable.initGetSubjectInfo(subjectParams);
        }else{
            this.refs.courseWare.getTeachPlans(sessionStorage.getItem("ident"),this.state.currentTeachScheduleId,this.state.currentOptType,1,this.state.currentKnowledgeName,this.state.dataFilter);
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


        if(!breadcrumbArray|| !breadcrumbArray.length){
            breadcrumbArray=[];
        }

        let startNav = [{hrefLink:'#/MainLayout',hrefText:"首页",menuId:'indexlink',menuLevel:0,openKeysStr:this.menuId},{hrefLink:'#/MainLayout',hrefText:"备课计划",menuId:'resourcesLink',menuLevel:1,openKeysStr:this.menuId}];
        breadcrumbArray = startNav.concat(breadcrumbArray);

        this.breadcrumbChildren = breadcrumbArray.map((e, i)=> {
            return <Breadcrumb.Item key={e.menuId}><a id={e.menuId+"*"+e.menuLevel+"*"+e.openKeysStr} onClick={this.breadClick}>{e.hrefText}</a></Breadcrumb.Item>
        });
        this.setState({activeKey:'课件'});
        this.setState({breadcrumbArray:breadcrumbArray});
        if(toolbarKey!="KnowledgeResources"){
          this.setState({currentOptType:"bySchedule"});
        }else{
          this.setState({currentOptType:"bySubjectId"});
        }
    },

    showpanle(obj){
        LP.Start(obj);
    },

    setCurrentOptType(toolbarKey){

    },

    componentWillMount(){
        this.buildBreadcrumb();
    },

    /**
     * 课件tab名称右侧的DropDownMenu点击响应处理函数
     * @param key 被点击menu item的key
     */
    menuItemOnClick : function ({ key }) {
        var clickKey = `${key}`;
        if(this.state.activeKey=="课件"){
            this.setState({dataFilter:clickKey});
            this.refs.courseWare.getTeachPlans(sessionStorage.getItem("ident"),this.state.currentTeachScheduleId,this.state.currentOptType,1,this.state.currentKnowledgeName,clickKey);
        }else{
            this.setState({subjectDataFilter:clickKey});
            var subjectParams = sessionStorage.getItem("ident")+"#"+this.state.currentTeachScheduleId+"#"+1+"#"+this.state.currentOptType+"#"+this.state.currentKnowledgeName+"#"+clickKey;
            this.refs.subTable.initGetSubjectInfo(subjectParams);
        }
    },
    /**
     * 课件上传成功后的回调函数
     */
    courseUploadCallBack(){
        if(this.state.activeKey=="题目"){
          var subjectParams = sessionStorage.getItem("ident")+"#"+this.state.currentTeachScheduleId+"#"+1+"#"+this.state.currentOptType+"#"+this.state.currentKnowledgeName+"#"+this.state.subjectDataFilter+"#fromUpload";
          this.refs.subTable.initGetSubjectInfo(subjectParams);
        }else{
          this.refs.courseWare.getTeachPlans(sessionStorage.getItem("ident"),this.state.currentTeachScheduleId,this.state.currentOptType,1,this.state.currentKnowledgeName,this.state.dataFilter,"fromUpload");
        }
    },



    render() {
        var tabPanel;
        var subjectTabPanel;

        var displayType='none';
        console.log("displayType================="+displayType);
        const menu = (
            <Menu onClick={this.menuItemOnClick}>
                <Menu.Item key="self">只看自己</Menu.Item>
                <Menu.Item key="other">查看他人</Menu.Item>
            </Menu>
        );
        if(this.state.currentOptType=="bySubjectId" && sessionStorage.getItem("lastClickMenuChildrenCount")==0 && sessionStorage.getItem("lastClickMenuId")!=null ){
            displayType='block';
            tabPanel=<TabPane
                tab={<span>课件<Dropdown overlay={menu}  trigger={['click']}  className='del_right'>
                <a className="ant-dropdown-link icon_filter" href="#"><Icon type="down-circle-o"/></a>
            </Dropdown></span>}
                 key="课件">
                <CourseWareComponents ref="courseWare" onPreview={ this.showpanle }/>
            </TabPane>;
            subjectTabPanel=<TabPane tab={<span>题目<Dropdown overlay={menu}  trigger={['click']}  className='del_right'>
                <a className="ant-dropdown-link icon_filter" href="#"><Icon type="down-circle-o" /></a></Dropdown></span>} key="题目">
                <SubjectTable  ref="subTable" params={this.state.subjectParams}/></TabPane>;
        }else if(this.state.currentOptType=="bySubjectId"){
            displayType='none';
            tabPanel=<TabPane tab={<span>课件<Dropdown overlay={menu}  trigger={['click']}  className='del_right'>
                <a className="ant-dropdown-link icon_filter" href="#"><Icon type="down-circle-o"/></a></Dropdown></span>} key="课件">
                <CourseWareComponents ref="courseWare" onPreview={ this.showpanle }/></TabPane>;
            subjectTabPanel=<TabPane tab={<span>题目<Dropdown overlay={menu}  trigger={['click']}  className='del_right'>
                <a className="ant-dropdown-link icon_filter" href="#"><Icon type="down-circle-o" /></a></Dropdown></span>} key="题目">
                <SubjectTable  ref="subTable" params={this.state.subjectParams}/></TabPane>;
        }else{
            displayType='none';
            tabPanel=<TabPane tab="课件" key="课件"><CourseWareComponents onPreview={ this.showpanle } ref="courseWare"/></TabPane>;
            subjectTabPanel=<TabPane tab="题目" key="题目"><SubjectTable  ref="subTable" params={this.state.subjectParams}/></TabPane>
        }
        var toolbarExtra = <div className="ant-tabs-right" style={{display:displayType}}><CourseWareUploadComponents courseUploadCallBack={this.courseUploadCallBack} params={this.state.subjectParams} />
            <SubjectUploadByTextboxio courseUploadCallBack={this.courseUploadCallBack} params={this.state.subjectParams} /></div>;

        return (
            <div>
                <UseKnowledgeComponents ref="useKnowledgeComponents"></UseKnowledgeComponents>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item><Icon type="home" /></Breadcrumb.Item>
                    { this.breadcrumbChildren}
                </Breadcrumb>
                <Tabs
                    hideAdd
                    onChange={this.onChange}
                    onEdit={this.onEdit}
                    ref = "mainTab"
                    animated={false}
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
